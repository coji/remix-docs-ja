---
title: 処理中の UI
order: 7
---

# 処理中の UI

ユーザーが新しいルートに移動するか、アクションにデータを送信すると、UI はすぐに処理中または楽観的な状態をユーザーのアクションに応答する必要があります。

## グローバルな処理中のナビゲーション

ユーザーが新しい URL に移動すると、次のページのローダーが、次のページがレンダリングされる前に待機されます。`useNavigation` から処理中の状態を取得できます。

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

## ローカルな処理中のナビゲーション

処理中インジケーターは、リンクにローカル化することもできます。NavLink の子要素、className、および style プロパティは、処理中の状態を受け取る関数にすることができます。

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

フォームが送信されると、UI はすぐにユーザーのアクションに応答して処理中の状態になる必要があります。これは、[フェッチャー][use_fetcher] フォームを使用するのが最も簡単です。フェッチャーフォームは独自の独立した状態を持っているためです（通常のフォームはグローバルナビゲーションを引き起こします）。

```tsx filename=app/project.tsx
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

フェッチャー以外のフォーム送信の場合、処理中の状態は `useNavigation` で利用できます。

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

UI の将来の状態がフォーム送信データによってわかっている場合、楽観的な UI を実装して UI を即座に反映させることができます。

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
          {isComplete ? "完了解除" : "完了"}
        </button>
      </fetcher.Form>
    </div>
  );
}
```

[use_fetcher]: ../hooks/use-fetcher


