---
title: React Server Components
unstable: true
---

# React Server Components

[MODES: framework, data]

<br/>
<br/>

<docs-warning>React Server Componentsのサポートは実験的なものであり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。使用する際は注意し、関連する変更についてはリリースノートに**非常に**注意を払ってください。</docs-warning>

React Server Components (RSC) は、React バージョン 19 以降で提供されるアーキテクチャと API セットの総称です。

ドキュメントより:

> Server Components は、バンドルされる前に、クライアントアプリや SSR サーバーとは別の環境で事前にレンダーされる新しいタイプの Component です。
>
> <cite>- [React "Server Components" ドキュメント][react-server-components-doc]</cite>

React Router は、RSC 互換のバンドラーと統合するための API セットを提供し、React Router アプリケーションで [Server Components][react-server-components-doc] や [Server Functions][react-server-functions-doc] を活用できるようにします。

これらの React の機能に慣れていない場合は、React Router の RSC API を使用する前に、公式の [Server Components ドキュメント][react-server-components-doc]を読むことをお勧めします。

RSC サポートは、Framework Mode と Data Mode の両方で利用可能です。これらの概念的な違いについては、["Picking a Mode"][picking-a-mode] を参照してください。ただし、このガイドで詳しく説明するように、RSC と非 RSC モードでは API と機能が異なることに注意してください。

## クイックスタート

最も早く始めるには、私たちのテンプレートのいずれかを使用するのが最速です。

これらのテンプレートには、React Router RSC API が既に設定されており、以下のようなすぐに使える機能を提供します。

- Server Component Route
- Server Side Rendering (SSR)
- Client Components ([`"use client"`][use-client-docs] ディレクティブ経由)
- Server Functions ([`"use server"`][use-server-docs] ディレクティブ経由)

### RSC Framework Mode テンプレート

[RSC Framework Mode テンプレート][framework-rsc-template]は、不安定版の React Router RSC Vite プラグインと実験版の [`@vitejs/plugin-rsc` プラグイン][vite-plugin-rsc]を使用します。

```shellscript
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-framework-mode
```

### RSC Data Mode テンプレート

[Vite RSC Data Mode テンプレート][vite-rsc-template]は、実験版の Vite `@vitejs/plugin-rsc` プラグインを使用します。

```shellscript
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-data-mode-vite
```

## RSC Framework Mode

RSC Framework Mode のほとんどの API と機能は、非 RSC Framework Mode と同じであるため、このガイドでは違いに焦点を当てます。

### 新しい React Router RSC Vite Plugin

RSC Framework Mode は、非 RSC Framework Mode とは異なる Vite plugin を使用します。これは現在 `unstable_reactRouterRSC` としてエクスポートされています。

この新しい Vite plugin には、実験的な `@vitejs/plugin-rsc` plugin への peer dependency もあります。`@vitejs/plugin-rsc` plugin は、Vite config 内で React Router RSC plugin の後に配置する必要があることに注意してください。

```tsx filename=vite.config.ts
import { defineConfig } from "vite";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";

export default defineConfig({
  plugins: [reactRouterRSC(), rsc()],
});
```

### ビルド出力

RSC Framework Mode のサーバービルドファイル (`build/server/index.js`) は、ドキュメント/データリクエスト用に `default` リクエストハンドラー関数 (`(request: Request) => Promise<Response>`) をエクスポートするようになりました。

必要に応じて、これを Node の組み込み `http.createServer` 関数 (またはそれをサポートするもの、例: [Express][express]) で使用するための [標準的な Node.js request listener][node-request-listener] に変換するには、`createRequestListener` 関数を `@remix-run/node-fetch-server` から使用します。

例えば、Express の場合:

```tsx filename=start.js
import express from "express";
import requestHandler from "./build/server/index.js";
import { createRequestListener } from "@remix-run/node-fetch-server";

const app = express();

app.use(
  "/assets",
  express.static("build/client/assets", {
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(express.static("build/client"));
app.use(createRequestListener(requestHandler));
app.listen(3000);
```

### ローダー/アクションからの React 要素

RSC Framework Mode では、loader と action は他のデータと共に React 要素を返すことができるようになりました。これらの要素は常にサーバー上でレンダーされます。

```tsx
import type { Route } from "./+types/route";

export async function loader() {
  return {
    message: "Message from the server!",
    element: <p>Element from the server!</p>,
  };
}

export default function Route({
  loaderData,
}: Route.ComponentProps) {
  return (
    <>
      <h1>{loaderData.message}</h1>
      {loaderData.element}
    </>
  );
}
```

