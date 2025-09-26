---
title: React Server Components
unstable: true
---

# React Server Components

[MODES: framework, data]

<br/>
<br/>

<docs-warning>React Server Componentsのサポートは実験的であり、破壊的変更の可能性があります。</docs-warning>

React Server Components (RSC) は、React バージョン19以降で提供されるアーキテクチャとAPIのセットを指します。

ドキュメントより:

> サーバーコンポーネントは、バンドルされる前に、クライアントアプリやSSRサーバーとは別の環境で、事前にレンダリングされる新しいタイプのコンポーネントです。
>
> <cite>- [React "Server Components" ドキュメント][react-server-components-doc]</cite>

React Routerは、RSC互換のバンドラーと統合するためのAPIセットを提供し、React Routerアプリケーションで[サーバーコンポーネント][react-server-components-doc]と[サーバー関数][react-server-functions-doc]を活用できるようにします。

これらのReact機能に馴染みがない場合は、React RouterのRSC APIを使用する前に、公式の[Server Componentsドキュメント][react-server-components-doc]を読むことをお勧めします。

RSCのサポートは、Framework ModeとData Modeの両方で利用できます。これらの概念的な違いについては、「[モードの選択][picking-a-mode]」を参照してください。ただし、RSCモードと非RSCモードではAPIと機能が異なる点があり、このガイドで詳しく説明します。

## クイックスタート

最も手軽に始めるには、いずれかのテンプレートをご利用ください。

これらのテンプレートには、React Router RSC APIがそれぞれのバンドラーで既に設定されており、以下のような機能がすぐに利用できます。

- サーバーコンポーネントルート
- サーバーサイドレンダリング (SSR)
- クライアントコンポーネント ([`"use client"`][use-client-docs] ディレクティブ経由)
- サーバー関数 ([`"use server"`][use-server-docs] ディレクティブ経由)

### RSC Framework Modeテンプレート

[RSC Framework Modeテンプレート][framework-rsc-template]は、不安定なReact Router RSC Viteプラグインと実験的な[`@vitejs/plugin-rsc`プラグイン][vite-plugin-rsc]を使用しています。

```shellscript
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-framework-mode
```

### RSC Data Modeテンプレート

RSC Data Modeを使用する場合、ViteとParcelのテンプレートから選択できます。

[Vite RSC Data Modeテンプレート][vite-rsc-template]は、実験的なVite `@vitejs/plugin-rsc`プラグインを使用しています。

```shellscript
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-data-mode-vite
```

[Parcel RSC Data Modeテンプレート][parcel-rsc-template]は、公式のReact `react-server-dom-parcel`プラグインを使用しています。

```shellscript
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-data-mode-parcel
```

## RSC Framework Mode

RSC Framework ModeのほとんどのAPIと機能は、非RSC Framework Modeと同じであるため、このガイドではその違いに焦点を当てます。

### 新しいReact Router RSC Viteプラグイン

RSC Framework Modeは、非RSC Framework Modeとは異なるViteプラグインを使用しており、現在は`unstable_reactRouterRSC`としてエクスポートされています。

この新しいViteプラグインは、実験的な`@vitejs/plugin-rsc`プラグインにピア依存関係を持っています。`@vitejs/plugin-rsc`プラグインは、Vite設定でReact Router RSCプラグインの後に配置する必要があることに注意してください。

```tsx filename=vite.config.ts
import { defineConfig } from "vite";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";

export default defineConfig({
  plugins: [reactRouterRSC(), rsc()],
});
```

### ビルド出力

RSC Framework Modeのサーバービルドファイル（`build/server/index.js`）は、ドキュメント/データリクエスト用の`default`リクエストハンドラ関数（`(request: Request) => Promise<Response>`）をエクスポートするようになりました。

必要に応じて、[@remix-run/node-fetch-server][node-fetch-server]の`createRequestListener`関数を使用することで、これをNodeの組み込み`http.createServer`関数（または[Express][express]など、それをサポートするもの）で使用するための[標準的なNode.jsリクエストリスナー][node-request-listener]に変換できます。

例えば、Expressでは次のようになります。

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

### ローダー/アクションからのReact要素

