---
title: Form
---

# Form

<!--
⚠️ ⚠️ 重要 ⚠️ ⚠️ 

ドキュメントの改善にご協力いただきありがとうございます！

このファイルはソースコード内のJSDocコメントから自動生成されています。そのため、以下のファイルのJSDocコメントを編集してください。変更がマージされると、このファイルは再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Form.html)

[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) を介してアクションにデータを送信する、プログレッシブエンハンスメントされた HTML [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) です。[`useNavigation`](../hooks/useNavigation) で保留状態をアクティブにし、基本的な HTML フォームを超える高度なユーザーインターフェースを可能にします。フォームのアクションが完了すると、ページ上のすべてのデータが自動的に再検証され、UI がデータと同期されます。

HTML フォーム API を使用しているため、サーバーでレンダリングされたページは、JavaScript がロードされる前に基本的なレベルでインタラクティブになります。React Router が送信を管理する代わりに、ブラウザが送信と保留状態（回転する favicon など）を管理します。JavaScript がロードされると、React Router が引き継ぎ、Web アプリケーションのユーザーエクスペリエンスを可能にします。

Form は、URL を変更したり、ブラウザの [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックにエントリを追加したりする必要がある送信に最も役立ちます。ブラウザの [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックを操作する必要がないフォームの場合は、[`<fetcher.Form>`](https://api.reactrouter.com/v7/types/react_router.FetcherWithComponents.html#Form) を使用してください。

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

リンクの検出動作を定義します。[`DiscoverBehavior`](https://api.reactrouter.com/v7/types/react_router.DiscoverBehavior.html) を参照してください。

```tsx
<Link /> // default ("render")
<Link discover="render" />
<Link discover="none" />
```

- **render** — デフォルト。リンクがレンダリングされたときにルートを検出します。
- **none** — 積極的に検出せず、リンクがクリックされた場合にのみ検出します。

### encType

[modes: framework, data]

フォームの送信に使用するエンコードタイプ。

```tsx
<Form encType="application/x-www-form-urlencoded"/>  // デフォルト
<Form encType="multipart/form-data"/>
<Form encType="text/plain"/>
```

### fetcherKey

[modes: framework, data]

`navigate={false}` を使用する場合に使用する特定の fetcherKey を示します。これにより、[useFetcher](../hooks/useFetcher) の別のコンポーネントで fetcher の状態を取得できます。

### method

[modes: framework, data]

フォームの送信に使用する HTTP 動詞。`"delete"`、`"get"`、`"patch"`、`"post"`、`"put"` をサポートします。

ネイティブの [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) は `"get"` と `"post"` のみをサポートします。プログレッシブエンハンスメントをサポートする場合は、他の動詞を避けてください。

### navigate

[modes: framework, data]

`false` の場合、ナビゲーションをスキップし、内部的に fetcher を介して送信します。これは基本的に [`useFetcher`](../hooks/useFetcher) + `<fetcher.Form>` の省略形であり、このコンポーネントで結果のデータを気にしません。

### onSubmit

[modes: framework, data]

フォームが送信されたときに呼び出す関数。[`event.preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) を呼び出すと、このフォームは何もしません。

### preventScrollReset

[modes: framework, data]

<ScrollRestoration> コンポーネントを使用している場合、ナビゲーションの完了時にスクロール位置がビューポートの先頭にリセットされるのを防ぎます。

### relative

[modes: framework, data]

フォームのアクションがルート階層に対して相対的か、パス名に対して相対的かを決定します。ルート階層のナビゲーションをオプトアウトし、代わりに /- 区切りの URL セグメントに基づいてルーティングする場合は、これを使用します。[`RelativeRoutingType`](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html) を参照してください。

### reloadDocument

[modes: framework, data]

クライアント側のルーティング + データフェッチの代わりに、完全なドキュメントナビゲーションを強制します。

### replace

[modes: framework, data]

フォームがナビゲートするときに、ブラウザの [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタック内の現在のエントリを置き換えます。ユーザーがフォームのあるページに「戻る」ことができないようにする場合は、これを使用します。

### state

[modes: framework, data]

このナビゲーションの [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックエントリに追加する状態オブジェクト

### viewTransition

[modes: framework, data]

このナビゲーションの [View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) を有効にします。トランジション中に特定のスタイルを適用するには、[`useViewTransitionState`](../hooks/useViewTransitionState) を参照してください。