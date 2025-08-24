---
title: Route
---

# Route

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Route.html)

パターンが現在のロケーションに一致したときにレンダリングする要素を設定します。
[`Routes`](../components/Routes) 要素内でレンダリングする必要があります。これらのルートは、
データローディング、アクション、コード分割、またはその他のルートモジュールの機能には関与しません。

```tsx
// Usually used in a declarative router
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

// But can be used with a data router as well if you prefer the JSX notation
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

ルートのアクション。
[`action`](../../start/data/route-object#action) を参照してください。

### caseSensitive

パスを大文字と小文字を区別してマッチさせるかどうか。デフォルトは `false` です。

### Component

このルートがマッチしたときにレンダリングする React Component。
`element` とは相互排他的です。

### children

子となる Route コンポーネント。

### element

この Route がマッチしたときにレンダリングする React 要素。
`Component` とは相互排他的です。

### ErrorBoundary

エラーが発生した場合にこのルートでレンダリングする React Component。
`errorElement` とは相互排他的です。

### errorElement

エラーが発生した場合にこのルートでレンダリングする React 要素。
`ErrorBoundary` とは相互排他的です。

### handle

ルートのハンドル。

### HydrateFallback

このルーターがデータをロードしている間にレンダリングする React Component。
`hydrateFallbackElement` とは相互排他的です。

### hydrateFallbackElement

このルーターがデータをロードしている間にレンダリングする React 要素。
`HydrateFallback` とは相互排他的です。

### id

このルートの一意の識別子 ([`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) で使用)。

### index

これがインデックスルートであるかどうか。

### lazy

ルートオブジェクトに解決される Promise を返す関数。
ルートのコード分割に使用されます。
[`lazy`](../../start/data/route-object#lazy) を参照してください。

### loader

ルートのローダー。
[`loader`](../../start/data/route-object#loader) を参照してください。

### path

マッチさせるパスパターン。指定されていないか空の場合、レイアウトルートになります。

### shouldRevalidate

ルートの shouldRevalidate 関数。
[`shouldRevalidate`](../../start/data/route-object#shouldRevalidate) を参照してください。