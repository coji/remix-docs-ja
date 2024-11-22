---
title: Fetcherの使用
---

# Fetcherの使用

Fetcherは、ナビゲーションを行わずに、複数同時データのやり取りを必要とする複雑で動的なユーザーインターフェースを作成するのに役立ちます。

Fetcherは独自の独立した状態を追跡し、データの読み込み、データの変更、フォームの送信、ローダーやアクションとの一般的なやり取りに使用できます。


## アクションの呼び出し

Fetcherの最も一般的なケースは、アクションにデータを送信して、ルートデータの再検証をトリガーすることです。次のルートモジュールを考えてみましょう。

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

### 1. アクションの追加

まず、Fetcherが呼び出すためのアクションをルートに追加します。

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

### 2. Fetcherの作成

次に、Fetcherを作成し、それを含むフォームをレンダリングします。

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

### 3. フォームの送信

ここでフォームを送信すると、Fetcherはアクションを呼び出し、ルートデータを自動的に再検証します。

### 4. ペディング状態のレンダリング

Fetcherは非同期処理中に状態を利用可能にするため、ユーザーが操作した瞬間にペディングUIをレンダリングできます。

```tsx lines=[10]
export default function Component() {
  let data = useLoaderData();
  let fetcher = useFetcher();
  return (
    <div>
      <h1>{data.title}</h1>

      <fetcher.Form method="post">
        <input type="text" name="title" />
        {fetcher.state !== "idle" && <p>Saving...</p>}
      </fetcher.Form>
    </div>
  );
}
```

### 5. 楽観的UI

フォームには次の状態をすぐにレンダリングするのに十分な情報がある場合があります。`fetcher.formData`を使用してフォームデータにアクセスできます。

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
        {fetcher.state !== "idle" && <p>Saving...</p>}
      </fetcher.Form>
    </div>
  );
}
```

### 6. Fetcherデータと検証

アクションから返されたデータは、fetcherの`data`プロパティで使用できます。これは主に、失敗した変更に対してユーザーにエラーメッセージを返すのに役立ちます。

```tsx lines=[7-10,28-32]
// ...

export async function clientAction({ request }) {
  await new Promise((res) => setTimeout(res, 1000));
  let data = await request.formData();

  let title = data.get("title") as string;
  if (title.trim() === "") {
    return { ok: false, error: "Title cannot be empty" };
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
        {fetcher.state !== "idle" && <p>Saving...</p>}
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

## データの読み込み

Fetcherのもう1つの一般的なユースケースは、コンボボックスなどに対してルートからデータを読み込むことです。

### 1. 検索ルートの作成

非常に基本的な検索を含む次のルートを考えてみましょう。

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

### 2. コンボボックスコンポーネントへのFetcherのレンダリング

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

- アクションは、上記で作成したルート "/search-users" を指します。
- 入力の名前は、クエリパラメータと一致する "q" です。

### 3. 型推論の追加

```tsx lines=[2,5]
import { useFetcher } from "react-router";
import type { Search } from "./search-users";

export function UserSearchCombobox() {
  let fetcher = useFetcher<typeof Search.action>();
  // ...
}
```

型のみをインポートするために`import type`を使用してください。


### 4. データのレンダリング

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

フォームを送信して結果を確認するには、「Enter」キーを押す必要があることに注意してください。


### 5. ペディング状態のレンダリング

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

### 6. ユーザー入力での検索

Fetcherは`fetcher.submit`を使用してプログラムで送信できます。

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

入力イベントのフォームが`fetcher.submit`の最初の引数として渡されることに注意してください。Fetcherはそのフォームを使用してリクエストを送信し、その属性を読み取り、要素からデータをシリアル化します。


