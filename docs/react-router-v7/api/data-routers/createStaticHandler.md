---
title: createStaticHandler
---

# createStaticHandler

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

ドキュメントの改善にご協力いただきありがとうございます！

このファイルはソースコード内のJSDocコメントから自動生成されています。
以下のファイルのJSDocコメントを編集してください。変更がマージされると、このファイルが再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/server.tsx
-->

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createStaticHandler.html)

サーバーサイドでのデータ読み込みを実行するための静的ハンドラーを作成します。

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

静的ハンドラーを作成するための[ルートオブジェクト](https://api.reactrouter.com/v7/types/react_router.RouteObject.html)。

### opts.basename

静的ハンドラーのベースURL（デフォルト: `/`）。

### opts.future

静的ハンドラーのフューチャーフラグ。

## 戻り値

指定されたルートのデータをクエリするために使用できる静的ハンドラー。