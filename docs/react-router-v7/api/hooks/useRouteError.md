---
title: useRouteError
---

# useRouteError

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useRouteError.html)

[`action`](../../start/framework/route-module#action)、[`loader`](../../start/framework/route-module#loader)、またはコンポーネントのレンダリング中にスローされたエラーにアクセスし、ルートモジュールの[`ErrorBoundary`](../../start/framework/route-module#errorboundary)で使用します。

```tsx
export function ErrorBoundary() {
  const error = useRouteError();
  return <div>{error.message}</div>;
}
```

## シグネチャ

```tsx
function useRouteError(): unknown
```

## 戻り値

ルートの[ローディング](../../start/framework/route-module#loader)、[`action`](../../start/framework/route-module#action)の実行、またはレンダリング中にスローされたエラー。