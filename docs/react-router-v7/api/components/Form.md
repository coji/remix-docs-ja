---
title: Form
---

# Form

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Form.html)

`fetch` を介してアクションにデータを送信する、プログレッシブエンハンスメントされた HTML [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) です。`useNavigation` で保留状態をアクティブにし、基本的な HTML フォームを超える高度なユーザーインターフェースを可能にします。フォームのアクションが完了すると、ページ上のすべてのデータが自動的に再検証され、UI がデータと同期されます。

HTML フォーム API を使用しているため、サーバーでレンダリングされたページは、JavaScript がロードされる前に基本的なレベルでインタラクティブになります。React Router が送信を管理する代わりに、ブラウザが送信と保留状態（回転する favicon など）を管理します。JavaScript がロードされると、React Router が引き継ぎ、Web アプリケーションのユーザーエクスペリエンスを可能にします。

Form は、URL を変更したり、ブラウザの履歴スタックにエントリを追加したりする必要がある送信に最も役立ちます。ブラウザの履歴スタックを操作する必要がないフォームの場合は、[`<fetcher.Form>`][fetcher_form] を使用してください。

```tsx
import { Form } from "react-router";

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

### action

[modes: framework, data]

フォームデータを送信する URL。`undefined` の場合、これはコンテキスト内の最も近いルートにデフォルト設定されます。

### discover

[modes: framework, data]

アプリケーションマニフェストの検出動作を決定します。

### encType

[modes: framework, data]

フォームの送信に使用するエンコードタイプ。

### fetcherKey

[modes: framework, data]

`navigate={false}` を使用する場合に使用する特定の fetcherKey を示します。これにより、[useFetcher](../hooks/useFetcher) の別のコンポーネントで fetcher の状態を取得できます。

### method

[modes: framework, data]

フォームの送信に使用する HTTP 動詞。"get"、"post"、"put"、"delete"、"patch" をサポートします。

ネイティブの `<form>` は `get` と `post` のみをサポートします。プログレッシブエンハンスメントをサポートする場合は、他の動詞を避けてください。

### navigate

[modes: framework, data]

ナビゲーションをスキップし、内部的に [useFetcher](../hooks/useFetcher) を使用します。これは基本的に `useFetcher()` + `<fetcher.Form>` の省略形であり、このコンポーネントで結果のデータを気にしません。

### onSubmit

[modes: framework, data]

フォームが送信されたときに呼び出す関数。`event.preventDefault()` を呼び出すと、このフォームは何もしません。

### preventScrollReset

[modes: framework, data]

<ScrollRestoration> コンポーネントを使用している場合、ナビゲーションの完了時にスクロール位置がビューポートの先頭にリセットされるのを防ぎます。

### relative

[modes: framework, data]

フォームのアクションがルート階層に対して相対的か、パス名に対して相対的かを決定します。ルート階層のナビゲーションをオプトアウトし、代わりに /- 区切りの URL セグメントに基づいてルーティングする場合は、これを使用します。

### reloadDocument

[modes: framework, data]

クライアント側のルーティング + データフェッチの代わりに、完全なドキュメントナビゲーションを強制します。

### replace

[modes: framework, data]

フォームがナビゲートするときに、ブラウザの履歴スタック内の現在のエントリを置き換えます。ユーザーがフォームのあるページに「戻る」ことができないようにする場合は、これを使用します。

### state

[modes: framework, data]

このナビゲーションの履歴スタックエントリに追加する状態オブジェクト

### viewTransition

[modes: framework, data]

このナビゲーションの [View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) を有効にします。トランジション中に特定のスタイルを適用するには、[useViewTransitionState](../hooks/useViewTransitionState) を参照してください。

