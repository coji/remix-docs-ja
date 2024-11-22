---
title: 処理中のUI
order: 7
---

# 処理中のUI

ユーザーが新しいルートに移動したり、アクションにデータを送信したりすると、UIはユーザーのアクションにすぐに処理中または楽観的な状態を反映して応答する必要があります。アプリケーションコードがこれの責任を負います。

## グローバルな処理中ナビゲーション

ユーザーが新しいURLに移動すると、次のページのローダーは次のページがレンダリングされる前に待機されます。`useNavigation`から処理中の状態を取得できます。

```tsx
import { useNavigation } from "react-router";

export default function Root() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <html>
      <body>
        {isNavigating && <GlobalSpinner />}
        <Outlet />
      </body>
    </html>
  );
}
```

## ローカルな処理中ナビゲーション

処理中のインジケーターは、リンクにローカライズすることもできます。NavLinkの子、className、およびstyleプロパティは、処理中の状態を受け取る関数にすることができます。

```tsx
import { NavLink } from "react-router";

function Navbar() {
  return (
    <nav>
      <NavLink to="/home">
        {({ isPending }) => (
          <span>Home {isPending && <Spinner />}</span>
        )}
      </NavLink>
      <NavLink
        to="/about"
        style={({ isPending }) => ({
          color: isPending ? "gray" : "black",
        })}
      >
        About
      </NavLink>
    </nav>
  );
}
```

## 処理中のフォーム送信

フォームが送信されると、UIはユーザーのアクションにすぐに処理中の状態を反映して応答する必要があります。これは、独自の独立した状態を持つ[フェッチャー][use_fetcher]フォームを使用するのが最も簡単です（通常のフォームはグローバルなナビゲーションを引き起こすため）。

```tsx filename=app/project.tsx lines=[10-12]
import { useFetcher } from "react-router";

function NewProjectForm() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post">
      <input type="text" name="title" />
      <button type="submit">
        {fetcher.state !== "idle"
          ? "送信中..."
          : "送信"}
      </button>
    </fetcher.Form>
  );
}
```

フェッチャー以外のフォーム送信の場合、処理中の状態は`useNavigation`で利用できます。

```tsx filename=app/projects/new.tsx
import { useNavigation, Form } from "react-router";

function NewProjectForm() {
  const navigation = useNavigation();

  return (
    <Form method="post" action="/projects/new">
      <input type="text" name="title" />
      <button type="submit">
        {navigation.formAction === "/projects/new"
          ? "送信中..."
          : "送信"}
      </button>
    </Form>
  );
}
```

## 楽観的UI

フォーム送信データによってUIの将来の状態がわかっている場合、インスタントUXを実現するために楽観的UIを実装できます。

```tsx filename=app/project.tsx lines=[4-7]
function Task({ task }) {
  const fetcher = useFetcher();

  let isComplete = task.status === "complete";
  if (fetcher.formData) {
    isComplete = fetcher.formData.get("status");
  }

  return (
    <div>
      <div>{task.title}</div>
      <fetcher.Form method="post">
        <button
          name="status"
          value={isComplete ? "incomplete" : "complete"}
        >
          {isComplete ? "完了マークを外す" : "完了マークをつける"}
        </button>
      </fetcher.Form>
    </div>
  );
}
```

---

次：[テスト](./testing)

[use_fetcher]: ../hooks/use-fetcher

