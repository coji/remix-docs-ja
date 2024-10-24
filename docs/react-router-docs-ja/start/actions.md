---
title: アクション
order: 6
---

# アクション

データの変更は、ルートのアクションを通して行われます。アクションが完了すると、ページ上のすべてのローダーデータが再検証され、UIがデータと同期した状態に保たれます。コードを書く必要はありません。

`action`で定義されたルートアクションはサーバーでのみ呼び出され、`clientAction`で定義されたアクションはブラウザで実行されます。

## クライアントアクション

クライアントアクションはブラウザでのみ実行され、サーバーアクションが両方定義されている場合、クライアントアクションが優先されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import type * as Route from "./+types.project";
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

サーバーアクションはサーバーでのみ実行され、クライアントバンドルから削除されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import type * as Route from "./+types.project";
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

### カスタムステータスコードとヘッダー

`action`からカスタムHTTPステータスコードまたはカスタムヘッダーを返す必要がある場合は、[`data`][data]ユーティリティを使用できます。

```tsx filename=app/project.tsx lines=[3,11-14,19]
// route('/projects/:projectId', './project.tsx')
import type * as Route from "./+types.project";
import { data } from "react-router";
import { fakeDb } from "../db";

export async function action({
  request,
}: Route.ActionArgs) {
  let formData = await request.formData();
  let title = await formData.get("title");
  if (!title) {
    throw data(
      { message: "Invalid title" },
      { status: 400 }
    );
  }

  if (!projectExists(title)) {
    let project = await fakeDb.createProject({ title });
    return data(project, { status: 201 });
  } else {
    let project = await fakeDb.updateProject({ title });
    return project;
  }
}
```

## アクションの呼び出し

アクションは、`<Form>`を通して宣言的に、そして`useSubmit`（または`<fetcher.Form>`と`fetcher.submit`）を通して、ルートのパスと "post" メソッドを参照することで、命令的に呼び出されます。

### フォームでアクションを呼び出す

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

これはナビゲーションを引き起こし、ブラウザの履歴に新しいエントリが追加されます。

### useSubmitでアクションを呼び出す

`useSubmit`を使用すると、アクションに対してフォームデータを命令的に送信できます。

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

これはナビゲーションを引き起こし、ブラウザの履歴に新しいエントリが追加されます。

### fetcherでアクションを呼び出す

fetcherを使用すると、ナビゲーション（ブラウザの履歴に新しいエントリがない）なしで、アクション（とローダー）に対してデータを送信できます。

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

それらには、命令的な`submit`メソッドもあります。

```tsx
fetcher.submit(
  { title: "New Title" },
  { action: "/update-task/123", method: "post" }
);
```

詳細は[Using Fetchers][fetchers]ガイドを参照してください。

[fetchers]: ../misc/fetchers
[data]: ../../api/react-router/data



