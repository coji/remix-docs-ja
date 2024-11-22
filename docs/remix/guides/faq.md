---
title: よくある質問
description: Remixに関するよくある質問
---

# よくある質問

## 親ルートローダーでユーザーを検証して、すべての子ルートを保護するにはどうすればよいですか？

それはできません😅。クライアント側の遷移中、アプリをできるだけ高速にするために、Remixはすべてのローダーを別々のフェッチ要求で並行して呼び出します。それぞれのローダーは独自の認証チェックを行う必要があります。

これは、Remixを使用する前と同じである可能性があり、今は単に明確になっているだけです。Remix以外では、「APIルート」に複数のフェッチを行う場合、それらのエンドポイントのそれぞれがユーザーセッションを検証する必要があります。言い換えれば、Remixルートローダーは独自の「APIルート」であり、そうとして扱う必要があります。

ユーザーセッションを検証する関数を作り、それを必要とするルートに追加することをお勧めします。

```ts filename=app/session.ts lines=[9-22]
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node"; // または cloudflare/deno

// セッションストレージがある場所
const { getSession } = createCookieSessionStorage();

export async function requireUserSession(request) {
  // セッションを取得する
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);

  // セッションを検証する、`userId`は単なる例であり、ユーザーが認証したときにセッションに保存した値を使用する
  if (!session.has("userId")) {
    // ユーザーセッションがない場合は、ログインにリダイレクトする
    throw redirect("/login");
  }

  return session;
}
```

これで、ユーザーセッションを必要とするローダーまたはアクションでは、この関数を呼び出すことができます。

```tsx filename=app/routes/projects.tsx lines=[5]
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // ユーザーが認証されていない場合は、ログインにリダイレクトされます
  const session = await requireUserSession(request);

  // それ以外の場合は、コードは実行を続けます
  const projects = await fakeDb.projects.scan({
    userId: session.get("userId"),
  });
  return json(projects);
}
```

セッション情報が必要なくても、この関数は引き続きルートを保護します。

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  await requireUserSession(request);
  // 続ける
}
```

## 1つのルートで複数のフォームを処理するにはどうすればよいですか？

[YouTubeで視聴][watch_on_youtube]

HTMLでは、フォームは`action`プロパティで任意のURLに投稿でき、アプリはそのURLにナビゲートします。

```tsx
<Form action="/some/where" />
```

Remixでは、アクションはフォームがレンダリングされているルートにデフォルトで設定されているため、UIとそれを処理するサーバー側のコードを簡単に配置できます。開発者はしばしば、このシナリオで複数のアクションをどのように処理するか疑問に思います。2つの選択肢があります。

1. 行いたいアクションを決定するフォームフィールドを送信する
2. 別のルートに投稿して、元のルートにリダイレクトする

オプション(1)は、UIにバリデーションエラーを戻すためにセッションを操作する必要がないため、最もシンプルであることがわかります。

HTMLボタンは値を送信できるので、これが実装する最も簡単な方法です。

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

<docs-warning>古いブラウザバージョンでは、[SubmitEvent: submitter プロパティ][submitevent-submitter]または[FormData() コンストラクターの submitter パラメーター][formdata-submitter]をサポートしていない可能性があるため、この機能が壊れる可能性があります。これらの機能のブラウザ互換性を必ず確認してください。ポリフィルが必要な場合は、[Event Submitter ポリフィル][polyfill-event-submitter]と[FormData Submitter ポリフィル][polyfill-formdata-submitter]を参照してください。詳細については、関連する問題[remix-run/remix#9704][remix-submitter-issue]をご覧ください。</docs-warning>

## フォームに構造化されたデータを含めるにはどうすればよいですか？

`application/json`のコンテンツタイプでフェッチを行うことに慣れている場合は、フォームがどのように当てはまるのか疑問に思うかもしれません。[`FormData`][form_data]はJSONとは少し異なります。

- ネストされたデータを持つことはできません。単なる「キー値」です。
- JSONとは異なり、_同じキーに複数のエントリを持つ_ことができます。

構造化されたデータを送信したい場合は、単に配列を投稿するために、同じキーを複数の入力に使用できます。

```tsx
<Form method="post">
  <p>この動画のカテゴリを選択してください:</p>
  <label>
    <input type="checkbox" name="category" value="comedy" />{" "}
    コメディ
  </label>
  <label>
    <input type="checkbox" name="category" value="music" />{" "}
    ミュージック
  </label>
  <label>
    <input type="checkbox" name="category" value="howto" />{" "}
    ハウツー
  </label>
</Form>
```

各チェックボックスの名前は「category」です。`FormData`は同じキーに複数の値を持つことができるため、JSONは必要ありません。アクションでは`formData.getAll()`を使用してチェックボックスの値にアクセスします。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const categories = formData.getAll("category");
  // ["comedy", "music"]
}
```

同じ入力名と`formData.getAll()`を使用すると、ほとんどの場合、構造化されたデータをフォームに送信したい場合に役立ちます。

それでもネストされた構造を送信したい場合は、標準ではないフォームフィールドの命名規則とnpmの[`query-string`][query_string]パッケージを使用できます。

```tsx
<>
  // []を使用した配列
  <input name="category[]" value="comedy" />
  <input name="category[]" value="comedy" />
  // ネストされた構造、親キー[子キー]
  <input name="user[name]" value="Ryan" />
</>
```

そして、アクションで

```tsx
import queryString from "query-string";

// アクションで
export async function action({
  request,
}: ActionFunctionArgs) {
  // フォームデータを取得するために`request.text()`を使用する、`request.formData`ではなく、URLエンコードされたフォームクエリ文字列
  const formQueryString = await request.text();

  // オブジェクトに解析する
  const obj = queryString.parse(formQueryString);
}
```

一部の人は、JSONを非表示フィールドにダンプすることさえあります。この方法は、プログレッシブエンハンスメントでは機能しないことに注意してください。それがアプリにとって重要ではない場合は、構造化されたデータを簡単に送信できます。

```tsx
<input
  type="hidden"
  name="json"
  value={JSON.stringify(obj)}
/>
```

そして、アクションでそれを解析します。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const obj = JSON.parse(formData.get("json"));
}
```

繰り返しますが、`formData.getAll()`は多くの場合で十分です。ぜひ試してみてください！

[form_data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[query_string]: https://npm.im/query-string
[ramda]: https://npm.im/ramda
[watch_on_youtube]: https://www.youtube.com/watch?v=w2i-9cYxSdc&ab_channel=Remix
[submitevent-submitter]: https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter
[formdata-submitter]: https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData#submitter
[polyfill-event-submitter]: https://github.com/idea2app/event-submitter-polyfill
[polyfill-formdata-submitter]: https://github.com/jenseng/formdata-submitter-polyfill
[remix-submitter-issue]: https://github.com/remix-run/remix/issues/9704



