---
title: フォーム検証
---

# フォーム検証

このガイドでは、Remix でシンプルなサインアップフォームのフォーム検証を実装する方法を説明します。ここでは、[`action`][action]、アクションデータ、エラーのレンダリングなど、Remix のフォーム検証の基本を理解するのに役立つ重要な要素に焦点を当てます。

## ステップ 1: サインアップフォームの設定

最初に、Remix の [`Form`][form_component] コンポーネントを使用して、基本的なサインアップフォームを作成します。

```tsx filename=app/routes/signup.tsx
import { Form } from "@remix-run/react";

export default function Signup() {
  return (
    <Form method="post">
      <p>
        <input type="email" name="email" />
      </p>

      <p>
        <input type="password" name="password" />
      </p>

      <button type="submit">サインアップ</button>
    </Form>
  );
}
```

## ステップ 2: アクションの定義

このステップでは、`Signup` コンポーネントと同じファイルにサーバー `action` を定義します。ここでは、フォーム検証ルールやエラーオブジェクト構造の詳細な説明ではなく、フォーム検証のメカニズムの概要を提供することを目的としています。メールとパスワードの簡単なチェックを使用して、基本的な概念を説明します。

```tsx filename=app/routes/signup.tsx
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { Form } from "@remix-run/react";

export default function Signup() {
  // 省略
}

export async function action({
  request,
}: ActionFunctionArgs) {
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
    return json({ errors });
  }

  // 検証が成功したら、ダッシュボードにリダイレクトします
  return redirect("/dashboard");
}
```

検証エラーが見つかった場合、`action` からクライアントに返されます。これは、UI に修正が必要なことを知らせる方法です。そうでない場合、ユーザーはダッシュボードにリダイレクトされます。

## ステップ 3: 検証エラーの表示

最後に、`Signup` コンポーネントを変更して、検証エラー（存在する場合）を表示します。[`useActionData`][use_action_data] を使用して、これらのエラーにアクセスして表示します。

```tsx filename=app/routes/signup.tsx lines=[3,6,12-14,19-21]
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { Form, useActionData } from "@remix-run/react";

export default function Signup() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <p>
        <input type="email" name="email" />
        {actionData?.errors?.email ? (
          <em>{actionData?.errors.email}</em>
        ) : null}
      </p>

      <p>
        <input type="password" name="password" />
        {actionData?.errors?.password ? (
          <em>{actionData?.errors.password}</em>
        ) : null}
      </p>

      <button type="submit">サインアップ</button>
    </Form>
  );
}

export async function action({
  request,
}: ActionFunctionArgs) {
  // 省略
}
```

## まとめ

これで、Remix で基本的なフォーム検証フローを設定することができました。このアプローチの良い点は、`action` データに基づいてエラーが自動的に表示され、ユーザーがフォームを再送信するたびにエラーが更新されることです。これにより、記述する必要がある定型コードが減り、開発プロセスが効率化されます。

[action]: ../route/action
[form_component]: ../components/form
[use_action_data]: ../hooks/use-action-data
