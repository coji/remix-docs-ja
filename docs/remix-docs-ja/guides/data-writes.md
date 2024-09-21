---
title: データ書き込み
---

# データ書き込み

Remix のデータ書き込み（一部の人々はこれをミューテーションと呼びます）は、2 つの基本的なウェブ API、`<form>` と HTTP を基盤として構築されています。その後、プログレッシブエンハンスメントを使用して、楽観的な UI、ローディングインジケーター、バリデーションフィードバックを有効にします。しかし、プログラミングモデルは依然として HTML フォームに基づいています。

ユーザーがフォームを送信すると、Remix は次の操作を行います。

1. フォームのアクションを呼び出す
2. ページ上のすべてのルートのすべてのデータをリロードする

多くの場合、人々は、サーバーの状態をコンポーネントに取得し、ユーザーが変更した場合に UI と同期させるために、redux のような React のグローバル状態管理ライブラリ、apollo のようなデータライブラリ、React Query のようなフェッチラッパーを探します。Remix の HTML ベースの API は、これらのツールのほとんどのユースケースを置き換えます。Remix は、標準の HTML API を使用すると、データをロードする方法と、変更後にデータを再検証する方法を知っています。

アクションを呼び出してルートを再検証する方法はいくつかあります。

- [`<Form>`][form]
- [`useSubmit()`][use-submit]
- [`useFetcher()`][use-fetcher]

このガイドでは、`<Form>` のみを扱います。このガイドを読んだ後、他の 2 つのドキュメントを読んで、それらをどのように使用するかを理解してください。このガイドのほとんどは `useSubmit` に適用されますが、`useFetcher` は少し異なります。

## プレーンな HTML フォーム

当社 <a href="https://reacttraining.com">React Training</a> でワークショップを何年も開催してきた結果、私たちは、多くの新しいウェブ開発者は（彼ら自身の責任ではないですが）、実際には `<form>` の仕組みを理解していないことに気づきました。

Remix の `<Form>` は `<form>` とまったく同じように動作するため（楽観的な UI など、いくつかの追加機能付き）、プレーンな HTML フォームについて復習しましょう。そうすることで、HTML と Remix を同時に学ぶことができます。

### HTML フォームの HTTP 動詞

ネイティブフォームは、`GET` と `POST` の 2 つの HTTP 動詞をサポートしています。Remix はこれらの動詞を使用して、ユーザーの意図を理解します。`GET` の場合、Remix はページのどの部分が変更されているかを判断し、変更されるレイアウトのデータのみを取得し、変更されないレイアウトにはキャッシュされたデータを使用します。`POST` の場合、Remix はすべてのデータをリロードして、サーバーからの更新を確実に取得します。両方を詳しく見てみましょう。

### HTML フォーム GET

`GET` は、フォームデータが URL 検索パラメータに渡される通常のナビゲーションです。`<a>` と同様に、通常のナビゲーションに使用しますが、ユーザーはフォームを通じて検索パラメータでデータを指定することができます。検索ページ以外では、`<form>` での `GET` の使用はあまりありません。

このフォームを考えてみましょう。

```html
<form method="get" action="/search">
  <label>検索 <input name="term" type="text" /></label>
  <button type="submit">検索</button>
</form>
```

ユーザーがフォームに入力して送信ボタンをクリックすると、ブラウザはフォームの値を URL 検索パラメータ文字列に自動的にシリアライズし、クエリ文字列を追加してフォームの `action` にナビゲートします。ユーザーが「remix」と入力したとします。ブラウザは `/search?term=remix` にナビゲートします。入力を `<input name="q"/>` に変更すると、フォームは `/search?q=remix` にナビゲートします。

これは、次のリンクを作成した場合と同じ動作です。

```html
<a href="/search?term=remix">「remix」を検索</a>
```

唯一の違いは、**ユーザー**が情報を提供できることです。

複数のフィールドがある場合、ブラウザはそれらを追加します。