RSC Framework Modeでは、ローダーとアクションが他のデータとともにReact要素を返すことができるようになりました。これらの要素は常にサーバー上でレンダリングされます。

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

ローダー/アクションから返されるReact要素内でクライアント専用機能（例：[Hooks][hooks]、イベントハンドラ）を使用する必要がある場合は、これらの機能を使用するコンポーネントを[クライアントモジュール][use-client-docs]に抽出する必要があります。

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

### サーバーコンポーネントルート

ルートが通常の`default`コンポーネントエクスポートの代わりに`ServerComponent`をエクスポートする場合、このコンポーネントは他のルートコンポーネント（`ErrorBoundary`、`HydrateFallback`、`Layout`）とともに、通常のクライアントコンポーネントではなくサーバーコンポーネントになります。

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

サーバーファーストのルート内でクライアント専用機能（例：[Hooks][hooks]、イベントハンドラ）を使用する必要がある場合は、これらの機能を使用するコンポーネントを[クライアントモジュール][use-client-docs]に抽出する必要があります。

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

### `.server`/`.client`モジュール

RSCの`"use server"`および`"use client"`ディレクティブとの混同を避けるため、RSC Framework Modeを使用する場合、[`.server`モジュール][server-modules]および[`.client`モジュール][client-modules]のサポートは組み込まれなくなりました。

ファイル命名規則に依存しない代替ソリューションとして、[`@vitejs/plugin-rsc`][vite-plugin-rsc]によって提供される`"server-only"`および`"client-only"`インポートを使用することをお勧めします。例えば、モジュールが誤ってクライアントビルドに含まれないようにするには、サーバー専用モジュール内で`"server-only"`から副作用としてインポートするだけです。

```ts filename=app/utils/db.ts
import "server-only";

// Rest of the module...
```

Reactチームによって作成された公式のnpmパッケージ[`server-only`][server-only-package]と[`client-only`][client-only-package]がありますが、これらをインストールする必要はありません。`@vitejs/plugin-rsc`はこれらのインポートを内部的に処理し、ランタイムエラーではなくビルド時の検証を提供します。

`.server`および`.client`ファイル命名規則に依存する既存のコードを迅速に移行したい場合は、[`vite-env-only`プラグイン][vite-env-only]を直接使用することをお勧めします。例えば、`.server`モジュールが誤ってクライアントビルドに含まれないようにするには、次のようになります。

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

### MDXルートのサポート

MDXルートは、`@mdx-js/rollup` v3.1.1以降を使用する場合、RSC Framework Modeでサポートされます。

MDXルートからエクスポートされるコンポーネントは、RSC環境でも有効である必要があることに注意してください。つまり、[Hooks][hooks]のようなクライアント専用機能を使用することはできません。これらの機能を使用する必要があるコンポーネントは、[クライアントモジュール][use-client-docs]に抽出する必要があります。

### サポートされていない設定オプション

最初の不安定版リリースでは、`react-router.config.ts`の以下のオプションはRSC Framework Modeではまだサポートされていません。

- `buildEnd`
- `prerender`
- `presets`
- `routeDiscovery`
- `serverBundles`
- `ssr: false` (SPA Mode)
- `future.unstable_splitRouteModules`
- `future.unstable_subResourceIntegrity`

カスタムビルドエントリーファイルもまだサポートされていません。

## RSC Data Mode

上記で説明したRSC Framework ModeのAPIは、より低レベルのRSC Data Mode APIの上に構築されています。

RSC Data Modeには、RSC Framework Modeの一部の機能（例：`routes.ts`設定とファイルシステムルーティング、HMRとホットデータ再検証）がありませんが、より柔軟性があり、独自のバンドラーとサーバー抽象化と統合できます。

### ルートの設定

ルートは[`matchRSCServerRequest`][match-rsc-server-request]の引数として設定されます。最低限、パスとコンポーネントが必要です。

```tsx
function Root() {
  return <h1>Hello world</h1>;
}

matchRSCServerRequest({
  // ...その他のオプション
  routes: [{ path: "/", Component: Root }],
});
```

コンポーネントをインラインで定義することもできますが、起動時のパフォーマンスとコードの整理の両方のために、`lazy()`オプションを使用し、[ルートモジュール][route-module]を定義することをお勧めします。

