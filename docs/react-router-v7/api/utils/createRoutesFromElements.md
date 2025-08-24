---
title: createRoutesFromElements
---

# createRoutesFromElements

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/variables/react_router.createRoutesFromElements.html)

オブジェクトの配列の代わりに、JSX要素からルートオブジェクトを作成します。

```tsx
const routes = createRoutesFromElements(
  <>
    <Route index loader={step1Loader} Component={StepOne} />
    <Route path="step-2" loader={step2Loader} Component={StepTwo} />
    <Route path="step-3" loader={step3Loader} Component={StepThree} />
  </>
);

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}
```

## パラメータ

### children

ルート設定に変換するReactの子要素

### parentPath

一意のIDを生成するために使用される親ルートのパスです。これは内部的な再帰処理に使用され、アプリケーション開発者による使用は意図されていません。

## 戻り値

[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)で使用できる[`RouteObject`](https://api.reactrouter.com/v7/types/react_router.RouteObject.html)の配列