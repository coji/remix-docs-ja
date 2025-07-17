---
title: NavLink
---

# NavLink

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.NavLink.html)

[Link](../components/Link) をラップし、アクティブおよび保留状態のスタイル設定のための追加の props を提供します。

- アクティブおよび保留状態に基づいて、クラスがリンクに自動的に適用されます。NavLinkProps.className を参照してください。
- リンクがアクティブな場合、`aria-current="page"` がリンクに自動的に適用されます。MDN の [`aria-current`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current) を参照してください。

```tsx
import { NavLink } from "react-router";
<NavLink to="/message" />;
```

状態は、className、style、および children のレンダー props を通じて利用できます。[NavLinkRenderProps](https://api.reactrouter.com/v7/types/react_router.NavLinkRenderProps) を参照してください。

```tsx
<NavLink
  to="/messages"
  className={({ isActive, isPending }) =>
    isPending ? "pending" : isActive ? "active" : ""
  }
>
  Messages
</NavLink>
```

## Props

### caseSensitive

[modes: framework, data, declarative]

マッチングロジックを大文字と小文字を区別するように変更します。

| Link                                         | URL           | isActive |
| -------------------------------------------- | ------------- | -------- |
| `<NavLink to="/SpOnGe-bOB" />`               | `/sponge-bob` | true     |
| `<NavLink to="/SpOnGe-bOB" caseSensitive />` | `/sponge-bob` | false    |

### children

[modes: framework, data, declarative]

通常の React children または、リンクのアクティブおよび保留状態を持つオブジェクトを受け取る関数にすることができます。

```tsx
<NavLink to="/tasks">
  {({ isActive }) => (
    <span className={isActive ? "active" : ""}>Tasks</span>
  )}
</NavLink>
```

### className

[modes: framework, data, declarative]

状態に対応するクラスが NavLink に自動的に適用されます。

```css
a.active {
  color: red;
}
a.pending {
  color: blue;
}
a.transitioning {
  view-transition-name: my-transition;
}
```

なお、`pending` は Framework および Data モードでのみ利用可能です。

### discover

[modes: framework]

リンクの検出動作を定義します。

```tsx
<Link discover="render" />
```

- **render** - デフォルト、リンクがレンダリングされるときにルートを検出します。
- **none** - 積極的に検出せず、リンクがクリックされた場合にのみ検出します。

### end

[modes: framework, data, declarative]

`active` および `pending` 状態のマッチングロジックを、NavLinkProps.to の「末尾」のみに一致するように変更します。URL が長い場合、アクティブとは見なされなくなります。

| Link                          | URL          | isActive |
| ----------------------------- | ------------ | -------- |
| `<NavLink to="/tasks" />`     | `/tasks`     | true     |
| `<NavLink to="/tasks" />`     | `/tasks/123` | true     |
| `<NavLink to="/tasks" end />` | `/tasks`     | true     |
| `<NavLink to="/tasks" end />` | `/tasks/123` | false    |

`<NavLink to="/">` は例外的なケースです。なぜなら、_すべての_ URL が `/` に一致するからです。デフォルトでこのマッチングがすべてのルートで行われるのを避けるために、事実上 `end` prop は無視され、ルートにいる場合にのみ一致します。

### prefetch

[modes: framework]

リンクのデータとモジュールのプリフェッチ動作を定義します。

```tsx
<Link prefetch="intent" />
```

- **none** - デフォルト、プリフェッチなし
- **intent** - ユーザーがリンクにホバーまたはフォーカスしたときにプリフェッチします。
- **render** - リンクがレンダリングされるときにプリフェッチします。
- **viewport** - リンクがビューポート内にあるときにプリフェッチします。モバイルに非常に便利です。

プリフェッチは HTML `<link rel="prefetch">` タグを使用して行われます。これらはリンクの後に挿入されます。

```tsx
<a href="..." />
<a href="..." />
<link rel="prefetch" /> // 条件付きでレンダリングされる可能性があります
```

このため、`nav :last-child` を使用している場合は、`nav :last-of-type` を使用して、スタイルが最後のリンクから条件付きで外れないようにする必要があります（および他の同様のセレクター）。

### preventScrollReset

[modes: framework, data]

リンクがクリックされたときに、スクロール位置がウィンドウの上部にリセットされるのを防ぎます。アプリが [ScrollRestoration](../components/ScrollRestoration) を使用している場合に限ります。これは、新しい場所でスクロールが上部にリセットされるのを防ぐだけであり、戻る/進むボタンのナビゲーションではスクロール位置が復元されます。

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

- **route** - デフォルト、ルートパターンを基準にしてリンクを解決します。上記の例では、`".."` の相対リンクは、`:slug/edit` セグメントを "/blog" まで削除します。
- **path** - パスを基準にするため、`..` は "/blog/:slug" まで 1 つの URL セグメントのみを削除します。

### reloadDocument

[modes: framework, data, declarative]

リンクがクリックされたときに、クライアント側のルーティングではなくドキュメントナビゲーションを使用します。ブラウザは、通常どおりにトランジションを処理します（`<a href>` のように）。

```tsx
<Link to="/logout" reloadDocument />
```

### replace

[modes: framework, data, declarative]

履歴スタックに新しいエントリをプッシュする代わりに、履歴スタック内の現在のエントリを置き換えます。

```tsx
<Link replace />
```

```
# 次のような履歴スタックの場合
A -> B

# 通常のリンククリックは新しいエントリをプッシュします
A -> B -> C

# ただし、`replace` を使用すると、B が C に置き換えられます
A -> C
```

### state

[modes: framework, data, declarative]

次の場所に永続的なクライアント側のルーティング状態を追加します。

```tsx
<Link to="/somewhere/else" state={{ some: "value" }} />
```

ロケーションの状態は `location` からアクセスされます。

```tsx
function SomeComp() {
  const location = useLocation();
  location.state; // { some: "value" }
}
```

この状態は、[`history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state) の上に実装されているため、サーバー上ではアクセスできません。

### style

[modes: framework, data, declarative]

通常の React スタイルオブジェクト、またはリンクのアクティブおよび保留状態を持つオブジェクトを受け取る関数。

```tsx
<NavLink to="/tasks" style={{ color: "red" }} />
<NavLink to="/tasks" style={({ isActive, isPending }) => ({
  color:
    isActive ? "red" :
    isPending ? "blue" : "black"
})} />
```

なお、`pending` は Framework および Data モードでのみ利用可能です。

### to

[modes: framework, data, declarative]

文字列または部分的な [Path](https://api.reactrouter.com/v7/interfaces/react_router.Path) にすることができます。

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

このナビゲーションの [View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) を有効にします。

```jsx
<Link to={to} viewTransition>
  Click me
</Link>
```

トランジションに特定のスタイルを適用するには、[useViewTransitionState](../hooks/useViewTransitionState) を参照してください。