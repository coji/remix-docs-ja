---
title: BrowserRouter
---

# BrowserRouter

[MODES: 宣言的]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.BrowserRouter.html)

クライアントサイドルーティングのためにブラウザの[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) APIを使用する宣言的な[`<Router>`](../declarative-routers/Router)です。

## シグネチャ

```tsx
function BrowserRouter({ basename, children, window }: BrowserRouterProps)
```

## Props

### basename

アプリケーションのベースネーム

### children

ルート設定を記述する``<Route>``コンポーネント

### window

[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window)オブジェクトのオーバーライド。デフォルトはグローバルな`window`インスタンスです。