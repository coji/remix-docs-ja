---
title: フォーム
---

# `<Form>`

`fetch` を介してアクションにデータを送信する、段階的に強化された HTML [`<form>`][form_element]。`useNavigation` における保留中の状態をアクティブ化し、基本的な HTML フォームを超えた高度なユーザーインターフェースを実現します。フォームのアクションが完了すると、ページ上のすべてのデータがサーバーから自動的に再検証され、UI がデータと同期した状態が保たれます。

HTML フォーム API を使用しているため、JavaScript がロードされる前に、サーバーレンダリングされたページは基本的なレベルでインタラクティブになります。Remix が送信を管理するのではなく、ブラウザが送信と保留中の状態（回転するファビコンなど）を管理します。JavaScript がロードされると、Remix が引き継いで Web アプリケーションのユーザーエクスペリエンスを実現します。

`Form` は、URL を変更したり、ブラウザの履歴スタックにエントリを追加したりする必要がある送信に最も役立ちます。ブラウザの履歴スタックを操作しないフォームの場合は、[`<fetcher.Form>`][fetcher_form] を使用してください。

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

`undefined` の場合、コンテキスト内の最も近いルートをデフォルトとして使用します。親ルートが `<Form>` をレンダリングしますが、URL がさらに深い子ルートと一致する場合、フォームは親ルートに投稿されます。同様に、子ルート内のフォームは子ルートに投稿されます。これは、ネイティブの [`<form>`][form_element] が常に完全な URL を指すこととは異なります。

<docs-info>相対的な `<Form action>` の動作に関する `future.v3_relativeSplatPath` 未来フラグの動作については、`useResolvedPath` ドキュメントの [Splat パス][relativesplatpath] セクションを参照してください。</docs-info>

### `method`

使用される [HTTP 動詞][http_verb] を決定します: `DELETE`, `GET`, `PATCH`, `POST`, および `PUT`。デフォルトは `GET` です。

```tsx
<Form method="post" />
```

ネイティブ [`<form>`][form_element] は `GET` と `POST` のみをサポートしているため、[段階的な強化][progressive_enhancement] をサポートしたい場合は、他の動詞を避ける必要があります。

### `encType`

フォーム送信に使用するエンコーディングタイプ。

```tsx
<Form encType="multipart/form-data" />
```

デフォルトは `application/x-www-form-urlencoded` で、ファイルアップロードには `multipart/form-data` を使用します。

### `navigate`

`<Form navigate={false}>` を指定することで、フォームにナビゲーションをスキップして内部的に [フェッチャー][use_fetcher] を使用させることができます。これは、結果のデータに興味がなく、送信を開始して [`useFetchers()`][use_fetchers] を介して保留中の状態にアクセスするだけの場合の、`useFetcher()` + `<fetcher.Form>` の省略形です。

```tsx
<Form method="post" navigate={false} />
```

### `fetcherKey`

ナビゲーションしない `Form` を使用する場合、独自のフェッチャー `key` をオプションで指定することもできます。

```tsx
<Form method="post" navigate={false} fetcherKey="my-key" />
```

### `preventScrollReset`

[`<ScrollRestoration>`][scroll_restoration_component] を使用している場合、このプロパティを使用すると、フォームを送信したときにスクロール位置がウィンドウの上部にリセットされないようにすることができます。

```tsx
<Form preventScrollReset />
```

### `replace`

新しいエントリをプッシュするのではなく、履歴スタックの現在のエントリを置き換えます。

```tsx
<Form replace />
```

### `reloadDocument`

true の場合、クライアント側のルーティングではなく、ブラウザを使用してフォームを送信します。ネイティブの `<form>` と同じです。

```tsx
<Form reloadDocument />
```

これは [`<form>`][form_element] よりも推奨されます。`action` プロパティが省略されている場合、`<Form>` と `<form>` は、`<form>` が現在の URL をデフォルトとして使用しますが、`<Form>` はフォームがレンダリングされているルートの URL を使用するため、場合によっては異なるアクションを呼び出します。

### `unstable_viewTransition`

`unstable_viewTransition` プロパティは、[`document.startViewTransition()`][document-start-view-transition] で最終的な状態の更新をラップすることで、このナビゲーションに対する [ビューのトランジション][view-transitions] を有効にします。このビューのトランジションに特定のスタイルを適用する必要がある場合は、[`unstable_useViewTransitionState()`][use-view-transition-state] も利用する必要があります。

<docs-warning>
この API は不安定とマークされており、メジャーリリースなしに破壊的な変更が生じる可能性があります。
</docs-warning>

## 注記

### `?index`

インデックスルートとその親ルートは同じ URL を共有するため、`?index` パラメータを使用して両者を区別します。

```tsx
<Form action="/accounts?index" method="post" />
```

| action url        | ルートアクション                     |
| ----------------- | -------------------------------- |
| `/accounts?index` | `app/routes/accounts._index.tsx` |
| `/accounts`       | `app/routes/accounts.tsx`        |

こちらもご覧ください。

- [`?index` クエリパラメータ][index_query_param]

## 追加のリソース

**ビデオ:**

- [Form + action によるデータ変更][data_mutations_with_form_action]
- [複数フォームと単一ボタンによる変更][multiple_forms_and_single_button_mutations]
- [フォーム送信後の入力のクリア][clearing_inputs_after_form_submissions]

**関連する議論:**

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


