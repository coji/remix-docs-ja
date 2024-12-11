---
title: カスタムフレームワーク
---

# カスタムフレームワーク

`@react-router/dev` を使用する代わりに、React Router のフレームワーク機能（ローダー、アクション、フェッチャーなど）を独自のバンドラーとサーバー抽象化に統合できます。

## クライアントサイドレンダリング

### 1. ルーターの作成

ルートモジュールAPI（ローダー、アクションなど）を有効にするブラウザーランタイムAPIは`createBrowserRouter`です。

ローダー、アクション、エラーバウンダリなどをサポートするルートオブジェクトの配列を取ります。React Router Viteプラグインは`routes.ts`からこれらを生成しますが、手動で（または抽象化を使用して）作成し、独自のバンドラーを使用できます。

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
          fetch(`/api/show/${params.id}.json`, {
            signal: request.signal,
          }),
      },
    ],
  },
]);
```

### 2. ルーターのレンダリング

ブラウザでルーターをレンダリングするには、`<RouterProvider>`を使用します。

```tsx
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
```

### 3. 遅延読み込み

ルートは、`lazy`プロパティを使用して定義の大部分を遅延させることができます。

```tsx
createBrowserRouter([
  {
    path: "/show/:showId",
    lazy: () => {
      let [loader, action, Component] = await Promise.all([
        import("./show.action.js"),
        import("./show.loader.js"),
        import("./show.component.js"),
      ]);
      return { loader, action, Component };
    },
  },
]);
```

## サーバーサイドレンダリング

カスタム設定をサーバーサイドレンダリングするには、データの読み込みとレンダリングに使用できるいくつかのサーバーAPIがあります。

このガイドは、それがどのように機能するかについてのいくつかのアイデアを提供するだけです。より深い理解のために、[カスタムフレームワークの例のリポジトリ](https://github.com/remix-run/custom-react-router-framework-example)を参照してください。

### 1. ルートの定義

ルートは、クライアント側と同様に、サーバー上でも同じ種類のオブジェクトです。

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

`createStaticHandler`を使用して、ルートをリクエストハンドラーに変換します。

```tsx
import { createStaticHandler } from "react-router";
import routes from "./some-routes";

let { query, dataRoutes } = createStaticHandler(routes);
```

### 3. ルーティングコンテキストの取得とレンダリング

React Router は web fetch の [リクエスト](https://developer.mozilla.org/en-US/docs/Web/API/Request) で動作するため、サーバーがそれを使用していない場合は、使用するオブジェクトを web fetch の `Request` オブジェクトに適応させる必要があります。

この手順では、サーバーが `Request` オブジェクトを受け取ることを前提としています。

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
  // 1. `query` を使用してルーティングコンテキストを取得するためにアクション/ローダーを実行します。
  let context = await query(request);

  // `query` が Response を返す場合、生のまま送信します（ルートはおそらくリダイレクトされています）
  if (context instanceof Response) {
    return context;
  }

  // 2. SSR 用の静的ルーターを作成します
  let router = createStaticRouter(dataRoutes, context);

  // 3. StaticRouterProvider ですべてをレンダリングします
  let html = renderToString(
    <StaticRouterProvider
      router={router}
      context={context}
    />
  );

  // 最も深い一致からのアクションとローダーからヘッダーを設定します
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

ハイドレーションデータは `window.__staticRouterHydrationData` に埋め込まれています。それを使用してクライアント側のルーターを初期化し、`<RouterProvider>`をレンダリングします。

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
  </StrictMode>
);
```

