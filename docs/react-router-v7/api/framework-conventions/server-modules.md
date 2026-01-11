---
title: .server モジュール
---

# `.server` モジュール

[MODES: framework]

## 概要

クライアントバンドルから除外され、サーバー上でのみ実行されるサーバー専用のモジュールです。

```ts filename=auth.server.ts
// サーバー専用モジュールからエクスポートされない場合、これはクライアントに秘密情報を公開してしまいます
export const JWT_SECRET = process.env.JWT_SECRET;

export function validateToken(token: string) {
  // サーバー専用認証ロジック
}
```

`.server` モジュールは、モジュール全体をサーバー専用として明示的にマークする良い方法です。`.server` ファイルまたは `.server` ディレクトリ内のコードが誤ってクライアントモジュールグラフに含まれた場合、ビルドは失敗します。

<docs-warning>

ルートモジュールは、特別なハンドリングがあり、サーバーとクライアントの両方のモジュールグラフで参照される必要があるため、`.server` または `.client` としてマークすべきではありません。そうしようとすると、ビルドエラーが発生します。

</docs-warning>

<docs-info>

クライアント/サーバーバンドルに何を含めるかについて、より高度な制御が必要な場合は、[`vite-env-only` プラグイン](https://github.com/pcattori/vite-env-only)を確認してください。

</docs-info>

## 使用パターン

### 個別ファイル

ファイル名に `.server` を追加して、個々のファイルをサーバー専用としてマークします。

```txt
app/
├── auth.server.ts         👈 サーバー専用ファイル
├── database.server.ts
├── email.server.ts
└── root.tsx
```

### サーバーディレクトリ

ディレクトリ名に `.server` を使用して、ディレクトリ全体をサーバー専用としてマークします。

```txt
app/
├── .server/               👈 ディレクトリ全体がサーバー専用
│   ├── auth.ts
│   ├── database.ts
│   └── email.ts
├── components/
└── root.tsx
```

## 例

### データベース接続

```ts filename=app/utils/db.server.ts
import { PrismaClient } from "@prisma/client";

// これはクライアントにデータベース認証情報を公開してしまいます
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export { db };
```

### 認証ユーティリティ

```ts filename=app/utils/auth.server.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(
  password: string,
  hash: string
) {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
  };
}
```

### サーバーモジュールの使用

```tsx filename=app/routes/login.tsx
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  hashPassword,
  createToken,
} from "../utils/auth.server";
import { db } from "../utils/db.server";

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // サーバー専用の操作
  const hashedPassword = await hashPassword(password);
  const user = await db.user.create({
    data: { email, password: hashedPassword },
  });

  const token = createToken(user.id);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Strict`,
    },
  });
}

export default function Login() {
  return (
    <form method="post">
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```