<docs-info>

これまでの[ルートモジュールAPI][route-module]は、[Framework Mode][framework-mode]専用の機能でした。しかし、RSCルート設定の`lazy`フィールドは、ルートモジュールのエクスポートと同じエクスポートを期待しており、APIをさらに統一しています。

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

### サーバーコンポーネントルート

デフォルトでは、各ルートの`default`エクスポートはサーバーコンポーネントをレンダリングします。

```tsx
export default function Home() {
  return (
    <main>
      <article>
        <h1>React Router RSCへようこそ</h1>
        <p>
          ブラウザでJavaScriptが実行されることはありません！
        </p>
      </article>
    </main>
  );
}
```

サーバーコンポーネントの優れた機能は、コンポーネントを非同期にすることで、データを直接フェッチできることです。

```tsx
export default async function Home() {
  let user = await getUserData();

  return (
    <main>
      <article>
        <h1>React Router RSCへようこそ</h1>
        <p>
          ブラウザでJavaScriptが実行されることはありません！
        </p>
        <p>
          こんにちは、{user ? user.name : "名もなき人"}！
        </p>
      </article>
    </main>
  );
}
```

<docs-info>

サーバーコンポーネントは、ローダーやアクションからも返却できます。一般的に、RSCを使用してアプリケーションを構築する場合、ローダーは主に`status`コードの設定や`redirect`の返却などに役立ちます。

ローダーでサーバーコンポーネントを使用することは、RSCの段階的な導入に役立ちます。

</docs-info>

### サーバー関数

[サーバー関数][react-server-functions-doc]は、サーバー上で実行される非同期関数を呼び出すことができるReactの機能です。これらは[`"use server"`][use-server-docs]ディレクティブで定義されます。

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

サーバー関数が呼び出された後、React Routerは自動的にルートを再検証し、新しいサーバーコンテンツでUIを更新します。キャッシュの無効化について心配する必要はありません。

### クライアントプロパティ

ルートは実行時にサーバー上で定義されますが、クライアント参照と`"use client"`を利用することで、`clientLoader`、`clientAction`、`shouldRevalidate`を提供できます。

```tsx filename=src/routes/root/client.tsx
"use client";

export function clientAction() {}

export function clientLoader() {}

export function shouldRevalidate() {}
```

次に、これらを遅延ロードされるルートモジュールから再エクスポートできます。

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

これは、ルート全体をクライアントコンポーネントにする方法でもあります。

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

### バンドラーの設定

React Routerは、RSC互換のバンドラーと簡単に統合できるいくつかのAPIを提供しており、独自の[カスタムフレームワーク][custom-framework]を作成するためにReact Router Data Modeを使用している場合に役立ちます。

以下の手順は、React Routerアプリケーションをセットアップして、サーバーコンポーネント（RSC）を使用してページをサーバーレンダリング（SSR）し、シングルページアプリケーション（SPA）ナビゲーションのためにそれらをハイドレートする方法を示しています。SSR（またはクライアントサイドハイドレーション）を使用する必要はありません。必要に応じて、静的サイト生成（SSG）やインクリメンタル静的再生成（ISR）のためにHTML生成を活用することもできます。このガイドは、典型的なRSCベースのアプリケーションのさまざまなAPIをすべて連携させる方法を説明することを目的としています。

### エントリーポイント

