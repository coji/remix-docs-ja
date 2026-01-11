---
title: StaticRouter
---

# StaticRouter

[MODES: declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.StaticRouter.html)

他の[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)へナビゲートできない[`<Router>`](../declarative-routers/Router)です。これは、ステートフルなUIがないサーバー上で役立ちます。

## シグネチャ

```tsx
function StaticRouter({
  basename,
  children,
  location: locationProp = "/",
}: StaticRouterProps)
```

## Props

### basename

静的ルーターのベースURLです（デフォルト: `/`）。

### children

静的ルーター内でレンダーする子要素です。

### location

静的ルーターをレンダーする[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)です（デフォルト: `/`）。