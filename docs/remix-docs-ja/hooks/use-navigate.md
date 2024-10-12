---
title: useNavigate
---

# `useNavigate`

`useNavigate`フックは、ユーザーの操作や効果に応じてブラウザでプログラム的にナビゲートできる関数を返します。

```tsx
import { useNavigate } from "@remix-run/react";

function SomeComponent() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        navigate(-1);
      }}
    />
  );
}
```

このフックよりも、[`action`][action]や[`loader`][loader]で[`redirect`][redirect]を使用する方が良いことが多いですが、それでも使用できるケースがあります。

## 引数

### `to: string`

最も基本的な使い方は、href文字列を指定することです。

```tsx
navigate("/some/path");
```

パスは相対的にも指定できます。

```tsx
navigate("..");
navigate("../other/path");
```

<docs-info>スプラットルート内の相対的な `useNavigate()` の動作については、`future.v3_relativeSplatPath` 未来フラグに関する注記を、`useResolvedPath` ドキュメントの[スプラットパス][relativesplatpath]セクションを参照してください。</docs-info>

### `to: Partial<Path>`

`Partial<Path>`値を渡すこともできます。

```tsx
navigate({
  pathname: "/some/path",
  search: "?query=string",
  hash: "#hash",
});
```

### `to: Number`

数値を渡すと、ブラウザは履歴スタックを前後に移動します。

```tsx
navigate(-1); // 戻る
navigate(1); // 進む
navigate(-2); // 2つ戻る
```

ブラウザの履歴スタックはアプリケーションに限定されていないため、この操作によってアプリケーションから移動してしまう可能性があることに注意してください。

### `options`

2番目の引数はオプションオブジェクトです。

```tsx
navigate(".", {
  replace: true,
  relative: "path",
  state: { some: "state" },
});
```

- **replace**: boolean - 新しいエントリをプッシュするのではなく、履歴スタックの現在のエントリを置き換えます。
- **relative**: `"route" | "path"` - リンクの相対パスの動作を定義します。
  - `"route"` はルート階層を使用するため、`".."` は現在のルートパターンのすべてのURLセグメントを削除します。一方、`"path"` はURLパスを使用するため、`".."` は1つのURLセグメントを削除します。
- **state**: any - 次の場所に永続的なクライアントサイドルーティング状態を追加します。
- **preventScrollReset**: boolean - [`<ScrollRestoration>`][scroll-restoration]を使用している場合、ナビゲート時にスクロール位置がウィンドウの上部にリセットされないようにします。
- **flushSync**: boolean - このナビゲーションの初期状態の更新を、デフォルトの[`React.startTransition`][start-transition]ではなく、[`ReactDOM.flushSync`][flush-sync]呼び出しでラップします。
- **viewTransition**: boolean - このナビゲーションに[ビュー遷移][view-transitions]を有効にします。最終状態の更新を `document.startViewTransition()` でラップします。
  - このビュー遷移に特定のスタイルを適用する必要がある場合は、[`useViewTransitionState()`][use-view-transition-state]も活用する必要があります。

[redirect]: ../utils/redirect
[flush-sync]: https://react.dev/reference/react-dom/flushSync
[start-transition]: https://react.dev/reference/react/startTransition
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[use-view-transition-state]: ../hooks//use-view-transition-state
[action]: ../route/action
[loader]: ../route/loader
[relativesplatpath]: ./use-resolved-path#splat-paths
[scroll-restoration]: ../components/scroll-restoration#preventing-scroll-reset



