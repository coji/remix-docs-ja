---
title: 保留中の UI
order: 7
---

# 保留中の UI

ユーザーが新しいルートに移動したり、アクションにデータを送信したりすると、UI は保留中または楽観的な状態でユーザーの操作に即座に応答する必要があります。アプリケーションコードがこれを行います。

## グローバルな保留中のナビゲーション

ユーザーが新しい URL に移動すると、次のページのローダーは、次のページがレンダリングされる前に待機されます。保留中の状態は `useNavigation` から取得できます。

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

## ローカルな保留中のナビゲーション

保留中のインジケーターは、リンクにローカライズすることもできます。NavLink の children、className、および style プロパティは、保留中の状態を受け取る関数にすることができます。

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

## 保留中のフォーム送信

フォームが送信されると、UI は保留中の状態でユーザーの操作に即座に応答する必要があります。これは、独自の独立した状態を持つ [fetcher][use_fetcher] フォームを使用するのが最も簡単です (通常のフォームはグローバルなナビゲーションを引き起こします)。

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

fetcher 以外のフォーム送信の場合、保留中の状態は `useNavigation` で利用できます。

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
    isComplete =
      fetcher.formData.get("status") === "complete";
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

