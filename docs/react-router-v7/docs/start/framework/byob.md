---
title: 独自のバンドラを使用する
---

<docs-warning>このドキュメントは未完成であり、エラーが含まれている可能性があります</docs-warning>

# 独自のバンドラを使用する

フレームワークの機能は、React React のランタイム機能によって有効になります。React Router の Vite プラグインを使用する代わりに、独自のバンドラとサーバー抽象化を使用できます。

## クライアントサイドレンダリング

### 1. ルーターを作成する

ルートモジュールAPI（ローダー、アクションなど）を有効にするブラウザーランタイムAPIは`createBrowserRouter`です。

ローダー、アクション、エラーバウンダリなどをサポートするルートオブジェクトの配列を取ります。React Router Viteプラグインは`routes.ts`からこのうち1つを作成しますが、手動で（または抽象化を使用して）作成し、独自のバンドラを使用できます。

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

### 2. ルーターをレンダリングする

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

`lazy`プロパティを使用して、ルートの大部分を遅延して定義できます。

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

### 1. ルートを定義する

ルートは、サーバー上でのオブジェクトの種類がクライアントと同じです。

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

### 2. 静的ハンドラを作成する

`createStaticHandler`を使用して、ルートをリクエストハンドラに変換します。

```tsx
import { createStaticHandler } from "react-router";
import routes from "./some-routes";

let { query, dataRoutes } = createStaticHandler(routes);
```

### 3. ルーティングコンテキストを取得してレンダリングする

React Router は Web Fetch の [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) と連携するため、サーバーが対応していない場合は、使用するオブジェクトを Web Fetch の `Request` オブジェクトに適応する必要があります。

この手順では、サーバーが `Request` オブジェクトを受け取ると想定しています。

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
  // 1. `query` を使用してルーティングコンテキストを取得するためにアクション/ローダーを実行します
  let context = await query(request);

  // `query` が Response を返す場合、生のまま送信します（ルートはおそらくリダイレクトされた）
  if (context instanceof Response) {
    return context;
  }

  // 2. SSR 用の静的ルーターを作成します
  let router = createStaticRouter(dataRoutes, context);

  // 3. StaticRouterProvider を使用してすべてをレンダリングします
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

### 4. ブラウザでハイドレートする

このセクションは未完成であり、更新されます。React Router が React Router Vite プラグインでこれを行う方法については、`HydratedRouter` のソースを参照してください。



