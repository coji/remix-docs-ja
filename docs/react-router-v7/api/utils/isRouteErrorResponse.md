---
title: isRouteErrorResponse
---

# isRouteErrorResponse

[MODES: framework, data]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.isRouteErrorResponse.html)

与えられたエラーが、[`action`](../../start/framework/route-module#action) または [`loader`](../../start/framework/route-module#loader) 関数からスローされた 4xx/5xx [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) から生成された [`ErrorResponse`](https://api.reactrouter.com/v7/types/react_router.ErrorResponse.html) であるかどうかを確認します。

```tsx
import { isRouteErrorResponse } from "react-router";

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <p>Error: `${error.status}: ${error.statusText}`</p>
        <p>{error.data}</p>
      </>
    );
  }

  return (
    <p>Error: {error instanceof Error ? error.message : "Unknown Error"}</p>
  );
}
```

## Signature

```tsx
function isRouteErrorResponse(error: any): error is ErrorResponse
```

## Params

### error

チェックするエラー。

## Returns

エラーが [`ErrorResponse`](https://api.reactrouter.com/v7/types/react_router.ErrorResponse.html) である場合は `true`、それ以外の場合は `false`。