---
title: ミドルウェア
unstable: true
---

# ミドルウェア

<docs-warning>ミドルウェア機能は現在実験段階であり、破壊的変更の可能性があります。有効にするには、`future.unstable_middleware`フラグを使用してください。</docs-warning>

ミドルウェアを使用すると、ルートハンドラー（ローダー、アクション、コンポーネント）が実行される前後にコードを実行できます。これにより、認証、ロギング、エラー処理、データ前処理などの一般的なパターンを再利用可能な方法で実現できます。

ミドルウェアはネストされたチェーンで実行され、ルートハンドラーへの「下り」の途中で親ルートから子ルートへ、そしてハンドラーが完了した後の「上り」の途中で子ルートから親ルートへと実行されます。

例えば、`GET /parent/child`リクエストでは、ミドルウェアは以下の順序で実行されます。

```text
- ルートミドルウェア開始
  - 親ミドルウェア開始
    - 子ミドルウェア開始
      - ローダーを実行
    - 子ミドルウェア終了
  - 親ミドルウェア終了
- ルートミドルウェア終了
```

## クイックスタート

### 1. ミドルウェアフラグを有効にする

まず、React Routerの設定でミドルウェアを有効にします。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    unstable_middleware: true,
  },
} satisfies Config;
```

<docs-warning>ミドルウェア機能を有効にすると、ローダーとアクションの`context`パラメーターの型が変更されます。現在`context`を積極的に使用している場合は、以下の[getLoadContext](#custom-server-with-getloadcontext)セクションに注意してください。</docs-warning>

### 2. 型サポートを追加する

ミドルウェアの型を有効にするために、`app/types/global.d.ts`を更新します。

```ts filename=app/types/global.d.ts
declare module "@react-router/dev/routes" {
  interface AppConfig {
    future: {
      unstable_middleware: true;
    };
  }
}
```

### 3. コンテキストを作成する

`unstable_createContext`を使用して型安全なコンテキストオブジェクトを作成します。

```ts filename=app/context.ts
import { unstable_createContext } from "react-router";
import type { User } from "~/types";

export const userContext =
  unstable_createContext<User | null>(null);
```

### 4. ルートからミドルウェアをエクスポートする

```tsx filename=app/routes/dashboard.tsx
import { redirect } from "react-router";
import { userContext } from "~/context";

// サーバーサイド認証ミドルウェア
export const unstable_middleware: Route.unstable_MiddlewareFunction[] =
  [
    async ({ request, context }) => {
      const user = await getUserFromSession(request);
      if (!user) {
        throw redirect("/login");
      }
      context.set(userContext, user);
    },
  ];

// クライアントサイドタイミングミドルウェア
export const unstable_clientMiddleware: Route.unstable_ClientMiddlewareFunction[] =
  [
    async ({ context }, next) => {
      const start = performance.now();

      await next();

      const duration = performance.now() - start;
      console.log(`Navigation took ${duration}ms`);
    },
  ];

export async function loader({
  context,
}: Route.LoaderArgs) {
  const user = context.get(userContext);
  const profile = await getProfile(user);
  return { profile };
}

export default function Dashboard({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>Welcome {loaderData.profile.fullName}!</h1>
      <Profile profile={loaderData.profile} />
    </div>
  );
}
```

## コアコンセプト

### サーバーミドルウェア vs クライアントミドルウェア

**サーバーミドルウェア** (`unstable_middleware`) は、サーバーで以下の場合に実行されます。

- HTMLドキュメントリクエスト
- 後続のナビゲーションとフェッチャー呼び出しのための`.data`リクエスト

**クライアントミドルウェア** (`unstable_clientMiddleware`) は、ブラウザで以下の場合に実行されます。

- クライアントサイドのナビゲーションとフェッチャー呼び出し

### `next`関数

`next`関数は、チェーン内の次のミドルウェア、またはリーフルートミドルウェアの場合はルートハンドラーを実行します。

```ts
const middleware = async ({ context }, next) => {
  // ここに書かれたコードはハンドラーの実行「前」に実行されます
  console.log("Before");

  const response = await next();

  // ここに書かれたコードはハンドラーの実行「後」に実行されます
  console.log("After");

  return response; // クライアントではオプション、サーバーでは必須
};
```

<docs-warning>ミドルウェアごとに`next()`を1回しか呼び出すことはできません。複数回呼び出すとエラーがスローされます。</docs-warning>

### `next()`のスキップ

ハンドラーの後にコードを実行する必要がない場合は、`next()`の呼び出しをスキップできます。

```ts
const authMiddleware = async ({ request, context }) => {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  context.set(userContext, user);
  // next() は自動的に呼び出されます
};
```

### コンテキストAPI

新しいコンテキストシステムは、型安全を提供し、名前の衝突を防ぎます。

```ts
// ✅ 型安全
import { unstable_createContext } from "react-router";
const userContext = unstable_createContext<User>();

// 後でミドルウェア/ローダーで
context.set(userContext, user); // User型である必要があります
const user = context.get(userContext); // User型を返します

