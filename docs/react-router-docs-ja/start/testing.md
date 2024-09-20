---
title: テスト
order: 9
---

# テスト

コンポーネントが `useLoaderData`、`<Link>` などの機能を使用する場合、React Router アプリのコンテキスト内でレンダリングする必要があります。`createStub` 関数は、コンポーネントを分離してテストするためのそのコンテキストを作成します。

`useActionData` に依存するログインフォームコンポーネントを考えてみましょう。

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

このコンポーネントは `createStub` を使用してテストできます。これは、ローダー、アクション、コンポーネントを持つルートモジュールに似たオブジェクトの配列を受け取ります。

```tsx
import { createStub, route } from "react-router/testing";
import * as Test from "@testing-library/react";
import { LoginForm } from "./LoginForm";

test("LoginForm renders error messages", async () => {
  const USER_MESSAGE = "Username is required";
  const PASSWORD_MESSAGE = "Password is required";

  const Stub = createStub([
    route("/login", {
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

  // "/login" にアプリのスタブをレンダリングする
  Test.render(<Stub initialEntries={["/login"]} />);

  // 相互作用をシミュレートする
  Test.user.click(screen.getByText("Login"));
  await Test.waitFor(() => screen.findByText(USER_MESSAGE));
  await Test.waitFor(() =>
    screen.findByText(PASSWORD_MESSAGE)
  );
});
```

