---
title: Form
---

# `<Form>`

`fetch` を介してアクションにデータを送信する、漸進的に強化された HTML [`<form>`][form_element] です。`useNavigation` で保留状態をアクティブ化し、基本的な HTML フォームを超えた高度なユーザーインターフェースを可能にします。フォームのアクションが完了すると、ページ上のすべてのデータはサーバーから自動的に再検証され、UI とデータが同期した状態になります。

HTML フォーム API を使用しているため、サーバーでレンダリングされたページは、JavaScript がロードされる前に基本レベルでインタラクティブになります。Remix が送信を管理するのではなく、ブラウザーが送信と保留状態（スピニングファビコンなど）を管理します。JavaScript がロードされると、Remix が引き継ぎ、ウェブアプリケーションのユーザーエクスペリエンスを実現します。

Form は、URL を変更したり、ブラウザの履歴スタックにエントリを追加したりする必要がある送信に最も役立ちます。ブラウザの履歴スタックを操作しないフォームの場合、[`<fetcher.Form>`][fetcher_form] を使用してください。

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

## Props

### `action`

フォームデータを送信する URL。

`undefined` の場合、これはコンテキスト内の最も近いルートにデフォルト設定されます。親ルートが `<Form>` をレンダリングしますが、URL がより深い子ルートと一致する場合、フォームは親ルートに投稿されます。同様に、子ルート内のフォームは子ルートに投稿されます。これは、ネイティブの [`<form>`][form_element] が常に完全な URL を指すこととは異なります。

<docs-info>
 スプラットルート内の相対的な `<Form action>` の動作に関する `future.v3_relativeSplatPath` の将来のフラグの動作については、`useResolvedPath` ドキュメントの [Splat パス][relativesplatpath] セクションを参照してください。
</docs-info>

### `method`

これは、使用される [HTTP 動詞][http_verb] (`DELETE`, `GET`, `PATCH`, `POST`, `PUT`) を決定します。デフォルトは `GET` です。

```tsx
<Form method="post" />
```

ネイティブの [`<form>`][form_element] は `GET` と `POST` のみをサポートしているので、[漸進的な強化][progressive_enhancement] をサポートしたい場合は、他の動詞を避けてください。

### `encType`

フォーム送信に使用するエンコードタイプ。

```tsx
<Form encType="multipart/form-data" />
```

デフォルトは `application/x-www-form-urlencoded` で、ファイルアップロードには `multipart/form-data` を使用します。

### `navigate`

`<Form navigate={false}>` を指定することで、フォームにナビゲーションをスキップさせ、内部的に [fetcher][use_fetcher] を使用させることができます。これは本質的に `useFetcher()` + `<fetcher.Form>` の略で、結果のデータは関係なく、送信を開始し、[`useFetchers()`][use_fetchers] を介して保留状態にアクセスしたい場合に便利です。

```tsx
<Form method="post" navigate={false} />
```

### `fetcherKey`

ナビゲーションしない `Form` を使用する場合、オプションで独自の fetcher `key` を指定することもできます。

```tsx
<Form method="post" navigate={false} fetcherKey="my-key" />
```

### `preventScrollReset`

[`<ScrollRestoration>`][scroll_restoration_component] を使用している場合、このプロパティを使用すると、フォームが送信されたときにスクロール位置がウィンドウの一番上にリセットされるのを防ぐことができます。

```tsx
<Form preventScrollReset />
```

### `replace`

新しいエントリをプッシュするのではなく、履歴スタックの現在のエントリを置き換えます。

```tsx
<Form replace />
```

### `reloadDocument`

`true` の場合、クライアントサイドルーティングではなく、ブラウザーでフォームを送信します。ネイティブ `<form>` と同じです。

```tsx
<Form reloadDocument />
```

これは、[`<form>`][form_element] よりも推奨されます。`action` プロパティが省略されている場合、`<Form>` と `<form>` は、`<form>` が現在の URL をデフォルトとして使用し、`<Form>` がフォームがレンダリングされているルートの URL を使用する一方で、現在の URL に応じて異なるアクションを呼び出すことがあります。

### `viewTransition`

`viewTransition` プロパティを使用すると、最終的な状態の更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることで、このナビゲーションの [ビュー遷移][view-transitions] を有効にできます。このビュー遷移に特定のスタイルを適用する必要がある場合は、[`useViewTransitionState()`][use-view-transition-state] も活用する必要があります。

## メモ

### `?index`

インデックスルートとその親ルートは同じ URL を共有するため、`?index` パラメータを使用して両者を区別します。

```tsx
<Form action="/accounts?index" method="post" />
```

| action url        | route action                     |
| ----------------- | -------------------------------- |
| `/accounts?index` | `app/routes/accounts._index.tsx` |
| `/accounts`       | `app/routes/accounts.tsx`        |

こちらも参照してください。

- [`?index` クエリパラメータ][index_query_param]

## その他のリソース

**ビデオ:**

- [Form + action を使ったデータの変更][data_mutations_with_form_action]
- [複数のフォームと単一のボタンによる変更][multiple_forms_and_single_button_mutations]
- [フォーム送信後の入力のクリア][clearing_inputs_after_form_submissions]

**関連するディスカッション:**

- [フルスタックデータフロー][fullstack_data_flow]
- [保留中の UI][pending_ui]
- [Form と Fetcher の違い][form_vs_fetcher]

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



