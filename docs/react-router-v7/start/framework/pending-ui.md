---
title: 処理中のUI
order: 7
---

# 処理中のUI

ユーザーが新しいルートに移動したり、アクションにデータを送信したりすると、UIはユーザーのアクションに、処理中または楽観的な状態ですぐに反応する必要があります。アプリケーションコードがこの処理を担当します。


## グローバルなナビゲーション処理中

ユーザーが新しいURLに移動すると、次のページのローダーは、次のページがレンダリングされる前に待機されます。`useNavigation`から処理中の状態を取得できます。

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

## ローカルなナビゲーション処理中

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

## フォーム送信処理中

フォームが送信されると、UIはユーザーのアクションに、処理中の状態で直ちに反応する必要があります。これは、[フェッチャー][use_fetcher]フォームを使用すると最も簡単です。フェッチャーフォームは独自の独立した状態を持つためです（通常のフォームはグローバルなナビゲーションを引き起こします）。

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

## 楽観的なUI

フォーム送信データによってUIの将来の状態がわかっている場合、インスタントUXのための楽観的なUIを実装できます。

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

---

次へ: [テスト](./testing)

[use_fetcher]: https://api.reactrouter.com/v7/functions/react_router.useFetcher.html



