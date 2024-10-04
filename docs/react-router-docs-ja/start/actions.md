---
title: アクション
order: 6
---

# アクション

データの変更は、ルートアクションを通じて行われます。アクションが完了すると、ページ上のすべてのローダーデータが再検証され、UIがデータと同期されます。コードを記述する必要はありません。

`action`で定義されたルートアクションはサーバーでのみ呼び出され、`clientAction`で定義されたアクションはブラウザで実行されます。

## クライアントアクション

クライアントアクションはブラウザでのみ実行され、両方が定義されている場合、サーバーアクションよりも優先されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import type * as Route from "./+types.project";
import { Form } from "react-router";

export async function clientAction({
  request,
}: Route.ClientActionArgs) {
  let formData = await request.formData();
  let title = await formData.get("title");
  let project = await someApi.updateProject({ title });
  return project;
}

export default function Project({
  clientActionData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>プロジェクト</h1>
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">送信</button>
      </Form>
      {clientActionData ? (
        <p>{clientActionData.title} が更新されました</p>
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

export async function action({
  request,
}: Route.ActionArgs) {
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
      <h1>プロジェクト</h1>
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">送信</button>
      </Form>
      {actionData ? (
        <p>{actionData.title} が更新されました</p>
      ) : null}
    </div>
  );
}
```

## アクションの呼び出し

アクションは、`<Form>`を通じて宣言的に、または`useSubmit`（または`<fetcher.Form>`および`fetcher.submit`）を通じて命令的に呼び出されます。これは、ルートのパスと「post」メソッドを参照することで行われます。

### フォームでアクションを呼び出す

```tsx
import { Form } from "react-router";

function SomeComponent() {
  return (
    <Form action="/projects/123" method="post">
      <input type="text" name="title" />
      <button type="submit">送信</button>
    </Form>
  );
}
```

これにより、ナビゲーションが発生し、ブラウザ履歴に新しいエントリが追加されます。

### useSubmitでアクションを呼び出す

`useSubmit`を使用すると、アクションにフォームデータを命令的に送信できます。

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

これにより、ナビゲーションが発生し、ブラウザ履歴に新しいエントリが追加されます。

### fetcherでアクションを呼び出す

フェッチャーを使用すると、ナビゲーションなしで（ブラウザ履歴に新しいエントリが追加されずに）、アクション（およびローダー）にデータを送信できます。

```tsx
import { useFetcher } from "react-router";

function Task() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" action="/update-task/123">
      <input type="text" name="title" />
      <button type="submit">
        {busy ? "保存中..." : "保存"}
      </button>
    </fetcher.Form>
  );
}
```

また、命令的な`submit`メソッドも備えています。

```tsx
fetcher.submit(
  { title: "新しいタイトル" },
  { action: "/update-task/123", method: "post" }
);
```

詳細については、[フェッチャーの使用](../misc/fetchers)ガイドを参照してください。



