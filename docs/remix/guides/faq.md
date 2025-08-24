---
title: FAQs
description: Remix に関するよくある質問
---

# よくある質問

## 親ルートのローダーでユーザーを検証し、すべての子ルートを保護するにはどうすればよいですか？

できません😅。クライアントサイドのトランジション中、アプリをできるだけ高速にするために、Remix はすべてのローダーを _並行して_、別々のフェッチリクエストで呼び出します。それぞれのローダーには、独自の認証チェックが必要です。

これはおそらく、Remix を使用する前にやっていたことと変わりないでしょう。ただ、今はより明確になっているだけかもしれません。Remix の外部では、「API ルート」に複数のフェッチを行う場合、それらのエンドポイントはそれぞれユーザーセッションを検証する必要があります。言い換えれば、Remix のルートローダーは独自の「API ルート」であり、そのように扱う必要があります。

ユーザーセッションを検証する関数を作成し、それを必要なルートに追加することをお勧めします。

```ts filename=app/session.ts lines=[9-22]
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node"; // or cloudflare/deno

// どこかにセッションストレージがある
const { getSession } = createCookieSessionStorage();

export async function requireUserSession(request) {
  // セッションを取得
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);

  // セッションを検証します。`userId` は単なる例です。ユーザーが認証されたときにセッションに設定した値を使用してください。
  if (!session.has("userId")) {
    // ユーザーセッションがない場合は、ログインにリダイレクトします
    throw redirect("/login");
  }

  return session;
}
```

これで、ユーザーセッションが必要なローダーまたはアクションで、この関数を呼び出すことができます。

```tsx filename=app/routes/projects.tsx lines=[5]
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // ユーザーが認証されていない場合、これはログインにリダイレクトします
  const session = await requireUserSession(request);

  // それ以外の場合は、コードの実行が続行されます
  const projects = await fakeDb.projects.scan({
    userId: session.get("userId"),
  });
  return json(projects);
}
```

セッション情報が必要ない場合でも、この関数はルートを保護します。

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  await requireUserSession(request);
  // 続行
}
```

## 1 つのルートで複数のフォームを処理するにはどうすればよいですか？

[YouTube で見る][watch_on_youtube]

HTML では、フォームは action プロパティを使用して任意の URL に POST でき、アプリはそこに移動します。

```tsx
<Form action="/some/where" />
```

Remix では、action はフォームがレンダリングされるルートにデフォルト設定されるため、UI とそれを処理するサーバーコードを簡単に同じ場所に配置できます。開発者は、このシナリオで複数のアクションを処理する方法を疑問に思うことがよくあります。2 つの選択肢があります。

1. 実行するアクションを決定するためのフォームフィールドを送信する
2. 別のルートに POST し、元のルートにリダイレクトする

(1) のオプションは、検証エラーを UI に戻すためにセッションをいじる必要がないため、最も簡単です。

HTML ボタンは値を送信できるため、これを実装する最も簡単な方法です。

```tsx filename=app/routes/projects.$id.tsx lines=[5-6,35,41]
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  switch (intent) {
    case "update": {
      // 更新を実行
      return updateProjectName(formData.get("name"));
    }
    case "delete": {
      // 削除を実行
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

<docs-warning>古いブラウザバージョンでは、[SubmitEvent: submitter プロパティ][submitevent-submitter] または [FormData() コンストラクター submitter パラメーター][formdata-submitter] をサポートしていないため、この機能が壊れる可能性があります。これらの機能のブラウザ互換性を必ず確認してください。これをポリフィルする必要がある場合は、[Event Submitter Polyfill][polyfill-event-submitter] および [FormData Submitter Polyfill][polyfill-formdata-submitter] を参照してください。詳細については、関連する問題 [remix-run/remix#9704][remix-submitter-issue] を参照してください。</docs-warning>

## フォームに構造化データを含めるにはどうすればよいですか？

`application/json` のコンテンツタイプでフェッチを行うことに慣れている場合は、フォームがどのように適合するのか疑問に思うかもしれません。[`FormData`][form_data] は JSON と少し異なります。

- ネストされたデータを持つことはできず、「キーと値」のみです。
- JSON とは異なり、1 つのキーに複数のエントリを持つことができます。

構造化データを単に配列を POST するために送信したい場合は、複数の入力で同じキーを使用できます。

```tsx
<Form method="post">
  <p>この動画のカテゴリを選択してください:</p>
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

各チェックボックスには、"category" という名前が付いています。`FormData` は同じキーに複数の値を持つことができるため、これに JSON は必要ありません。アクションで `formData.getAll()` を使用してチェックボックスの値にアクセスします。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const categories = formData.getAll("category");
  // ["comedy", "music"]
}
```

同じ入力名と `formData.getAll()` を使用すると、フォームで構造化データを送信したい場合のほとんどのケースに対応できます。

それでもネストされた構造も送信したい場合は、非標準のフォームフィールド命名規則と npm の [`query-string`][query_string] パッケージを使用できます。

```tsx
<>
  // [] を使用した配列
  <input name="category[]" value="comedy" />
  <input name="category[]" value="comedy" />
  // ネストされた構造 parentKey[childKey]
  <input name="user[name]" value="Ryan" />
</>
```

そして、アクションで次のようにします。

```tsx
import queryString from "query-string";

// アクション内:
export async function action({
  request,
}: ActionFunctionArgs) {
  // `request.formData` ではなく `request.text()` を使用して、フォームデータを URL エンコードされたフォームクエリ文字列として取得します
  const formQueryString = await request.text();

  // オブジェクトに解析します
  const obj = queryString.parse(formQueryString);
}
```

JSON を非表示フィールドにダンプする人もいます。このアプローチは、プログレッシブエンハンスメントでは機能しないことに注意してください。それがアプリにとって重要でない場合は、構造化データを送信する簡単な方法です。

```tsx
<input
  type="hidden"
  name="json"
  value={JSON.stringify(obj)}
/>
```

そして、アクションで解析します。

```tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const obj = JSON.parse(formData.get("json"));
}
```

繰り返しますが、`formData.getAll()` は多くの場合、必要なすべてです。ぜひ試してみてください。

[form_data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[query_string]: https://npm.im/query-string
[ramda]: https://npm.im/ramda
[watch_on_youtube]: https://www.youtube.com/watch?v=w2i-9cYxSdc&ab_channel=Remix
[submitevent-submitter]: https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter
[formdata-submitter]: https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData#submitter
[polyfill-event-submitter]: https://github.com/idea2app/event-submitter-polyfill
[polyfill-formdata-submitter]: https://github.com/jenseng/formdata-submitter-polyfill
[remix-submitter-issue]: https://github.com/remix-run/remix/issues/9704
