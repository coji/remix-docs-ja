---
title: フォームのバリデーション
---

# フォームのバリデーション

このガイドでは、Remix での簡単なサインアップフォームのフォームバリデーションの実装について説明します。ここでは、[`action`][action]、アクションデータ、エラーのレンダリングなど、Remix でのフォームバリデーションの重要な要素を理解するための基本を捉えることに焦点を当てます。

## ステップ 1: サインアップフォームのセットアップ

まず、Remix の [`Form`][form_component] コンポーネントを使用して、基本的なサインアップフォームを作成します。

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

このステップでは、`Signup` コンポーネントと同じファイルにサーバー `action` を定義します。ここでの目的は、フォームバリデーションのルールやエラーオブジェクトの構造を深く掘り下げるのではなく、関連するメカニズムの概要を説明することです。コアコンセプトを示すために、メールとパスワードの基本的なチェックを使用します。

```tsx filename=app/routes/signup.tsx
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { Form } from "@remix-run/react";

export default function Signup() {
  // 簡潔にするため省略
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const errors = {};

  if (!email.includes("@")) {
    errors.email = "無効なメールアドレス";
  }

  if (password.length < 12) {
    errors.password =
      "パスワードは12文字以上である必要があります";
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  // バリデーションが成功した場合はダッシュボードにリダイレクト
  return redirect("/dashboard");
}
```

バリデーションエラーが見つかった場合、それらは `action` からクライアントに返されます。これは、UI に何かを修正する必要があることを知らせる方法です。そうでない場合、ユーザーはダッシュボードにリダイレクトされます。

## ステップ 3: バリデーションエラーの表示

最後に、`Signup` コンポーネントを修正して、バリデーションエラーがある場合は表示します。これらのエラーにアクセスして表示するために、[`useActionData`][use_action_data] を使用します。

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
  // 簡潔にするため省略
}
```

## 結論

これで完了です！Remix で基本的なフォームバリデーションフローを正常に設定しました。このアプローチの利点は、エラーが `action` データに基づいて自動的に表示され、ユーザーがフォームを再送信するたびに更新されることです。これにより、記述する必要があるボイラープレートコードの量が減り、開発プロセスがより効率的になります。

[action]: ../route/action
[form_component]: ../components/form
[use_action_data]: ../hooks/use-action-data
