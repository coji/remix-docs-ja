---
title: Link
---

# `<Link>`

クライアントサイドルーティングでのナビゲーションを可能にする `<a href>` ラッパー。

```tsx
import { Link } from "@remix-run/react";

<Link to="/dashboard">Dashboard</Link>;
```

<docs-info>`useResolvedPath` ドキュメントの [Splat Paths][relativesplatpath] セクションで、スプラットルート内の相対 `<Link to>` の動作に関する `future.v3_relativeSplatPath` future フラグに関する注意点をご覧ください。</docs-info>

## Props

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

[`future.v3_lazyRouteDiscovery`][lazy-route-discovery] を使用する際のルート検出の動作を定義します。

```tsx
<>
  <Link /> {/* デフォルトは "render" */}
  <Link discover="none" />
</>
```

- **render** - デフォルト、リンクがレンダリングされるときにルートを検出します
- **none** - 積極的に検出せず、リンクがクリックされた場合にのみ検出します

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
- **viewport** - リンクがビューポート内にあるときにプリフェッチします。モバイルに非常に便利です

プリフェッチは HTML `<link rel="prefetch">` タグを使用して行われます。これらはリンクの後に挿入されます。

```tsx
<nav>
  <a href="..." />
  <a href="..." />
  <link rel="prefetch" /> {/* 条件付きでレンダリングされる可能性があります */}
</nav>
```

このため、`nav :last-child` を使用している場合は、スタイルが最後のリンク（およびその他の同様のセレクター）から条件付きで外れないように、`nav :last-of-type` を使用する必要があります。

### `preventScrollReset`

[`<ScrollRestoration>`][scroll-restoration-component] を使用している場合、これにより、リンクがクリックされたときにスクロール位置がウィンドウの上部にリセットされるのを防ぐことができます。

```tsx
<Link to="?tab=one" preventScrollReset />
```

これは、ユーザーが戻る/進むボタンでその場所に再び戻ったときにスクロール位置が復元されるのを防ぐものではなく、ユーザーがリンクをクリックしたときにリセットされるのを防ぐだけです。

<details>

<summary>議論</summary>

この動作が必要になる可能性のある例は、ページの上部ではない URL 検索パラメーターを操作するタブのリストです。スクロール位置が上部にジャンプして、切り替えられたコンテンツがビューポートからスクロールアウトする可能性があるため、これは望ましくありません。

```text
      ┌─────────────────────────┐
      │                         ├──┐
      │                         │  │
      │                         │  │ スクロール
      │                         │  │ アウト
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
    │   │ コンテンツ          │   │ │
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

- **route** - デフォルト、ルート階層に対する相対パス。したがって、`..` は現在のルートパターンのすべての URL セグメントを削除します
- **path** - パスに対する相対パス。したがって、`..` は 1 つの URL セグメントを削除します

### `reloadDocument`

リンクがクリックされたときにクライアントサイドルーティングの代わりにドキュメントナビゲーションを使用します。ブラウザはトランジションを通常どおりに処理します（`<a href>` の場合と同様）。

```tsx
<Link to="/logout" reloadDocument />
```

### `replace`

`replace` プロパティは、履歴スタックに新しいエントリをプッシュする代わりに、履歴スタックの現在のエントリを置き換えます。

```tsx
<Link replace />
```

```
# このような履歴スタックの場合
A -> B

# 通常のリンククリックは新しいエントリをプッシュします
A -> B -> C

# ただし、`replace` を使用すると、B は C に置き換えられます
A -> C
```

### `state`

次の場所に永続的なクライアントサイドルーティング状態を追加します。

```tsx
<Link to="/somewhere/else" state={{ some: "value" }} />
```

ロケーション状態は `location` からアクセスされます。

```tsx
function SomeComp() {
  const location = useLocation();
  location.state; // { some: "value" }
}
```

この状態は、[`history.state`][history-state] の上に実装されているため、サーバー上ではアクセスできません。

## `viewTransition`

`viewTransition` プロパティは、最終的な状態更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることにより、このナビゲーションの [View Transition][view-transitions] を有効にします。

```jsx
<Link to={to} viewTransition>
  Click me
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