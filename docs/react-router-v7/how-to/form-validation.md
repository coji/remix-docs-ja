---
title: フォームのバリデーション
---

# フォームのバリデーション

[MODES: framework, data]

<br/>
<br/>

このガイドでは、簡単なサインアップフォームの実装について説明します。これらの概念は、サードパーティのバリデーションライブラリやエラーコンポーネントと組み合わせて使用することが多いと思いますが、このガイドではReact Routerの動作部分にのみ焦点を当てます。

## 1. セットアップ

まず、フォーム付きの基本的なサインアップルートを作成します。

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

      <button type="submit">サインアップ</button>
    </fetcher.Form>
  );
}
```

## 2. アクションの定義

このステップでは、`Signup`コンポーネントと同じファイルにサーバーの`action`を定義します。ここでの目的は、フォームのバリデーションルールやエラーオブジェクトの構造を深く掘り下げるのではなく、関連するメカニズムの概要を説明することです。メールとパスワードの基本的なチェックを使用して、コアとなる概念を説明します。

```tsx filename=signup.tsx
import type { Route } from "./+types/signup";
import { redirect, useFetcher, data } from "react-router";

export default function Signup(_: Route.ComponentProps) {
  // 簡潔にするため省略
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
      "パスワードは12文字以上である必要があります";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  // バリデーションが成功したらダッシュボードにリダイレクト
  return redirect("/dashboard");
}
```

バリデーションエラーが見つかった場合、それらは`action`からフェッチャーに返されます。これは、UIに修正が必要なことを知らせるための方法です。そうでない場合、ユーザーはダッシュボードにリダイレクトされます。

`data({ errors }, { status: 400 })`の呼び出しに注目してください。400ステータスを設定することは、バリデーションエラー（不正なリクエスト）があったことをクライアントに知らせるためのWeb標準の方法です。React Routerでは、200ステータスコードのみがページデータの再検証をトリガーするため、400はそれを防ぎます。

## 3. バリデーションエラーの表示

最後に、`Signup`コンポーネントを修正して、`fetcher.data`からバリデーションエラー（存在する場合）を表示します。

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

      <button type="submit">サインアップ</button>
    </fetcher.Form>
  );
}
```