---
title: ペンディング UI
order: 7
---

# ペンディング UI

ユーザーが新しいルートに移動したり、アクションにデータを送信したりする場合、UI はユーザーのアクションにペンディング状態または楽観的な状態で即座に応答する必要があります。アプリケーションコードがこれを担当します。

## グローバルなペンディングナビゲーション

ユーザーが新しい URL に移動すると、次のページのローダーは、次のページがレンダリングされる前に待機されます。`useNavigation` からペンディング状態を取得できます。

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

## ローカルなペンディングナビゲーション

ペンディングインジケーターは、リンクにローカライズすることもできます。NavLink の children、className、および style プロパティは、ペンディング状態を受け取る関数にすることができます。

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

## ペンディングフォーム送信

フォームが送信されると、UI はユーザーのアクションにペンディング状態で即座に応答する必要があります。これは、独自の独立した状態を持つため（通常のフォームはグローバルナビゲーションを引き起こすのに対し）、[fetcher][use_fetcher] フォームを使用するのが最も簡単です。

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

fetcher 以外のフォーム送信の場合、ペンディング状態は `useNavigation` で利用できます。

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

## 楽観的な UI

UI の将来の状態がフォーム送信データによってわかっている場合、即時の UX のために楽観的な UI を実装できます。

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
          {isComplete ? "未完了にする" : "完了にする"}
        </button>
      </fetcher.Form>
    </div>
  );
}
```

---

次: [テスト](./testing)

[use_fetcher]: https://api.reactrouter.com/v7/functions/react_router.useFetcher.html

