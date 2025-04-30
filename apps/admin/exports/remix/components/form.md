---
title: Form
---

# `<Form>`

`<Form>` は、プログレッシブエンハンスメントされた HTML [`<form>`][form_element] であり、`fetch` を介してアクションにデータを送信し、`useNavigation` の保留状態をアクティブにします。これにより、基本的な HTML フォームを超えた高度なユーザーインターフェースが可能になります。フォームのアクションが完了すると、ページ上のすべてのデータがサーバーから自動的に再検証され、UI がデータと同期した状態に保たれます。

HTML フォーム API を使用しているため、サーバーでレンダリングされたページは JavaScript がロードされる前に基本的なレベルでインタラクティブになります。Remix が送信を管理する代わりに、ブラウザが送信と保留状態（回転するファビコンなど）を管理します。JavaScript がロードされると、Remix が引き継ぎ、Web アプリケーションのユーザーエクスペリエンスを有効にします。

Form は、URL を変更したり、ブラウザの履歴スタックにエントリを追加したりする必要がある送信に最も役立ちます。ブラウザの履歴スタックを操作する必要がないフォームの場合は、[`<fetcher.Form>`][fetcher_form] を使用してください。

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

`undefined` の場合、これはコンテキスト内の最も近いルートにデフォルト設定されます。親ルートが `<Form>` をレンダリングしているが、URL がより深い子ルートと一致する場合、フォームは親ルートにポストされます。同様に、子ルート内のフォームは子ルートにポストされます。これは、常に完全な URL を指すネイティブの [`<form>`][form_element] とは異なります。

<docs-info>相対 `<Form action>` の動作に関する `future.v3_relativeSplatPath` future フラグについては、`useResolvedPath` ドキュメントの [Splat Paths][relativesplatpath] セクションを参照してください。</docs-info>

### `method`

使用する [HTTP 動詞][http_verb] を決定します。`DELETE`、`GET`、`PATCH`、`POST`、および `PUT` です。デフォルトは `GET` です。

```tsx
<Form method="post" />
```

ネイティブの [`<form>`][form_element] は `GET` と `POST` のみをサポートしているため、[プログレッシブエンハンスメント][progressive_enhancement] をサポートする場合は、他の動詞を避ける必要があります。

### `encType`

フォーム送信に使用するエンコードタイプ。

```tsx
<Form encType="multipart/form-data" />
```

デフォルトは `application/x-www-form-urlencoded` で、ファイルのアップロードには `multipart/form-data` を使用します。

### `navigate`

`<Form navigate={false}>` を指定することで、フォームにナビゲーションをスキップして内部的に [fetcher][use_fetcher] を使用するように指示できます。これは基本的に `useFetcher()` + `<fetcher.Form>` の省略形であり、結果のデータに関心がなく、送信を開始して [`useFetchers()`][use_fetchers] を介して保留状態にアクセスしたいだけの場合に使用します。

```tsx
<Form method="post" navigate={false} />
```

### `fetcherKey`

ナビゲートしない `Form` を使用する場合、オプションで独自の fetcher `key` を指定することもできます。

```tsx
<Form method="post" navigate={false} fetcherKey="my-key" />
```

### `preventScrollReset`

[`<ScrollRestoration>`][scroll_restoration_component] を使用している場合、これにより、フォームが送信されたときにスクロール位置がウィンドウの上部にリセットされるのを防ぐことができます。

```tsx
<Form preventScrollReset />
```

### `replace`

新しいエントリをプッシュする代わりに、履歴スタック内の現在のエントリを置き換えます。

```tsx
<Form replace />
```

### `reloadDocument`

true の場合、クライアント側のルーティングではなく、ブラウザでフォームを送信します。ネイティブの `<form>` と同じです。

```tsx
<Form reloadDocument />
```

これは、[`<form>`][form_element] よりも推奨されます。`action` プロップが省略されている場合、`<Form>` と `<form>` は、現在の URL が何であるかによって異なるアクションを呼び出すことがあります。これは、`<form>` が現在の URL をデフォルトとして使用するのに対し、`<Form>` はフォームがレンダリングされるルートの URL を使用するためです。

### `viewTransition`

`viewTransition` プロップは、最終的な状態更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることにより、このナビゲーションの [View Transition][view-transitions] を有効にします。このビュー遷移に特定のスタイルを適用する必要がある場合は、[`useViewTransitionState()`][use-view-transition-state] も活用する必要があります。

## 注記

### `?index`

インデックスルートとその親ルートは同じ URL を共有するため、`?index` パラメータを使用して区別します。

```tsx
<Form action="/accounts?index" method="post" />
```

| action url        | route action                     |
| ----------------- | -------------------------------- |
| `/accounts?index` | `app/routes/accounts._index.tsx` |
| `/accounts`       | `app/routes/accounts.tsx`        |

参照：

- [`?index` クエリパラメータ][index_query_param]

## 追加リソース

**動画:**

- [Form + action を使用したデータ変更][data_mutations_with_form_action]
- [複数のフォームと単一ボタンの変更][multiple_forms_and_single_button_mutations]
- [フォーム送信後の入力のクリア][clearing_inputs_after_form_submissions]

**関連するディスカッション:**

- [フルスタックデータフロー][fullstack_data_flow]
- [保留中の UI][pending_ui]
- [Form vs. Fetcher][form_vs_fetcher]

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

