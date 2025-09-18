---
title: ミドルウェア
---

# ミドルウェア

[MODES: framework, data]

<br/>
<br/>

<docs-info>フレームワークモードでは、`getLoadContext`関数と`loader`/`action`の`context`パラメーターに軽微な[破壊的変更][getloadcontext]が含まれているため、[`future.v8_middleware`][future-flags]フラグを介してミドルウェアをオプトインする必要があります。</docs-info>

ミドルウェアを使用すると、一致したパスの[`Response`][Response]生成の前後にコードを実行できます。これにより、認証、ロギング、エラー処理、データ前処理などの[一般的なパターン][common-patterns]を再利用可能な方法で実現できます。

ミドルウェアはネストされたチェーンで実行され、ルートハンドラーへの「下り」の途中で親ルートから子ルートへ、そして[`Response`][Response]が生成された後の「上り」の途中で子ルートから親ルートへと実行されます。

例えば、`GET /parent/child`リクエストでは、ミドルウェアは以下の順序で実行されます。

```text
- Root middleware start
  - Parent middleware start
    - Child middleware start
      - Run loaders, generate HTML Response
    - Child middleware end
  - Parent middleware end
- Root middleware end
```

<docs-info>サーバー（フレームワークモード）とクライアント（フレームワーク/データモード）でのミドルウェアには、いくつかのわずかな違いがあります。このドキュメントでは、過去に他のHTTPサーバーでミドルウェアを使用したことがあるユーザーにとって最も馴染み深いため、ほとんどの例でサーバーミドルウェアについて言及します。詳細については、以下の[サーバーミドルウェアとクライアントミドルウェア][server-client]セクションを参照してください。</docs-info>

## クイックスタート (フレームワークモード)

### 1. ミドルウェアフラグを有効にする

まず、[React Routerの設定][rr-config]でミドルウェアを有効にします。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    v8_middleware: true,
  },
} satisfies Config;
```

<docs-warning>ミドルウェア機能を有効にすると、[`action`][framework-action]と[`loader`][framework-loader]の`context`パラメーターの型が変更されます。現在`context`を積極的に使用している場合は、以下の[`getLoadContext`][getloadcontext]セクションに注意してください。</docs-warning>

### 2. コンテキストを作成する

ミドルウェアは、ミドルウェアチェーンにデータを供給するために`context`プロバイダーインスタンスを使用します。
[`createContext`][createContext]を使用して型安全なコンテキストオブジェクトを作成できます。

```ts filename=app/context.ts
import { createContext } from "react-router";
import type { User } from "~/types";

export const userContext = createContext<User | null>(null);
```

### 3. ルートからミドルウェアをエクスポートする

```tsx filename=app/routes/dashboard.tsx
import { redirect } from "react-router";
import { userContext } from "~/context";

// サーバーサイド認証ミドルウェア
async function authMiddleware({ request, context }) {
  const user = await getUserFromSession(request);
  if (!user) {
    throw redirect("/login");
  }
  context.set(userContext, user);
}

export const middleware: Route.MiddlewareFunction[] = [
  authMiddleware,
];

// クライアントサイドタイミングミドルウェア
async function timingMiddleware({ context }, next) {
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`Navigation took ${duration}ms`);
}

export const clientMiddleware: Route.ClientMiddlewareFunction[] =
  [timingMiddleware];

export async function loader({
  context,
}: Route.LoaderArgs) {
  const user = context.get(userContext);
  const profile = await getProfile(user);
  return { profile };
}

export default function Dashboard({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>Welcome {loaderData.profile.fullName}!</h1>
      <Profile profile={loaderData.profile} />
    </div>
  );
}
```

### 4. `getLoadContext`関数を更新する（該当する場合）

カスタムサーバーと`getLoadContext`関数を使用している場合、実装を更新して、JavaScriptオブジェクトの代わりに[`RouterContextProvider`][RouterContextProvider]のインスタンスを返す必要があります。

```diff
+import {
+  createContext,
+  RouterContextProvider,
+} from "react-router";
import { createDb } from "./db";

+const dbContext = createContext<Database>();

function getLoadContext(req, res) {
-  return { db: createDb() };
+  const context = new RouterContextProvider();
+  context.set(dbContext, createDb());
+  return context;
}
```

## クイックスタート (データモード)

<docs-info>データモードには将来のフラグがないことに注意してください。これは、ルートにミドルウェアを追加することでオプトインでき、将来のフラグを必要とする破壊的変更が存在しないためです。</docs-info>

### 1. コンテキストを作成する

ミドルウェアは、ミドルウェアチェーンにデータを供給するために`context`プロバイダーインスタンスを使用します。
[`createContext`][createContext]を使用して型安全なコンテキストオブジェクトを作成できます。

```ts
import { createContext } from "react-router";
import type { User } from "~/types";

