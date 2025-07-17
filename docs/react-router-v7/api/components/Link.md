---
title: Link
---

# Link

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Link.html)

クライアントサイドルーティングによるナビゲーションを可能にする、段階的に機能拡張された `<a href>` ラッパー。

```tsx
import { Link } from "react-router";

<Link to="/dashboard">Dashboard</Link>;

<Link
  to={{
    pathname: "/some/path",
    search: "?query=string",
    hash: "#hash",
  }}
/>;
```

## Props

### discover

[modes: framework]

リンクの検出動作を定義します。

```tsx
<Link discover="render" />
```

- **render** - デフォルト。リンクのレンダリング時にルートを検出します。
- **none** - 積極的に検出せず、リンクがクリックされた場合にのみ検出します。

### prefetch

[modes: framework]

リンクのデータとモジュールのプリフェッチ動作を定義します。

```tsx
<Link prefetch="intent" />
```

- **none** - デフォルト。プリフェッチを行いません。
- **intent** - ユーザーがリンクにホバーまたはフォーカスしたときにプリフェッチします。
- **render** - リンクのレンダリング時にプリフェッチします。
- **viewport** - リンクがビューポート内にあるときにプリフェッチします。モバイルに非常に便利です。

プリフェッチは、HTML `<link rel="prefetch">` タグを使用して行われます。これらはリンクの後に挿入されます。

```tsx
<a href="..." />
<a href="..." />
<link rel="prefetch" /> // 条件付きでレンダリングされる場合があります
```

このため、`nav :last-child` を使用している場合は、`nav :last-of-type` を使用して、スタイルが最後のリンクから条件付きで外れないようにする必要があります（および他の同様のセレクター）。

### preventScrollReset

[modes: framework, data]

リンクがクリックされたときに、スクロール位置がウィンドウの上部にリセットされるのを防ぎます。これは、アプリが [ScrollRestoration](../components/ScrollRestoration) を使用している場合に限ります。これは、新しいロケーションでスクロールが上部にリセットされるのを防ぐだけで、戻る/進むボタンのナビゲーションではスクロール位置が復元されます。

```tsx
<Link to="?tab=one" preventScrollReset />
```

### relative

[modes: framework, data, declarative]

リンクの相対パスの動作を定義します。

```tsx
<Link to=".." /> // デフォルト: "route"
<Link relative="route" />
<Link relative="path" />
```

親ルートパターンが "blog" で、子ルートパターンが "blog/:slug/edit" であるルート階層を考えてみましょう。

- **route** - デフォルト。ルートパターンを基準にしてリンクを解決します。上記の例では、`".."` の相対リンクは、`:slug/edit` セグメントの両方を削除して "/blog" に戻ります。
- **path** - パスを基準にするため、`..` は1つのURLセグメントのみを削除して "/blog/:slug" に戻ります。

インデックスルートとレイアウト ルートにはパスがないため、相対パスの計算には含まれないことに注意してください。

### reloadDocument

[modes: framework, data, declarative]

リンクがクリックされたときに、クライアントサイドルーティングの代わりにドキュメントナビゲーションを使用します。ブラウザは、トランジションを通常どおりに処理します（`<a href>` のように）。

```tsx
<Link to="/logout" reloadDocument />
```

### replace

[modes: framework, data, declarative]

履歴スタックに新しいエントリをプッシュする代わりに、現在のエントリを置き換えます。

```tsx
<Link replace />
```

```
# このような履歴スタックがある場合
A -> B

# 通常のリンククリックは新しいエントリをプッシュします
A -> B -> C

# ただし、`replace` を使用すると、B が C に置き換えられます
A -> C
```

### state

[modes: framework, data, declarative]

次のロケーションに永続的なクライアントサイドルーティング状態を追加します。

```tsx
<Link to="/somewhere/else" state={{ some: "value" }} />
```

ロケーションの状態は、`location` からアクセスされます。

```tsx
function SomeComp() {
  const location = useLocation();
  location.state; // { some: "value" }
}
```

この状態は、[`history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state) の上に実装されているため、サーバー上ではアクセスできません。

### to

[modes: framework, data, declarative]

文字列または部分的な [Path](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) にすることができます。

```tsx
<Link to="/some/path" />

<Link
  to={{
    pathname: "/some/path",
    search: "?query=string",
    hash: "#hash",
  }}
/>
```

### viewTransition

[modes: framework, data, declarative]

このナビゲーションで [View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) を有効にします。

```jsx
<Link to={to} viewTransition>
  Click me
</Link>
```

トランジションに特定のスタイルを適用するには、[useViewTransitionState](../hooks/useViewTransitionState) を参照してください。
