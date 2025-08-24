---
title: StaticRouter
---

# StaticRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/server.tsx
-->

[MODES: declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.StaticRouter.html)

他の [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) にナビゲートできない [`<Router>`](../declarative-routers/Router) です。これは、ステートフルな UI がないサーバー上で役立ちます。

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

StaticRouter のベース URL です (デフォルト: `/`)

### children

StaticRouter 内にレンダーする子要素です

### location

StaticRouter をレンダーする [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) です (デフォルト: `/`)