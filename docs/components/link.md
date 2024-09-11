---
title: Link
---

# `<Link>`

クライアントサイドルーティングでナビゲーションを有効にするために、`<a href>` ラッパーを使用します。

```tsx
import { Link } from "@remix-run/react";

<Link to="/dashboard">ダッシュボード</Link>;
```

<docs-info>
`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照して、スプラットルート内での相対的な `<Link to>` の動作に関する `future.v3_relativeSplatPath` の将来のフラグの動作に関する注意を確認してください。
</docs-info>

## プロパティ

### `to: string`

最も基本的な使用法は、href 文字列を取ります。

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

[`future.unstable_lazyRouteDiscovery`][lazy-route-discovery] を使用する場合、ルート検出の動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "render" */}
  <Link discover="none" />
</>
```

- **render** - デフォルト、リンクがレンダリングされるときにルートを検出します。
- **none** - 積極的に検出せず、リンクがクリックされた場合にのみ検出します。

### `prefetch`

リンクのデータとモジュールプレフェッチの動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "none" */}
  <Link prefetch="none" />
  <Link prefetch="intent" />
  <Link prefetch="render" />
  <Link prefetch="viewport" />
</>
```

- **none** - デフォルト、プレフェッチなし
- **intent** - ユーザーがリンクにホバーまたはフォーカスするとプレフェッチします。
- **render** - リンクがレンダリングされるとプレフェッチします。
- **viewport** - リンクがビューポート内にあるときにプレフェッチします。モバイルに非常に便利です。

プレフェッチは、HTML `<link rel="prefetch">` タグを使用して行われます。リンクの後に挿入されます。

```tsx
<nav>
  <a href="..." />
  <a href="..." />
  <link rel="prefetch" /> {/* 条件付きでレンダリングされる場合があります */}
</nav>
```

そのため、`nav :last-child` を使用している場合は、スタイルが最後のリンク（およびその他の同様のセレクター）から条件付きで外れないように、`nav :last-of-type` を使用する必要があります。

### `preventScrollReset`

[`<ScrollRestoration>`][scroll-restoration-component] を使用している場合、このプロパティを使用すると、リンクをクリックしたときにスクロール位置がウィンドウの上部にリセットされるのを防ぐことができます。

```tsx
<Link to="?tab=one" preventScrollReset />
```

これは、ユーザーが戻る/進むボタンを使用して位置に戻ったときにスクロール位置が復元されるのを防ぐものではなく、ユーザーがリンクをクリックしたときにリセットされるのを防ぐだけです。

<details>

<summary>ディスカッション</summary>

ページの上部にない URL 検索パラメーターを操作するタブのリストの場合に、この動作が必要になる可能性があります。切り替えられたコンテンツがビューポートからスクロールアウトされる可能性があるため、スクロール位置が上にジャンプするのを避けたいでしょう！

```text
      ┌─────────────────────────┐
      │                         ├──┐
      │                         │  │
      │                         │  │ スクロールアウト
      │                         │  │ ビューから
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

- **route** - デフォルト、ルート階層に対する相対パスなので、`..` は現在のルートパターンのすべての URL セグメントを削除します。
- **path** - パスに対する相対パスなので、`..` は 1 つの URL セグメントを削除します。

### `reloadDocument`

リンクがクリックされると、クライアントサイドルーティングではなくドキュメントナビゲーションを使用し、ブラウザは通常どおり（`<a href>` の場合と同じように）遷移を処理します。

```tsx
<Link to="/logout" reloadDocument />
```

### `replace`

`replace` プロパティは、新しいエントリを履歴スタックにプッシュするのではなく、現在のエントリを置き換えます。

```tsx
<Link replace />
```

```
# 履歴スタックは次のようになります
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

ロケーション状態は、`location` からアクセスされます。

```tsx
function SomeComp() {
  const location = useLocation();
  location.state; // { some: "value" }
}
```

この状態は、[`history.state`][history-state] の上に実装されているため、サーバーではアクセスできません。

## `unstable_viewTransition`

`unstable_viewTransition` プロパティは、最終的な状態の更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることで、このナビゲーションの [ビュー遷移][view-transitions] を有効にします。

```jsx
<Link to={to} unstable_viewTransition>
  私をクリックしてください
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
この API は不安定とマークされており、メジャーリリースなしに破壊的な変更が発生する可能性があります。
</docs-warning>

[scroll-restoration-component]: ./scroll-restoration
[history-state]: https://developer.mozilla.org/en-US/docs/Web/API/History/state
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[document-start-view-transition]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[use-view-transition-state]: ../hooks/use-view-transition-state
[relativesplatpath]: ../hooks/use-resolved-path#splat-paths
[lazy-route-discovery]: ../guides/lazy-route-discovery
