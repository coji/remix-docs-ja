---
title: アクション
order: 5
---

# アクション

[MODES: data]

## アクションの定義

データの変更は、ルートオブジェクトの `action` プロパティで定義されたルートアクションを通じて行われます。アクションが完了すると、ページ上のすべてのローダーデータが再検証され、UIをデータと同期させるためのコードを書く必要がなくなります。

```tsx
import { createBrowserRouter } from "react-router";
import { someApi } from "./api";

let router = createBrowserRouter([
  {
    path: "/projects/:projectId",
    Component: Project,
    action: async ({ request }) => {
      let formData = await request.formData();
      let title = formData.get("title");
      let project = await someApi.updateProject({ title });
      return project;
    },
  },
]);
```

## アクションの呼び出し

アクションは、ルートのパスと "post" メソッドを参照することで、`<Form>` を通じて宣言的に、または `useSubmit` （あるいは `<fetcher.Form>` と `fetcher.submit`）を通じて命令的に呼び出されます。

### Form を使ったアクションの呼び出し

```tsx
import { Form } from "react-router";

function SomeComponent() {
  return (
    <Form action="/projects/123" method="post">
      <input type="text" name="title" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

これによりナビゲーションが発生し、ブラウザの履歴に新しいエントリが追加されます。

### useSubmit を使ったアクションの呼び出し

`useSubmit` を使用して、命令的にフォームデータをアクションに送信できます。

```tsx
import { useCallback } from "react";
import { useSubmit } from "react-router";
import { useFakeTimer } from "fake-lib";

function useQuizTimer() {
  let submit = useSubmit();

  let cb = useCallback(() => {
    submit(
      { quizTimedOut: true },
      { action: "/end-quiz", method: "post" }
    );
  }, []);

  let tenMinutes = 10 * 60 * 1000;
  useFakeTimer(tenMinutes, cb);
}
```

これによりナビゲーションが発生し、ブラウザの履歴に新しいエントリが追加されます。

### fetcher を使ったアクションの呼び出し

Fetcher を使用すると、ナビゲーションを引き起こさずに（ブラウザ履歴に新しいエントリを追加せずに）アクション（およびローダー）にデータを送信できます。

```tsx
import { useFetcher } from "react-router";

function Task() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" action="/update-task/123">
      <input type="text" name="title" />
      <button type="submit">
        {busy ? "Saving..." : "Save"}
      </button>
    </fetcher.Form>
  );
}
```

これらには命令的な `submit` メソッドもあります。

```tsx
fetcher.submit(
  { title: "New Title" },
  { action: "/update-task/123", method: "post" }
);
```

詳細については、[Fetcher の使用][fetchers]ガイドを参照してください。

## アクションデータへのアクセス

アクションは、ルートコンポーネント内で `useActionData` を通じて、または fetcher を使用している場合は `fetcher.data` を通じて利用可能なデータを返すことができます。

```tsx
function Project() {
  let actionData = useActionData();
  return (
    <div>
      <h1>Project</h1>
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">Submit</button>
      </Form>
      {actionData ? (
        <p>{actionData.title} updated</p>
      ) : null}
    </div>
  );
}
```

---

次へ: [ナビゲーション](./navigating)

[fetchers]: ../../how-to/fetchers
