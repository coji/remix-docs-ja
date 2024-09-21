---
title: アクション
order: 6
---

# アクション

データの変更は、ルートアクションを通じて行われます。アクションが完了すると、ページ上のすべてのローダーデータは再検証され、UIとデータが同期状態に保たれます。この処理は、コードを書くことなく行われます。

`action`で定義されたルートアクションはサーバーでのみ呼び出され、`clientAction`で定義されたアクションはブラウザで実行されます。

## クライアントアクション

クライアントアクションはブラウザでのみ実行され、サーバーアクションと両方が定義されている場合は優先されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import { defineRoute$, Form } from "react-router";

export default defineRoute$({
  clientAction({ request }) {
    let formData = await request.formData();
    let title = await formData.get("title");
    let project = await someApi.updateProject({ title });
    return project;
  },

  Component({ data, actionData }) {
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
  },
});
```

## サーバーアクション

サーバーアクションはサーバーでのみ実行され、クライアントバンドルから削除されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import { defineRoute$, Form } from "react-router";

export default defineRoute$({
  action({ request }) {
    let formData = await request.formData();
    let title = await formData.get("title");
    let project = await someApi.updateProject({ title });
    return project;
  },

  Component({ data, actionData }) {
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
  },
});
```

## アクションの呼び出し

アクションは、`<Form>`を介して宣言的に、または`useSubmit`（または`<fetcher.Form>`と`fetcher.submit`）を介して、ルートのパスと「post」メソッドを参照することで、命令的に呼び出されます。

### フォームを使用したアクションの呼び出し

```tsx
import { Form } from "react-router";

function SomeComponent() {
  return (
    <Form action="/projects/:projectId" method="post">
      <input type="text" name="title" />
      <button type="submit">送信</button>
    </Form>
  );
}
```

これにより、ナビゲーションが発生し、ブラウザの履歴に新しいエントリが追加されます。

### useSubmitを使用したアクションの呼び出し

`useSubmit`を使用して、アクションにフォームデータを命令的に送信できます。

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

### fetcherを使用したアクションの呼び出し

fetcherを使用すると、ナビゲーションが発生することなく（ブラウザの履歴に新しいエントリは追加されません）、アクション（およびローダー）にデータを送信できます。

```tsx
import { useFetcher } from "react-router";

function Task() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post">
      <input type="text" name="title" />
      <button type="submit">
        {busy ? "保存中..." : "保存"}
      </button>
    </fetcher.Form>
  );
}
```

fetcherには、命令的な`submit`メソッドもあります。

```tsx
fetcher.submit(
  { title: "New Title" },
  { action: "/update-task", method: "post" }
);
```

詳細については、[フェッチャーの使用](../guides/fetchers)ガイドを参照してください。