loader/action から返される React 要素内でクライアントのみの機能 (例: [Hooks][hooks]、イベントハンドラー) を使用する必要がある場合は、これらの機能を使用する component を [クライアントモジュール][use-client-docs]に抽出する必要があります。

```tsx filename=src/routes/counter/counter.tsx
"use client";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

```tsx filename=src/routes/counter/route.tsx
import type { Route } from "./+types/route";
import { Counter } from "./counter";

export async function loader() {
  return {
    message: "Message from the server!",
    element: (
      <>
        <p>Element from the server!</p>
        <Counter />
      </>
    ),
  };
}

export default function Route({
  loaderData,
}: Route.ComponentProps) {
  return (
    <>
      <h1>{loaderData.message}</h1>
      {loaderData.element}
    </>
  );
}
```

### Server Component Route

route が典型的な `default` component export の代わりに `ServerComponent` をエクスポートする場合、この component は他の route component (`ErrorBoundary`、`HydrateFallback`、`Layout`) とともに、通常のクライアント component ではなくサーバー component になります。

```tsx
import type { Route } from "./+types/route";
import { Outlet } from "react-router";
import { getMessage } from "./message";

export async function loader() {
  return {
    message: await getMessage(),
  };
}

export function ServerComponent({
  loaderData,
}: Route.ComponentProps) {
  return (
    <>
      <h1>Server Component Route</h1>
      <p>Message from the server: {loaderData.message}</p>
      <Outlet />
    </>
  );
}
```

サーバーファーストルート内でクライアントのみの機能 (例: [Hooks][hooks]、イベントハンドラー) を使用する必要がある場合は、これらの機能を使用する component を [クライアントモジュール][use-client-docs]に抽出する必要があります。

```tsx filename=src/routes/counter/counter.tsx
"use client";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

```tsx filename=src/routes/counter/route.tsx
import { Counter } from "./counter";

export function ServerComponent() {
  return (
    <>
      <h1>Counter</h1>
      <Counter />
    </>
  );
}
```

### `.server`/`.client` モジュール

RSC の `"use server"` および `"use client"` ディレクティブとの混同を避けるため、RSC Framework Mode を使用する場合、[`.server` モジュール][server-modules] と [`.client` モジュール][client-modules] のサポートは組み込まれなくなりました。

ファイル命名規則に依存しない代替ソリューションとして、[`@vitejs/plugin-rsc`][vite-plugin-rsc] が提供する `"server-only"` および `"client-only"` インポートを使用することをお勧めします。たとえば、モジュールが誤ってクライアントビルドに含まれないようにするには、サーバー専用モジュール内で `"server-only"` から副作用としてインポートするだけです。

```ts filename=app/utils/db.ts
import "server-only";

// Rest of the module...
```

React チームによって作成された公式の npm パッケージ [`server-only`][server-only-package] と [`client-only`][client-only-package] がありますが、それらをインストールする必要はありません。`@vitejs/plugin-rsc` はこれらのインポートを内部的に処理し、実行時エラーではなくビルド時の検証を提供します。

`.server` および `.client` ファイル命名規則に依存する既存のコードを迅速に移行したい場合は、[`vite-env-only` プラグイン][vite-env-only] を直接使用することをお勧めします。たとえば、`.server` モジュールが誤ってクライアントビルドに含まれないようにするには、次のようになります。

```tsx filename=vite.config.ts
import { defineConfig } from "vite";
import { denyImports } from "vite-env-only";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";

export default defineConfig({
  plugins: [
    denyImports({
      client: { files: ["**/.server/*", "**/*.server.*"] },
    }),
    reactRouterRSC(),
    rsc(),
  ],
});
```

### MDX Route のサポート

MDX route は、`@mdx-js/rollup` v3.1.1+ を使用する場合、RSC Framework Mode でサポートされます。

MDX route からエクスポートされるすべての component は、RSC 環境でも有効である必要があることに注意してください。つまり、[Hooks][hooks] のようなクライアントのみの機能を使用することはできません。これらの機能を使用する必要がある component は、[クライアントモジュール][use-client-docs]に抽出する必要があります。

### カスタムエントリーファイル

RSC Framework Mode はカスタムエントリーファイルをサポートしており、RSC サーバー、SSR サーバー、およびクライアントのエントリーポイントの動作をカスタマイズできます。

