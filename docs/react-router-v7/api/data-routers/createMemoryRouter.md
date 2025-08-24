---
title: createMemoryRouter
---

# createMemoryRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx
-->

[MODES: data]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.createMemoryRouter.html)

インメモリの[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History)スタックを使用してアプリケーションパスを管理する、新しい[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)を作成します。DOM APIを持たない非ブラウザ環境で有用です。

## Signature

```tsx
function createMemoryRouter(
  routes: RouteObject[],
  opts?: MemoryRouterOpts,
): DataRouter
```

## Params

### routes

アプリケーションのルート

### opts.basename

アプリケーションのベースパス。

### opts.dataStrategy

並行してロードするデフォルトのデータ戦略を上書きします。高度な使用法のみを意図しています。

### opts.future

ルーターで有効にするFutureフラグ。

### opts.unstable_getContext

クライアントの[`action`](../../start/data/route-object#action)s、[`loader`](../../start/data/route-object#loader)s、および[middleware](../../how-to/middleware)に`context`引数として提供される[`unstable_RouterContextProvider`](../utils/RouterContextProvider)インスタンスを返す関数です。この関数は、ナビゲーションまたはフェッチャー呼び出しごとに新しい`context`インスタンスを生成するために呼び出されます。

### opts.hydrationData

サーバーで既にデータロードを実行している場合に、ルーターを初期化するためのハイドレーションデータ。

### opts.initialEntries

インメモリ履歴スタックの初期エントリ。

### opts.initialIndex

アプリケーションが初期化される`initialEntries`のインデックス。

### opts.patchRoutesOnNavigation

ナビゲーション時にルートツリーの一部を遅延定義します。

## Returns

[`<RouterProvider>`](../data-routers/RouterProvider)に渡す、初期化された[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。