export const userContext = createContext<User | null>(null);
```

### 2. ルートにミドルウェアを追加する

```tsx
import { redirect } from "react-router";
import { userContext } from "~/context";

const routes = [
  {
    path: "/",
    middleware: [timingMiddleware], // 👈
    Component: Root,
    children: [
      {
        path: "profile",
        middleware: [authMiddleware], // 👈
        loader: profileLoader,
        Component: Profile,
      },
      {
        path: "login",
        Component: Login,
      },
    ],
  },
];

async function timingMiddleware({ context }, next) {
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`Navigation took ${duration}ms`);
}

async function authMiddleware({ context }) {
  const user = await getUser();
  if (!user) {
    throw redirect("/login");
  }
  context.set(userContext, user);
}

export async function profileLoader({
  context,
}: Route.LoaderArgs) {
  const user = context.get(userContext);
  const profile = await getProfile(user);
  return { profile };
}

export default function Profile() {
  let loaderData = useLoaderData();
  return (
    <div>
      <h1>Welcome {loaderData.profile.fullName}!</h1>
      <Profile profile={loaderData.profile} />
    </div>
  );
}
```

### 3. `getContext`関数を追加する（オプション）

すべてのナビゲーション/フェッチにベースコンテキストを含めたい場合は、ルーターに[`getContext`][getContext]関数を追加できます。これは、すべてのナビゲーション/フェッチで新しいコンテキストを生成するために呼び出されます。

```tsx
let sessionContext = createContext();

const router = createBrowserRouter(routes, {
  getContext() {
    let context = new RouterContextProvider();
    context.set(sessionContext, getSession());
    return context;
  },
});
```

<docs-info>このAPIは、フレームワークモードのサーバーにおける`getLoadContext` APIをミラーリングするために存在します。これは、HTTPサーバーからReact Routerハンドラーに値を渡す方法として存在します。この[`getContext`][getContext] APIは、[`window`][window]/[`document`][document]からReact Routerにグローバルな値を渡すために使用できますが、これらはすべて同じコンテキスト（ブラウザ）で実行されるため、ルートミドルウェアを使用しても実質的に同じ動作を実現できます。したがって、サーバーと同じ方法でこのAPIが必要ない場合もありますが、一貫性のために提供されています。</docs-info>

## コアコンセプト

### サーバーミドルウェア vs クライアントミドルウェア

サーバーミドルウェアは、フレームワークモードのサーバーで、HTMLドキュメントリクエストおよび後続のナビゲーションとフェッチャー呼び出しのための`.data`リクエストに対して実行されます。サーバーミドルウェアはHTTP [`Request`][request]に応答してサーバーで実行されるため、`next`関数を介してHTTP [`Response`][Response]をミドルウェアチェーンに返します。

```ts
async function serverMiddleware({ request }, next) {
  console.log(request.method, request.url);
  let response = await next();
  console.log(response.status, request.method, request.url);
  return response;
}

// Framework mode only
export const middleware: Route.MiddlewareFunction[] = [
  serverMiddleware,
];
```

クライアントミドルウェアは、クライアントサイドのナビゲーションとフェッチャー呼び出しのために、フレームワークモードとデータモードのブラウザで実行されます。クライアントミドルウェアは、HTTPリクエストがないため、`Response`をバブルアップしない点でサーバーミドルウェアとは異なります。ほとんどの場合、`next`からの戻り値を無視し、クライアントのミドルウェアから何も返さないことができます。

```ts
async function clientMiddleware({ request }, next) {
  console.log(request.method, request.url);
  await next();
  console.log(response.status, request.method, request.url);
}

// Framework mode
export const clientMiddleware: Route.ClientMiddlewareFunction[] =
  [clientMiddleware];