プラグインは `app` ディレクトリ内のカスタムエントリーファイルを自動的に検出します。

- `app/entry.rsc.ts` (または `.tsx`) - カスタム RSC サーバーエントリー
- `app/entry.ssr.ts` (または `.tsx`) - カスタム SSR サーバーエントリー
- `app/entry.client.tsx` - カスタムクライアントエントリー

これらのファイルが見つからない場合、React Router はフレームワークが提供するデフォルトのエントリーを使用します。

#### 基本的なオーバーライドパターン

デフォルトの動作をラップまたは拡張するカスタムエントリーファイルを作成できます。たとえば、RSC エントリーにカスタムログを追加するには、次のようになります。

```ts filename=app/entry.rsc.ts
import defaultEntry from "@react-router/dev/config/default-rsc-entries/entry.rsc";
import { RouterContextProvider } from "react-router";

export default {
  fetch(request: Request): Promise<Response> {
    console.log(
      "Custom RSC entry handling request:",
      request.url,
    );

    const requestContext = new RouterContextProvider();

    return defaultEntry.fetch(request, requestContext);
  },
};

if (import.meta.hot) {
  import.meta.hot.accept();
}
```

同様に、SSR エントリーをカスタマイズできます。

```ts filename=app/entry.ssr.ts
import { generateHTML as defaultGenerateHTML } from "@react-router/dev/config/default-rsc-entries/entry.ssr";

export function generateHTML(
  request: Request,
  serverResponse: Response,
): Promise<Response> {
  console.log(
    "Custom SSR entry generating HTML for:",
    request.url,
  );

  return defaultGenerateHTML(request, serverResponse);
}
```

そしてクライアント用:

```ts filename=app/entry.client.ts
import "@react-router/dev/config/default-rsc-entries/entry.client";
```

#### デフォルトエントリーのコピー

より高度なカスタマイズには、デフォルトのエントリーをコピーして必要に応じて変更できます。デフォルトのエントリーを見つけるには:

1. IDE で、デフォルトのエントリーインポートに対して「定義へ移動」(または Cmd/Ctrl+クリック) を使用します。

   ```ts
   import defaultEntry from "@react-router/dev/config/default-rsc-entries/entry.rsc";
   ```

2. デフォルトのエントリーコードをカスタムファイルにコピーします。

3. 必要に応じて変更します。

デフォルトのエントリーは以下の場所にあります。

- [`@react-router/dev/config/default-rsc-entries/entry.rsc`][entry-rsc-source]
- [`@react-router/dev/config/default-rsc-entries/entry.ssr`][entry-ssr-source]
- [`@react-router/dev/config/default-rsc-entries/entry.client`][entry-client-source]

上記のリンクを使用して GitHub でソースコードを表示するか、`node_modules/@react-router/dev/dist/config/default-rsc-entries/` にあるこれらのファイルに直接移動できます。

<docs-info>

デフォルトのエントリーをコピーする際は、必要な export を維持してください。

- `entry.rsc.ts` は `fetch` メソッドを持つデフォルトオブジェクトを export する必要があります。
- `entry.ssr.ts` は `generateHTML` 関数を export する必要があります。
- `entry.client.tsx` はクライアントサイドの hydration を処理する必要があります。

</docs-info>

### サポートされていない設定オプション

最初の不安定版リリースでは、`react-router.config.ts` の以下のオプションは RSC Framework Mode ではまだサポートされていません。

- `buildEnd`
- `prerender`
- `presets`
- `routeDiscovery`
- `serverBundles`
- `ssr: false` (SPA Mode)
- `future.v8_splitRouteModules`
- `future.unstable_subResourceIntegrity`

## RSC Data Mode

上記の RSC Framework Mode API は、より低レベルの RSC Data Mode API の上に構築されています。

RSC Data Mode には、RSC Framework Mode の一部の機能 (`routes.ts` config やファイルシステムルーティング、HMR、Hot Data Revalidation など) が欠けていますが、より柔軟性があり、独自のバンドラーやサーバー抽象化と統合できます。

### ルートの設定

Route は [`matchRSCServerRequest`][match-rsc-server-request] の引数として設定されます。最低限、path と component が必要です。

```tsx
function Root() {
  return <h1>Hello world</h1>;
}

matchRSCServerRequest({
  // ...other options
  routes: [{ path: "/", Component: Root }],
});
```