```html
<form method="get" action="/search">
  <fieldset>
    <legend>ブランド</legend>
    <label>
      <input name="brand" value="nike" type="checkbox" />
      Nike
    </label>
    <label>
      <input name="brand" value="reebok" type="checkbox" />
      Reebok
    </label>
    <label>
      <input name="color" value="white" type="checkbox" />
      白
    </label>
    <label>
      <input name="color" value="black" type="checkbox" />
      黒
    </label>
    <button type="submit">検索</button>
  </fieldset>
</form>
```

ユーザーがどのチェックボックスをクリックしたかによって、ブラウザは次の URL にナビゲートします。

```
/search?brand=nike&color=black
/search?brand=nike&brand=reebok&color=white
```

### HTML フォーム POST

ウェブサイトのデータを新規作成、削除、または更新したい場合、フォームの POST が適しています。これは、ユーザーのプロフィール編集ページのような大きなフォームを意味するだけではありません。「いいね」ボタンでさえ、フォームで処理することができます。

「新規プロジェクト」フォームを考えてみましょう。

```html
<form method="post" action="/projects">
  <label><input name="name" type="text" /></label>
  <label><textarea name="description"></textarea></label>
  <button type="submit">作成</button>
</form>
```

ユーザーがこのフォームを送信すると、ブラウザはフィールドをリクエストの「ボディ」（URL 検索パラメータではなく）にシリアライズし、サーバーに「POST」します。これは依然として、ユーザーがリンクをクリックした場合と同じ通常のナビゲーションです。違いは 2 つあります。ユーザーがサーバーのデータを提供し、ブラウザがリクエストを「GET」ではなく「POST」として送信したことです。

データはサーバーのリクエストハンドラーで使用できるため、レコードを作成することができます。その後、レスポンスを返します。この場合、おそらく新しく作成されたプロジェクトにリダイレクトするでしょう。Remix のアクションは次のようになります。

```tsx filename=app/routes/projects.tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const body = await request.formData();
  const project = await createProject(body);
  return redirect(`/projects/${project.id}`);
}
```

ブラウザは `/projects/new` から始まり、リクエストにフォームデータを含む `/projects` に POST し、サーバーがブラウザを `/projects/123` にリダイレクトしました。このすべてが進行している間、ブラウザは通常の「ローディング」状態になります。アドレスの進捗バーが埋まり、ファビコンがスピナーに変わります。これは実際には、ユーザーにとって十分なエクスペリエンスです。

ウェブ開発初心者であれば、このようにフォームを使ったことがないかもしれません。多くの人が常に次のようにしていました。

```html
<form onSubmit={(event) => { event.preventDefault(); // 頑張って！ }} />
```

もしあなたがその一人なら、ブラウザ（と Remix）が組み込んだものをそのまま使用することで、ミューテーションがどれほど簡単になるのかを知って喜ぶでしょう。

## Remix のミューテーション：最初から最後まで

次の手順で、ミューテーションを最初から最後まで構築します。

1. JavaScript はオプション
2. バリデーション
3. エラー処理
4. プログレッシブに強化されたローディングインジケーター
5. プログレッシブに強化されたエラー表示

Remix の `<Form>` コンポーネントは、HTML フォームと同じようにデータミューテーションに使用します。違いは、ペンディングのフォーム状態にアクセスして、より良いユーザーエクスペリエンスを構築できることです。楽観的な UI やコンテキストに応じたローディングインジケーターなどです。

しかし、`<form>` か `<Form>` を使用するかにかかわらず、まったく同じコードを記述します。`<form>` から始めて、何も変更せずに `<Form>` に移行することができます。その後、特別なローディングインジケーターや楽観的な UI を追加します。しかし、面倒だなと思ったり、締め切りが迫っている場合は、`<form>` を使用して、ブラウザにユーザーフィードバックを処理させましょう。Remix の `<Form>` は、ミューテーションの「プログレッシブエンハンスメント」を実現したものです。

### フォームの作成

先ほどのプロジェクトフォームを再び使用してみましょう。

