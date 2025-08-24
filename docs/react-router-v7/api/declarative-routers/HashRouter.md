---
title: HashRouter
---

# HashRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: declarative]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.HashRouter.html)

URLの[`hash`](https://developer.mozilla.org/en-US/docs/Web/API/URL/hash)部分にロケーションを保存し、サーバーに送信されないようにする、宣言的な[`<Router>`](../declarative-routers/Router)です。

## Signature

```tsx
function HashRouter({ basename, children, window }: HashRouterProps)
```

## Props

### basename

アプリケーションのベースネーム

### children

ルート設定を記述する``<Route>``コンポーネント

### window

[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window)オブジェクトのオーバーライド。デフォルトはグローバルな`window`インスタンスです。