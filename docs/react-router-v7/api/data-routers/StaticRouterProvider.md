---
title: StaticRouterProvider
---

# StaticRouterProvider

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.StaticRouterProvider.html)

他の[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)にナビゲートできない[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)です。これは、ステートフルなUIがないサーバー上で役立ちます。

```tsx
export async function handleRequest(request: Request) {
  let { query, dataRoutes } = createStaticHandler(routes);
  let context = await query(request));

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
function StaticRouterProvider({
  context,
  router,
  hydrate = true,
  nonce,
}: StaticRouterProviderProps)
```

## Props

### context

[`StaticHandler`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html)の`query`から返される[`StaticHandlerContext`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandlerContext.html)。

### hydrate

クライアントでルーターをハイドレートするかどうか（デフォルトは`true`）。

### nonce

ハイドレーション用の[`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)タグに使用する[`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce)。

### router

[`createStaticRouter`](../data-routers/createStaticRouter)から取得した静的な[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。