[ルートの設定](#configuring-routes)に加えて、以下を設定する必要があります。

1. 受信リクエストを処理し、RSCペイロードをフェッチし、それをHTMLに変換するサーバー
2. RSCペイロードを生成するReactサーバー
3. 生成されたHTMLをハイドレートし、ハイドレーション後のサーバーアクションをサポートするために`callServer`関数を設定するブラウザハンドラー

以下の命名規則は、分かりやすさと簡潔さのために選択されています。ご自身の判断でエントリーポイントを命名および設定してください。

以下の各エントリーポイントの具体的なコード例については、関連するバンドラーのドキュメントを参照してください。

これらの例はすべて、サーバーとリクエスト処理に[express][express]と[@remix-run/node-fetch-server][node-fetch-server]を使用しています。

**ルート**

[ルートの設定](#configuring-routes)を参照してください。

**サーバー**

<docs-info>

SSRをまったく使用する必要はありません。RSCを使用して、静的サイト生成（SSG）やインクリメンタル静的再生成（ISR）などのためにHTMLを「プリレンダリング」することを選択できます。

</docs-info>

`entry.ssr.tsx`はサーバーのエントリーポイントです。これは、リクエストを処理し、RSCサーバーを呼び出し、ドキュメントリクエスト（サーバーサイドレンダリング）でRSCペイロードをHTMLに変換する役割を担います。

関連API:

- [`routeRSCServerRequest`][route-rsc-server-request]
- [`RSCStaticRouter`][rsc-static-router]

**RSCサーバー**

<docs-info>

「Reactサーバー」とリクエスト処理/SSRを担当するサーバーがある場合でも、実際には2つの別々のサーバーを持つ必要はありません。同じサーバー内に2つの別々のモジュールグラフを持つことができます。これは、ReactがRSCペイロードを生成する場合と、クライアントでハイドレートされるHTMLを生成する場合とで動作が異なるため重要です。

</docs-info>

`entry.rsc.tsx`はReactサーバーのエントリーポイントです。これは、リクエストをルートにマッチさせ、RSCペイロードを生成する役割を担います。

関連API:

- [`matchRSCServerRequest`][match-rsc-server-request]

**ブラウザ**

`entry.browser.tsx`はクライアントのエントリーポイントです。これは、生成されたHTMLをハイドレートし、ハイドレーション後のサーバーアクションをサポートするために`callServer`関数を設定する役割を担います。

関連API:

- [`createCallServer`][create-call-server]
- [`getRSCStream`][get-rsc-stream]
- [`RSCHydratedRouter`][rsc-hydrated-router]

### Parcel

詳細については、[Parcel RSC ドキュメント][parcel-rsc-doc]を参照してください。動作するバージョンを確認するには、[Parcel RSC Data Modeテンプレート][parcel-rsc-template]も参照できます。

`react`、`react-dom`、`react-router`に加えて、以下の依存関係が必要です。

```shellscript
# ランタイム依存関係をインストール
npm i @parcel/runtime-rsc react-server-dom-parcel

# 開発依存関係をインストール
npm i -D parcel
```

#### `package.json`

Parcelを設定するには、`package.json`に以下を追加します。

```json filename=package.json
{
  "scripts": {
    "build": "parcel build --no-autoinstall",
    "dev": "cross-env NODE_ENV=development parcel --no-autoinstall --no-cache",
    "start": "cross-env NODE_ENV=production node dist/server/entry.rsc.js"
  },
  "targets": {
    "react-server": {
      "context": "react-server",
      "source": "src/entry.rsc.tsx",
      "scopeHoist": false,
      "includeNodeModules": {
        "@remix-run/node-fetch-server": false,
        "compression": false,
        "express": false
      }
    }
  }
}
```

#### `routes/config.ts`

ルートを定義するファイルの先頭に`"use server-entry"`を追加する必要があります。さらに、クライアントエントリーポイントが`"use client-entry"`ディレクティブを使用するため（下記参照）、それをインポートする必要があります。

```tsx filename=src/routes/config.ts
"use server-entry";

import type { unstable_RSCRouteConfig as RSCRouteConfig } from "react-router";

import "../entry.browser";

// Parcelが`bootstrapScript`プロパティを追加できるように、これは関数である必要があります。
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

以下は、Parcel SSRサーバーの簡略化された例です。

```tsx filename=src/entry.ssr.tsx
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from "react-router";
import { createFromReadableStream } from "react-server-dom-parcel/client.edge";

export async function generateHTML(
  request: Request,
  fetchServer: (request: Request) => Promise<Response>,
  bootstrapScriptContent: string | undefined,
): Promise<Response> {
  return await routeRSCServerRequest({
    // 受信リクエスト。
    request,
    // Reactサーバーを呼び出す方法。
    fetchServer,
    // Reactサーバーのタッチポイントを提供。
    createFromReadableStream,
    // ルーターをHTMLにレンダリング。
    async renderHTML(getPayload) {
      const payload = getPayload();

      return await renderHTMLToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          bootstrapScriptContent,
          formState: await payload.formState,
        },
      );
    },
  });
}
```

#### `entry.rsc.tsx`

以下は、Parcel RSCサーバーの簡略化された例です。

```tsx filename=src/entry.rsc.tsx
import { createRequestListener } from "@remix-run/node-fetch-server";
import express from "express";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";
import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "react-server-dom-parcel/server.edge";

