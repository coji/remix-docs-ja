---
title: HydratedRouter
---

# HydratedRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom-export/hydrated-router.tsx
-->

[MODES: framework]

## Summary

[`ServerRouter`](../framework-routers/ServerRouter)からルーターをハイドレートするために使用される、フレームワークモードのルーターコンポーネントです。[`entry.client.tsx`](../framework-conventions/entry.client.tsx)を参照してください。

## Signature

```tsx
function HydratedRouter(props: HydratedRouterProps)
```

## Props

### getContext

[`createBrowserRouter`](../data-routers/createBrowserRouter)に渡され、[`clientAction`](../../start/framework/route-module#clientAction)/[`clientLoader`](../../start/framework/route-module#clientLoader)関数で利用可能になるコンテキストオブジェクト

### unstable_onError

アプリケーションで発生したloader/action/renderエラーに対して呼び出されるエラーハンドラー関数です。これは`ErrorBoundary`の代わりにエラーのログ記録や報告に役立ちます。なぜなら、再レンダリングの影響を受けず、エラーごとに一度だけ実行されるためです。

`errorInfo`パラメーターは[`componentDidCatch`](https://react.dev/reference/react/Component#componentdidcatch)から渡され、レンダリングエラーの場合にのみ存在します。

```tsx
<HydratedRouter unstable_onError={(error, errorInfo) => {
  console.error(error, errorInfo);
  reportToErrorService(error, errorInfo);
}} />
```