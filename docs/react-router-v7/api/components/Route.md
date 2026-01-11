---
title: Route
---

# Route

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Route.html)

パターンが現在のロケーションに一致したときにレンダリングする要素を設定します。
[Routes](../components/Routes) 要素内でレンダリングする必要があります。これらのルートは、
データローディング、アクション、コード分割、またはその他のルートモジュールの機能には関与しません。

```tsx
// 通常、宣言的な router で使用されます。
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<StepOne />} />
        <Route path="step-2" element={<StepTwo />} />
        <Route path="step-3" element={<StepThree />} />
      </Routes>
   </BrowserRouter>
  );
}

// しかし、JSX 表記を好む場合はデータ router でも使用できます。
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

## シグネチャ

```tsx
function Route(props: RouteProps): React.ReactElement | null
```

## Props

### action

ルート action。
[`action`](../../start/data/route-object#action) を参照してください。

### caseSensitive

パスを大文字と小文字を区別してマッチさせるかどうか。デフォルトは `false` です。

### Component

この route がマッチしたときにレンダリングする React Component。
`element` とは相互に排他的です。

### children

子 Route コンポーネント。

### element

この Route がマッチしたときにレンダリングする React element。
`Component` とは相互に排他的です。

### ErrorBoundary

エラーが発生した場合にこの route でレンダリングする React Component。
`errorElement` とは相互に排他的です。

### errorElement

エラーが発生した場合にこの route でレンダリングする React element。
`ErrorBoundary` とは相互に排他的です。

### handle

ルート handle。

### HydrateFallback

この router がデータをロードしている間にレンダリングする React Component。
`hydrateFallbackElement` とは相互に排他的です。

### hydrateFallbackElement

この router がデータをロードしている間にレンダリングする React element。
`HydrateFallback` とは相互に排他的です。

### id

この route の一意な識別子（[`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) と共に使用するため）。

### index

これがインデックスルートであるかどうか。

### lazy

route オブジェクトに解決される Promise を返す関数。
route のコード分割に使用されます。
[`lazy`](../../start/data/route-object#lazy) を参照してください。

### loader

ルート loader。
[`loader`](../../start/data/route-object#loader) を参照してください。

### path

マッチさせるパスパターン。指定されていないか空の場合、レイアウトルートになります。

### shouldRevalidate

ルート shouldRevalidate 関数。
[`shouldRevalidate`](../../start/data/route-object#shouldRevalidate) を参照してください。