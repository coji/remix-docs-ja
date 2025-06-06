---
title: テスト
order: 9
---

# テスト

[MODES: framework, data]

## はじめに

コンポーネントが `useLoaderData` や `<Link>` などを利用する場合、React Router アプリのコンテキスト内でレンダリングされる必要があります。`createRoutesStub` 関数は、コンポーネントを分離してテストするためのコンテキストを作成します。

`useActionData` に依存するログインフォームコンポーネントを考えてみましょう。

```tsx
import { useActionData } from "react-router";

export function LoginForm() {
  const { errors } = useActionData();
  return (
    <Form method="post">
      <label>
        <input type="text" name="username" />
        {errors?.username && <div>{errors.username}</div>}
      </label>

      <label>
        <input type="password" name="password" />
        {errors?.password && <div>{errors.password}</div>}
      </label>

      <button type="submit">ログイン</button>
    </Form>
  );
}
```

このコンポーネントは `createRoutesStub` でテストできます。これは、ローダー、アクション、コンポーネントを持つルートモジュールに似たオブジェクトの配列を受け取ります。

```tsx
import { createRoutesStub } from "react-router";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

test("LoginForm はエラーメッセージをレンダリングする", async () => {
  const USER_MESSAGE = "ユーザー名は必須です";
  const PASSWORD_MESSAGE = "パスワードは必須です";

  const Stub = createRoutesStub([
    {
      path: "/login",
      Component: LoginForm,
      action() {
        return {
          errors: {
            username: USER_MESSAGE,
            password: PASSWORD_MESSAGE,
          },
        };
      },
    },
  ]);

  // アプリスタブを "/login" でレンダリングする
  render(<Stub initialEntries={["/login"]} />);

  // インタラクションをシミュレートする
  userEvent.click(screen.getByText("ログイン"));
  await waitFor(() => screen.findByText(USER_MESSAGE));
  await waitFor(() => screen.findByText(PASSWORD_MESSAGE));
});
```