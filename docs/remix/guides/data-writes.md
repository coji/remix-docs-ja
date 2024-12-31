---
title: データ書き込み
---

# データ書き込み

Remix におけるデータ書き込み（ミューテーションと呼ぶ人もいます）は、2 つの基本的な Web API である `<form>` と HTTP の上に構築されています。そして、プログレッシブエンハンスメントを使用して、楽観的な UI、ローディングインジケーター、およびバリデーションフィードバックを有効にしますが、プログラミングモデルは依然として HTML フォームに基づいています。

ユーザーがフォームを送信すると、Remix は次の処理を行います。

1. フォームのアクションを呼び出す
2. ページ上のすべてのルートのすべてのデータをリロードする

多くの場合、人々は、サーバーの状態をコンポーネントに取り込み、ユーザーが変更したときに UI を同期させるために、redux のような React のグローバル状態管理ライブラリ、apollo のようなデータライブラリ、React Query のような fetch ラッパーを利用します。Remix の HTML ベースの API は、これらのツールのほとんどのユースケースを置き換えます。Remix は、標準の HTML API を使用すると、データのロード方法と、変更後に再検証する方法を認識します。

アクションを呼び出してルートを再検証する方法はいくつかあります。

- [`<Form>`][form]
- [`useSubmit()`][use-submit]
- [`useFetcher()`][use-fetcher]

このガイドでは、`<Form>` のみを取り上げます。これら 2 つの使用方法を理解するために、このガイドの後にドキュメントを読むことをお勧めします。このガイドのほとんどは `useSubmit` に適用されますが、`useFetcher` は少し異なります。

## プレーンな HTML フォーム

当社 <a href="https://reacttraining.com">React Training</a> で長年ワークショップを開催してきた結果、多くの新しい Web 開発者（彼らのせいではありませんが）が、実際には `<form>` の仕組みを知らないことがわかりました。

Remix の `<Form>` は `<form>` と同じように機能するため（楽観的な UI などのためのいくつかの追加機能があります）、プレーンな HTML フォームについて復習し、HTML と Remix の両方を同時に学習できるようにします。

### HTML フォームの HTTP 動詞

ネイティブフォームは、`GET` と `POST` の 2 つの HTTP 動詞をサポートしています。Remix は、これらの動詞を使用して、あなたの意図を理解します。GET の場合、Remix はページのどの部分が変更されているかを判断し、変更されているレイアウトのデータのみをフェッチし、変更されていないレイアウトにはキャッシュされたデータを使用します。POST の場合、Remix はすべてのデータをリロードして、サーバーからの更新を確実にキャプチャします。両方を見てみましょう。

### HTML フォーム GET

`GET` は、フォームデータが URL 検索パラメーターで渡される通常のナビゲーションです。通常のナビゲーションに使用します。`<a>` と同じですが、ユーザーはフォームを介して検索パラメーターでデータを提供できます。検索ページを除いて、`<form>` での使用は非常にまれです。

次のフォームを考えてみましょう。

```html
<form method="get" action="/search">
  <label>検索 <input name="term" type="text" /></label>
  <button type="submit">検索</button>
</form>
```

ユーザーがフォームに入力して送信をクリックすると、ブラウザーはフォームの値を自動的に URL 検索パラメーター文字列にシリアル化し、クエリ文字列を追加してフォームの `action` に移動します。ユーザーが「remix」と入力したとしましょう。ブラウザーは `/search?term=remix` に移動します。入力を `<input name="q"/>` に変更すると、フォームは `/search?q=remix` に移動します。

これは、次のリンクを作成した場合と同じ動作です。

```html
<a href="/search?term=remix">「remix」を検索</a>
```

ただし、**ユーザー**が情報を提供したという独自の違いがあります。

フィールドが多い場合、ブラウザーはそれらを追加します。

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
      White
    </label>
    <label>
      <input name="color" value="black" type="checkbox" />
      Black
    </label>
    <button type="submit">検索</button>
  </fieldset>
</form>
```

ユーザーがクリックしたチェックボックスに応じて、ブラウザーは次のような URL に移動します。

```
/search?brand=nike&color=black
/search?brand=nike&brand=reebok&color=white
```

### HTML フォーム POST

Web サイトでデータを作成、削除、または更新する場合は、フォームの POST を使用します。そして、ユーザープロファイルの編集ページのような大きなフォームだけを意味するわけではありません。「いいね」ボタンでさえ、フォームで処理できます。

「新しいプロジェクト」フォームを考えてみましょう。

```html
<form method="post" action="/projects">
  <label><input name="name" type="text" /></label>
  <label><textarea name="description"></textarea></label>
  <button type="submit">作成</button>
