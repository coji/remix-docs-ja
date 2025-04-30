---
title: アクション
order: 6
---

# アクション

[MODES: framework]

## イントロダクション

データの変更は、ルートアクションを通じて行われます。アクションが完了すると、ページ上のすべてのローダーデータが再検証され、UIを最新の状態に保つためにコードを書く必要はありません。

`action` で定義されたルートアクションはサーバーでのみ呼び出され、`clientAction` で定義されたアクションはブラウザで実行されます。

## クライアントアクション

クライアントアクションはブラウザでのみ実行され、サーバーアクションと両方が定義されている場合は、サーバーアクションよりも優先されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { Form } from "react-router";
import { someApi } from "./api";

export async function clientAction({
  request,
}: Route.ClientActionArgs) {
  let formData = await request.formData();
  let title = formData.get("title");
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

## サーバーアクション

サーバーアクションはサーバーでのみ実行され、クライアントバンドルから削除されます。

```tsx filename=app/project.tsx
// route('/projects/:projectId', './project.tsx')
import type { Route } from "./+types/project";
import { Form } from "react-router";
import { fakeDb } from "../db";

export async function action({
  request,
}: Route.ActionArgs) {
  let formData = await request.formData();
  let title = formData.get("title");
  let project = await fakeDb.updateProject({ title });
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

アクションは、ルートのパスと "post" メソッドを参照することにより、`<Form>` を通じて宣言的に、また `useSubmit` (または `<fetcher.Form>` と `fetcher.submit`) を通じて命令的に呼び出されます。

### Form を使用したアクションの呼び出し

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

これによりナビゲーションが発生し、ブラウザの履歴に新しいエントリが追加されます。

### useSubmit を使用したアクションの呼び出し

`useSubmit` を使用して、フォームデータを命令的にアクションに送信できます。

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

### fetcher を使用したアクションの呼び出し

Fetcher を使用すると、ナビゲーションを引き起こすことなく (ブラウザの履歴に新しいエントリを追加せずに)、アクション (およびローダー) にデータを送信できます。

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

また、命令的な `submit` メソッドもあります。

```tsx
fetcher.submit(
  { title: "新しいタイトル" },
  { action: "/update-task/123", method: "post" }
);
```

詳細については、[Fetcher の使用][fetchers] ガイドを参照してください。

---

次: [ナビゲーション](./navigating)

[fetchers]: ../../how-to/fetchers
[data]: ../../api/react-router/data