// ❌ 古い方法（型安全なし）
// context.user = user; // 何でもあり得る
```

## 一般的なパターン

### 認証

```tsx filename=app/middleware/auth.ts
import { redirect } from "react-router";
import { userContext } from "~/context";
import { getSession } from "~/sessions.server";

export const authMiddleware = async ({
  request,
  context,
}) => {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    throw redirect("/login");
  }

  const user = await getUserById(userId);
  context.set(userContext, user);
};
```

```tsx filename=app/routes/protected.tsx
import { authMiddleware } from "~/middleware/auth";

export const unstable_middleware = [authMiddleware];

export function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext); // 存在が保証されます
  return { user };
}
```

### ロギング

```tsx filename=app/middleware/logging.ts
import { requestIdContext } from "~/context";

export const loggingMiddleware = async (
  { request, context },
  next
) => {
  const requestId = crypto.randomUUID();
  context.set(requestIdContext, requestId);

  console.log(
    `[${requestId}] ${request.method} ${request.url}`
  );

  const start = performance.now();
  const response = await next();
  const duration = performance.now() - start;

  console.log(
    `[${requestId}] Response ${response.status} (${duration}ms)`
  );

  return response;
};
```

### エラーハンドリング

```tsx filename=app/middleware/error-handling.ts
export const errorMiddleware = async (
  { context },
  next
) => {
  try {
    return await next();
  } catch (error) {
    // エラーをログに記録
    console.error("Route error:", error);

    // React Routerに処理させるために再スロー
    throw error;
  }
};
```

### 404からCMSへのリダイレクト

```tsx filename=app/middleware/cms-fallback.ts
export const cmsFallbackMiddleware = async (
  { request },
  next
) => {
  const response = await next();

  // 404を受け取ったか確認
  if (response.status === 404) {
    // CMSでリダイレクトを確認
    const cmsRedirect = await checkCMSRedirects(
      request.url
    );
    if (cmsRedirect) {
      throw redirect(cmsRedirect, 302);
    }
  }

  return response;
};
```

### レスポンスヘッダー

```tsx filename=app/middleware/headers.ts
export const headersMiddleware = async (
  { context },
  next
) => {
  const response = await next();

  // セキュリティヘッダーを追加
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
};
```

## クライアントサイドミドルウェア

クライアントミドルウェアも同様に機能しますが、レスポンスを返しません。

```tsx filename=app/routes/dashboard.tsx
import { userContext } from "~/context";

export const unstable_clientMiddleware = [
  ({ context }) => {
    // クライアントサイドのユーザーデータを設定
    const user = getLocalUser();
    context.set(userContext, user);
  },

  async ({ context }, next) => {
    console.log("Starting client navigation");
    await next();
    console.log("Client navigation complete");
  },
];

export async function clientLoader({
  context,
}: Route.ClientLoaderArgs) {
  const user = context.get(userContext);
  return { user };
}
```

## 高度な使用法

### 条件付きミドルウェア

```tsx
export const unstable_middleware = [
  async ({ request, context }, next) => {
    // POSTリクエストの場合のみ認証を実行
    if (request.method === "POST") {
      await ensureAuthenticated(request, context);
    }
    return next();
  },
];
```

### アクションとローダー間でのコンテキスト共有

```tsx
const sharedDataContext = unstable_createContext<any>();

export const unstable_middleware = [
  async ({ request, context }, next) => {
    if (request.method === "POST") {
      // アクションフェーズ中にデータを設定
      context.set(
        sharedDataContext,
        await getExpensiveData()
      );
    }
    return next();
  },
];

export async function action({
  context,
}: Route.ActionArgs) {
  const data = context.get(sharedDataContext);
  // データを活用...
}

export async function loader({
  context,
}: Route.LoaderArgs) {
  const data = context.get(sharedDataContext);
  // 同じデータがここで利用可能
}
```

### getLoadContextを使用したカスタムサーバー

カスタムサーバーを使用している場合は、`getLoadContext`関数を更新してください。

```ts filename=app/entry.server.tsx
import { unstable_createContext } from "react-router";
import type { unstable_InitialContext } from "react-router";

const dbContext = unstable_createContext<Database>();

function getLoadContext(req, res): unstable_InitialContext {
  const map = new Map();
  map.set(dbContext, database);
  return map;
}
```

### AppLoadContextからの移行

現在`AppLoadContext`を使用している場合、既存のオブジェクトのコンテキストを作成することで最も簡単に移行できます。

```ts filename=app/context.ts
import { unstable_createContext } from "react-router";

declare module "@react-router/server-runtime" {
  interface AppLoadContext {
    db: Database;
    user: User;
  }
}

const myLoadContext =
  unstable_createContext<AppLoadContext>();
```

`getLoadContext`関数を更新して、コンテキストの初期値を持つMapを返すようにします。

```diff filename=app/entry.server.tsx
function getLoadContext() {
  const loadContext = {...};
-  return loadContext;
+  return new Map([
+    [myLoadContext, appLoadContextInstance]]
+  );
}
```

ローダー/アクションを更新して、新しいコンテキストインスタンスから読み込むようにします。

```diff filename=app/routes/example.tsx
export function loader({ context }: Route.LoaderArgs) {
-  const { db, user } = context;
+  const { db, user } = context.get(myLoadContext);
}
```