component をインラインで定義することもできますが、起動時のパフォーマンスとコードの整理の両方のために、`lazy()` オプションを使用して [Route Modules][route-module] を定義することをお勧めします。

<docs-info>

これまでの [Route Module API][route-module] は、[Framework Mode][framework-mode] のみの機能でした。しかし、RSC route config の `lazy` フィールドは Route Module の export と同じ export を期待しており、API をさらに統一しています。

</docs-info>

```tsx filename=app/routes.ts
import type { unstable_RSCRouteConfig as RSCRouteConfig } from "react-router";

export function routes() {
  return [
    {
      id: "root",
      path: "",
      lazy: () => import("./root/route"),
      children: [
        {
          id: "home",
          index: true,
          lazy: () => import("./home/route"),
        },
        {
          id: "about",
          path: "about",
          lazy: () => import("./about/route"),
        },
      ],
    },
  ] satisfies RSCRouteConfig;
}
```

### Server Component Route

デフォルトでは、各 route の `default` export は Server Component をレンダーします。

```tsx
export default function Home() {
  return (
    <main>
      <article>
        <h1>Welcome to React Router RSC</h1>
        <p>
          You won't find me running any JavaScript in the
          browser!
        </p>
      </article>
    </main>
  );
}
```

Server Component の優れた機能は、非同期にすることで component から直接データをフェッチできることです。

```tsx
export default async function Home() {
  let user = await getUserData();

  return (
    <main>
      <article>
        <h1>Welcome to React Router RSC</h1>
        <p>
          You won't find me running any JavaScript in the
          browser!
        </p>
        <p>
          Hello, {user ? user.name : "anonymous person"}!
        </p>
      </article>
    </main>
  );
}
```

<docs-info>

Server Components は、loader や action からも返されます。一般的に、RSC を使用してアプリケーションを構築する場合、loader は主に `status` コードの設定や `redirect` の返却などに役立ちます。

loader で Server Components を使用することは、RSC の段階的な導入に役立ちます。

</docs-info>

### Server Functions

[Server Functions][react-server-functions-doc] は、サーバーで実行される非同期関数を呼び出すことができる React の機能です。これらは [`"use server"`][use-server-docs] ディレクティブで定義されます。

```tsx
"use server";

export async function updateFavorite(formData: FormData) {
  let movieId = formData.get("id");
  let intent = formData.get("intent");
  if (intent === "add") {
    await addFavorite(Number(movieId));
  } else {
    await removeFavorite(Number(movieId));
  }
}
```

```tsx
import { updateFavorite } from "./action.ts";
export async function AddToFavoritesForm({
  movieId,
}: {
  movieId: number;
}) {
  let isFav = await isFavorite(movieId);
  return (
    <form action={updateFavorite}>
      <input type="hidden" name="id" value={movieId} />
      <input
        type="hidden"
        name="intent"
        value={isFav ? "remove" : "add"}
      />
      <AddToFavoritesButton isFav={isFav} />
    </form>
  );
}
```

サーバー関数が呼び出された後、React Router は自動的に route を再検証し、新しいサーバーコンテンツで UI を更新することに注意してください。キャッシュの無効化について心配する必要はありません。

### クライアントプロパティ

Route は実行時にサーバー上で定義されますが、クライアント参照と `"use client"` を利用することで `clientLoader`、`clientAction`、`shouldRevalidate` を提供できます。

```tsx filename=src/routes/root/client.tsx
"use client";

export function clientAction() {}

export function clientLoader() {}

export function shouldRevalidate() {}
```

これらを遅延ロードされた route モジュールから再エクスポートできます。

```tsx filename=src/routes/root/route.tsx
export {
  clientAction,
  clientLoader,
  shouldRevalidate,
} from "./route.client";

export default function Root() {
  // ...
}
```

これは、route 全体を Client Component にする方法でもあります。

```tsx filename=src/routes/root/route.tsx lines=[1,11]
import { default as ClientRoot } from "./route.client";
export {
  clientAction,
  clientLoader,
  shouldRevalidate,
} from "./route.client";

export default function Root() {
  // Adding a Server Component at the root is required by bundlers
  // if you're using css side-effects imports.
  return <ClientRoot />;
}
```

### バンドラー設定

React Router は、RSC 互換バンドラーと簡単に統合できるいくつかの API を提供します。これは、React Router Data Mode を使用して独自の [カスタムフレームワーク][custom-framework] を作成する場合に役立ちます。