// react-client環境からgenerateHTML関数をインポート
import { generateHTML } from "./entry.ssr" with { env: "react-client" };
import { routes } from "./routes/config";

function fetchServer(request: Request) {
  return matchRSCServerRequest({
    // Reactサーバーのタッチポイントを提供。
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    // 受信リクエスト。
    request,
    // アプリのルート。
    routes: routes(),
    // Reactサーバーの実装でマッチをエンコード。
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

const app = express();

// 静的アセットを圧縮と長いキャッシュ寿命で提供。
app.use(
  "/client",
  compression(),
  express.static("dist/client", {
    immutable: true,
    maxAge: "1y",
  }),
);
// アプリケーションを接続。
app.use(
  createRequestListener((request) =>
    generateHTML(
      request,
      fetchServer,
      (routes as unknown as { bootstrapScript?: string })
        .bootstrapScript,
    ),
  ),
);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
```

#### `entry.browser.tsx`

```tsx filename=src/entry.browser.tsx
"use client-entry";

import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  unstable_createCallServer as createCallServer,
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
  type unstable_RSCPayload as RSCServerPayload,
} from "react-router";
import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "react-server-dom-parcel/client";

// ハイドレーション後のサーバーアクションをサポートするために、callServer関数を作成して設定します。
setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
  }),
);

// 初期サーバーペイロードを取得してデコードします。
createFromReadableStream(getRSCStream()).then(
  (payload: RSCServerPayload) => {
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
  },
);
```

### Vite

詳細については、[@vitejs/plugin-rsc ドキュメント][vite-plugin-rsc]を参照してください。動作するバージョンを確認するには、[Vite RSC Data Modeテンプレート][vite-rsc-template]も参照できます。

`react`、`react-dom`、`react-router`に加えて、以下の依存関係が必要です。

```shellscript
npm i -D vite @vitejs/plugin-react @vitejs/plugin-rsc
```

#### `vite.config.ts`

Viteを設定するには、`vite.config.ts`に以下を追加します。

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

以下は、Vite SSRサーバーの簡略化された例です。

```tsx filename=src/entry.ssr.tsx
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge";
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from "react-router";

export async function generateHTML(
  request: Request,
  fetchServer: (request: Request) => Promise<Response>,
): Promise<Response> {
  return await routeRSCServerRequest({
    // 受信リクエスト。
    request,
    // Reactサーバーを呼び出す方法。
    fetchServer,
    // Reactサーバーのタッチポイントを提供。
    createFromReadableStream,
    // ルーターをHTMLにレンダリング。
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

以下は、Vite RSCサーバーの簡略化された例です。

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
    // Reactサーバーのタッチポイントを提供。
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    // 受信リクエスト。
    request,
    // アプリのルート。
    routes: routes(),
    // Reactサーバーの実装でマッチをエンコード。
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
  // クライアント環境からgenerateHTML関数をインポート
  const ssr = await import.meta.viteRsc.loadModule<
    typeof import("./entry.ssr")
  >("ssr", "index");

  return ssr.generateHTML(request, fetchServer);
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

// ハイドレーション後のサーバーアクションをサポートするために、callServer関数を作成して設定します。
setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
  }),
);

// 初期サーバーペイロードを取得してデコードします。
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
[parcel-rsc-doc]: https://parceljs.org/recipes/rsc/
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
[parcel-rsc-template]: https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-data-mode-parcel
[vite-rsc-template]: https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-data-mode-vite
[node-request-listener]: https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
[hooks]: https://react.dev/reference/react/hooks
[vite-env-only]: https://github.com/pcattori/vite-env-only
[server-modules]: ../api/framework-conventions/server-modules
[client-modules]: ../api/framework-conventions/client-modules
[server-only-package]: https://www.npmjs.com/package/server-only
[client-only-package]: https://www.npmjs.com/package/client-only