`app/routes/projects.new.tsx` というルートがあり、その中に次のフォームが含まれているとします。

```tsx filename=app/routes/projects.new.tsx
export default function NewProject() {
  return (
    <form method="post" action="/projects/new">
      <p>
        <label>
          名前: <input name="name" type="text" />
        </label>
      </p>
      <p>
        <label>
          説明:
          <br />
          <textarea name="description" />
        </label>
      </p>
      <p>
        <button type="submit">作成</button>
      </p>
    </form>
  );
}
```

次に、ルートアクションを追加します。`post` で送信されたフォームは、データの「アクション」を呼び出します。`get` で送信されたフォーム (`<Form method="get">`) は、`loader` によって処理されます。

```tsx lines=[1,5-11]
import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { redirect } from "@remix-run/node"; // または cloudflare/deno

// アクションという名前のエクスポートに注意してください。これはフォーム POST を処理します
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const project = await createProject(formData);
  return redirect(`/projects/${project.id}`);
};

export default function NewProject() {
  // ... 前と同じ
}
```

これで完了です。`createProject` が期待通りに動作すると仮定すれば、これだけです。過去に構築した SPA がどのようなものであっても、サーバーサイドのアクションとフォームがなければ、ユーザーからデータを取得することはできません。Remix の違いは、**それだけが必要である**ということです（そして、それはウェブがかつてそうであったように）。

もちろん、デフォルトのブラウザの動作よりも優れたユーザーエクスペリエンスを作成するために、複雑化し始めました。続けるうちに、そこにたどり着きますが、コア機能を実現するために、すでに記述したコードを変更する必要はありません。

### フォームバリデーション

フォームをクライアント側とサーバー側の両方でバリデーションすることは一般的です。また、（残念ながら）クライアント側でのみバリデーションを行うことも一般的です。これは、現在説明する時間がない、さまざまなデータの問題につながります。要点は、1 つの場所でしかバリデーションを行わない場合は、サーバーで行うということです。Remix では、それが唯一の場所であることに気づくでしょう（ブラウザに送信するほど少なく、良いものです！）。

わかっています、あなたはバリデーションエラーをアニメーション化したいと思っています。その部分にたどり着きます。しかし、今は基本的な HTML フォームとユーザーフローを構築するだけにしましょう。まずはシンプルに保ち、その後でファッショナブルにしましょう。

アクションに戻って、次のようにバリデーションエラーを返す API があるとします。

```tsx
const [errors, project] = await createProject(formData);
```

バリデーションエラーが発生した場合は、フォームに戻ってエラーを表示する必要があります。

```tsx lines=[1,7,9-12]
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const [errors, project] = await createProject(formData);

  if (errors) {
    const values = Object.fromEntries(formData);
    return json({ errors, values });
  }

  return redirect(`/projects/${project.id}`);
};
```

`useLoaderData` が `loader` からの値を返すのと同じように、`useActionData` はアクションからのデータを返します。ナビゲーションがフォームの送信だった場合にのみ存在するため、常に確認する必要があります。

```tsx lines=[3,12,22,27-31,39,44-48]
import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import { useActionData } from "@remix-run/react";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  // ...
};

export default function NewProject() {
  const actionData = useActionData<typeof action>();

  return (
    <form method="post" action="/projects/new">
      <p>
        <label>
          名前:{" "}
          <input
            name="name"
            type="text"
            defaultValue={actionData?.values.name}
          />
        </label>
      </p>

      {actionData?.errors.name ? (
        <p style={{ color: "red" }}>
          {actionData.errors.name}
        </p>
      ) : null}

      <p>
        <label>
          説明:
          <br />
          <textarea
            name="description"
            defaultValue={actionData?.values.description}
          />
        </label>
      </p>

      {actionData?.errors.description ? (
        <p style={{ color: "red" }}>
          {actionData.errors.description}
        </p>
      ) : null}

      <p>
        <button type="submit">作成</button>
      </p>
    </form>
  );
}
```

