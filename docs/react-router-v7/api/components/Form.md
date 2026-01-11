---
title: Form
---

# Form

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Form.html)

[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) を介してアクションにデータを送信する、プログレッシブエンハンスメントされた HTML [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) です。[`useNavigation`](../hooks/useNavigation) で保留状態をアクティブにし、基本的な HTML [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) を超える高度なユーザーインターフェースを可能にします。フォームの `action` が完了すると、ページ上のすべてのデータが自動的に再検証され、UI がデータと同期されます。

HTML フォーム API を使用しているため、サーバーでレンダリングされたページは、JavaScript がロードされる前に基本的なレベルでインタラクティブになります。React Router が送信を管理する代わりに、ブラウザが送信と保留状態（回転する favicon など）を管理します。JavaScript がロードされると、React Router が引き継ぎ、Web アプリケーションのユーザーエクスペリエンスを可能にします。

`Form` は、URL を変更したり、ブラウザの履歴スタックにエントリを追加したりする必要がある送信に最も役立ちます。ブラウザの[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックを操作する必要がないフォームの場合は、[`<fetcher.Form>`](https://api.reactrouter.com/v7/types/react_router.FetcherWithComponents.html#Form) を使用してください。

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

フォームデータを送信する URL。`undefined` の場合、これはコンテキスト内の最も近いルートにデフォルト設定されます。

### discover

フォームの[遅延ルートディスカバリ](../../explanation/lazy-route-discovery)の動作を定義します。

- **render** — デフォルトでは、フォームがレンダーされたときにルートをディスカバリします。
- **none** — 先行してディスカバリせず、フォームが送信された場合にのみディスカバリします。

```tsx
<Form /> // default ("render")
<Form discover="render" />
<Form discover="none" />
```

### encType

フォームの送信に使用するエンコードタイプ。

```tsx
<Form encType="application/x-www-form-urlencoded"/>  // Default
<Form encType="multipart/form-data"/>
<Form encType="text/plain"/>
```

### fetcherKey

`navigate={false}` を使用する場合に使用する特定の fetcherKey を示します。これにより、[`useFetcher`](../hooks/useFetcher) の別のコンポーネントで fetcher の状態を取得できます。

### method

フォームが送信されたときに使用する HTTP 動詞。`"delete"`、`"get"`、`"patch"`、`"post"`、および `"put"` をサポートします。

ネイティブの [`<form>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form) は `"get"` と `"post"` のみをサポートします。プログレッシブエンハンスメントをサポートする場合は、他の動詞を避けてください。

### navigate

`false` の場合、ナビゲーションをスキップし、内部的に fetcher を介して送信します。これは基本的に [`useFetcher`](../hooks/useFetcher) + `<fetcher.Form>` の省略形であり、このコンポーネントで結果のデータを気にしません。

### onSubmit

フォームが送信されたときに呼び出す関数。[`event.preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) を呼び出すと、このフォームは何もしません。

### preventScrollReset

<ScrollRestoration> コンポーネントを使用している場合、ナビゲーションの完了時にスクロール位置がビューポートの先頭にリセットされるのを防ぎます。

### relative

フォームのアクションがルート階層に対して相対的か、パス名に対して相対的かを決定します。ルート階層のナビゲーションをオプトアウトし、代わりにスラッシュ区切りの URL セグメントに基づいてルーティングする場合は、これを使用します。[`RelativeRoutingType`](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html) を参照してください。

### reloadDocument

クライアント側のルーティングとデータフェッチの代わりに、完全なドキュメントナビゲーションを強制します。

### replace

フォームがナビゲートするときに、ブラウザの[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタック内の現在のエントリを置き換えます。ユーザーがフォームのあるページに「戻る」ことができないようにする場合は、これを使用します。

### state

このナビゲーションの[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックエントリに追加する状態オブジェクト

### viewTransition

このナビゲーションの [View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) を有効にします。トランジション中に特定のスタイルを適用するには、[`useViewTransitionState`](../hooks/useViewTransitionState) を参照してください。

### unstable_defaultShouldRevalidate

この送信後のデフォルトの再検証動作を指定します。

アクティブなルートに `shouldRevalidate` 関数が存在しない場合、この値が直接使用されます。そうでない場合は、`shouldRevalidate` に渡され、ルートが再検証に関する最終決定を行うことができます。これは、検索パラメーターを更新する際に再検証をトリガーしたくない場合に役立ちます。

デフォルトでは（指定しない場合）、loader はルーターの標準的な再検証動作に従って再検証されます。