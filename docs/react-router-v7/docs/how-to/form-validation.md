---
title: フォームバリデーション
---

# フォームバリデーション

このガイドでは、シンプルなサインアップフォームの実装について説明します。これらの概念はサードパーティのバリデーションライブラリとエラーコンポーネントと組み合わせることをお勧めしますが、このガイドではReact Routerの動作部分のみに焦点を当てています。

## 1. セットアップ

フォーム付きの基本的なサインアップルートを作成することから始めます。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("signup", "signup.tsx"),
] satisfies RouteConfig;
```

```tsx filename=signup.tsx
import type { Route } from "./+types/signup";
import { useFetcher } from "react-router";

export default function Signup(_: Route.ComponentProps) {
  let fetcher = useFetcher();
  return (
    <fetcher.Form method="post">
      <p>
        <input type="email" name="email" />
      </p>

      <p>
        <input type="password" name="password" />
      </p>

      <button type="submit">Sign Up</button>
    </fetcher.Form>
  );
}
```

## 2. アクションの定義

このステップでは、`Signup`コンポーネントと同じファイルにサーバー側の`action`を定義します。ここでは、フォームバリデーションルールやエラーオブジェクト構造の詳細な説明ではなく、関連するメカニズムの概要を提供することを目的としています。コアコンセプトを示すために、メールとパスワードの基本的なチェックを使用します。

```tsx filename=signup.tsx
import type { Route } from "./+types/signup";
import { redirect, useFetcher, data } from "react-router";

export default function Signup(_: Route.ComponentProps) {
  // 省略
}

export async function action({
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const errors = {};

  if (!email.includes("@")) {
    errors.email = "無効なメールアドレスです";
  }

  if (password.length < 12) {
    errors.password =
      "パスワードは12文字以上にする必要があります";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  // バリデーションが成功したらダッシュボードにリダイレクト
  return redirect("/dashboard");
}
```

バリデーションエラーが見つかった場合は、`action`からフェッチャに返されます。これは、UIに何か修正が必要であることを知らせる方法です。そうでなければ、ユーザーはダッシュボードにリダイレクトされます。

`data({ errors }, { status: 400 })`呼び出しに注目してください。400ステータスを設定することは、クライアントにバリデーションエラー（不正なリクエスト）があったことを知らせるWeb標準の方法です。React Routerでは、200ステータスのコードのみがページデータの再検証をトリガーするため、400はそれを防止します。


## 3. バリデーションエラーの表示

最後に、`fetcher.data`からバリデーションエラーがある場合は、それを表示するように`Signup`コンポーネントを変更します。

```tsx filename=signup.tsx lines=[3,8,13-15]
export default function Signup(_: Route.ComponentProps) {
  let fetcher = useFetcher();
  let errors = fetcher.data?.errors;
  return (
    <fetcher.Form method="post">
      <p>
        <input type="email" name="email" />
        {errors?.email ? <em>{errors.email}</em> : null}
      </p>

      <p>
        <input type="password" name="password" />
        {errors?.password ? (
          <em>{errors.password}</em>
        ) : null}
      </p>

      <button type="submit">Sign Up</button>
    </fetcher.Form>
  );
}
```

