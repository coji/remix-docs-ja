---
title: テスト
order: 9
---

# テスト

`useLoaderData`、`<Link>`などを使用するコンポーネントは、React Router アプリのコンテキストでレンダリングする必要があります。`createRoutesStub`関数は、コンポーネントを分離してテストするためのコンテキストを作成します。

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

`createRoutesStub`を使用してこのコンポーネントをテストできます。これは、ローダー、アクション、コンポーネントを持つルートモジュールに似たオブジェクトの配列を取ります。

```tsx
import { createRoutesStub } from "react-router";
import * as Test from "@testing-library/react";
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
    }),
  ]);

  // "/login"でアプリスタブをレンダリングします
  Test.render(<Stub initialEntries={["/login"]} />);

  // インタラクションをシミュレートします
  Test.user.click(screen.getByText("Login"));
  await Test.waitFor(() => screen.findByText(USER_MESSAGE));
  await Test.waitFor(() =>
    screen.findByText(PASSWORD_MESSAGE)
  );
});
```

