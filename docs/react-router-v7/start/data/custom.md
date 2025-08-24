---
title: カスタムフレームワーク
order: 8
---

# カスタムフレームワーク

[MODES: data]

## はじめに

`@react-router/dev` を使用する代わりに、データモードを使用して、React Router のフレームワーク機能（ローダー、アクション、フェッチャーなど）を独自のバンドラーおよびサーバー抽象化に統合できます。

## クライアントレンダリング

### 1. ルーターの作成

ルートモジュール API（ローダー、アクションなど）を有効にするブラウザランタイム API は `createBrowserRouter` です。

これは、ローダー、アクション、エラー境界などをサポートするルートオブジェクトの配列を受け取ります。React Router Vite プラグインは `routes.ts` からこれを作成しますが、手動で（または抽象化を使用して）作成し、独自のバンドラーを使用できます。

```tsx
import { createBrowserRouter } from "react-router";

let router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        path: "shows/:showId",
        Component: Show,
        loader: ({ request, params }) =>
          fetch(`/api/show/${params.showId}.json`, {
            signal: request.signal,
          }),
      },
    ],
  },
]);
```

### 2. ルーターのレンダリング

ブラウザでルーターをレンダリングするには、`<RouterProvider>` を使用します。

```tsx
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
```

### 3. 遅延ロード

ルートは、`lazy` プロパティを使用して、定義のほとんどを遅延的に取得できます。

```tsx
createBrowserRouter([
  {
    path: "/show/:showId",
    lazy: {
      loader: async () =>
        (await import("./show.loader.js")).loader,
      action: async () =>
        (await import("./show.action.js")).action,
      Component: async () =>
        (await import("./show.component.js")).Component,
    },
  },
]);
```

## サーバーレンダリング

カスタムセットアップをサーバーレンダリングするには、レンダリングとデータロードに使用できるいくつかのサーバー API があります。

このガイドでは、その仕組みに関するいくつかのアイデアを提供します。より深く理解するには、[カスタムフレームワークのサンプルリポジトリ](https://github.com/remix-run/custom-react-router-framework-example) を参照してください。

### 1. ルートの定義

ルートは、クライアントと同じ種類のオブジェクトです。

```tsx
export default [
  {
    path: "/",
    Component: Root,
    children: [
      {
        path: "shows/:showId",
        Component: Show,
        loader: ({ params }) => {
          return db.loadShow(params.id);
        },
      },
    ],
  },
];
```

### 2. 静的ハンドラーの作成

`createStaticHandler` を使用して、ルートをリクエストハンドラーに変換します。

```tsx
import { createStaticHandler } from "react-router";
import routes from "./some-routes";

let { query, dataRoutes } = createStaticHandler(routes);
```

### 3. ルーティングコンテキストの取得とレンダリング

React Router は Web fetch [Requests](https://developer.mozilla.org/en-US/docs/Web/API/Request) で動作するため、サーバーがそうでない場合は、サーバーが使用するオブジェクトを Web fetch `Request` オブジェクトに適応させる必要があります。

このステップでは、サーバーが `Request` オブジェクトを受信することを前提としています。

```tsx
import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";

import routes from "./some-routes.js";

let { query, dataRoutes } = createStaticHandler(routes);

export async function handler(request: Request) {
  // 1. actions/loaders を実行して、`query` でルーティングコンテキストを取得します
  let context = await query(request);

  // `query` が Response を返す場合は、生のまま送信します（ルートはおそらくリダイレクトされました）
  if (context instanceof Response) {
    return context;
  }

  // 2. SSR 用の静的ルーターを作成します
  let router = createStaticRouter(dataRoutes, context);

  // 3. StaticRouterProvider で全てをレンダリングします
  let html = renderToString(
    <StaticRouterProvider
      router={router}
      context={context}
    />,
  );

  // 最も深い一致からアクションとローダーのヘッダーを設定します
  let leaf = context.matches[context.matches.length - 1];
  let actionHeaders = context.actionHeaders[leaf.route.id];
  let loaderHeaders = context.loaderHeaders[leaf.route.id];
  let headers = new Headers(actionHeaders);
  if (loaderHeaders) {
    for (let [key, value] of loaderHeaders.entries()) {
      headers.append(key, value);
    }
  }

  headers.set("Content-Type", "text/html; charset=utf-8");

  // 4. レスポンスを送信します
  return new Response(`<!DOCTYPE html>${html}`, {
    status: context.statusCode,
    headers,
  });
}
```

### 4. ブラウザでのハイドレーション

ハイドレーションデータは `window.__staticRouterHydrationData` に埋め込まれます。これを使用してクライアント側のルーターを初期化し、`<RouterProvider>` をレンダリングします。

```tsx
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import routes from "./app/routes.js";
import { createBrowserRouter } from "react-router";

let router = createBrowserRouter(routes, {
  hydrationData: window.__staticRouterHydrationData,
});

hydrateRoot(
  document,
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```