// Or, Data mode
const route = {
  path: "/",
  middleware: [clientMiddleware],
  loader: rootLoader,
  Component: Root,
};
```

ローダー/アクションの結果に基づいて何らかの後処理を行いたい場合があるかもしれません。`Response`の代わりに、クライアントミドルウェアはアクティブな[`dataStrategy`][datastrategy]から返された値（ルートIDでキー付けされた`Record<string, DataStrategyResult>`）をバブルアップします。これにより、実行された`loader`/`action`関数の結果に基づいて、ミドルウェアで条件付きアクションを実行できます。

以下は、クライアントサイドミドルウェアとして実装された[404でのCMSリダイレクト][cms-redirect]のユースケースの例です。

```tsx
async function cmsFallbackMiddleware({ request }, next) {
  const results = await next();

  // Check if we got a 404 from any of our routes and if so, look for a
  // redirect in our CMS
  const found404 = Object.values(results).some(
    (r) =>
      isRouteErrorResponse(r.result) &&
      r.result.status === 404,
  );
  if (found404) {
    const cmsRedirect = await checkCMSRedirects(
      request.url,
    );
    if (cmsRedirect) {
      throw redirect(cmsRedirect, 302);
    }
  }
}
```

<docs-warning>サーバーミドルウェアでは、`Response`ボディをいじるべきではなく、ステータス/ヘッダーの読み取りとヘッダーの設定のみを行うべきです。同様に、この値はクライアントミドルウェアでは読み取り専用と見なされるべきです。なぜなら、それは結果のナビゲーションの「ボディ」または「データ」を表し、ミドルウェアではなくローダー/アクションによって駆動されるべきだからです。これはまた、クライアントミドルウェアでは、`await next()`から結果をキャプチャする必要があったとしても、通常は結果を返す必要がないことを意味します。</docs-warning>

### ミドルウェアの実行タイミング

アプリケーションが意図したとおりに動作するように、ミドルウェアが_いつ_実行されるかを理解することは非常に重要です。

#### サーバーミドルウェア

ハイドレートされたフレームワークモードのアプリでは、サーバーミドルウェアはSPAの動作を優先し、デフォルトでは新しいネットワークアクティビティを作成しないように設計されています。ミドルウェアは_既存の_リクエストをラップし、サーバーにアクセスする必要がある場合にのみ実行されます。

これにより、React Routerにおける「ハンドラー」とは何かという疑問が生じます。それはルートでしょうか？それとも`loader`でしょうか？私たちは「場合による」と考えています。

- ドキュメントリクエスト（`GET /route`）では、ハンドラーはルートです。なぜなら、レスポンスには`loader`とルートコンポーネントの両方が含まれるからです。
- クライアントサイドナビゲーションのデータリクエスト（`GET /route.data`）では、ハンドラーは[`action`][data-action]/[`loader`][data-loader]です。なぜなら、レスポンスに含まれるのはそれだけだからです。

したがって:

- ドキュメントリクエストは、`loader`が存在するかどうかにかかわらずサーバーミドルウェアを実行します。なぜなら、UIをレンダリングするための「ハンドラー」の中にまだいるからです。
- クライアントサイドナビゲーションは、[`action`][framework-action]/[`loader`][framework-loader]のためにサーバーに`.data`リクエストが行われた場合にのみ、サーバーミドルウェアを実行します。

これは、リクエスト期間のロギング、セッションのチェック/設定、送信キャッシュヘッダーの設定などのリクエストアノテーションミドルウェアにとって重要な動作です。そもそもサーバーにアクセスする理由がないのに、サーバーにアクセスしてこれらの種類のミドルウェアを実行しても無意味でしょう。これにより、サーバーの負荷が増加し、サーバーログが煩雑になります。

```tsx filename=app/root.tsx
// This middleware won't run on client-side navigations without a `.data` request
async function loggingMiddleware({ request }, next) {
  console.log(`Request: ${request.method} ${request.url}`);
  let response = await next();
  console.log(
    `Response: ${response.status} ${request.method} ${request.url}`,
  );
  return response;
}

export const middleware: Route.MiddlewareFunction[] = [
  loggingMiddleware,
];
```

しかし、`loader`が存在しない場合でも、_すべての_クライアントナビゲーションで特定のサーバーミドルウェアを実行したい場合があります。例えば、サイトの認証済みセクションにあるフォームで、`loader`は必要ないが、ユーザーがフォームに入力する前に認証ミドルウェアを使用してリダイレクトしたい場合などです。`action`に送信するときではなく。ミドルウェアがこれらの基準を満たす場合、そのルートを含むルートに`loader`を配置することで、そのルートが関与するクライアントサイドナビゲーションに対して常にサーバーを呼び出すように強制できます。

```tsx filename=app/_auth.tsx
function authMiddleware({ request }, next) {
  if (!isLoggedIn(request)) {
    throw redirect("/login");
  }
}

