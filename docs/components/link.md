---
title: Link
---

# `<Link>`

クライアントサイドルーティングによるナビゲーションを可能にする `<a href>` ラッパー。

```tsx
import { Link } from "@remix-run/react";

<Link to="/dashboard">ダッシュボード</Link>;
```

<docs-info>相対的な `<Link to>` の動作については、`future.v3_relativeSplatPath` 未来フラグの`useResolvedPath` ドキュメントの[スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

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

[`future.unstable_lazyRouteDiscovery`][lazy-route-discovery] を使用する場合のルート検出動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "render" */}
  <Link discover="none" />
</>
```

- **render** - デフォルト、リンクのレンダリング時にルートを検出
- **none** - 熱心に検出しない、リンクがクリックされた場合にのみ検出

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
- **intent** - ユーザーがリンクにホバーまたはフォーカスしたときにプリフェッチ
- **render** - リンクがレンダリングされたときにプリフェッチ
- **viewport** - リンクがビューポート内にあるときにプリフェッチ、モバイルに非常に役立ちます

プリフェッチは、HTML `<link rel="prefetch">` タグで行われます。リンクの後に挿入されます。

```tsx
<nav>
  <a href="..." />
  <a href="..." />
  <link rel="prefetch" /> {/* 場合によってはレンダリングされます */}
</nav>
```

そのため、`nav :last-child` を使用している場合は、スタイルが最後のリンク（および同様のセレクター）から条件付きで外れないように、`nav :last-of-type` を使用する必要があります。

### `preventScrollReset`

[`<ScrollRestoration>`][scroll-restoration-component] を使用している場合、このプロパティを使用すると、リンクがクリックされたときにスクロール位置がウィンドウの上部にリセットされるのを防ぐことができます。

```tsx
<Link to="?tab=one" preventScrollReset />
```

これは、ユーザーが戻る/進むボタンでその場所に移動したときにスクロール位置が復元されるのを防ぐものではありません。これは、ユーザーがリンクをクリックしたときにリセットされるのを防ぐだけです。

<details>

<summary>ディスカッション</summary>

この動作が必要になる可能性のある例として、ページの上部にない URL 検索パラメーターを操作するタブのリストがあります。タブの切り替えによってコンテンツがビューポートからスクロールアウトされる可能性があるため、スクロール位置が最上部にジャンプするのを防ぐ必要があります。

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
    │   │ コンテンツ            │   │ │
    │   │                     │   │ │
    │   │                     │   │ │
    │   └─────────────────────┘   │ │
    │                             │◄┘
    └─────────────────────────────┘

```

</details>

### `relative`

リンクの相対パス動作を定義します。

```tsx
<Link to=".." />; // デフォルト: "route"
<Link relative="route" />;
<Link relative="path" />;
```

- **route** - デフォルト、ルート階層に対して相対的なので、`..` は現在のルートパターンのすべての URL セグメントを削除します
- **path** - パスに対して相対的なので、`..` は 1 つの URL セグメントを削除します

### `reloadDocument`

リンクがクリックされたときにクライアントサイドルーティングではなくドキュメントナビゲーションを使用します。ブラウザは、`<a href>` であるかのように、遷移を通常どおり処理します。

```tsx
<Link to="/logout" reloadDocument />
```

### `replace`

`replace` プロパティは、新しいエントリを履歴スタックにプッシュするのではなく、現在のエントリを置き換えます。

```tsx
<Link replace />
```

```
# 履歴スタックがこのような場合
A -> B

# 通常のリンククリックは新しいエントリをプッシュします
A -> B -> C

# しかし、`replace` を使用すると、B は C に置き換えられます
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

この状態はサーバーではアクセスできません。これは、[`history.state`][history-state] の上に実装されているためです。

## `unstable_viewTransition`

`unstable_viewTransition` プロパティは、[`document.startViewTransition()`][document-start-view-transition] で最終的な状態の更新をラップすることで、このナビゲーションの[ビュー遷移][view-transitions] を有効にします。

```jsx
<Link to={to} unstable_viewTransition>
  クリックしてください
</Link>
```

このビュー遷移に特定のスタイルを適用する必要がある場合は、[`unstable_useViewTransitionState()`][use-view-transition-state] も使用する必要があります。

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
この API は不安定としてマークされており、メジャーリリースなしに破壊的な変更が発生する可能性があります。
</docs-warning>

[scroll-restoration-component]: ./scroll-restoration
[history-state]: https://developer.mozilla.org/en-US/docs/Web/API/History/state
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[document-start-view-transition]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[use-view-transition-state]: ../hooks/use-view-transition-state
[relativesplatpath]: ../hooks/use-resolved-path#splat-paths
[lazy-route-discovery]: ../guides/lazy-route-discovery



