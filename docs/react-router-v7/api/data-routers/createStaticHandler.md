---
title: createStaticHandler
---

# createStaticHandler

<!--
⚠️ ⚠️ 重要 ⚠️ ⚠️ 

ドキュメント改善にご協力いただきありがとうございます！

このファイルはソースコード内の JSDoc コメントから自動生成されます。
したがって、以下のファイルにある JSDoc コメントを編集してください。
変更がマージされると、このファイルは再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/server.tsx
-->

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createStaticHandler.html)

サーバーサイドのデータローディングを実行するためのスタティックハンドラーを作成します。

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
function createStaticHandler(
  routes: RouteObject[],
  opts?: CreateStaticHandlerOptions,
)
```

## パラメータ

### routes

スタティックハンドラーを作成するための [ルートオブジェクト](https://api.reactrouter.com/v7/types/react_router.RouteObject.html) です。

### opts.basename

スタティックハンドラーのベース URL です (デフォルト: `/`)。

### opts.future

スタティックハンドラーの future フラグです。

## 戻り値

指定された routes のデータをクエリするために使用できるスタティックハンドラーです。