すべての入力に `defaultValue` を追加していることに注意してください。これは通常の HTML `<form>` なので、ブラウザとサーバーの通常の処理が行われています。サーバーから値を取得しているので、ユーザーは入力した内容を再入力する必要がありません。

このコードはそのまま配布できます。ブラウザはペンディングの UI と割り込みを処理します。週末は楽しんで、月曜日にファッショナブルにしてください。

### `<Form>` に移行して、ペンディングの UI を追加する

プログレッシブエンハンスメントを使用して、この UX をさらにファッショナブルにしましょう。`<form>` を `<Form>` に変更することで、Remix はブラウザの動作を `fetch` でエミュレートします。また、ペンディングのフォームデータにアクセスできるようになるため、ペンディングの UI を構築することができます。

```tsx lines=[2,11]
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import { useActionData, Form } from "@remix-run/react";

// ...

export default function NewProject() {
  const actionData = useActionData<typeof action>();

  return (
    // 大文字の F <Form> に注意してください
    <Form method="post">{/* ... */}</Form>
  );
}
```

<docs-error>ちょっと待って！フォームを Form に変更するだけだと、UX が少し悪くなります！</docs-error>

時間がないか、ここでの作業を行う気力がなければ、`<Form reloadDocument>` を使用してください。これにより、ブラウザはペンディングの UI 状態を処理し続けることができます（タブのファビコンのスピナー、アドレスバーの進捗バーなど）。`<Form>` をそのまま使用して、ペンディングの UI を実装しないと、ユーザーはフォームを送信しても何も起こっていないことに気づきません。

<docs-info>大文字の F の Form を常に使用することをお勧めします。ブラウザにペンディングの UI を処理させたい場合は、<code>\<Form reloadDocument></code> プロップを使用してください。</docs-info>

次に、ペンディングの UI を追加して、ユーザーがフォームを送信したときに何かが起こっていることを知らせるようにしましょう。`useNavigation` というフックがあります。フォームの送信がペンディングの場合、Remix はフォームのシリアライズされたバージョンを <a href="https://developer.mozilla.org/en-US/docs/Web/API/FormData">`FormData`</a> オブジェクトとして返します。最も関心があるのは、<a href="https://developer.mozilla.org/en-US/docs/Web/API/FormData/get">`formData.get()`</a> メソッドです。

```tsx lines=[5,13,19,65-67]
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import {
  useActionData,
  Form,
  useNavigation,
} from "@remix-run/react";

// ...

export default function NewProject() {
  // フォームがサーバーで処理されている場合、これは異なるナビゲーション状態を返し、ペンディングの UI と楽観的な UI を構築するのに役立ちます。
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <fieldset
        disabled={navigation.state === "submitting"}
      >
        <p>
          <label>
            名前:{" "}
            <input
              name="name"
              type="text"
              defaultValue={
                actionData
                  ? actionData.values.name
                  : undefined
              }
            />
          </label>
        </p>

        {actionData && actionData.errors.name ? (
          <p style={{ color: "red" }}>
            {actionData.errors.name}
          </p>
        ) : null}

        <p>
          <label>
            説明:
            <br />
            <textarea
              name="description"
              defaultValue={
                actionData
                  ? actionData.values.description
                  : undefined
              }
            />
          </label>
        </p>

        {actionData && actionData.errors.description ? (
          <p style={{ color: "red" }}>
            {actionData.errors.description}
          </p>
        ) : null}

        <p>
          <button type="submit">
            {navigation.state === "submitting"
              ? "作成中..."
              : "作成"}
          </button>
        </p>
      </fieldset>
    </Form>
  );
}
```

素晴らしいですね！これで、ユーザーが「作成」をクリックすると、入力は使用不能になり、送信ボタンのテキストが変更されます。ネットワークリクエストが 1 つだけになったため、全体的な処理速度も向上するはずです（完全なページリロードは、多くの場合、さらに多くのネットワークリクエスト、ブラウザキャッシュからのアセットの読み込み、JavaScript の解析、CSS の解析などが含まれます）。

