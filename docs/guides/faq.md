---
title: FAQ
description: Remixに関するよくある質問
---

# よくある質問

## 親ルートローダーでユーザーを検証し、すべての子ルートを保護するにはどうすればよいですか？

できません 😅。クライアント側の遷移中、アプリをできるだけ高速にするために、Remixはすべてのローダーを _並行して_ 個別のフェッチリクエストで呼び出します。それぞれのローダーは、独自の認証チェックを行う必要があります。

これは、Remixを使う前に行っていたこととあまり変わらないかもしれません。ただ、今はより明確になっているだけです。Remix以外では、"APIルート"への複数のフェッチを行う場合、これらのエンドポイントのそれぞれがユーザーセッションを検証する必要があります。言い換えれば、Remixのルートローダーは独自の"APIルート"であり、そのように扱う必要があります。

ユーザーセッションを検証する関数を作成することをお勧めします。この関数は、必要なルートに追加できます。

```ts filename=app/session.ts lines=[9-22]
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node"; // またはcloudflare/deno

// セッションストレージがある場所
const { getSession } = createCookieSessionStorage();

export async function requireUserSession(request) {
  // セッションを取得する
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);

  // セッションを検証する。`userId`は単なる例です。ユーザーが認証したときにセッションに格納した値を使用してください
  if (!session.has("userId")) {
    // ユーザーセッションが存在しない場合、ログインにリダイレクトする
    throw redirect("/login");
  }

  return session;
}
```

そして、ユーザーセッションが必要なローダーまたはアクションでは、この関数を呼び出すことができます。

```tsx filename=app/routes/projects.tsx lines=[5]
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // ユーザーが認証されていない場合、ログインにリダイレクトされます
  const session = await requireUserSession(request);

  // それ以外の場合は、コードの実行が続行されます
  const projects = await fakeDb.projects.scan({
    userId: session.get("userId"),
  });
  return json(projects);
}
```

セッション情報が必要なくても、この関数はルートを保護します。

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  await requireUserSession(request);
  // 続行する
}
```

## 1つのルートで複数のフォームをどのように処理すればよいですか？

[YouTubeで確認する][watch_on_youtube]

HTMLでは、フォームは `action` プロパティで任意のURLに投稿することができ、アプリはそのURLに移動します。

```tsx
<Form action="/some/where" />
```

Remixでは、アクションはデフォルトでフォームがレンダリングされたルートになります。これにより、UIとそれを処理するサーバーコードを簡単に共存させることができます。開発者は、このシナリオで複数のアクションをどのように処理すればよいのか疑問に思うことがよくあります。2つの選択肢があります。

1. 行いたいアクションを決定するフォームフィールドを送信する
2. 別のルートに投稿し、元のルートにリダイレクトする

選択肢(1)の方が簡単です。セッションをいじることなく、バリデーションエラーをUIに戻すことができます。

HTMLボタンは値を送信できるので、これが最も簡単な実装方法です。

```tsx filename=app/routes/projects.$id.tsx lines=[5-6,35,41]
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "update": {
      // 更新を実行する
      return updateProjectName(formData.get("name"));
    }
    case "delete": {
      // 削除を実行する
      return deleteStuff(formData);
    }
    default: {
      throw new Error("予期しないアクション");
    }
  }
}

export default function Projects() {
  const project = useLoaderData<typeof loader>();
  return (
    <>
      <h2>プロジェクトの更新</h2>
      <Form method="post">
        <label>
          プロジェクト名:{" "}
          <input
            type="text"
            name="name"
            defaultValue={project.name}
          />
        </label>
        <button type="submit" name="intent" value="update">
          更新
        </button>
      </Form>

      <Form method="post">
        <button type="submit" name="intent" value="delete">
          削除
        </button>
      </Form>
    </>
  );
}
```

## フォームに構造化されたデータを入れるにはどうすればよいですか？

`application/json`というコンテンツタイプでフェッチを行うことに慣れている場合、フォームがどのように当てはまるのか疑問に思うかもしれません。[`FormData`][form_data] は JSONとは少し異なります。

- ネストされたデータを持つことはできません。単なる"キーバリュー"です。
- JSONとは異なり、_同じキーに複数のエントリを持つ_ ことができます。

構造化されたデータを単純に配列として投稿したい場合は、複数の入力で同じキーを使用できます。

```tsx
<Form method="post">
  <p>ビデオのカテゴリを選択してください:</p>
  <label>
    <input type="checkbox" name="category" value="comedy" />{" "}
    コメディ
  </label>
  <label>
    <input type="checkbox" name="category" value="music" />{" "}
    音楽
  </label>
  <label>
    <input type="checkbox" name="category" value="howto" />{" "}
    ハウツー
  </label>
</Form>
```

各チェックボックスのnameは"category"です。`FormData`は同じキーに複数の値を持つことができるため、JSONは必要ありません。アクションで`formData.getAll()`を使ってチェックボックスの値にアクセスしてください。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const categories = formData.getAll("category");
  // ["comedy", "music"]
}
```

同じ入力名と`formData.getAll()`を使用することで、構造化されたデータをフォームで送信したい場合のほとんどのケースに対応できます。

それでもネストされた構造を送信したい場合は、標準外のフォームフィールドの命名規則とnpmの[`query-string`][query_string]パッケージを使用できます。

```tsx
<>
  // []を使った配列
  <input name="category[]" value="comedy" />
  <input name="category[]" value="comedy" />
  // ネストされた構造 parentKey[childKey]
  <input name="user[name]" value="Ryan" />
</>
```

そして、アクションで以下のようにします。

```tsx
import queryString from "query-string";

// アクションで
export async function action({
  request,
}: ActionFunctionArgs) {
  // `request.formData`ではなく`request.text()`を使って、フォームデータをURLエンコードされたフォームクエリ文字列として取得する
  const formQueryString = await request.text();

  // オブジェクトに解析する
  const obj = queryString.parse(formQueryString);
}
```

JSONを隠しフィールドにダンプする人もいます。このアプローチは、プログレッシブエンハンスメントでは動作しないことに注意してください。アプリにとってそれが重要でない場合は、これが構造化されたデータを簡単に送信する方法です。

```tsx
<input
  type="hidden"
  name="json"
  value={JSON.stringify(obj)}
/>
```

そして、アクションで以下のように解析します。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const obj = JSON.parse(formData.get("json"));
}
```

繰り返しますが、`formData.getAll()`は多くの場合、必要なものです。ぜひ試してみてください！

[form_data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[query_string]: https://npm.im/query-string
[ramda]: https://npm.im/ramda
[watch_on_youtube]: https://www.youtube.com/watch?v=w2i-9cYxSdc&ab_channel=Remix
