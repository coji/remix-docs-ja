---
title: フェッチャーの使用
---

# フェッチャーの使用

フェッチャーは、ナビゲーションが発生することなく、複数の同時データのやり取りを必要とする複雑で動的なユーザーインターフェースを作成するのに役立ちます。

フェッチャーは独自の独立した状態を追跡し、データの読み込み、データの変更、フォームの送信、およびローダーやアクションとの一般的な対話に使用できます。

## React 19

React は、フォームアクション、トランジション、`useOptimistic`、`useActionState`、`useFormStatus` の導入により、フェッチャーと同じユースケースを範囲に含めました。React Router でフェッチャーを使用する前に、React の組み込み API を使用することを検討してください。

React 18 を使用している場合は、フェッチャーは依然として複雑なデータのやり取りを管理するための優れた方法です。

## アクションの呼び出し

フェッチャーの最も一般的なケースは、アクションにデータを送信して、ルートデータの再検証をトリガーすることです。次のルートモジュールを検討してください。

```tsx
import { useLoaderData } from "react-router";

export async function clientLoader({ request }) {
  let title = localStorage.getItem("title") || "No Title";
  return { title };
}

export default function Component() {
  let data = useLoaderData();
  return (
    <div>
      <h1>{data.title}</h1>
    </div>
  );
}
```

### 1. アクションを追加する

まず、フェッチャーが呼び出すルートにアクションを追加します。

```tsx lines=[7-11]
import { useLoaderData } from "react-router";

export async function clientLoader({ request }) {
  // ...
}

export async function clientAction({ request }) {
  await new Promise((res) => setTimeout(res, 1000));
  let data = await request.formData();
  localStorage.setItem("title", data.get("title"));
  return { ok: true };
}

export default function Component() {
  let data = useLoaderData();
  // ...
}
```

### 2. フェッチャーを作成する

次に、フェッチャーを作成し、フォームをレンダリングします。

```tsx lines=[7,12-14]
import { useLoaderData, useFetcher } from "react-router";

// ...

export default function Component() {
  let data = useLoaderData();
  let fetcher = useFetcher();
  return (
    <div>
      <h1>{data.title}</h1>

      <fetcher.Form method="post">
        <input type="text" name="title" />
      </fetcher.Form>
    </div>
  );
}
```

### 3. フォームを送信する

ここでフォームを送信すると、フェッチャーはアクションを呼び出して、ルートデータを自動的に再検証します。

### 4. 処理中の状態をレンダリングする

フェッチャーは非同期処理中に状態を公開するため、ユーザーが操作した瞬間に処理中の UI をレンダリングできます。

```tsx lines=[10]
export default function Component() {
  let data = useLoaderData();
  let fetcher = useFetcher();
  return (
    <div>
      <h1>{data.title}</h1>

      <fetcher.Form method="post">
        <input type="text" name="title" />
        {fetcher.state !== "idle" && <p>保存中...</p>}
      </fetcher.Form>
    </div>
  );
}
```

### 5. 楽観的な UI

場合によっては、フォームに次の状態をすぐにレンダリングするのに十分な情報が含まれています。`fetcher.formData` でフォームデータにアクセスできます。

```tsx lines=[3-4,8]
export default function Component() {
  let data = useLoaderData();
  let fetcher = useFetcher();
  let title = fetcher.formData?.get("title") || data.title;

  return (
    <div>
      <h1>{title}</h1>

      <fetcher.Form method="post">
        <input type="text" name="title" />
        {fetcher.state !== "idle" && <p>保存中...</p>}
      </fetcher.Form>
    </div>
  );
}
```

### 6. フェッチャーデータと検証

アクションから返されたデータは、フェッチャーの `data` プロパティで利用できます。これは、失敗した変更に対してユーザーにエラーメッセージを返す際に主に役立ちます。

```tsx lines=[7-10,28-32]
// ...

export async function clientAction({ request }) {
  await new Promise((res) => setTimeout(res, 1000));
  let data = await request.formData();

  let title = data.get("title") as string;
  if (title.trim() === "") {
    return { ok: false, error: "タイトルは空にできません" };
  }

  localStorage.setItem("title", title);
  return { ok: true, error: null };
}

export default function Component() {
  let data = useLoaderData();
  let fetcher = useFetcher();
  let title = fetcher.formData?.get("title") || data.title;

  return (
    <div>
      <h1>{title}</h1>

      <fetcher.Form method="post">
        <input type="text" name="title" />
        {fetcher.state !== "idle" && <p>保存中...</p>}
        {fetcher.data?.error && (
          <p style={{ color: "red" }}>
            {fetcher.data.error}
          </p>
        )}
      </fetcher.Form>
    </div>
  );
}
```

### React 19 を使用する場合

React 19 では、フェッチャーの代わりにフォームアクション、`useActionState`、`useOptimistic` を使用できます。

- アクション: `clientAction` は React アクション関数に移動しますが、ほとんど変更されません
- 再検証: ルートデータは、`useRevalidator` を使用して手動で再検証されます
- 処理中の状態: `useActionState` は、`fetcher.state` の代わりに処理中のフラグを提供します
- 楽観的な UI: `useOptimistic` は、`fetcher.formData` から読み取る代わりに、楽観的な値を提供します