export const middleware: Route.MiddlewareFunction[] = [
  authMiddleware,
];

// By adding a `loader`, we force the `authMiddleware` to run on every
// client-side navigation involving this route.
export async function loader() {
  return null;
}
```

#### クライアントミドルウェア

クライアントミドルウェアはよりシンプルです。なぜなら、私たちはすでにクライアント上にいて、ナビゲーション時に常にルーターに「リクエスト」を行っているからです。クライアントミドルウェアは、実行する`loader`があるかどうかにかかわらず、すべてのクライアントナビゲーションで実行されます。

### コンテキストAPI

新しいコンテキストシステムは、型安全を提供し、名前の衝突を防ぎ、ネストされたミドルウェアや`action`/`loader`関数にデータを提供できるようにします。フレームワークモードでは、これは以前の`AppLoadContext` APIを置き換えます。

```ts
// ✅ 型安全
import { createContext } from "react-router";
const userContext = createContext<User>();

// 後でミドルウェア/`loader`s
context.set(userContext, user); // User型である必要があります
const user = context.get(userContext); // User型を返します

// ❌ 古い方法（型安全なし）
context.user = user; // 何でもあり得る
```

#### `Context`と`AsyncLocalStorage`

Nodeは、非同期実行コンテキストを通じて値を提供する[`AsyncLocalStorage`][asynclocalstorage] APIを提供します。これはNode APIですが、ほとんどのモダンなランタイムで（ほとんど）利用可能になっています（例：[Cloudflare][cloudflare]、[Bun][bun]、[Deno][deno]）。

理論的には、ミドルウェアから子ルートに値を渡す方法として[`AsyncLocalStorage`][asynclocalstorage]を直接活用することもできましたが、100%のクロスプラットフォーム互換性がないことが懸念され、ランタイムに依存しない方法で再利用可能なミドルウェアパッケージを公開できるように、ファーストクラスの`context` APIを引き続き提供したいと考えました。

とはいえ、このAPIはReact Routerミドルウェアと非常によく連携し、`context` APIの代わりとして、またはそれと並行して使用できます。

<docs-info>[React Server Components](../how-to/react-server-components)を使用する場合、[`AsyncLocalStorage`][asynclocalstorage]は_特に_強力です。なぜなら、`middleware`からServer ComponentsやServer Actionsに情報を提供できるからです。これらは同じサーバー実行コンテキストで実行されるためです🤯</docs-info>

```tsx filename=app/user-context.ts
import { AsyncLocalStorage } from "node:async_hooks";

const USER = new AsyncLocalStorage<User>();

export async function provideUser(
  request: Request,
  cb: () => Promise<Response>,
) {
  let user = await getUser(request);
  return USER.run(user, cb);
}

export function getUser() {
  return USER.getStore();
}
```

```tsx filename=app/root.tsx
import { provideUser } from "./user-context";

export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }, next) => {
    return provideUser(request, async () => {
      let res = await next();
      return res;
    });
  },
];
```

```tsx filename=app/routes/_index.tsx
import { getUser } from "../user-context";

