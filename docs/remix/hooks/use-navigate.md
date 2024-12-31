---
title: useNavigate
---

# `useNavigate`

`useNavigate` フックは、ユーザーの操作やエフェクトに応じて、ブラウザでプログラム的にナビゲートできる関数を返します。

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

このフックよりも、[`action`][action] や [`loader`][loader] で [`redirect`][redirect] を使用する方が良い場合が多いですが、それでもユースケースはあります。

## 引数

### `to: string`

最も基本的な使い方は、href 文字列を受け取ることです。

```tsx
navigate("/some/path");
```

パスは相対パスにできます。

```tsx
navigate("..");
navigate("../other/path");
```

<docs-info>`future.v3_relativeSplatPath` future フラグの、スプラットルート内での相対 `useNavigate()` の動作に関する注意については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

### `to: Partial<Path>`

`Partial<Path>` 値を渡すこともできます。

```tsx
navigate({
  pathname: "/some/path",
  search: "?query=string",
  hash: "#hash",
});
```

### `to: Number`

数値を渡すと、ブラウザに履歴スタックを戻ったり進んだりするように指示します。

```tsx
navigate(-1); // 戻る
navigate(1); // 進む
navigate(-2); // 2つ戻る
```

ブラウザの履歴スタックはアプリケーションに限定されないため、これによりアプリケーションから移動してしまう可能性があることに注意してください。

### `options`

2番目の引数はオプションオブジェクトです。

```tsx
navigate(".", {
  replace: true,
  relative: "path",
  state: { some: "state" },
});
```

- **replace**: boolean - 履歴スタックに新しいエントリをプッシュする代わりに、現在のエントリを置き換えます。
- **relative**: `"route" | "path"` - リンクの相対パスの動作を定義します。
  - `"route"` はルート階層を使用するため、`".."` は現在のルートパターンのすべての URL セグメントを削除しますが、`"path"` は URL パスを使用するため、`".."` は 1 つの URL セグメントを削除します。
- **state**: any - 次の場所に永続的なクライアント側のルーティング状態を追加します。
- **preventScrollReset**: boolean - [`<ScrollRestoration>`][scroll-restoration] を使用している場合、ナビゲート時にスクロール位置がウィンドウの上部にリセットされるのを防ぎます。
- **flushSync**: boolean - このナビゲーションの初期状態の更新を、デフォルトの [`React.startTransition`][start-transition] 呼び出しの代わりに、[`ReactDOM.flushSync`][flush-sync] 呼び出しでラップします。
- **viewTransition**: boolean - 最終的な状態の更新を `document.startViewTransition()` でラップすることにより、このナビゲーションの [View Transition][view-transitions] を有効にします。
  - このビュー遷移に特定のスタイルを適用する必要がある場合は、[`useViewTransitionState()`][use-view-transition-state] も活用する必要があります。

[redirect]: ../utils/redirect
[flush-sync]: https://react.dev/reference/react-dom/flushSync
[start-transition]: https://react.dev/reference/react/startTransition
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[use-view-transition-state]: ../hooks//use-view-transition-state
[action]: ../route/action
[loader]: ../route/loader
[relativesplatpath]: ./use-resolved-path#splat-paths
[scroll-restoration]: ../components/scroll-restoration#preventing-scroll-reset