```tsx
import {
  useLoaderData,
  useRevalidator,
} from "react-router";
import { useActionState, useOptimistic } from "react";

async function updateTitleAction(formData: formData) {
  await new Promise((res) => setTimeout(res, 1000));
  let data = await request.formData();

  let title = data.get("title") as string;
  if (title.trim() === "") {
    return { ok: false, error: "タイトルは空にできません" };
  }

  localStorage.setItem("title", title);
  return { ok: true, error: null };
}

export async function clientLoader() {
  // ...
}

export default function Component() {
  let data = useLoaderData();
  let revalidator = useRevalidator();
  let [title, setTitle] = useOptimistic(data.title);
  let [state, action, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      setTitle(formData.get("title") as string);
      let result = await updateTitleAction(formData);
      if (result.ok) await revalidator.revalidate();
      return result;
    },
    null
  );

  return (
    <div>
      <h1>{title}</h1>

      <form action={action}>
        <input type="text" name="title" />
        {pending && <p>保存中...</p>}
        {state?.error && (
          <p style={{ color: "red" }}>{state.error}</p>
        )}
      </form>
    </div>
  );
}
```

## データの読み込み

フェッチャーのもう 1 つの一般的なユースケースは、コンボボックスなどのルートからデータを読み込むことです。

### 1. 検索ルートを作成する

非常に基本的な検索を備えた次のルートを検討してください。

```tsx filename=./search-users.tsx
// { path: '/search-users', filename: './search-users.tsx' }
const users = [
  { id: 1, name: "Ryan" },
  { id: 2, name: "Michael" },
  // ...
];

export async function loader({ request }) {
  await new Promise((res) => setTimeout(res, 300));
  let url = new URL(request.url);
  let query = url.searchParams.get("q");
  return users.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );
}
```

### 2. コンボボックスコンポーネントにフェッチャーをレンダリングする

```tsx
import { useFetcher } from "react-router";

export function UserSearchCombobox() {
  let fetcher = useFetcher();
  return (
    <div>
      <fetcher.Form method="get" action="/search-users">
        <input type="text" name="q" />
      </fetcher.Form>
    </div>
  );
}
```

- アクションは、上記で作成したルートを指します: "/search-users"
- 入力の名前は "q" で、クエリパラメーターと一致しています

### 3. タイプ推論を追加する

```tsx lines=[2,5]
import { useFetcher } from "react-router";
import type { Search } from "./search-users";

export function UserSearchCombobox() {
  let fetcher = useFetcher<typeof Search.action>();
  // ...
}
```

`import type` を使用して、タイプのみをインポートするようにしてください。

### 4. データをレンダリングする

```tsx lines=[10-16]
import { useFetcher } from "react-router";

export function UserSearchCombobox() {
  let fetcher = useFetcher<typeof Search.action>();
  return (
    <div>
      <fetcher.Form method="get" action="/search-users">
        <input type="text" name="q" />
      </fetcher.Form>
      {fetcher.data && (
        <ul>
          {fetcher.data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

フォームを送信して結果を表示するには、「enter」キーを押す必要があることに注意してください。

### 5. 処理中の状態をレンダリングする

```tsx lines=[12-14]
import { useFetcher } from "react-router";

export function UserSearchCombobox() {
  let fetcher = useFetcher<typeof Search.action>();
  return (
    <div>
      <fetcher.Form method="get" action="/search-users">
        <input type="text" name="q" />
      </fetcher.Form>
      {fetcher.data && (
        <ul
          style={{
            opacity: fetcher.state === "idle" ? 1 : 0.25,
          }}
        >
          {fetcher.data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 6. ユーザー入力で検索する

フェッチャーは、`fetcher.submit` を使用してプログラムで送信できます。

```tsx lines=[5-7]
<fetcher.Form method="get" action="/search-users">
  <input
    type="text"
    name="q"
    onChange={(event) => {
      fetcher.submit(event.currentTarget.form);
    }}
  />
</fetcher.Form>
```

入力イベントのフォームが、`fetcher.submit` の最初の引数として渡されることに注意してください。フェッチャーは、そのフォームを使用してリクエストを送信し、フォームの属性を読み取って、フォーム要素からデータのシリアル化を行います。

### React 19 を使用する場合

React 19 を使用する場合、フォームアクション、`useActionState`、`useTransition` を使用して同じことを行うことができ、検索のためにルートを設定する必要はありません。

```tsx filename=./search-users.tsx
const users = [
  { id: 1, name: "Ryan" },
  { id: 2, name: "Michael" },
  // ...
];

async function search(_: any, formData: FormData) {
  let query = formData.get("q") as string;
  await new Promise((res) => setTimeout(res, 250));
  return users.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );
}
```

```tsx
import { useActionState, useTransition } from "react";
import { searchUsers } from "./search-users";

export default function UserSearchCombobox() {
  let [, startTransition] = useTransition();
  let [data, action, pending] = useActionState(
    searchUsers,
    null
  );
  return (
    <div>
      <form action={action}>
        <input
          type="text"
          name="q"
          onChange={(event) => {
            startTransition(() => {
              action(
                new FormData(event.currentTarget.form!)
              );
            });
          }}
        />
      </form>
      {data && (
        <ul style={{ opacity: pending ? 0.25 : 1 }}>
          {data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```



