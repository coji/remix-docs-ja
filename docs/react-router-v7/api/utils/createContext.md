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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createContext.html)

`action`、`loader`、および `middleware` で任意の値を保存および取得するために使用できる、型安全な [`RouterContext`](https://api.reactrouter.com/v7/interfaces/react_router.RouterContext.html) オブジェクトを作成します。React の [`createContext`](https://react.dev/reference/react/createContext) と似ていますが、React Router のリクエスト/レスポンスライフサイクル用に特別に設計されています。

`defaultValue` が提供された場合、`context` に値が設定されていないときに `context.get()` から返されます。そうでない場合、値が設定されていないこの `context` を読み取るとエラーがスローされます。

```tsx filename=app/context.ts
import { createContext } from "react-router";

// ユーザーデータの context を作成
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

`context` のオプションのデフォルト値です。この値は、`context` に値が設定されていない場合に返されます。

## Returns

`action`、`loader`、および `middleware` で `context.get()` および `context.set()` とともに使用できる [`RouterContext`](https://api.reactrouter.com/v7/interfaces/react_router.RouterContext.html) オブジェクトです。