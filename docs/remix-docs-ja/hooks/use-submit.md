---
title: useSubmit
---

# `useSubmit`

[`<Form>`][form-component] の命令型バージョンで、ユーザーではなくプログラマーがフォームを送信できます。

```tsx
import { useSubmit } from "@remix-run/react";

function SomeComponent() {
  const submit = useSubmit();
  return (
    <Form
      onChange={(event) => {
        submit(event.currentTarget);
      }}
    />
  );
}
```

## シグネチャ

```tsx
submit(targetOrData, options);
```

### `targetOrData`

次のいずれかになります。

**[`HTMLFormElement`][html-form-element] インスタンス**

```tsx
<Form
  onSubmit={(event) => {
    submit(event.currentTarget);
  }}
/>
```

**[`FormData`][form-data] インスタンス**

```tsx
const formData = new FormData();
formData.append("myKey", "myValue");
submit(formData, { method: "post" });
```

**`FormData`としてシリアル化されるプレーンオブジェクト**

```tsx
submit({ myKey: "myValue" }, { method: "post" });
```

**JSONとしてシリアル化されるプレーンオブジェクト**

```tsx
submit(
  { myKey: "myValue" },
  { method: "post", encType: "application/json" }
);
```

### `options`

送信に関するオプションで、[`<Form>`][form-component] プロパティと同じです。すべてのオプションはオプションです。

- **action**: 送信先への href。デフォルトは現在のルートパスです。
- **method**: 使用する HTTP メソッド（POST など）。デフォルトは GET です。
- **encType**: フォーム送信に使用するエンコーディングタイプ: `application/x-www-form-urlencoded`, `multipart/form-data`, `application/json`, または `text/plain`。デフォルトは `application/x-www-form-urlencoded` です。
- **navigate**: ナビゲーションを実行する代わりに、フェッチャーを使用して送信するには `false` を指定します。
- **fetcherKey**: `navigate: false` を介してフェッチャーを使用して送信する場合に使用するフェッチャーキー。
- **preventScrollReset**: データが送信されたときにスクロール位置がウィンドウの上部にリセットされないようにします。デフォルトは `false` です。
- **replace**: 新しいエントリをプッシュするのではなく、履歴スタックの現在のエントリを置き換えます。デフォルトは `false` です。
- **relative**: 相対ルート解決の動作を定義します。`route` (ルート階層に対する相対) または `path` (URL に対する相対) のいずれかです。
- **unstable_flushSync**: このナビゲーションの初期状態の更新を、デフォルトの [`React.startTransition`][start-transition] ではなく、[`ReactDOM.flushSync`][flush-sync] コールでラップします
- **unstable_viewTransition**: `document.startViewTransition()` で最終的な状態の更新をラップすることにより、このナビゲーションの [ビュー遷移][view-transitions] を有効にします
  - このビュー遷移に特定のスタイルを適用する必要がある場合は、[`unstable_useViewTransitionState()`][use-view-transition-state] も利用する必要があります

```tsx
submit(data, {
  action: "",
  method: "post",
  encType: "application/x-www-form-urlencoded",
  preventScrollReset: false,
  replace: false,
  relative: "route",
});
```

<docs-info>相対的な `useSubmit()` の動作について、スラッシュルート内の `future.v3_relativeSplatPath` 未来フラグの動作については、`useResolvedPath` ドキュメントの [スラッシュパス][relativesplatpath] セクションを参照してください</docs-info>

## 追加のリソース

**ディスカッション**

- [フォーム vs. フェッチャー][form-vs-fetcher]

**関連 API**

- [`<Form>`][form-component]
- [`fetcher.submit`][fetcher-submit]

[form-component]: ../components/form
[html-form-element]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[form-vs-fetcher]: ../discussion/form-vs-fetcher
[fetcher-submit]: ../hooks/use-fetcher#fetchersubmitformdata-options
[flush-sync]: https://react.dev/reference/react-dom/flushSync
[start-transition]: https://react.dev/reference/react/startTransition
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[use-view-transition-state]: ../hooks//use-view-transition-state
[relativesplatpath]: ./use-resolved-path#splat-paths