export async function loader() {
  let user = getUser();
  //...
}
```

### `next`関数

`next`関数のロジックは、それが呼び出されているルートミドルウェアによって異なります。

- リーフではないミドルウェアから呼び出された場合、チェーン内の次のミドルウェアを実行します。
- リーフミドルウェアから呼び出された場合、ルートハンドラーを実行し、リクエストに対する結果の[`Response`][Response]を生成します。

```ts
const middleware = async ({ context }, next) => {
  // ここに書かれたコードはハンドラーの実行「前」に実行されます
  console.log("Before");

  const response = await next();

  // ここに書かれたコードはハンドラーの実行「後」に実行されます
  console.log("After");

  return response; // クライアントではオプション、サーバーでは必須
};
```

<docs-warning>ミドルウェアごとに`next()`を1回しか呼び出すことはできません。複数回呼び出すとエラーがスローされます。</docs-warning>

### `next()`のスキップ

ハンドラーの後にコードを実行する必要がない場合は、`next()`の呼び出しをスキップできます。

```ts
const authMiddleware = async ({ request, context }) => {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  context.set(userContext, user);
  // next() は自動的に呼び出されます
};
```

### `next()`とエラーハンドリング

React Routerには、ルートの[`ErrorBoundary`][ErrorBoundary]エクスポートを介した組み込みのエラーハンドリングが含まれています。`action`/`loader`がスローした場合と同様に、`middleware`がスローした場合、適切な[`ErrorBoundary`][ErrorBoundary]で捕捉および処理され、祖先の`next()`呼び出しを通じて[`Response`][Response]が返されます。これは、`next()`関数は決してスローせず、常に[`Response`][Response]を返す必要があることを意味するため、try/catchでラップすることを心配する必要はありません。

この動作は、ルート`middleware`から送信されるレスポンスに必須ヘッダーを自動的に設定する（つまり、セッションをコミットする）などのミドルウェアパターンを可能にするために重要です。もし`middleware`からのエラーが`next()`を`throw`させた場合、終了時の祖先ミドルウェアの実行を見逃し、必要なヘッダーが設定されなくなります。

```tsx filename=routes/parent.tsx
export const middleware: Route.MiddlewareFunction[] = [
  async (_, next) => {
    let res = await next();
    //  ^ res.status = 500
    // This response contains the ErrorBoundary
    return res;
  },
];
```

```tsx filename=routes/parent.child.tsx
export const middleware: Route.MiddlewareFunction[] = [
  async (_, next) => {
    let res = await next();
    //  ^ res.status = 200
    // This response contains the successful UI render
    throw new Error("Uh oh, something went wrong!");
  },
];
```

## `getLoadContext`/`AppLoadContext`の変更点

<docs-info>これは、カスタムサーバーとカスタム`getLoadContext`関数を使用している場合にのみ適用されます。</docs-info>

ミドルウェアは、`getLoadContext`によって生成され、`action`と`loader`に渡される`context`パラメーターに破壊的変更を導入します。モジュール拡張された`AppLoadContext`の現在の方法は、実際には型安全ではなく、TypeScriptに「私を信じて」と伝えるようなものです。

ミドルウェアは`clientMiddleware`のためにクライアント上で同等の`context`を必要としますが、すでに不満があったサーバーからのこのパターンを複製したくなかったため、型安全に取り組める新しいAPIを導入することにしました。

ミドルウェアをオプトインすると、`context`パラメーターは[`RouterContextProvider`][RouterContextProvider]のインスタンスに変更されます。

```ts
let dbContext = createContext<Database>();
let context = new RouterContextProvider();
context.set(dbContext, getDb());
//                     ^ type-safe
let db = context.get(dbContext);
//  ^ Database
```

カスタムサーバーと`getLoadContext`関数を使用している場合、実装を更新して、プレーンなJavaScriptオブジェクトの代わりに[`RouterContextProvider`][RouterContextProvider]のインスタンスを返す必要があります。

```diff
+import {
+  createContext,
+  RouterContextProvider,
+} from "react-router";
import { createDb } from "./db";

+const dbContext = createContext<Database>();

function getLoadContext(req, res) {
-  return { db: createDb() };
+  const context = new RouterContextProvider();
+  context.set(dbContext, createDb());
+  return context;
}
```

### `AppLoadContext`からの移行

現在`AppLoadContext`を使用している場合、既存のモジュール拡張を使用して`AppLoadContext`の代わりに[`RouterContextProvider`][RouterContextProvider]を拡張することで、段階的に移行できます。次に、`getLoadContext`関数を更新して、[`RouterContextProvider`][RouterContextProvider]のインスタンスを返すようにします。

```diff
declare module "react-router" {
-  interface AppLoadContext {
+  interface RouterContextProvider {
    db: Database;
    user: User;
  }
}

function getLoadContext() {
  const loadContext = {...};
-  return loadContext;
+  let context = new RouterContextProvider();
+  Object.assign(context, loadContext);
+  return context;
}
```

これにより、`action`/`loader`は値を直接読み取ることができる（例：`context.db`）ため、ミドルウェアの初期導入時に`action`/`loader`をそのままにしておくことができます。

<docs-warning>このアプローチは、React Router v7でミドルウェアを導入する際の移行戦略としてのみ意図されており、`context.set`/`context.get`への段階的な移行を可能にします。このアプローチがReact Routerの次のメジャーバージョンで機能すると仮定するのは安全ではありません。</docs-warning>

<docs-warning>[`RouterContextProvider`][RouterContextProvider]クラスは、`<HydratedRouter getContext>`および`<RouterProvider getContext>`を介したクライアントサイドの`context`パラメーターにも使用されます。`AppLoadContext`は主にHTTPサーバーからReact Routerハンドラーへの引き渡しとして意図されているため、これらの拡張フィールドは`clientMiddleware`、`clientLoader`、または`clientAction`関数では利用できないことに注意する必要があります（もちろん、クライアントで`getContext`を介してフィールドを提供しない限り、TypeScriptはそれらが利用可能であると示しますが）。</docs-warning>

## 一般的なパターン

### 認証

```tsx filename=app/middleware/auth.ts
import { redirect } from "react-router";
import { userContext } from "~/context";
import { getSession } from "~/sessions.server";

export const authMiddleware = async ({
  request,
  context,
}) => {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    throw redirect("/login");
  }

