---
title: Link
---

# `<Link>`

クライアントサイドルーティングでナビゲーションを有効にするための `<a href>` ラッパーです。

```tsx
import { Link } from "@remix-run/react";

<Link to="/dashboard">ダッシュボード</Link>;
```

<docs-info>スプラットルート内の相対的な `<Link to>` の動作に関する `future.v3_relativeSplatPath` の未来フラグの動作については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

## プロパティ

### `to: string`

最も基本的な使い方は、href 文字列を受け取ります。

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

### `discover`

[`future.unstable_fogOfWar`][fog-of-war] を使用する場合、ルートの検出動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "render" */}
  <Link discover="none" />
</>
```

- **render** - デフォルト、リンクがレンダリングされるときにルートを検出します
- **none** - 熱心に検出しない、リンクがクリックされた場合にのみ検出します

### `prefetch`

リンクのデータとモジュールのプリフェッチ動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "none" */}
  <Link prefetch="none" />
  <Link prefetch="intent" />
  <Link prefetch="render" />
  <Link prefetch="viewport" />
</>
```

- **none** - デフォルト、プリフェッチなし
- **intent** - ユーザーがリンクにホバーまたはフォーカスしたときにプリフェッチします
- **render** - リンクがレンダリングされるときにプリフェッチします
- **viewport** - リンクがビューポート内にあるときにプリフェッチします、モバイルに非常に便利です

プリフェッチは、HTML `<link rel="prefetch">` タグで行われます。それらはリンクの後に入力されます。

```tsx
<nav>
  <a href="..." />
  <a href="..." />
  <link rel="prefetch" /> {/* 条件付きでレンダリングされる可能性があります */}
</nav>
```

このため、`nav :last-child` を使用している場合は、`nav :last-of-type` を使用する必要があります。そうしないと、スタイルが条件付きで最後のリンク（および同様のセレクター）から外れてしまいます。

### `preventScrollReset`

[`<ScrollRestoration>`][scroll-restoration-component] を使用している場合、このプロパティを使用すると、リンクをクリックしたときにスクロール位置がウィンドウの上部にリセットされるのを防ぐことができます。

```tsx
<Link to="?tab=one" preventScrollReset />
```

これは、ユーザーが戻る/進むボタンを使用して場所に移動したときにスクロール位置が復元されるのを防ぐものではなく、ユーザーがリンクをクリックしたときにリセットされるのを防ぐだけです。

<details>

<summary>議論</summary>

この動作が必要になる可能性のある例として、ページの上部ではなく、URL 検索パラメータを操作するタブのリストがあります。トグルされたコンテンツがビューポートからスクロールアウトされる可能性があるため、スクロール位置が上にジャンプするのは避けたいです！

```text
      ┌─────────────────────────┐
      │                         ├──┐
      │                         │  │
      │                         │  │ スクロール
      │                         │  │ ビューから外れています
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

- **route** - デフォルト、ルート階層に対して相対的なので、`..` は現在のルートパターンのすべての URL セグメントを削除します
- **path** - パスに対して相対的なので、`..` は 1 つの URL セグメントを削除します

### `reloadDocument`

リンクがクリックされたときに、クライアントサイドルーティングの代わりにドキュメントナビゲーションを使用します。ブラウザは通常どおり移行を処理します（`<a href>` であるかのように）。

```tsx
<Link to="/logout" reloadDocument />
```

### `replace`

`replace` プロパティを使用すると、新しいエントリを履歴スタックにプッシュするのではなく、現在のエントリを履歴スタックから置き換えます。

```tsx
<Link replace />
```

```
# 履歴スタックはこのようになります
A -> B

# 通常のリンククリックは新しいエントリをプッシュします
A -> B -> C

# しかし、`replace` を使用すると、B は C に置き換えられます
A -> C
```

### `state`

次のロケーションに永続的なクライアントサイドルーティング状態を追加します。

```tsx
<Link to="/somewhere/else" state={{ some: "value" }} />
```

ロケーション状態には、`location` からアクセスできます。

```tsx
function SomeComp() {
  const location = useLocation();
  location.state; // { some: "value" }
}
```

この状態はサーバーではアクセスできません。これは [`history.state`][history-state] の上に実装されているためです。

## `unstable_viewTransition`

`unstable_viewTransition` プロパティを使用すると、最終的な状態の更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることにより、このナビゲーションの [ビュー遷移][view-transitions] を有効にすることができます。

```jsx
<Link to={to} unstable_viewTransition>
  クリックしてください
</Link>
```

このビュー遷移に特定のスタイルを適用する必要がある場合は、[`unstable_useViewTransitionState()`][use-view-transition-state] も利用する必要があります。

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
この API は不安定とマークされており、メジャーリリースなしに破壊的な変更が発生する可能性があります。
</docs-warning>

[scroll-restoration-component]: ./scroll-restoration
[history-state]: https://developer.mozilla.org/en-US/docs/Web/API/History/state
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[document-start-view-transition]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[use-view-transition-state]: ../hooks/use-view-transition-state
[relativesplatpath]: ../hooks/use-resolved-path#splat-paths
[fog-of-war]: ../guides/fog-of-war


