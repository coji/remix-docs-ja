---
title: React Server Components
unstable: true
---

# React Server Components

[MODES: data]

<br/>
<br/>

<docs-warning>React Server Componentsのサポートは実験的であり、破壊的変更の可能性があります。</docs-warning>

React Server Components (RSC) は、React バージョン19以降で提供されるアーキテクチャとAPIのセットを指します。

ドキュメントより:

> サーバーコンポーネントは、バンドルされる前に、クライアントアプリやSSRサーバーとは別の環境で、事前にレンダリングされる新しいタイプのコンポーネントです。
>
> <cite>- [React "Server Components" ドキュメント][react-server-components-doc]</cite>

React Routerは、RSC互換のバンドラーと統合するためのAPIセットを提供し、React Routerアプリケーションで[サーバーコンポーネント][react-server-components-doc]と[サーバー関数][react-server-functions-doc]を活用できるようにします。

## クイックスタート

最も手軽に始めるには、いずれかのテンプレートをご利用ください。

これらのテンプレートには、React Router RSC APIがそれぞれのバンドラーで既に設定されており、以下のような機能がすぐに利用できます。

- サーバーコンポーネントルート
- サーバーサイドレンダリング (SSR)
- クライアントコンポーネント ([`"use client"`][use-client-docs] ディレクティブ経由)
- サーバー関数 ([`"use server"`][use-server-docs] ディレクティブ経由)

**Parcel テンプレート**

[Parcel テンプレート][parcel-rsc-template]は、公式のReact `react-server-dom-parcel` プラグインを使用しています。

```shellscript
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-parcel
```

**Vite テンプレート**

[Vite テンプレート][vite-rsc-template]は、実験的なVite `@vitejs/plugin-rsc` プラグインを使用しています。

```shellscript
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-vite
```

## React RouterでのRSCの使用

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

これまでの[ルートモジュールAPI][route-module]は、[フレームワークモード][framework-mode]専用の機能でした。しかし、RSCルート設定の`lazy`フィールドは、ルートモジュールのエクスポートと同じエクスポートを期待しており、APIをさらに統一しています。

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

## React RouterでのRSCの設定

React Routerは、RSC互換のバンドラーと簡単に統合できるいくつかのAPIを提供しており、独自の[カスタムフレームワーク][custom-framework]を作成するためにReact Routerデータモードを使用している場合に役立ちます。

以下の手順は、React Routerアプリケーションをセットアップして、サーバーコンポーネント（RSC）を使用してページをサーバーレンダリング（SSR）し、シングルページアプリケーション（SPA）ナビゲーションのためにそれらをハイドレートする方法を示しています。SSR（またはクライアントサイドハイドレーション）を使用する必要はありません。必要に応じて、静的サイト生成（SSG）やインクリメンタル静的再生成（ISR）のためにHTML生成を活用することもできます。このガイドは、典型的なRSCベースのアプリケーションのさまざまなAPIをすべて連携させる方法を説明することを目的としています。

### エントリーポイント

[ルート定義](#configuring-routes)に加えて、以下を設定する必要があります。

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

詳細については、[Parcel RSC ドキュメント][parcel-rsc-doc]を参照してください。動作するバージョンを確認するには、[Parcel RSC テンプレート][parcel-rsc-template]も参照できます。

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
  bootstrapScriptContent: string | undefined
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
      const payload = await getPayload();
      const formState =
        payload.type === "render"
          ? await payload.formState
          : undefined;

      return await renderHTMLToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          bootstrapScriptContent,
          formState,
        }
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
      return new Response(renderToReadableStream(match.payload), {
        status: match.statusCode,
        headers: match.headers,
      });
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
  })
);
// アプリケーションを接続。
app.use(
  createRequestListener((request) =>
    generateHTML(
      request,
      fetchServer,
      (routes as unknown as { bootstrapScript?: string }).bootstrapScript
    )
  )
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
  })
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
        }
      );
    });
  }
);
```

### Vite

詳細については、[Vite RSC ドキュメント][vite-rsc-doc]を参照してください。動作するバージョンを確認するには、[Vite RSC テンプレート][vite-rsc-template]も参照できます。

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
  fetchServer: (request: Request) => Promise<Response>
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
      const payload = await getPayload();
      const formState =
        payload.type === "render"
          ? await payload.formState
          : undefined;

      const bootstrapScriptContent =
        await import.meta.viteRsc.loadBootstrapScriptContent(
          "index"
        );

      return await renderHTMLToReadableStream(
        <RSCStaticRouter getPayload={getPayload} />,
        {
          bootstrapScriptContent,
          formState,
        }
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
        }
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
  })
);

// 初期サーバーペイロードを取得してデコードします。
createFromReadableStream<RSCServerPayload>(
  getRSCStream()
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
      }
    );
  });
});
```

[react-server-components-doc]: https://react.dev/reference/rsc/server-components
[react-server-functions-doc]: https://react.dev/reference/rsc/server-functions
[use-client-docs]: https://react.dev/reference/rsc/use-client
[use-server-docs]: https://react.dev/reference/rsc/use-server
[route-module]: ../start/framework/route-module
[framework-mode]: ../start/modes#framework
[custom-framework]: ../start/data/custom
[parcel-rsc-doc]: https://parceljs.org/recipes/rsc/
[vite-rsc-doc]: https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc
[match-rsc-server-request]: ../api/rsc/matchRSCServerRequest
[route-rsc-server-request]: ../api/rsc/routeRSCServerRequest
[rsc-static-router]: ../api/rsc/RSCStaticRouter
[create-call-server]: ../api/rsc/createCallServer
[get-rsc-stream]: ../api/rsc/getRSCStream
[rsc-hydrated-router]: ../api/rsc/RSCHydratedRouter
[express]: https://expressjs.com/
[node-fetch-server]: https://www.npmjs.com/package/@remix-run/node-fetch-server
[parcel-rsc-template]: https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-parcel
[vite-rsc-template]: https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-vite