  const user = await getUserById(userId);
  context.set(userContext, user);
};
```

```tsx filename=app/routes/protected.tsx
import { authMiddleware } from "~/middleware/auth";

export const middleware: Route.MiddlewareFunction[] = [
  authMiddleware,
];

export async function loader({
  context,
}: Route.LoaderArgs) {
  const user = context.get(userContext); // 存在が保証されます
  return { user };
}
```

### ロギング

```tsx filename=app/middleware/logging.ts
import { requestIdContext } from "~/context";

export const loggingMiddleware = async (
  { request, context },
  next,
) => {
  const requestId = crypto.randomUUID();
  context.set(requestIdContext, requestId);

  console.log(
    `[${requestId}] ${request.method} ${request.url}`,
  );

  const start = performance.now();
  const response = await next();
  const duration = performance.now() - start;

  console.log(
    `[${requestId}] Response ${response.status} (${duration}ms)`,
  );

  return response;
};
```

### 404でのCMSリダイレクト

```tsx filename=app/middleware/cms-fallback.ts
export const cmsFallbackMiddleware = async (
  { request },
  next,
) => {
  const response = await next();

  // 404を受け取ったか確認
  if (response.status === 404) {
    // CMSでリダイレクトを確認
    const cmsRedirect = await checkCMSRedirects(
      request.url,
    );
    if (cmsRedirect) {
      throw redirect(cmsRedirect, 302);
    }
  }

  return response;
};
```

### レスポンスヘッダー

```tsx filename=app/middleware/headers.ts
export const headersMiddleware = async (
  { context },
  next,
) => {
  const response = await next();

  // セキュリティヘッダーを追加
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
};
```

### 条件付きミドルウェア

```tsx
export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }, next) => {
    // POSTリクエストの場合のみ認証を実行
    if (request.method === "POST") {
      await ensureAuthenticated(request, context);
    }
    return next();
  },
];
```

### `action`と`loader`間でのコンテキスト共有

```tsx
const sharedDataContext = createContext<any>();

export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }, next) => {
    if (request.method === "POST") {
      // アクションフェーズ中にデータを設定
      context.set(
        sharedDataContext,
        await getExpensiveData(),
      );
    }
    return next();
  },
];

export async function action({
  context,
}: Route.ActionArgs) {
  const data = context.get(sharedDataContext);
  // データを活用...
}

export async function loader({
  context,
}: Route.LoaderArgs) {
  const data = context.get(sharedDataContext);
  // 同じデータがここで利用可能
}
```

[future-flags]: ../upgrading/future
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[common-patterns]: #common-patterns
[server-client]: #server-vs-client-middleware
[rr-config]: ../api/framework-conventions/react-router.config.ts
[framework-action]: ../start/framework/route-module#action
[framework-loader]: ../start/framework/route-module#loader
[getloadcontext]: #changes-to-getloadcontextapploadcontext
[datastrategy]: ../api/data-routers/createBrowserRouter#optsdatastrategy
[cms-redirect]: #cms-redirect-on-404
[createContext]: ../api/utils/createContext
[RouterContextProvider]: ../api/utils/RouterContextProvider
[getContext]: ../api/data-routers/createBrowserRouter#optsgetContext
[window]: https://developer.mozilla.org/en-US/docs/Web/API/Window
[document]: https://developer.mozilla.org/en-US/docs/Web/API/Document
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[data-action]: ../start/data/route-object#action
[data-loader]: ../start/data/route-object#loader
[asynclocalstorage]: https://nodejs.org/api/async_context.html#class-asynclocalstorage
[cloudflare]: https://developers.cloudflare.com/workers/runtime-apis/nodejs/asynclocalstorage/
[bun]: https://bun.sh/blog/bun-v0.7.0#asynclocalstorage-support
[deno]: https://docs.deno.com/api/node/async_hooks/~/AsyncLocalStorage
[ErrorBoundary]: ../start/framework/route-module#errorboundary