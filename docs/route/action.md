---
title: アクション
---

# `action`

<docs-success>📼 Remix Singles をご覧ください: <a href="https://www.youtube.com/playlist?list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">📼 Remix Singles</a>: <a href="https://www.youtube.com/watch?v=Iv25HAHaFDs&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">フォーム + アクションによるデータ変更</a> と <a href="https://www.youtube.com/watch?v=w2i-9cYxSdc&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">複数のフォームと単一のボタン変更</a></docs-success>

ルート `action` は、データの変更やその他の操作を処理するためのサーバー側専用の関数です。ルートに `GET` 以外のリクエスト (`DELETE`, `PATCH`, `POST`, または `PUT`) が行われると、`action` は [`loader`][loader] より先に呼び出されます。

`action` は `loader` と同じ API を持ちますが、唯一の違いは呼び出されるタイミングです。これにより、データセットに関するすべてのものを単一のルートモジュールにまとめることができます。データの読み込み、データをレンダリングするコンポーネント、データの書き込みです。

```tsx
import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import { Form } from "@remix-run/react";

import { TodoList } from "~/components/TodoList";
import { fakeCreateTodo, fakeGetTodos } from "~/utils/db";

export async function action({
  request,
}: ActionFunctionArgs) {
  const body = await request.formData();
  const todo = await fakeCreateTodo({
    title: body.get("title"),
  });
  return redirect(`/todos/${todo.id}`);
}

export async function loader() {
  return json(await fakeGetTodos());
}

export default function Todos() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <TodoList todos={data} />
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">Todo 作成</button>
      </Form>
    </div>
  );
}
```

URL に `POST` が行われると、ルート階層内の複数のルートが URL と一致します。`GET` から `loader` へのリクエストの場合、UI を構築するためにすべてが呼び出されますが、_呼び出される `action` は 1 つのみ_です。

<docs-info>呼び出されるルートは、最も深く一致するルートになります。ただし、最も深く一致するルートが "インデックスルート" の場合は、インデックスの親ルートに投稿されます (同じ URL を共有するため、親が優先されます)。</docs-info>

インデックスルートに投稿する場合は、`action` に `?index` を使用します。`<Form action="/accounts?index" method="post" />`

| action の URL     | ルートのアクション                   |
| ---------------- | ------------------------------- |
| `/accounts?index` | `app/routes/accounts._index.tsx` |
| `/accounts`      | `app/routes/accounts.tsx`       |

また、アクションプロパティのないフォーム (`<Form method="post">`) は、レンダリングされたのと同じルートに自動的に投稿されます。そのため、親ルートとインデックスルートを区別するために `?index` パラメータを使用するのは、インデックスルート自体以外からインデックスルートに投稿する場合にのみ役立ちます。インデックスルートからそれ自体に、または親ルートからそれ自体に投稿する場合は、`<Form action>` を定義する必要はありません。省略してください。`<Form method="post">`。

こちらも参照してください:

- [`<Form>`][form-component]
- [`<Form action>`][form-component-action]
- [`?index` クエリパラメータ][index-query-param]

[loader]: ./loader
[form-component]: ../components/form
[form-component-action]: ../components/form#action
[index-query-param]: ../guides/index-query-param
