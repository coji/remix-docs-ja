---
title: Form
---

# `<Form>`

`fetch` を介してアクションにデータを提出する、漸進的に強化された HTML [`<form>`][form_element] であり、`useNavigation` 内の保留状態をアクティブにして、基本的な HTML フォームを超えた高度なユーザーインターフェイスを実現します。フォームのアクションが完了すると、ページ上のすべてのデータはサーバーから自動的に再検証され、UI をデータと同期させます。

HTML フォーム API を使用するため、サーバー側でレンダリングされたページは、JavaScript がロードされる前に基本的なレベルでインタラクティブになります。Remix が提出を管理するのではなく、ブラウザが提出と保留状態（スピニングファビコンなど）を管理します。JavaScript がロードされると、Remix が引き継ぎ、Web アプリケーションのユーザーエクスペリエンスを可能にします。

フォームは、URL を変更したり、ブラウザの履歴スタックにエントリを追加したりする必要がある提出に最も役立ちます。ブラウザの履歴スタックを操作しないフォームの場合、[`<fetcher.Form>`][fetcher_form] を使用してください。

```tsx
import { Form } from "@remix-run/react";

function NewEvent() {
  return (
    <Form action="/events" method="post">
      <input name="title" type="text" />
      <input name="description" type="text" />
    </Form>
  );
}
```

## プロパティ

### `action`

フォームデータを提出する URL。

`undefined` の場合、これはコンテキスト内で最も近いルートにデフォルト設定されます。親ルートが `<Form>` をレンダリングするが、URL がより深い子ルートに一致する場合、フォームは親ルートに投稿されます。同様に、子ルート内のフォームは子ルートに投稿されます。これは、常に完全な URL を指すネイティブな [`<form>`][form_element] とは異なります。

<docs-info>
相対的な `<Form action>` の動作に関する `future.v3_relativeSplatPath` 未来フラグの動作については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。
</docs-info>

### `method`

これは使用する [HTTP 動詞][http_verb] を決定します: `DELETE`、`GET`、`PATCH`、`POST`、`PUT`。デフォルトは `GET` です。

```tsx
<Form method="post" />
```

ネイティブ [`<form>`][form_element] は `GET` と `POST` のみをサポートするため、[漸進的強化][progressive_enhancement] をサポートしたい場合は、他の動詞は避けてください。

### `encType`

フォーム提出に使用するエンコーディングタイプ。

```tsx
<Form encType="multipart/form-data" />
```

デフォルトは `application/x-www-form-urlencoded` であり、ファイルアップロードには `multipart/form-data` を使用します。

### `navigate`

`<Form navigate={false}>` を指定することで、フォームにナビゲーションをスキップさせて、内部的に [フェッチャー][use_fetcher] を使用するように指示できます。これは、結果のデータに関心がなく、提出を開始して [`useFetchers()`][use_fetchers] を介して保留状態にアクセスしたい場合の `useFetcher()` + `<fetcher.Form>` の省略形です。

```tsx
<Form method="post" navigate={false} />
```

### `fetcherKey`

ナビゲーションを行わない `Form` を使用する場合、オプションで使用する独自のフェッチャー `key` を指定することもできます。

```tsx
<Form method="post" navigate={false} fetcherKey="my-key" />
```

### `preventScrollReset`

[`<ScrollRestoration>`][scroll_restoration_component] を使用している場合、フォームが提出されたときにスクロール位置がウィンドウの上部にリセットされないようにすることができます。

```tsx
<Form preventScrollReset />
```

### `replace`

新しいエントリをプッシュするのではなく、現在のエントリを履歴スタックで置き換えます。

```tsx
<Form replace />
```

### `reloadDocument`

true の場合、クライアント側ルーティングではなくブラウザでフォームを提出します。ネイティブな `<form>` と同じです。

```tsx
<Form reloadDocument />
```

これは [`<form>`][form_element] よりも推奨されます。`action` プロパティが省略されている場合、`<Form>` と `<form>` は、`<form>` が現在の URL をデフォルトとして使用しますが、`<Form>` がフォームがレンダリングされているルートの URL を使用するため、現在の URL に応じて異なるアクションを呼び出す場合があります。

### `unstable_viewTransition`

`unstable_viewTransition` プロパティは、最終的な状態の更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることで、このナビゲーションの [ビュー遷移][view-transitions] を有効にします。このビュー遷移に特定のスタイルを適用する必要がある場合は、[`unstable_useViewTransitionState()`][use-view-transition-state] を活用する必要もあります。

<docs-warning>
この API は不安定としてマークされており、メジャーリリースなしに破壊的な変更が発生する可能性があることに注意してください。
</docs-warning>

## 注意

### `?index`

インデックスルートとその親ルートは同じ URL を共有するため、`?index` パラメータを使用してそれらを区別します。

```tsx
<Form action="/accounts?index" method="post" />
```

| action url        | ルートアクション                     |
| ----------------- | -------------------------------- |
| `/accounts?index` | `app/routes/accounts._index.tsx` |
| `/accounts`       | `app/routes/accounts.tsx`        |

こちらもご覧ください。

- [`?index` クエリパラメータ][index_query_param]

## さらなるリソース

**動画:**

- [フォーム + アクションを使用したデータの変更][data_mutations_with_form_action]
- [複数のフォームと単一のボタンによる変更][multiple_forms_and_single_button_mutations]
- [フォーム提出後の入力のクリア][clearing_inputs_after_form_submissions]

**関連する議論:**

- [フルスタックデータフロー][fullstack_data_flow]
- [保留中の UI][pending_ui]
- [フォームとフェッチャー][form_vs_fetcher]

**関連する API:**

- [`useActionData`][use_action_data]
- [`useNavigation`][use_navigation]
- [`useSubmit`][use_submit]

[use_navigation]: ../hooks/use-navigation
[scroll_restoration_component]: ./scroll-restoration
[index_query_param]: ../guides/index-query-param
[http_verb]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
[form_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[use_action_data]: ../hooks/use-action-data
[use_submit]: ../hooks/use-submit
[data_mutations_with_form_action]: https://www.youtube.com/watch?v=Iv25HAHaFDs&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
[multiple_forms_and_single_button_mutations]: https://www.youtube.com/watch?v=w2i-9cYxSdc&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
[clearing_inputs_after_form_submissions]: https://www.youtube.com/watch?v=bMLej7bg5Zo&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
[fullstack_data_flow]: ../discussion/data-flow
[pending_ui]: ../discussion/pending-ui
[form_vs_fetcher]: ../discussion/form-vs-fetcher
[use_fetcher]: ../hooks/use-fetcher
[use_fetchers]: ../hooks/use-fetchers
[fetcher_form]: ../hooks/use-fetcher#fetcherform
[progressive_enhancement]: ../discussion/progressive-enhancement
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[document-start-view-transition]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[use-view-transition-state]: ../hooks/use-view-transition-state
[relativesplatpath]: ../hooks/use-resolved-path#splat-paths


