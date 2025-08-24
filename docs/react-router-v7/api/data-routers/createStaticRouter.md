---
title: createStaticRouter
---

# createStaticRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/server.tsx
-->

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createStaticRouter.html)

サーバーサイドレンダリング用の静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成します。

```tsx
export async function handleRequest(request: Request) {
  let { query, dataRoutes } = createStaticHandler(routes);
  let context = await query(request);

  if (context instanceof Response) {
    return context;
  }

  let router = createStaticRouter(dataRoutes, context);
  return new Response(
    ReactDOMServer.renderToString(<StaticRouterProvider ... />),
    { headers: { "Content-Type": "text/html" } }
  );
}
```

## シグネチャ

```tsx
function createStaticRouter(
  routes: RouteObject[],
  context: StaticHandlerContext,
  opts: {
    future?: Partial<FutureConfig>;
  } = ,
): DataRouter {}
```

## パラメータ

### routes

静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成するためのルートオブジェクト。

### context

[`StaticHandler`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html) の `query` から返される [`StaticHandlerContext`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html)。

### opts.future

静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) のための Future フラグ。

## 戻り値

提供されたルートをレンダリングするために使用できる静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。