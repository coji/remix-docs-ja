---
title: useSubmit
---

# `useSubmit`

[`<Form>`][form-component] の命令型バージョンで、ユーザーではなくプログラマーがフォームを送信できるようにします。

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

次のいずれかを指定できます。

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

**`FormData` としてシリアライズされるプレーンオブジェクト**

```tsx
submit({ myKey: "myValue" }, { method: "post" });
```

**JSON としてシリアライズされるプレーンオブジェクト**

```tsx
submit(
  { myKey: "myValue" },
  { method: "post", encType: "application/json" }
);
```

### `options`

送信のオプションで、[`<Form>`][form-component] の props と同じです。すべてのオプションは省略可能です。

- **action**: 送信する href。デフォルトは現在のルートパスです。
- **method**: POST のような使用する HTTP メソッド。デフォルトは GET です。
- **encType**: フォーム送信に使用するエンコードタイプ: `application/x-www-form-urlencoded`、`multipart/form-data`、`application/json`、または `text/plain`。デフォルトは `application/x-www-form-urlencoded` です。
- **navigate**: ナビゲーションを実行する代わりに、フェッチャーを使用して送信する場合は `false` を指定します。
- **fetcherKey**: `navigate: false` を介してフェッチャーを使用して送信する場合に使用するフェッチャーキー。
- **preventScrollReset**: データが送信されたときに、スクロール位置がウィンドウの上部にリセットされるのを防ぎます。デフォルトは `false` です。
- **replace**: 新しいエントリをプッシュする代わりに、履歴スタック内の現在のエントリを置き換えます。デフォルトは `false` です。
- **relative**: 相対ルート解決の動作を定義します。`"route"` (ルート階層に対して相対的) または `"path"` (URL に対して相対的) のいずれかです。
- **flushSync**: このナビゲーションの初期状態の更新を、デフォルトの [`React.startTransition`][start-transition] 呼び出しの代わりに [`ReactDOM.flushSync`][flush-sync] 呼び出しでラップします。
- **viewTransition**: 最終的な状態の更新を `document.startViewTransition()` でラップすることにより、このナビゲーションの [View Transition][view-transitions] を有効にします。
  - このビュー遷移に特定のスタイルを適用する必要がある場合は、[`useViewTransitionState()`][use-view-transition-state] も活用する必要があります。

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

<docs-info>スプラットルート内の相対的な `useSubmit()` の動作に関する `future.v3_relativeSplatPath` future フラグの動作については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

## 追加リソース

**ディスカッション**

- [Form vs. Fetcher][form-vs-fetcher]

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

