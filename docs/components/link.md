---
title: リンク
---

# `<Link>`

クライアントサイドルーティングによるナビゲーションを可能にする `<a href>` ラッパーです。

```tsx
import { Link } from "@remix-run/react";

<Link to="/dashboard">ダッシュボード</Link>;
```

<docs-info>スプラットルート内の相対的な `<Link to>` の動作に関する注意については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

## プロパティ

### `to: string`

最も基本的な使い方は、href 文字列を使用します。

```tsx
<Link to="/some/path" />
```

### `to: Partial<Path>`

`Partial<Path>` 値を渡すこともできます。

```tsx
<Link
  to={{
    pathname: "/some/path",
    search: "?query=string",
    hash: "#hash",
  }}
/>
```

### `prefetch`

リンクのデータとモジュールの事前取得の動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "none" */}
  <Link prefetch="none" />
  <Link prefetch="intent" />
  <Link prefetch="render" />
  <Link prefetch="viewport" />
</>
```

- **none** - デフォルト、事前取得なし
- **intent** - ユーザーがリンクにホバーまたはフォーカスしたときに事前取得します
- **render** - リンクがレンダリングされたときに事前取得します
- **viewport** - リンクがビューポート内にあるときに事前取得します。モバイルに非常に役立ちます

事前取得は、HTML `<link rel="prefetch">` タグを使用して行われます。これらはリンクの後に挿入されます。

```tsx
<nav>
  <a href="..." />
  <a href="..." />
  <link rel="prefetch" /> {/* 条件付きでレンダリングされる場合があります */}
</nav>
```

このため、`nav :last-child` を使用している場合は、スタイルが最後のリンク（および同様のセレクター）から条件付きで外れないように、`nav :last-of-type` を使用する必要があります。

### `preventScrollReset`

[`<ScrollRestoration>`][scroll-restoration-component] を使用している場合、このプロパティを使用すると、リンクをクリックしたときにスクロール位置がウィンドウの上部にリセットされるのを防ぐことができます。

```tsx
<Link to="?tab=one" preventScrollReset />
```

これにより、ユーザーが戻る/進むボタンでその場所に移動したときにスクロール位置が復元されるのを防ぐことはできません。ユーザーがリンクをクリックしたときにリセットされるのを防ぐだけです。

<details>

<summary>議論</summary>

この動作が必要になる場合の例として、ページの上部ではなく、URL 検索パラメータを操作するタブのリストがあります。切り替えられたコンテンツがビューポートからスクロールされる可能性があるため、スクロール位置が上部にジャンプすることは避けたいでしょう。

```text
      ┌─────────────────────────┐
      │                         ├──┐
      │                         │  │
      │                         │  │ スクロール
      │                         │  │ ビューから外れる
      │                         │  │
      │                         │ ◄┘
    ┌─┴─────────────────────────┴─┐
    │                             ├─┐
    │                             │ │ ビューポート
    │   ┌─────────────────────┐   │ │
    │   │  タブ   タブ   タブ    │   │ │
    │   ├─────────────────────┤   │ │
    │   │                     │   │ │
    │   │                     │   │ │
    │   │ コンテンツ             │   │ │
    │   │                     │   │ │
    │   │                     │   │ │
    │   └─────────────────────┘   │ │
    │                             │◄┘
    └─────────────────────────────┘

```

</details>

### `relative`

リンクの相対パスの動作を定義します。

```tsx
<Link to=".." />; // デフォルト: "route"
<Link relative="route" />;
<Link relative="path" />;
```

- **route** - デフォルト、ルート階層を基準とするため、`..` は現在のルートパターンのすべての URL セグメントを削除します
- **path** - パスを基準とするため、`..` は 1 つの URL セグメントを削除します

### `reloadDocument`

リンクをクリックしたときにクライアントサイドルーティングではなくドキュメントナビゲーションを使用します。ブラウザは通常どおり（`<a href>` であるかのように）遷移を処理します。

```tsx
<Link to="/logout" reloadDocument />
```

### `replace`

`replace` プロパティを使用すると、新しいエントリを履歴スタックにプッシュするのではなく、現在のエントリを置き換えます。

```tsx
<Link replace />
```

```
# 履歴スタックが次のようになっている場合
A -> B

# 通常のリンククリックでは新しいエントリがプッシュされます
A -> B -> C

# しかし、`replace` を使用すると、B は C で置き換えられます
A -> C
```

### `state`

次の場所に永続的なクライアントサイドルーティング状態を追加します。

```tsx
<Link to="/somewhere/else" state={{ some: "value" }} />
```

場所の状態は `location` からアクセスされます。

```tsx
function SomeComp() {
  const location = useLocation();
  location.state; // { some: "value" }
}
```

この状態は、[`history.state`][history-state] の上に実装されているため、サーバーではアクセスできません。

## `unstable_viewTransition`

`unstable_viewTransition` プロパティは、[`document.startViewTransition()`][document-start-view-transition] で最終的な状態の更新をラップすることで、このナビゲーションの [ビュー遷移][view-transitions] を有効にします。

```jsx
<Link to={to} unstable_viewTransition>
  クリックして
</Link>
```

このビュー遷移に特定のスタイルを適用する必要がある場合は、[`unstable_useViewTransitionState()`][use-view-transition-state] も活用する必要があります。

```jsx
function ImageLink(to) {
  const isTransitioning =
    unstable_useViewTransitionState(to);
  return (
    <Link to={to} unstable_viewTransition>
      <p
        style={{
          viewTransitionName: isTransitioning
            ? "image-title"
            : "",
        }}
      >
        画像番号 {idx}
      </p>
      <img
        src={src}
        alt={`Img ${idx}`}
        style={{
          viewTransitionName: isTransitioning
            ? "image-expand"
            : "",
        }}
      />
    </Link>
  );
}
```

<docs-warning>
この API は不安定としてマークされており、メジャーリリースなしに破壊的な変更が行われる可能性があります。
</docs-warning>

[scroll-restoration-component]: ./scroll-restoration
[history-state]: https://developer.mozilla.org/en-US/docs/Web/API/History/state
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[document-start-view-transition]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[use-view-transition-state]: ../hooks/use-view-transition-state
[relativesplatpath]: ../hooks/use-resolved-path#splat-paths


