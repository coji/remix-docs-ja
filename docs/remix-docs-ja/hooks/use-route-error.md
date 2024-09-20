---
title: useRouteError
new: true
---

# `useRouteError`

[`action`][action]、[`loader`][loader]、またはレンダリング中にスローされたエラーにアクセスし、[`ErrorBoundary`][error-boundary]で使用します。

```jsx filename=routes/some-route.tsx
export function ErrorBoundary() {
  const error = useRouteError();
  return <div>{error.message}</div>;
}
```

## 追加リソース

**ガイド**

- [エラー処理ガイド][error-handling-guide]

**APIリファレンス**

- [`ErrorBoundary`][error-boundary]

[action]: ../route/action
[loader]: ../route/loader
[error-boundary]: ../route/error-boundary
[error-handling-guide]: ../guides/errors
