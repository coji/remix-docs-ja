---
title: Router
---

# Router

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx
-->

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
}: RouterProps): React.ReactElement | null
```

## Props

### basename

アプリケーションのベースパスです。これはすべてのロケーションの前に付加されます。

### children

ルートツリーを記述するネストされた [`Route`](../components/Route) 要素。

### location

マッチング対象のロケーションです。デフォルトは現在のロケーションです。
これは文字列または [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) オブジェクトのいずれかです。

### navigationType

この `location` の変更をトリガーしたナビゲーションのタイプです。
デフォルトは `NavigationType.Pop` です。

### navigator

ナビゲーションに使用するナビゲーターです。これは通常、history オブジェクト
または [`Navigator`](https://api.reactrouter.com/v7/interfaces/react_router.Navigator.html) インターフェースを実装するカスタムナビゲーターです。

### static

このルーターが静的であるかどうか（SSR で使用）。`true` の場合、ルーターは
ロケーションの変更に反応しません。