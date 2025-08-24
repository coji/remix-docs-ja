---
title: RouterProvider
---

# RouterProvider

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx
-->

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.RouterProvider.html)

指定された[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)のUIをレンダリングします。このコンポーネントは通常、アプリの要素ツリーの最上位に配置する必要があります。

```tsx
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createRoot } from "react-dom/client";

const router = createBrowserRouter(routes);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
```

<docs-info>このコンポーネントは`react-router`と`react-router/dom`の両方からエクスポートされていますが、唯一の違いは、後者が`react-dom`の[`flushSync`](https://react.dev/reference/react-dom/flushSync)実装を自動的に接続することです。非DOM環境で実行している場合を除き、_ほとんどの場合_`react-router/dom`からのバージョンを使用することをお勧めします。</docs-info>

## シグネチャ

```tsx
function RouterProvider({
  router,
  flushSync: reactDomFlushSyncImpl,
  unstable_onError,
}: RouterProviderProps): React.ReactElement
```

## Props

### flushSync

更新をフラッシュするために使用する[`ReactDOM.flushSync`](https://react.dev/reference/react-dom/flushSync)の実装です。

通常、これについて心配する必要はありません。
- `react-router/dom`からエクスポートされる`RouterProvider`は、これを内部で処理します。
- 非DOM環境でレンダリングしている場合、`react-router`から`RouterProvider`をインポートし、このプロパティを無視できます。

### unstable_onError

アプリケーションで発生するloader/action/renderエラーに対して呼び出されるエラーハンドラ関数です。これは、再レンダリングの影響を受けず、エラーごとに1回だけ実行されるため、`ErrorBoundary`の代わりにエラーをログに記録したり報告したりするのに役立ちます。

`errorInfo`パラメータは[`componentDidCatch`](https://react.dev/reference/react/Component#componentdidcatch)から渡され、レンダリングエラーの場合にのみ存在します。

```tsx
<RouterProvider unstable_onError=(error, errorInfo) => {
  console.error(error, errorInfo);
  reportToErrorService(error, errorInfo);
}} />
```

### router

ナビゲーションとデータフェッチに使用する[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)インスタンスです。