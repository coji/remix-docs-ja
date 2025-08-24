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
  const actionData = useActionData();
  const errors = actionData?.errors;
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

  // render the app stub at "/login"
  render(<Stub initialEntries={["/login"]} />);

  // simulate interactions
  userEvent.click(screen.getByText("Login"));
  await waitFor(() => screen.findByText(USER_MESSAGE));
  await waitFor(() => screen.findByText(PASSWORD_MESSAGE));
});
```

## フレームワークモードの型との使用

`createRoutesStub` は、コンテキストルーター情報（`loaderData`、`actionData`、`matches` など）に依存するアプリケーション内の再利用可能なコンポーネントの_ユニット_テスト用に設計されていることに注意することが重要です。これらのコンポーネントは通常、フック（`useLoaderData`、`useActionData`、`useMatches`）または祖先ルートコンポーネントから渡される props を介してこの情報を取得します。`createRoutesStub` の使用は、これらの種類の再利用可能なコンポーネントのユニットテストに限定することを**強く**お勧めします。

`createRoutesStub` は、フレームワークモードで利用可能な [`Route.*`](../../explanation/type-safety) 型を使用した Route コンポーネントの直接テスト用には_設計されていません_（そして、おそらく互換性がありません）。これは、`Route.*` 型が実際のアプリケーション（実際の `loader`/`action` 関数や、`matches` 型を定義するルートツリー構造を含む）から派生しているためです。`createRoutesStub` を使用する場合、`createRoutesStub` に渡すルートツリーに基づいて、`loaderData`、`actionData`、さらには `matches` のスタブ値を指定することになります。したがって、型は `Route.*` 型と一致せず、ルートスタブでルートコンポーネントを使用しようとすると型に関する問題が発生します。

```tsx filename=routes/login.tsx
export default function Login({
  actionData,
}: Route.ComponentProps) {
  return <Form method="post">...</Form>;
}
```

```tsx filename=routes/login.test.tsx
import LoginRoute from "./login";

test("LoginRoute renders error messages", async () => {
  const Stub = createRoutesStub([
    {
      path: "/login",
      Component: LoginRoute,
      // ^ ❌ Types of property 'matches' are incompatible.
      action() {
        /*...*/
      },
    },
  ]);

  // ...
});
```

このようにテストを設定しようとすると、これらの型エラーは一般的に正確です。スタブ化された `loader`/`action` 関数が実際の実装と一致している限り、`loaderData`/`actionData` の型は正しくなりますが、異なる場合は型が誤った情報を提供することになります。

`matches` は、通常、すべての祖先ルートをスタブ化しないため、より複雑です。この例では、ルートルートがないため、`matches` にはテストルートのみが含まれますが、ランタイム時にはルートルートとその他のすべての祖先が含まれます。テストで typegen の型をランタイムの型と自動的に一致させる良い方法はありません。

したがって、Route レベルのコンポーネントをテストする必要がある場合は、ルート全体をテストする際にはユニットテストの領域から外れるため、実行中のアプリケーションに対して統合/E2E テスト（Playwright、Cypress など）を介して行うことをお勧めします。

ルートに対してユニットテストを_記述する必要がある_場合は、TypeScript エラーを抑制するために、テストに `@ts-expect-error` コメントを追加できます。

```tsx
const Stub = createRoutesStub([
  {
    path: "/login",
    // @ts-expect-error: `matches` won't align between test code and app code
    Component: LoginRoute,
    action() {
      /*...*/
    },
  },
]);
```