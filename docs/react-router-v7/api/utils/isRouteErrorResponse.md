---
title: isRouteErrorResponse
---

# isRouteErrorResponse

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.isRouteErrorResponse.html)

与えられたエラーが、[`action`](../../start/framework/route-module#action)または[`loader`](../../start/framework/route-module#loader)からスローされた4xx/5xxの[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)から生成された[`ErrorResponse`](https://api.reactrouter.com/v7/types/react_router.ErrorResponse.html)であるかどうかを確認します。

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

## シグネチャ

```tsx
function isRouteErrorResponse(error: any): error is ErrorResponse
```

## パラメータ

### error

チェックするエラー。

## 戻り値

エラーが[`ErrorResponse`](https://api.reactrouter.com/v7/types/react_router.ErrorResponse.html)である場合は`true`、それ以外の場合は`false`。