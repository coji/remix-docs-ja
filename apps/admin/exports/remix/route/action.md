---
title: action
---

# `action`

<docs-success><a href="https://www.youtube.com/playlist?list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">📼 Remix Singles</a> をご覧ください: <a href="https://www.youtube.com/watch?v=Iv25HAHaFDs&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">Form + action によるデータ変更</a> と <a href="https://www.youtube.com/watch?v=w2i-9cYxSdc&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">複数のフォームと単一ボタンによる変更</a></docs-success>

ルートの `action` は、データ変更やその他のアクションを処理するためのサーバー専用の関数です。ルートに対して `GET` 以外のリクエスト (`DELETE`, `PATCH`, `POST`, または `PUT`) が行われた場合、[`loader`][loader] が呼び出される前に action が呼び出されます。

`action` は `loader` と同じ API を持ちますが、呼び出されるタイミングが異なるだけです。これにより、データセットに関するすべてのものを単一のルートモジュールにまとめることができます。データの読み取り、データをレンダリングするコンポーネント、データの書き込みです。

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
        <button type="submit">Create Todo</button>
      </Form>
    </div>
  );
}
```

URL に対して `POST` が行われると、ルート階層内の複数のルートがその URL に一致します。UI を構築するためにすべてが呼び出されるローダーへの `GET` とは異なり、_1 つの action のみが呼び出されます_。

<docs-info>呼び出されるルートは、最も深く一致するルートになります。ただし、最も深く一致するルートが「インデックスルート」である場合は除きます。この場合、インデックスの親ルートにポストされます（同じ URL を共有しているため、親が優先されます）。</docs-info>

インデックスルートにポストしたい場合は、action で `?index` を使用します: `<Form action="/accounts?index" method="post" />`

| action url        | ルート action                     |
| ----------------- | -------------------------------- |
| `/accounts?index` | `app/routes/accounts._index.tsx` |
| `/accounts`       | `app/routes/accounts.tsx`        |

また、action プロパティのないフォーム (`<Form method="post">`) は、レンダリングされているルートと同じルートに自動的にポストされることに注意してください。したがって、親ルートとインデックスルートを区別するために `?index` パラメータを使用するのは、インデックスルート自体以外の場所からインデックスルートにポストする場合にのみ役立ちます。インデックスルートからそれ自体にポストする場合、または親ルートからそれ自体にポストする場合は、`<Form action>` を定義する必要はまったくありません。単に省略してください: `<Form method="post">`。

以下も参照してください:

- [`<Form>`][form-component]
- [`<Form action>`][form-component-action]
- [`?index` クエリパラメータ][index-query-param]

[loader]: ./loader
[form-component]: ../components/form
[form-component-action]: ../components/form#action
[index-query-param]: ../guides/index-query-param

