---
title: useRouteError
---

# useRouteError

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useRouteError.html)

[ActionFunction](https://api.reactrouter.com/v7/interfaces/react_router.ActionFunction.html)、[LoaderFunction](https://api.reactrouter.com/v7/types/react_router.LoaderFunction.html)、またはコンポーネントのレンダリング中にスローされたエラーにアクセスし、ルートモジュールのエラー境界で使用します。

```tsx
export function ErrorBoundary() {
  const error = useRouteError();
  return <div>{error.message}</div>;
}
```

## シグネチャ

```tsx
useRouteError(): unknown
```