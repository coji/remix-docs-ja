---
title: ミドルウェア
---

# ミドルウェア

[モード: framework, data]

<br/>
<br/>

<docs-info>Framework Mode では、`getLoadContext` 関数と loader/action の `context` パラメーターに小さな[破壊的変更][getloadcontext]が含まれるため、[`future.v8_middleware`][future-flags] フラグを介してミドルウェアをオプトインする必要があります。</docs-info>

ミドルウェアを使用すると、マッチしたパスの[`Response`][Response]生成の前後でコードを実行できます。これにより、認証、ロギング、エラー処理、データ前処理などの[一般的なパターン][common-patterns]を再利用可能な方法で実現できます。

ミドルウェアはネストされたチェーンで実行され、ルートハンドラーへ「下り」方向には親ルートから子ルートへ、[`Response`][Response]が生成された後は「上り」方向には子ルートから親ルートへ実行されます。

例えば、`GET /parent/child` リクエストでは、ミドルウェアは以下の順序で実行されます。

```text
- Root middleware start
  - Parent middleware start
    - Child middleware start
      - Run loaders, generate HTML Response
    - Child middleware end
  - Parent middleware end
- Root middleware end
```

<docs-info>サーバー (framework mode) とクライアント (framework/data mode) のミドルウェアには、若干の違いがあります。このドキュメントでは、過去に他の HTTP サーバーでミドルウェアを使用したことがあるユーザーにとって最も馴染みのある Server Middleware をほとんどの例で参照します。詳細については、下記の[Server vs Client Middleware][server-client]セクションを参照してください。</docs-info>

## クイックスタート (Framework mode)

### 1. ミドルウェアフラグを有効にする

まず、[React Router config][rr-config]でミドルウェアを有効にします。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    v8_middleware: true,
  },
} satisfies Config;
```

<docs-warning>ミドルウェア機能を有効にすると、[`action`][framework-action] と [`loader`][framework-loader] の `context` パラメーターの型が変更されます。現在 `context` を積極的に使用している場合は、下記の [`getLoadContext`][getloadcontext] に関するセクションに注意してください。</docs-warning>

### 2. context を作成する

ミドルウェアは、`context` provider のインスタンスを使用して、ミドルウェアチェーンの下位にデータを提供します。
[`createContext`][createContext] を使用して、型安全な context オブジェクトを作成できます。

```ts filename=app/context.ts
import { createContext } from "react-router";
import type { User } from "~/types";

export const userContext = createContext<User | null>(null);
```

### 3. ルートからミドルウェアをエクスポートする

```tsx filename=app/routes/dashboard.tsx
import { redirect } from "react-router";
import { userContext } from "~/context";

// Server-side Authentication Middleware
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

// Client-side timing middleware
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

### 4. `getLoadContext` 関数を更新する (該当する場合)

カスタムサーバーと `getLoadContext` 関数を使用している場合、実装を更新して、JavaScript オブジェクトの代わりに [`RouterContextProvider`][RouterContextProvider] のインスタンスを返すようにする必要があります。

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

## クイックスタート (Data Mode)

<docs-info>Data Mode には future flag はありません。これは、ルートにミドルウェアを追加することでオプトインできるため、future flag を必要とする破壊的変更が存在しないためです。</docs-info>

### 1. context を作成する

ミドルウェアは、`context` provider のインスタンスを使用して、ミドルウェアチェーンの下位にデータを提供します。
[`createContext`][createContext] を使用して、型安全な context オブジェクトを作成できます。

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

### 3. `getContext` 関数を追加する (オプション)

すべてのナビゲーション/フェッチに基本 context を含めたい場合は、ルーターに [`getContext`][getContext] 関数を追加できます。これは、すべてのナビゲーション/フェッチで新しい context を設定するために呼び出されます。

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

<docs-info>この API は、Framework Mode のサーバーにおける `getLoadContext` API をミラーリングするために存在し、HTTP サーバーから React Router ハンドラーに値を渡す方法として存在します。この [`getContext`][getContext] API は、[`window`][window]/[`document`][document] から React Router にグローバルな値を渡すために使用できますが、それらがすべて同じ context (ブラウザ) で実行されているため、ルートルートのミドルウェアでも実質的に同じ動作を実現できます。したがって、サーバーと同じようにこの API を必要としないかもしれませんが、一貫性のために提供されています。</docs-info>

## コアコンセプト

### サーバーミドルウェアとクライアントミドルウェア

