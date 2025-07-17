---
title: createContext
unstable: true
---

# unstable_createContext

[MODES: framework, data]

<br/>
<br/>

<docs-warning>このAPIは実験的なものであり、破壊的な変更が行われる可能性があります。`future.unstable_middleware`フラグを有効にして使用してください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_createContext.html)

ミドルウェア、ローダー、アクションで値を保存および取得するために使用できる、型安全なコンテキストオブジェクトを作成します。Reactの`createContext`に似ていますが、React Routerのリクエスト/レスポンスライフサイクル向けに設計されています。

## シグネチャ

```tsx
unstable_createContext<T>(defaultValue?: T): RouterContext<T>
```

## パラメータ

### defaultValue

コンテキストのオプションのデフォルト値です。このコンテキストに値が設定されていない場合、この値が返されます。

## 戻り値

ミドルウェア、ローダー、アクションで`context.get()`および`context.set()`と共に使用できる`RouterContext<T>`オブジェクトです。

## 例

### 基本的な使用法

```tsx filename=app/context.ts
import { unstable_createContext } from "react-router";

// ユーザーデータ用のコンテキストを作成
export const userContext =
  unstable_createContext<User | null>(null);
```

```tsx filename=app/middleware/auth.ts
import { userContext } from "~/context";
import { getUserFromSession } from "~/auth.server";

export const authMiddleware = async ({
  request,
  context,
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

## 関連項目

- [ミドルウェアガイド](../../how-to/middleware)