</form>
```

ユーザーがこのフォームを送信すると、ブラウザーはフィールドをリクエスト「ボディ」（URL 検索パラメーターではなく）にシリアル化し、サーバーに「POST」します。これは、ユーザーがリンクをクリックした場合と同じように、通常のナビゲーションです。違いは 2 つあります。ユーザーがサーバーにデータを提供し、ブラウザーがリクエストを「GET」ではなく「POST」として送信したことです。

データはサーバーのリクエストハンドラーで利用できるため、レコードを作成できます。その後、レスポンスを返します。この場合、おそらく新しく作成されたプロジェクトにリダイレクトします。Remix アクションは次のようになります。

```tsx filename=app/routes/projects.tsx
export async function action({
  request,
}: ActionFunctionArgs) {
  const body = await request.formData();
  const project = await createProject(body);
  return redirect(`/projects/${project.id}`);
}
```

ブラウザーは `/projects/new` から開始し、リクエストにフォームデータを含めて `/projects` に POST し、サーバーはブラウザーを `/projects/123` にリダイレクトしました。これがすべて発生している間、ブラウザーは通常の「読み込み中」状態になります。アドレスのプログレスバーが埋まり、ファビコンがスピナーに変わるなどです。実際には、まともなユーザーエクスペリエンスです。

Web 開発を始めたばかりの場合は、この方法でフォームを使用したことがないかもしれません。多くの人が常に次のように行ってきました。

```html
<form onSubmit={(event) => { event.preventDefault(); // 頑張って！ }} />
```

もしあなたがそうなら、ブラウザー（および Remix）に組み込まれているものを使用するだけで、ミューテーションがいかに簡単になるかを知って喜ぶでしょう。

## Remix ミューテーション、最初から最後まで

次の手順で、ミューテーションを最初から最後まで構築します。

1. JavaScript はオプション
2. バリデーション
3. エラー処理
4. プログレッシブエンハンスメントされたローディングインジケーター
5. プログレッシブエンハンスメントされたエラー表示

データミューテーションには、HTML フォームと同じように Remix の `<Form>` コンポーネントを使用します。違いは、コンテキストローディングインジケーターや「楽観的な UI」のような、より優れたユーザーエクスペリエンスを構築するために、保留中のフォーム状態にアクセスできるようになったことです。

`<form>` を使用するか `<Form>` を使用するかに関係なく、まったく同じコードを記述します。`<form>` から始めて、何も変更せずに `<Form>` に移行できます。その後、特別なローディングインジケーターと楽観的な UI を追加します。ただし、その気がなかったり、締め切りが迫っている場合は、`<form>` を使用して、ブラウザーにユーザーフィードバックを処理させましょう。Remix の `<Form>` は、ミューテーションに対する「プログレッシブエンハンスメント」の実現です。

### フォームの構築

以前のプロジェクトフォームから始めますが、使用可能にしましょう。

ルート `app/routes/projects.new.tsx` に次のフォームがあるとします。

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

次に、ルートアクションを追加します。「post」であるフォーム送信は、データ「アクション」を呼び出します。「get」送信（`<Form method="get">`）は、「ローダー」によって処理されます。

```tsx lines=[1,5-11]
import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { redirect } from "@remix-run/node"; // または cloudflare/deno

// 「action」エクスポート名に注意してください。これがフォームの POST を処理します
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

これで完了です！`createProject` が期待どおりに機能すると仮定すると、これだけですべてです。過去に構築した可能性のある SPA の種類に関係なく、ユーザーからデータを取得するには、常にサーバー側のアクションとフォームが必要であることに注意してください。Remix の違いは、**これだけが必要**であるということです（そして、それが Web の昔の姿でもありました）。

もちろん、デフォルトのブラウザーの動作よりも優れたユーザーエクスペリエンスを作成しようとして、複雑なことを始めました。続行しましょう。そこに到達しますが、コア機能を実行するためにすでに記述したコードを変更する必要はありません。

### フォームのバリデーション

フォームをクライアント側とサーバー側の両方で検証するのが一般的です。また、（残念ながら）クライアント側でのみ検証することも一般的であり、これにより、今すぐ説明する時間がないさまざまなデータの問題が発生します。重要なのは、1 か所でのみ検証する場合は、サーバーで検証することです。Remix を使用すると、それが唯一の場所であることがわかります（ブラウザーに送信するものが少ないほど良いです！）。

わかっています、わかっています、素敵なバリデーションエラーなどをアニメーション化したいのですよね。それについては後で説明します。しかし、今は基本的な HTML フォームとユーザーフローを構築しているだけです。最初はシンプルにして、後で凝ったものにします。

アクションに戻ると、次のようなバリデーションエラーを返す API があるかもしれません。

```tsx
const [errors, project] = await createProject(formData);
```

バリデーションエラーがある場合は、フォームに戻って表示する必要があります。

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

`useLoaderData` が `loader` から値を返すのと同じように、`useActionData` はアクションからデータを返します。ナビゲーションがフォーム送信の場合にのみ存在するため、常に取得したかどうかを確認する必要があります。

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

すべての入力に `defaultValue` を追加する方法に注目してください。これは通常の HTML `<form>` であるため、通常のブラウザー/サーバーの処理が行われているだけです。サーバーから値が返されるため、ユーザーは入力した内容を再入力する必要はありません。

このコードをそのまま出荷できます。ブラウザーは、保留中の UI と中断を処理します。週末を楽しんで、月曜日に凝ったものにしましょう。

### `<Form>` に移行して保留中の UI を追加する

プログレッシブエンハンスメントを使用して、この UX を少し凝ったものにしましょう。`<form>` から `<Form>` に変更すると、Remix は `fetch` でブラウザーの動作をエミュレートします。また、保留中のフォームデータにアクセスできるため、保留中の UI を構築できます。

```tsx lines=[2,11]
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import { useActionData, Form } from "@remix-run/react";

// ...

export default function NewProject() {
  const actionData = useActionData<typeof action>();

  return (
    // 大文字の「F」の <Form> に注目してください
    <Form method="post">{/* ... */}</Form>
  );
}
```

<docs-error>ちょっと待ってください！フォームを Form に変更するだけでは、UX が少し悪化しました！</docs-error>

ここで残りの作業を行う時間や意欲がない場合は、`<Form reloadDocument>` を使用してください。これにより、ブラウザーは保留中の UI 状態（タブのファビコンのスピナー、アドレスバーのプログレスバーなど）を処理し続けることができます。保留中の UI を実装せずに `<Form>` を使用するだけの場合、ユーザーはフォームを送信したときに何も起こっていないことに気づきません。

<docs-info>常に大文字の F の Form を使用し、ブラウザーに保留中の UI を処理させたい場合は、<code>\<Form reloadDocument></code> プロパティを使用することをお勧めします。</docs-info>

次に、ユーザーが送信時に何かが起こったことを知るための保留中の UI を追加しましょう。`useNavigation` というフックがあります。保留中のフォーム送信がある場合、Remix はフォームのシリアル化されたバージョンを <a href="https://developer.mozilla.org/en-US/docs/Web/API/FormData">`FormData`</a> オブジェクトとして提供します。最も関心があるのは、<a href="https://developer.mozilla.org/en-US/docs/Web/API/FormData/get">`formData.get()`</a> メソッドです。

```tsx lines=[5,13,19,65-67]
import { json, redirect } from "@remix-run/node"; // または cloudflare/deno
import {
  useActionData,
  Form,
  useNavigation,
} from "@remix-run/react";

// ...

export default function NewProject() {
  // フォームがサーバーで処理されている場合、これは保留中および楽観的な UI を構築するのに役立つさまざまなナビゲーション状態を返します。
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

かなり洗練されています！ユーザーが「作成」をクリックすると、入力が無効になり、送信ボタンのテキストが変更されます。ページ全体のリロード（ネットワークリクエストの増加、ブラウザーキャッシュからのアセットの読み取り、JavaScript の解析、CSS の解析などが発生する可能性があります）ではなく、1 つのネットワークリクエストのみが発生するため、操作全体も高速になるはずです。

このページでは `navigation` をあまり使用しませんでしたが、送信に関するすべての情報（`navigation.formMethod`、`navigation.formAction`、`navigation.formEncType`）と、サーバーで処理されているすべての値が `navigation.formData` に含まれています。

### バリデーションエラーのアニメーション化

このページを送信するために JavaScript を使用するようになったため、ページがステートフルであるため、バリデーションエラーをアニメーション化できます。まず、高さと不透明度をアニメーション化する凝ったコンポーネントを作成します。

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

これで、古いエラーメッセージをこの新しい凝ったコンポーネントでラップし、エラーのあるフィールドの境界線を赤色にすることもできます。

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

やった！サーバーとの通信方法を変更することなく、凝った UI ができました。また、JS の読み込みを妨げるネットワーク状態にも対応できます。

### レビュー

- まず、JavaScript を念頭に置かずにプロジェクトフォームを構築しました。サーバー側のアクションに投稿するシンプルなフォームです。1998 年へようこそ。

- それが機能したら、`<form>` を `<Form>` に変更して JavaScript を使用してフォームを送信しましたが、他に何もする必要はありませんでした。

- React を使用したステートフルなページになったので、Remix にナビゲーションの状態を要求するだけで、ローディングインジケーターとバリデーションエラーのアニメーションを追加しました。

コンポーネントの観点から見ると、フォームが送信されたときに `useNavigation` フックが状態の更新を引き起こし、データが返ってきたときに別の状態の更新が発生しただけです。もちろん、Remix の内部ではさらに多くのことが起こりましたが、コンポーネントに関する限り、それだけです。いくつかの状態の更新だけです。これにより、ユーザーフローを非常に簡単に装飾できます。

## 参照

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