Server middleware は、Framework mode のサーバーで、HTML Document リクエストと、その後のナビゲーションおよび fetcher 呼び出しのための `.data` リクエストに対して実行されます。server middleware は HTTP [`Request`][request] に応答してサーバー上で実行されるため、`next` 関数を介して HTTP [`Response`][Response] をミドルウェアチェーンの上位に返します。

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

Client middleware は、クライアントサイドのナビゲーションおよび fetcher 呼び出しのために、framework と data mode のブラウザで実行されます。client middleware は HTTP Request がないため、server middleware とは異なります。そのため、上位にバブルアップする [`Response`][Response] がありません。ほとんどの場合、`next` からの戻り値を無視し、クライアント側のミドルウェアからは何も返さないことができます。

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

ローダー/アクションの結果に基づいて何らかの後処理を行いたい_場合_もあります。[`Response`][Response] の代わりに、client middleware はアクティブな [`dataStrategy`][datastrategy] から返される値 (route id でキー付けされた `Record<string, DataStrategyResult>`) を上位にバブルアップさせます。これにより、実行された `loader`/`action` 関数の結果に基づいて、ミドルウェアで条件付きアクションを実行できます。

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

<docs-warning>server middleware では、[`Response`][Response] ボディを操作するべきではなく、ステータス/ヘッダーの読み取りとヘッダーの設定のみを行うべきです。同様に、この値は client middleware では読み取り専用と見なすべきです。なぜなら、これは結果として得られるナビゲーションの「ボディ」または「データ」を表し、これはミドルウェアではなく loader/action によって駆動されるべきだからです。これはまた、client middleware では、`await next()` から結果をキャプチャする必要があったとしても、通常、結果を返す必要がないことを意味します。</docs-warning>

### ミドルウェアが実行されるタイミング

アプリケーションが意図したとおりに動作していることを確認するためには、ミドルウェアが_いつ_実行されるかを理解することが非常に重要です。

#### サーバーミドルウェア

ハイドレートされた Framework Mode アプリでは、server middleware は SPA の動作を優先し、デフォルトでは新しいネットワークアクティビティを作成しないように設計されています。ミドルウェアは_既存の_リクエストをラップし、サーバーにヒットする_必要が_ある場合にのみ実行されます。

ここで、React Router における「ハンドラー」とは何かという疑問が生じます。それは route でしょうか？それとも `loader` でしょうか？私たちは「場合による」と考えています。

- ドキュメントリクエスト (`GET /route`) では、ハンドラーは route です。なぜなら、レスポンスは `loader` と route component の両方を包含するからです。
- クライアントサイドナビゲーションのデータリクエスト (`GET /route.data`) では、ハンドラーは [`action`][data-action]/[`loader`][data-loader] です。なぜなら、レスポンスに含まれるのはそれだけだからです。

したがって：

- ドキュメントリクエストは、UI をレンダリングするための「ハンドラー」にまだいるため、`loader` が存在するかどうかにかかわらず server middleware を実行します。
- クライアントサイドナビゲーションは、[`action`][framework-action]/[`loader`][framework-loader] のための `.data` リクエストがサーバーに対して行われた場合にのみ server middleware を実行します。

これは、リクエスト期間のロギング、セッションのチェック/設定、出力キャッシュヘッダーの設定など、リクエストアノテーションミドルウェアにとって重要な動作です。そもそもサーバーにアクセスする理由がない場合に、サーバーにアクセスしてこれらの種類のミドルウェアを実行しても無意味です。これにより、サーバー負荷が増加し、サーバーログが煩雑になります。

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

しかし、`loader` が存在しない場合でも、_すべての_クライアントナビゲーションで特定の server middleware を実行したい_場合_があるかもしれません。例えば、サイトの認証済みセクションにあるフォームで、`loader` を必要としないが、ユーザーがフォームを送信して `action` に到達する前ではなく、フォームに入力する前に認証ミドルウェアを使用してユーザーをリダイレクトしたい場合などです。ミドルウェアがこれらの基準を満たしている場合、ミドルウェアを含むルートに `loader` を配置することで、そのルートを含むクライアントサイドナビゲーションに対して常にサーバーを呼び出すように強制できます。

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

client middleware はよりシンプルです。なぜなら、私たちはすでにクライアントにいて、ナビゲーション時には常にルーターに「リクエスト」を行っているからです。Client middleware は、実行すべき `loader` があるかどうかにかかわらず、すべてのクライアントナビゲーションで実行されます。

### Context API

