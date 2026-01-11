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

[`ServerRouter`](../framework-routers/ServerRouter) からルーターをハイドレートするために使用される、フレームワークモードの router component です。[`entry.client.tsx`](../framework-conventions/entry.client.tsx) を参照してください。

## Signature

```tsx
function HydratedRouter(props: HydratedRouterProps)
```

## Props

### getContext

[`createBrowserRouter`](../data-routers/createBrowserRouter) に渡される context ファクトリ関数です。この関数は、それぞれの navigation/fetch ごとに新しい `context` インスタンスを作成するために呼び出され、[`clientAction`](../../start/framework/route-module#clientAction)/[`clientLoader`](../../start/framework/route-module#clientLoader) 関数で利用できるようになります。

### onError

アプリケーションで発生した middleware, loader, action, または render のエラーに対して呼び出されるエラーハンドラー関数です。これは、再レンダリングの影響を受けず、エラーごとに一度しか実行されないため、`ErrorBoundary` 内ではなく、エラーのログ記録やレポートに役立ちます。

`errorInfo` パラメーターは [`componentDidCatch`](https://react.dev/reference/react/Component#componentdidcatch) から渡され、render エラーの場合にのみ存在します。

```tsx
<HydratedRouter onError=(error, info) => {
  let { location, params, unstable_pattern, errorInfo } = info;
  console.error(error, location, errorInfo);
  reportToErrorService(error, location, errorInfo);
}} />
```