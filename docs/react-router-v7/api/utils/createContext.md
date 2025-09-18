---
title: createContext
---

# createContext

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.createContext.html)

型安全な[`RouterContext`](https://api.reactrouter.com/v7/interfaces/react_router.RouterContext.html)オブジェクトを作成します。これは、[`action`](../../start/framework/route-module#action)s、[`loader`](../../start/framework/route-module#loader)s、および[ミドルウェア](../../how-to/middleware)で任意の値を保存および取得するために使用できます。Reactの[`createContext`](https://react.dev/reference/react/createContext)に似ていますが、React Routerのリクエスト/レスポンスライフサイクル向けに特別に設計されています。

`defaultValue`が提供された場合、コンテキストに値が設定されていないときに`context.get()`からその値が返されます。それ以外の場合、値が設定されていないときにこのコンテキストを読み取るとエラーがスローされます。

```tsx filename=app/context.ts
import { createContext } from "react-router";

// Create a context for user data
export const userContext =
  createContext<User | null>(null);
```

```tsx filename=app/middleware/auth.ts
import { getUserFromSession } from "~/auth.server";
import { userContext } from "~/context";

export const authMiddleware = async ({
  context,
  request,
}) => {
  const user = await getUserFromSession(request);
  context.set(userContext, user);
};
```

```tsx filename=app/routes/profile.tsx
import { userContext } from "~/context";

export async function loader({
  context,
}: Route.LoaderArgs) {
  const user = context.get(userContext);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return { user };
}
```

## Signature

```tsx
function createContext<T>(defaultValue?: T): RouterContext<T>
```

## Params

### defaultValue

コンテキストのオプションのデフォルト値です。このコンテキストに値が設定されていない場合、この値が返されます。

## Returns

[`RouterContext`](https://api.reactrouter.com/v7/interfaces/react_router.RouterContext.html)オブジェクトです。これは、[`action`](../../start/framework/route-module#action)s、[`loader`](../../start/framework/route-module#loader)s、および[ミドルウェア](../../how-to/middleware)で`context.get()`および`context.set()`と共に使用できます。