新しい context システムは、型安全を提供し、名前の競合を防ぎ、ネストされたミドルウェアや `action`/`loader` 関数にデータを提供することを可能にします。Framework Mode では、これは以前の `AppLoadContext` API を置き換えます。

```ts
// ✅ Type-safe
import { createContext } from "react-router";
const userContext = createContext<User>();

// Later in middleware/`loader`s
context.set(userContext, user); // Must be `User` type
const user = context.get(userContext); // Returns `User` type

// ❌ Old way (no type safety)
context.user = user; // Could be anything
```

#### `Context` と `AsyncLocalStorage`

Node は、非同期実行 context を介して値を提供する方法を提供する [`AsyncLocalStorage`][asynclocalstorage] API を提供します。これは Node API ですが、ほとんどの最新のランタイムで (ほとんど) 利用可能になっています ([Cloudflare][cloudflare]、[Bun][bun]、[Deno][deno] など)。

理論的には、ミドルウェアから子ルートへ値を渡す方法として [`AsyncLocalStorage`][asynclocalstorage] を直接活用することもできたかもしれませんが、100% のクロスプラットフォーム互換性がないことが十分に懸念されたため、ランタイムに依存しない方法で確実に動作する再利用可能なミドルウェアパッケージを公開できる方法として、ファーストクラスの `context` API を依然として提供したいと考えました。

とはいえ、この API は React Router のミドルウェアと依然としてうまく機能し、`context` API の代わりに、またはそれと組み合わせて使用​​できます。

<docs-info>[`AsyncLocalStorage`][asynclocalstorage] は、[React Server Components](../how-to/react-server-components) を使用する際に_特に_強力です。なぜなら、`middleware` から Server Components および Server Actions に情報を提供できるからです。それらは同じサーバー実行 context で実行されるためです 🤯</docs-info>

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

### `next` 関数

`next` 関数のロジックは、それがどのルートミドルウェアから呼び出されているかによって異なります。

- リーフではないミドルウェアから呼び出された場合、チェーン内の次のミドルウェアを実行します。
- リーフミドルウェアから呼び出された場合、ルートハンドラーを実行し、リクエストに対する結果の[`Response`][Response]を生成します。

```ts
const middleware = async ({ context }, next) => {
  // Code here runs BEFORE handlers
  console.log("Before");

  const response = await next();

  // Code here runs AFTER handlers
  console.log("After");

  return response; // クライアントではオプション、サーバーでは必須
};
```

<docs-warning>`next()` はミドルウェアごとに一度しか呼び出せません。複数回呼び出すとエラーが発生します</docs-warning>

### `next()` のスキップ

ハンドラーの後にコードを実行する必要がない場合は、`next()` の呼び出しをスキップできます。

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

### `next()` とエラーハンドリング

React Router には、ルートの [`ErrorBoundary`][ErrorBoundary] エクスポートを介した組み込みのエラー処理が含まれています。`action`/`loader` がスローした場合と同様に、`middleware` がスローした場合、適切な [`ErrorBoundary`][ErrorBoundary] で捕捉され処理され、祖先の `next()` 呼び出しを介して[`Response`][Response]が返されます。これは、`next()` 関数が決してスローせず、常に[`Response`][Response]を返す必要があることを意味するため、try/catch でラップすることを心配する必要はありません。

この動作は、ルート `middleware` からの応答（セッションのコミットなど）に必要なヘッダーを自動的に設定するようなミドルウェアパターンを可能にする上で重要です。`middleware` からのエラーが `next()` を `throw` させた場合、上位ミドルウェアの実行がスキップされ、必要なヘッダーが設定されなくなってしまいます。

```tsx filename=routes/parent.tsx
export const middleware: Route.MiddlewareFunction[] = [
  async (_, next) => {
    let res = await next();
    //  ^ res.status = 500
    // この response には ErrorBoundary が含まれています
    return res;
  },
];
```

```tsx filename=routes/parent.child.tsx
export const middleware: Route.MiddlewareFunction[] = [
  async (_, next) => {
    let res = await next();
    //  ^ res.status = 200
    // この response には正常にレンダリングされた UI が含まれています
    throw new Error("Uh oh, something went wrong!");
  },
];
```

どの [`ErrorBoundary`][ErrorBoundary] がレンダリングされるかは、ミドルウェアが `next()` 関数を呼び出す_前_にスローしたか_後_にスローしたかによって異なります。_後_にスローされた場合、すでに loader を実行しており、route component でレンダリングするための適切な `loaderData` があるため、通常の loader エラーと同様にスローしたルートからバブルアップします。しかし、`next()` を呼び出す_前_にエラーがスローされた場合、まだ loader を呼び出しておらず、利用可能な `loaderData` がありません。この場合、`loader` を持つ最も上位のルートまでバブルアップし、そこで [`ErrorBoundary`][ErrorBoundary] を探し始める必要があります。そのレベル以下では、`loaderData` なしではいかなる route component もレンダリングできません。

