---
title: HashRouter
---

# HashRouter

[MODES: declarative]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.HashRouter.html)

URLのハッシュ部分にlocationを保存し、それがサーバーに送信されないようにする、宣言的な [`<Router>`](../declarative-routers/Router) です。

## Signature

```tsx
function HashRouter({
  basename,
  children,
  unstable_useTransitions,
  window,
}: HashRouterProps)
```

## Props

### basename

アプリケーションの basename

### children

ルート設定を記述する ``<Route>`` component

### unstable_useTransitions

ルーターのstateの更新が内部的に [`React.startTransition`](https://react.dev/reference/react/startTransition) でラップされるかどうかを制御します。

- `undefined` の場合、すべてのルーターstateの更新は `React.startTransition` でラップされます。
- `true` に設定されている場合、[`Link`](../components/Link) および [`Form`](../components/Form) のナビゲーションは `React.startTransition` でラップされ、すべてのルーターstateの更新も `React.startTransition` でラップされます。
- `false` に設定されている場合、ルーターはいかなるナビゲーションやstateの変更においても `React.startTransition` を利用しません。

詳細については、[ドキュメント](https://reactrouter.com/explanation/react-transitions)を参照してください。

### window

[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) オブジェクトのオーバーライド。デフォルトはグローバルの `window` インスタンスです。