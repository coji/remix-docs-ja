---
title: テスト
order: 9
---

# テスト

[MODES: framework, data]

## はじめに

コンポーネントが `useLoaderData` や `<Link>` などのものを使用する場合、React Router アプリのコンテキスト内でレンダリングされる必要があります。`createRoutesStub` 関数は、コンポーネントを分離してテストするためのコンテキストを作成します。

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
import { LoginForm } => "./LoginForm";

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

## フレームワークモードの型との利用

`createRoutesStub` は、アプリケーション内の再利用可能なコンポーネント（コンテキストルーター情報、つまり `loaderData`、`actionData`、`matches` に依存するもの）の**単体**テストのために設計されていることに注意することが重要です。これらのコンポーネントは通常、`hook`（`useLoaderData`、`useActionData`、`useMatches`）または祖先ルートコンポーネントから渡される `props` を介してこの情報を取得します。これらの種類の再利用可能なコンポーネントの単体テストに `createRoutesStub` の使用を限定することを**強く**推奨します。

`createRoutesStub` は、フレームワークモードで利用可能な [`Route.\*`](../../explanation/type-safety) 型を使用した Route コンポーネントの直接的なテストには**設計されていません**（そして、おそらく互換性がありません）。これは、`Route.*` 型が実際のアプリケーション（実際の `loader`/`action` 関数と、`matches` 型を定義するルートツリーの構造を含む）から派生しているためです。`createRoutesStub` を使用する場合、`createRoutesStub` に渡すルートツリーに基づいて、`loaderData`、`actionData`、さらには `matches` のスタブ値を提供します。そのため、型が `Route.*` 型と一致せず、ルートスタブでルートコンポーネントを使用しようとすると型エラーが発生します。

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
      // ^ ❌ プロパティ 'matches' の型に互換性がありません。
      action() {
        /*...*/
      },
    },
  ]);

  // ...
});
```

このようにテストを設定しようとすると、これらの型エラーは一般的に正確です。スタブ化された `loader`/`action` 関数が実際の実装と一致している限り、`loaderData`/`actionData` の型は正しいですが、異なる場合は型が誤情報を提供することになります。

`matches` は、通常すべての祖先ルートをスタブ化しないため、より複雑です。この例では `root` ルートがないため、`matches` にはテストルートのみが含まれますが、実行時には `root` ルートとその他のすべての祖先が含まれます。テストで型生成された型を実行時型と自動的に連携させる良い方法はありません。

したがって、Route レベルのコンポーネントをテストする必要がある場合、ルート全体をテストする際は単体テストの領域から外れるため、実行中のアプリケーションに対して統合/E2Eテスト（Playwright、Cypressなど）を介してそれを行うことをお勧めします。

ルートに対する単体テストを**記述する必要がある**場合は、TypeScript エラーを抑制するために、テストに `@ts-expect-error` コメントを追加できます。

```tsx
const Stub = createRoutesStub([
  {
    path: "/login",
    // @ts-expect-error: `matches` はテストコードとアプリコードで一致しません
    Component: LoginRoute,
    action() {
      /*...*/
    },
  },
]);
```