## `getLoadContext` と `AppLoadContext` への変更点

<docs-info>これは、カスタムサーバーとカスタム `getLoadContext` 関数を使用している場合にのみ適用されます。</docs-info>

ミドルウェアは、`getLoadContext` によって生成され、`action` と `loader` に渡される `context` パラメーターに破壊的変更を導入します。モジュール拡張された `AppLoadContext` の現在の方法は、実際には型安全ではなく、TypeScript に「私を信じて」と言うようなものです。

ミドルウェアには `clientMiddleware` 用にクライアント側で同等の `context` が必要ですが、すでに不満を抱いていたサーバー側のこのパターンを重複させたくなかったため、型安全性を解決できる新しい API を導入することにしました。

ミドルウェアをオプトインすると、`context` パラメーターは [`RouterContextProvider`][RouterContextProvider] のインスタンスに変更されます。

```ts
let dbContext = createContext<Database>();
let context = new RouterContextProvider();
context.set(dbContext, getDb());
//                     ^ 型安全
let db = context.get(dbContext);
//  ^ Database
```

カスタムサーバーと `getLoadContext` 関数を使用している場合、実装を更新して、プレーンな JavaScript オブジェクトの代わりに [`RouterContextProvider`][RouterContextProvider] のインスタンスを返すようにする必要があります。

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

### AppLoadContext からの移行

現在 `AppLoadContext` を使用している場合、既存のモジュール拡張を使用して `AppLoadContext` の代わりに [`RouterContextProvider`][RouterContextProvider] を拡張することで、段階的に移行できます。次に、`getLoadContext` 関数を更新して、[`RouterContextProvider`][RouterContextProvider] のインスタンスを返すようにします。

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

これにより、`action` と `loader` は値を直接読み取ることができるため (`context.db` など)、ミドルウェアの初期導入時にそれらを変更せずに残すことができます。

<docs-warning>このアプローチは、React Router v7 でミドルウェアを導入する際の移行戦略としてのみ使用することを意図しており、`context.set`/`context.get` への段階的な移行を可能にします。このアプローチが React Router の次のメジャーバージョンで機能すると仮定するのは安全ではありません。</docs-warning>

<docs-warning>[`RouterContextProvider`][RouterContextProvider] クラスは、`<HydratedRouter getContext>` および `<RouterProvider getContext>` を介したクライアントサイドの `context` パラメーターにも使用されます。`AppLoadContext` は主に HTTP サーバーから React Router ハンドラーへの引き渡しを意図しているため、これらの拡張フィールドは `clientMiddleware`、`clientLoader`、または `clientAction` 関数では利用できないことに注意する必要があります (もちろん、クライアント側で `getContext` を介してフィールドを提供する場合を除きます)。</docs-warning>

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
  const user = context.get(userContext); // 存在することが保証されています
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

  // Check if we got a 404
  if (response.status === 404) {
    // Check CMS for a redirect
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

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
};
```

### 条件付きミドルウェア

```tsx
export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }, next) => {
    // Only run auth for POST requests
    if (request.method === "POST") {
      await ensureAuthenticated(request, context);
    }
    return next();
  },
];
```

### action と loader 間での Context 共有

<docs-info>サーバーでは、`context` はリクエストにスコープされているため、このアプローチはドキュメントの POST リクエストに対してのみ機能します。SPA ナビゲーションの送信は個別の POST/GET リクエストを使用するため、それらの間で `context` を共有することはできません。このパターンは、個別の HTTP リクエストがないため、`clientMiddleware`、`clientLoader`、`clientAction` で常に機能します。</docs-info>

```tsx
const sharedDataContext = createContext<any>();

export const middleware: Route.MiddlewareFunction[] = [
  async ({ request, context }, next) => {
    // データが存在しない場合に設定
    // これはドキュメントリクエストに対して一度だけ実行されます
    // SPA の送信では二度 (action リクエスト + loader リクエスト) 実行されます
    if (!context.get(sharedDataContext)) {
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
  // データを...使用します。
}

export async function loader({
  context,
}: Route.LoaderArgs) {
  const data = context.get(sharedDataContext);
  // 同じデータがここで利用可能です
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