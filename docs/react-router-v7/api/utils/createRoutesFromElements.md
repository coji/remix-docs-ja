---
title: createRoutesFromElements
---

# createRoutesFromElements

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createRoutesFromElements.html)

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

ルート設定に変換する React children。

### parentPath

一意の ID を生成するために使用される、親ルートの path。これは内部的な再帰処理に使用され、アプリケーション開発者が直接使用することを意図したものではありません。

## 戻り値

[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) で使用できる [`RouteObject`](https://api.reactrouter.com/v7/types/react_router.RouteObject.html) の配列。