このページでは `navigation` をあまり使用していませんが、送信に関するすべての情報（`navigation.formMethod`、`navigation.formAction`、`navigation.formEncType`）と、サーバーで処理されているすべての値（`navigation.formData`）が含まれています。

### バリデーションエラーのアニメーション化

JavaScript を使用してこのページを送信するようになったので、ページが状態を持つようになったため、バリデーションエラーをアニメーション化することができます。まず、高さや不透明度をアニメーション化するファッショナブルなコンポーネントを作成しましょう。

```tsx
function ValidationMessage({ error, isSubmitting }) {
  const [show, setShow] = useState(!!error);

  useEffect(() => {
    const id = setTimeout(() => {
      const hasError = !!error;
      setShow(hasError && !isSubmitting);
    });
    return () => clearTimeout(id);
  }, [error, isSubmitting]);

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        height: show ? "1em" : 0,
        color: "red",
        transition: "all 300ms ease-in-out",
      }}
    >
      {error}
    </div>
  );
}
```

これで、古いエラーメッセージをこの新しいファッショナブルなコンポーネントでラップし、エラーのあるフィールドの境界線を赤くすることができます。

```tsx lines=[21-24,31-34,44-48,53-56]
export default function NewProject() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <fieldset
        disabled={navigation.state === "submitting"}
      >
        <p>
          <label>
            名前:{" "}
            <input
              name="name"
              type="text"
              defaultValue={
                actionData
                  ? actionData.values.name
                  : undefined
              }
              style={{
                borderColor: actionData?.errors.name
                  ? "red"
                  : "",
              }}
            />
          </label>
        </p>

        {actionData?.errors.name ? (
          <ValidationMessage
            isSubmitting={navigation.state === "submitting"}
            error={actionData?.errors?.name}
          />
        ) : null}

        <p>
          <label>
            説明:
            <br />
            <textarea
              name="description"
              defaultValue={actionData?.values.description}
              style={{
                borderColor: actionData?.errors.description
                  ? "red"
                  : "",
              }}
            />
          </label>
        </p>

        <ValidationMessage
          isSubmitting={navigation.state === "submitting"}
          error={actionData?.errors.description}
        />

        <p>
          <button type="submit">
            {navigation.state === "submitting"
              ? "作成中..."
              : "作成"}
          </button>
        </p>
      </fieldset>
    </Form>
  );
}
```

バッチリですね！サーバーとのやり取り方を変えることなく、ファッショナブルな UI を実現できました。また、JS が読み込まれないネットワーク状況にも対応しています。

### まとめ

- まず、JavaScript を考慮せずにプロジェクトフォームを作成しました。シンプルなフォームで、サーバーサイドのアクションに POST します。1998 年へようこそ。

- その後、`<form>` を `<Form>` に変更することで、JavaScript を使用してフォームを送信できるようにしました。しかし、それ以外何もする必要はありませんでした。

- React を使用して状態を持つページが作成されたので、`useNavigation` フックを使用してナビゲーションの状態を問い合わせるだけで、ローディングインジケーターとバリデーションエラーのアニメーションを追加することができました。

コンポーネントの観点から言えば、すべてが `useNavigation` フックによってフォームが送信されたときに状態が更新され、データが返ってきたときにさらに状態が更新されただけです。もちろん、Remix の内部ではもっと多くのことが行われています。しかし、コンポーネントにとっては、それだけのことです。いくつかの状態更新だけです。これにより、あらゆるユーザーフローを簡単に飾ることができます。

## 関連項目

- [Form][form]
- [useNavigation][use-navigation]
- [アクション][actions]
- [ローダー][loaders]
- [`useSubmit()`][use-submit]
- [`useFetcher()`][use-fetcher]

[form]: ../components/form
[use-submit]: ../hooks/use-submit
[use-fetcher]: ../hooks/use-fetcher
[use-navigation]: ../hooks/use-navigation
[actions]: ../route/action
[loaders]: ../route/loader