以下の手順は、Server Components (RSC) を使用してページをサーバーレンダー (SSR) し、シングルページアプリ (SPA) ナビゲーション用にそれらをハイドレートするように React Router アプリケーションを設定する方法を示しています。SSR (またはクライアントサイドのハイドレーションでさえ) を使用したくない場合は、使用する必要はありません。Static Site Generation (SSG) または Incremental Static Regeneration (ISR) のために HTML 生成を活用することもできます。このガイドは、典型的な RSC ベースのアプリケーション向けに、すべての異なる API を連携させる方法を説明することを目的としています。

### エントリーポイント

[route 定義](#configuring-routes)に加えて、以下の設定が必要です。

1. 受信リクエストを処理し、RSC ペイロードをフェッチし、それを HTML に変換するサーバー
2. RSC ペイロードを生成する React サーバー
3. 生成された HTML をハイドレートし、ハイドレーション後のサーバーアクションをサポートするための `callServer` 関数を設定するブラウザハンドラー

以下の命名規則は、分かりやすさと簡潔さのために選択されました。必要に応じてエントリーポイントを自由に命名および設定してください。

以下の各エントリーポイントの具体的なコード例については、関連するバンドラーのドキュメントを参照してください。

これらの例はすべて、サーバーとリクエスト処理に [express][express] と [@remix-run/node-fetch-server][node-fetch-server] を使用しています。

**Route**

[ルートの設定](#configuring-routes)を参照してください。

**サーバー**

<docs-info>

SSR をまったく使用する必要はありません。RSC を使用して Static Site Generation (SSG) や Incremental Static Regeneration (ISR) のために HTML を「事前レンダー」することを選択できます。

</docs-info>

`entry.ssr.tsx` はサーバーのエントリーポイントです。これは、リクエストを処理し、RSC サーバーを呼び出し、ドキュメントリクエスト (サーバーサイドレンダリング) で RSC ペイロードを HTML に変換する役割を担います。

関連する API:

- [`routeRSCServerRequest`][route-rsc-server-request]
- [`RSCStaticRouter`][rsc-static-router]

**RSC サーバー**

<docs-info>

「React サーバー」とリクエスト処理/SSR を担当するサーバーがある場合でも、実際には2つの別々のサーバーを持つ必要はありません。同じサーバー内に2つの別々のモジュールグラフを持つだけで済みます。これは、RSC ペイロードを生成する場合と、クライアントでハイドレートされる HTML を生成する場合とで React の動作が異なるため、重要です。

</docs-info>

`entry.rsc.tsx` は React Server のエントリーポイントです。これは、リクエストを route に一致させ、RSC ペイロードを生成する役割を担います。

関連する API:

- [`matchRSCServerRequest`][match-rsc-server-request]

**ブラウザ**

`entry.browser.tsx` はクライアントのエントリーポイントです。これは、生成された HTML をハイドレートし、ハイドレーション後のサーバーアクションをサポートするための `callServer` 関数を設定する役割を担います。

関連する API:

- [`createCallServer`][create-call-server]
- [`getRSCStream`][get-rsc-stream]
- [`RSCHydratedRouter`][rsc-hydrated-router]

### Vite

詳細については、[@vitejs/plugin-rsc ドキュメント][vite-plugin-rsc] を参照してください。動作するバージョンについては、[Vite RSC Data Mode テンプレート][vite-rsc-template] も参照してください。

`react`、`react-dom`、`react-router` に加えて、以下の依存関係が必要です。

```shellscript
npm i -D vite @vitejs/plugin-react @vitejs/plugin-rsc
```

#### `vite.config.ts`

Vite を設定するには、`vite.config.ts` に以下を追加します。

```ts filename=vite.config.ts
import rsc from "@vitejs/plugin-rsc/plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    rsc({
      entries: {
        client: "src/entry.browser.tsx",
        rsc: "src/entry.rsc.tsx",
        ssr: "src/entry.ssr.tsx",
      },
    }),
  ],
});
```

```tsx filename=src/routes/config.ts
import type { unstable_RSCRouteConfig as RSCRouteConfig } from "react-router";

export function routes() {
  return [
    {
      id: "root",
      path: "",
      lazy: () => import("./root/route"),
      children: [
        {
          id: "home",
          index: true,
          lazy: () => import("./home/route"),
        },
        {
          id: "about",
          path: "about",
          lazy: () => import("./about/route"),
        },
      ],
    },
  ] satisfies RSCRouteConfig;
}
```

#### `entry.ssr.tsx`

以下は、Vite SSR Server の簡略化された例です。

```tsx filename=src/entry.ssr.tsx
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from "react-router";

export async function generateHTML(
  request: Request,
  serverResponse: Response,
): Promise<Response> {
  return await routeRSCServerRequest({
    // The incoming request.
    request,
    // The React Server response
    serverResponse,
    // Provide the React Server touchpoints.
    createFromReadableStream,
    // Render the router to HTML.
    async renderHTML(getPayload) {
      const payload = getPayload();

      const bootstrapScriptContent =
        await import.meta.viteRsc.loadBootstrapScriptContent(
          "index",
        );

      return await renderHTMLToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          bootstrapScriptContent,
          formState: payload.formState,
        },
      );
    },
  });
}
```

#### `entry.rsc.tsx`

以下は、Vite RSC Server の簡略化された例です。

```tsx filename=src/entry.rsc.tsx
import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";

import { routes } from "./routes/config";

function fetchServer(request: Request) {
  return matchRSCServerRequest({
    // Provide the React Server touchpoints.
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    // The incoming request.
    request,
    // The app routes.
    routes: routes(),
    // Encode the match with the React Server implementation.
    generateResponse(match) {
      return new Response(
        renderToReadableStream(match.payload),
        {
          status: match.statusCode,
          headers: match.headers,
        },
      );
    },
  });
}

export default async function handler(request: Request) {
  // Import the generateHTML function from the client environment
  const ssr = await import.meta.viteRsc.loadModule<
    typeof import("./entry.ssr")
  >("ssr", "index");

  return ssr.generateHTML(
    request,
    await fetchServer(request),
  );
}
```

#### `entry.browser.tsx`

```tsx filename=src/entry.browser.tsx
import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  unstable_createCallServer as createCallServer,
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
  type unstable_RSCPayload as RSCServerPayload,
} from "react-router";

// Create and set the callServer function to support post-hydration server actions.
setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
  }),
);

// Get and decode the initial server payload.
createFromReadableStream<RSCServerPayload>(
  getRSCStream(),
).then((payload) => {
  startTransition(async () => {
    const formState =
      payload.type === "render"
        ? await payload.formState
        : undefined;

    hydrateRoot(
      document,
      <StrictMode>
        <RSCHydratedRouter
          createFromReadableStream={
            createFromReadableStream
          }
          payload={payload}
        />
      </StrictMode>,
      {
        formState,
      },
    );
  });
});
```

[picking-a-mode]: ../start/modes
[react-server-components-doc]: https://react.dev/reference/rsc/server-components
[react-server-functions-doc]: https://react.dev/reference/rsc/server-functions
[use-client-docs]: https://react.dev/reference/rsc/use-client
[use-server-docs]: https://react.dev/reference/rsc/use-server
[route-module]: ../start/framework/route-module
[framework-mode]: ../start/modes#framework
[custom-framework]: ../start/data/custom
[vite-plugin-rsc]: https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc
[match-rsc-server-request]: ../api/rsc/matchRSCServerRequest
[route-rsc-server-request]: ../api/rsc/routeRSCServerRequest
[rsc-static-router]: ../api/rsc/RSCStaticRouter
[create-call-server]: ../api/rsc/createCallServer
[get-rsc-stream]: ../api/rsc/getRSCStream
[rsc-hydrated-router]: ../api/rsc/RSCHydratedRouter
[express]: https://expressjs.com/
[node-fetch-server]: https://www.npmjs.com/package/@remix-run/node-fetch-server
[framework-rsc-template]: https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-framework-mode
[vite-rsc-template]: https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-data-mode-vite
[node-request-listener]: https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
[hooks]: https://react.dev/reference/react/hooks
[vite-env-only]: https://github.com/pcattori/vite-env-only
[server-modules]: ../api/framework-conventions/server-modules
[client-modules]: ../api/framework-conventions/client-modules
[server-only-package]: https://www.npmjs.com/package/server-only
[client-only-package]: https://www.npmjs.com/package/client-only
[entry-rsc-source]: https://github.com/remix-run/react-router/blob/main/packages/react-router-dev/config/default-rsc-entries/entry.rsc.tsx
[entry-ssr-source]: https://github.com/remix-run/react-router/blob/main/packages/react-router-dev/config/default-rsc-entries/entry.ssr.tsx
[entry-client-source]: https://github.com/remix-run/react-router/blob/main/packages/react-router-dev/config/default-rsc-entries/entry.client.tsx