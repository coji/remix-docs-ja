---
title: Router
---

# Router

[MODES: declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Router.html)

アプリの残りの部分にロケーションコンテキストを提供します。

注意: 通常、`<Router>` を直接レンダリングすることはありません。代わりに、Web ブラウザの [`BrowserRouter`](../declarative-routers/BrowserRouter) やサーバーレンダリングの [`ServerRouter`](../framework-routers/ServerRouter) など、環境に特化したルーターをレンダリングします。

## シグネチャ

```tsx
function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = NavigationType.Pop,
  navigator,
  static: staticProp = false,
  unstable_useTransitions,
}: RouterProps): React.ReactElement | null
```

## Props

### basename

アプリケーションのベースパスです。すべてのロケーションの前に付加されます。

### children

ルーティングツリーを記述するネストされた [`Route`](../components/Route) 要素。

### location

マッチング対象のロケーションです。現在のロケーションがデフォルトです。文字列または [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) オブジェクトのいずれかになります。

### navigationType

このロケーション変更をトリガーした navigation のタイプです。`NavigationType.Pop` がデフォルトです。

### navigator

navigation に使用する navigator です。これは通常、history オブジェクト、または [`Navigator`](https://api.reactrouter.com/v7/interfaces/react_router.Navigator.html) インターフェースを実装するカスタム navigator です。

### static

このルーターが静的であるかどうか (SSR で使用されます)。`true` の場合、ルーターはロケーションの変更に反応しません。

### unstable_useTransitions

router の state updates が内部的に [`React.startTransition`](https://react.dev/reference/react/startTransition) でラップされるかどうかを制御します。

- `undefined` のままの場合、すべての router の state updates は `React.startTransition` でラップされます。
- `true` に設定すると、[`Link`](../components/Link) と [`Form`](../components/Form) の navigations は `React.startTransition` でラップされ、すべての router の state updates も `React.startTransition` でラップされます。
- `false` に設定すると、router は navigations または state 変更のいずれにおいても `React.startTransition` を利用しません。

詳細については、[ドキュメント](https://reactrouter.com/explanation/react-transitions)を参照してください。