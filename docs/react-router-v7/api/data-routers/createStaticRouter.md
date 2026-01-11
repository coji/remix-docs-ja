---
title: createStaticRouter
---

# createStaticRouter

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createStaticRouter.html)

サーバーサイドレンダリングのために静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成します。

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

静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成するための route オブジェクト。

### context

[`StaticHandler`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html) の `query` から返される [`StaticHandlerContext`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandlerContext.html)。

### opts.future

静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) の Future flags。

## 戻り値

指定された routes をレンダリングするために使用できる静的な [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。