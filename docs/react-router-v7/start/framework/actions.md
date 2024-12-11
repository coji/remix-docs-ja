---
title: アクション
order: 6
---

# アクション

データの変更は、ルートアクションを通して行われます。アクションが完了すると、ページ上のすべてのローダーデータが再検証され、UIをデータと同期した状態に保ちます。コードを書く必要はありません。

`action` で定義されたルートアクションはサーバーでのみ呼び出され、`clientAction`で定義されたアクションはブラウザで実行されます。

## クライアントアクション

クライアントアクションはブラウザでのみ実行され、サーバーアクションの両方が定義されている場合、クライアントアクションが優先されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { Form } from "react-router";
import { someApi } from "./api";

export async function clientAction({
  request,
}: Route.ClientActionArgs) {
  let formData = await request.formData();
  let title = await formData.get("title");
  let project = await someApi.updateProject({ title });
  return project;
}

export default function Project({
  actionData,
}: Route.ComponentProps) {
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

## サーバーアクション

サーバーアクションはサーバーでのみ実行され、クライアントバンドルからは削除されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { Form } from "react-router";
import { fakeDb } from "../db";

export async function action({
  request,
}: Route.ActionArgs) {
  let formData = await request.formData();
  let title = await formData.get("title");
  let project = await fakeDb.updateProject({ title });
  return project;
}

export default function Project({
  actionData,
}: Route.ComponentProps) {
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

## アクションの呼び出し

アクションは、`<Form>` を通じて宣言的に、`useSubmit` （または `<fetcher.Form>` と `fetcher.submit`）を通じて命令的に、ルートのパスと "post" メソッドを参照することで呼び出されます。

### `<Form>` を使用したアクションの呼び出し

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

これにより、ナビゲーションが発生し、ブラウザの履歴に新しいエントリが追加されます。

### `useSubmit` を使用したアクションの呼び出し

`useSubmit` を使用して、アクションにフォームデータを送信することができます。

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

これにより、ナビゲーションが発生し、ブラウザの履歴に新しいエントリが追加されます。

### fetcher を使用したアクションの呼び出し

フェッチャーを使用すると、ナビゲーションを起こすことなく（ブラウザの履歴に新しいエントリは追加されません）、アクション（とローダー）にデータを送信できます。

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

これには、命令的な `submit` メソッドもあります。

```tsx
fetcher.submit(
  { title: "New Title" },
  { action: "/update-task/123", method: "post" }
);
```

詳細については、[フェッチャーの使用][fetchers]ガイドを参照してください。

---

次へ: [ナビゲーション](./navigating)

[fetchers]: ../../how-to/fetchers
[data]: ../../api/react-router/data

