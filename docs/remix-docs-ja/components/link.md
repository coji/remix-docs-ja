---
title: Link
---

# `<Link>`

`<Link>`は、クライアントサイドルーティングを使用したナビゲーションを可能にする `<a href>` のラッパーです。

```tsx
import { Link } from "@remix-run/react";

<Link to="/dashboard">ダッシュボード</Link>;
```

<docs-info>相対的な `<Link to>` の動作に関する `future.v3_relativeSplatPath` フラグの将来的な動作については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

## プロパティ

### `to: string`

最も基本的な使用方法は、href 文字列を受け取ります。

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

[`future.v3_lazyRouteDiscovery`][lazy-route-discovery] を使用する場合に、ルーティングの検出動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "render" */}
  <Link discover="none" />
</>
```

- **render** - デフォルト、リンクがレンダリングされたときにルートを検出します
- **none** - 熱心な検出は行わず、リンクがクリックされた場合にのみ検出します

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
- **render** - リンクがレンダリングされたときにプリフェッチします
- **viewport** - リンクがビューポート内にあるときにプリフェッチします。モバイルに非常に役立ちます

プリフェッチは、HTML `<link rel="prefetch">` タグを使用して行われます。これらはリンクの後に挿入されます。

```tsx
<nav>
  <a href="..." />
  <a href="..." />
  <link rel="prefetch" /> {/* 条件付きでレンダリングされる場合があります */}
</nav>
```

このため、`nav :last-child` を使用している場合は、`nav :last-of-type` を使用して、スタイルが最後のリンク（および同様のセレクター）から条件付きで外れないようにする必要があります。

### `preventScrollReset`

[`<ScrollRestoration>`][scroll-restoration-component] を使用している場合、これにより、リンクがクリックされたときにスクロール位置がウィンドウの上部にリセットされるのを防ぐことができます。

```tsx
<Link to="?tab=one" preventScrollReset />
```

これは、ユーザーが戻る/進むボタンで場所に戻ったときにスクロール位置が復元されるのを防ぎません。これは、ユーザーがリンクをクリックしたときにリセットされるのを防ぐだけです。

<details>

<summary>ディスカッション</summary>

この動作が必要になる場合の例として、ページの上部にない URL 検索パラメータを操作するタブのリストがあります。トグルされたコンテンツがビューポートからスクロールされる可能性があるため、スクロール位置が上部にジャンプすることを望まないでしょう！

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

リンクの相対パス動作を定義します。

```tsx
<Link to=".." />; // デフォルト: "route"
<Link relative="route" />;
<Link relative="path" />;
```

- **route** - デフォルト、ルート階層に対して相対的なので、`..` は現在のルートパターンのすべての URL セグメントを削除します
- **path** - パスに対して相対的なので、`..` は 1 つの URL セグメントを削除します

### `reloadDocument`

リンクがクリックされたときに、クライアントサイドルーティングではなくドキュメントナビゲーションを使用します。ブラウザは通常どおり遷移を処理します（`<a href>` の場合と同じです）。

```tsx
<Link to="/logout" reloadDocument />
```

### `replace`

`replace` プロパティは、新しいエントリを履歴スタックにプッシュするのではなく、現在のエントリを履歴スタックから置き換えます。

```tsx
<Link replace />
```

```
# このような履歴スタックの場合
A -> B

# 通常のリンククリックは新しいエントリをプッシュします
A -> B -> C

# しかし、`replace` を使用すると、B は C で置き換えられます
A -> C
```

### `state`

次の場所に永続的なクライアントサイドルーティング状態を追加します。

```tsx
<Link to="/somewhere/else" state={{ some: "value" }} />
```

ロケーション状態は、`location` からアクセスできます。

```tsx
function SomeComp() {
  const location = useLocation();
  location.state; // { some: "value" }
}
```

この状態は、[`history.state`][history-state] の上に実装されているため、サーバーではアクセスできません。

## `viewTransition`

`viewTransition` プロパティは、最終的な状態の更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることにより、このナビゲーションの [ビュー遷移][view-transitions] を有効にします。

```jsx
<Link to={to} viewTransition>
  クリックしてください
</Link>
```

このビュー遷移に特定のスタイルを適用する必要がある場合は、[`useViewTransitionState()`][use-view-transition-state] も活用する必要があります。

```jsx
function ImageLink(to) {
  const isTransitioning = useViewTransitionState(to);
  return (
    <Link to={to} viewTransition>
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

[scroll-restoration-component]: ./scroll-restoration
[history-state]: https://developer.mozilla.org/en-US/docs/Web/API/History/state
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[document-start-view-transition]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[use-view-transition-state]: ../hooks/use-view-transition-state
[relativesplatpath]: ../hooks/use-resolved-path#splat-paths
[lazy-route-discovery]: ../guides/lazy-route-discovery



