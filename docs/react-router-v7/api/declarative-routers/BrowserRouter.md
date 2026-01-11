---
title: BrowserRouter
---

# BrowserRouter

[MODES: 宣言的]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.BrowserRouter.html)

クライアントサイドルーティングにブラウザの[History](https://developer.mozilla.org/en-US/docs/Web/API/History) API を使用する、宣言的な[`<Router>`](../declarative-routers/Router)です。

## シグネチャ

```tsx
function BrowserRouter({
  basename,
  children,
  unstable_useTransitions,
  window,
}: BrowserRouterProps)
```

## Props

### basename

アプリケーションの basename

### children

route 設定を記述する `<Route>` component

### unstable_useTransitions

router の state 更新が内部的に [`React.startTransition`](https://react.dev/reference/react/startTransition) でラップされるかどうかを制御します。

- `undefined` のままにした場合、すべての router の state 更新は `React.startTransition` でラップされます。
- `true` に設定した場合、[`Link`](../components/Link) と [`Form`](../components/Form) のナビゲーションは `React.startTransition` でラップされ、すべての router の state 更新は `React.startTransition` でラップされます。
- `false` に設定した場合、router はナビゲーションや state の変更において `React.startTransition` を利用しません。

詳細については、[ドキュメント](https://reactrouter.com/explanation/react-transitions)を参照してください。

### window

[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) オブジェクトのオーバーライド。デフォルトはグローバルの `window` インスタンスです。