---
title: RouterProvider
---

# RouterProvider

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.RouterProvider.html)

与えられた [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) のUIをレンダリングします。このコンポーネントは通常、アプリの要素ツリーの最上位に配置されるべきです。

```tsx
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createRoot } from "react-dom/client";

const router = createBrowserRouter(routes);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
```

<docs-info>このコンポーネントは `react-router` と `react-router/dom` の両方からエクスポートされており、後者のみが `react-dom` の [`flushSync`](https://react.dev/reference/react-dom/flushSync) 実装を自動的に設定するという違いがある点に注意してください。非DOM環境で実行している場合を除き、_ほぼ常に_ `react-router/dom` からのバージョンを使用したいと考えるでしょう。</docs-info>

## Signature

```tsx
function RouterProvider({
  router,
  flushSync: reactDomFlushSyncImpl,
  onError,
  unstable_useTransitions,
}: RouterProviderProps): React.ReactElement
```

## Props

### flushSync

アップデートをフラッシュするために使用する [`ReactDOM.flushSync`](https://react.dev/reference/react-dom/flushSync) の実装です。

通常、これを気にする必要はありません。
- `react-router/dom` からエクスポートされる `RouterProvider` は、これを内部で処理します。
- 非DOM環境でレンダリングしている場合、`react-router` から `RouterProvider` をインポートし、この props を無視できます。

### onError

アプリケーションで発生するあらゆる middleware、loader、action、またはレンダリングエラーに対して呼び出されるエラーハンドラー関数です。これは `ErrorBoundary` 内ではなく、エラーのロギングや報告に役立ちます。なぜなら、再レンダリングの対象ではなく、エラーごとに1回だけ実行されるためです。

`errorInfo` パラメーターは [`componentDidCatch`](https://react.dev/reference/react/Component#componentdidcatch) から渡され、レンダリングエラーの場合にのみ存在します。

```tsx
<RouterProvider onError=(error, info) => {
  let { location, params, unstable_pattern, errorInfo } = info;
  console.error(error, location, errorInfo);
  reportToErrorService(error, location, errorInfo);
}} />
```

### router

ナビゲーションおよびデータフェッチングに使用する [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) インスタンスです。

### unstable_useTransitions

ルーターの state のアップデートが、内部的に [`React.startTransition`](https://react.dev/reference/react/startTransition) でラップされるかどうかを制御します。

- `undefined` のままにすると、すべての state のアップデートが `React.startTransition` でラップされます。
  - これは、独自のナビゲーションやフェッチャーを `startTransition` でラップしている場合に、バグのある動作につながる可能性があります。
- `true` に設定すると、[`Link`](../components/Link) や [`Form`](../components/Form) のナビゲーションは `React.startTransition` でラップされ、ルーターの state の変更も `React.startTransition` でラップされるだけでなく、ナビゲーション途中のルーターの state の変更をUIに表示するために [`useOptimistic`](https://react.dev/reference/react/useOptimistic) を通じて送信されます。
- `false` に設定すると、ルーターはナビゲーションや state の変更において `React.startTransition` または `React.useOptimistic` を利用しません。

詳細については、[ドキュメント](https://reactrouter.com/explanation/react-transitions)を参照してください。