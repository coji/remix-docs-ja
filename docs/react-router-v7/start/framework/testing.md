---
title: テスト
order: 9
---

# テスト

`useLoaderData`、`<Link>`などを使用するコンポーネントは、React Router アプリのコンテキストでレンダリングする必要があります。`createRoutesStub`関数は、コンポーネントを独立してテストするためのコンテキストを作成します。

`useActionData`に依存するログインフォームコンポーネントを考えてみましょう。

```tsx
import { useActionData } from "react-router";

export function LoginForm() {
  const errors = useActionData();
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

      <button type="submit">Login</button>
    </Form>
  );
}
```

`createRoutesStub`を使用してこのコンポーネントをテストできます。これは、ローダー、アクション、コンポーネントを持つルートモジュールに似たオブジェクトの配列を受け取ります。

```tsx
import { createRoutesStub } from "react-router";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

test("LoginForm renders error messages", async () => {
  const USER_MESSAGE = "Username is required";
  const PASSWORD_MESSAGE = "Password is required";

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

  // "/login"でアプリスタブをレンダリングする
  render(<Stub initialEntries={["/login"]} />);

  // ユーザーインタラクションをシミュレートする
  userEvent.click(screen.getByText("Login"));
  await waitFor(() => screen.findByText(USER_MESSAGE));
  await waitFor(() => screen.findByText(PASSWORD_MESSAGE));
});
```

