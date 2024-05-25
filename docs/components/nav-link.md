---
title: NavLink
---

# `<NavLink>`

`<Link>`[link-component] にアクティブ状態と保留状態のスタイリング用の追加プロパティをラップします。

```tsx
import { NavLink } from "@remix-run/react";

<NavLink
  to="/messages"
  className={({ isActive, isPending }) =>
    isPending ? "pending" : isActive ? "active" : ""
  }
>
  メッセージ
</NavLink>;
```

## 自動属性

### `.active`

`<NavLink>`コンポーネントがアクティブな場合、`active`クラスが追加されるため、CSSを使用してスタイリングできます。

```tsx
<NavLink to="/messages" />
```

```css
a.active {
  color: red;
}
```

### `aria-current`

`<NavLink>`がアクティブな場合、基になるアンカータグに`<a aria-current="page">`が自動的に適用されます。 MDNの[`aria-current`][aria-current]を参照してください。

### `.pending`

ナビゲーション中に保留されている場合、`<NavLink>`コンポーネントに`pending`クラスが追加されるため、CSSを使用してスタイリングできます。

```tsx
<NavLink to="/messages" />
```

```css
a.pending {
  color: red;
}
```

### `.transitioning`

ナビゲーション中に移行している場合、[`<NavLink unstable_viewTransition>`][view-transition-prop]コンポーネントに`transitioning`クラスが追加されるため、CSSを使用してスタイリングできます。

```tsx
<NavLink to="/messages" unstable_viewTransition />
```

```css
a.transitioning {
  view-transition-name: my-transition;
}
```

## プロパティ

### `className` コールバック

適用されるクラス名をカスタマイズできるように、アクティブ状態と保留状態をコールバックします。

```tsx
<NavLink
  to="/messages"
  className={({ isActive, isPending }) =>
    isPending ? "pending" : isActive ? "active" : ""
  }
>
  メッセージ
</NavLink>
```

### `style` コールバック

適用されるスタイルをカスタマイズできるように、アクティブ状態と保留状態をコールバックします。

```tsx
<NavLink
  to="/messages"
  style={({ isActive, isPending }) => {
    return {
      fontWeight: isActive ? "bold" : "",
      color: isPending ? "red" : "black",
    };
  }}
>
  メッセージ
</NavLink>
```

### `children` コールバック

`<NavLink>`の内容をカスタマイズできるように、アクティブ状態と保留状態をコールバックします。

```tsx
<NavLink to="/tasks">
  {({ isActive, isPending }) => (
    <span className={isActive ? "active" : ""}>タスク</span>
  )}
</NavLink>
```

### `end`

`end`プロパティは、`active`と`pending`の状態のマッチングロジックを変更して、`NavLinks`の`to`パスの「終わり」にのみ一致するようにします。 URLが`to`よりも長い場合、アクティブとは見なされなくなります。

| リンク                          | URL          | isActive |
| ----------------------------- | ------------ | -------- |
| `<NavLink to="/tasks" />`     | `/tasks`     | true     |
| `<NavLink to="/tasks" />`     | `/tasks/123` | true     |
| `<NavLink to="/tasks" end />` | `/tasks`     | true     |
| `<NavLink to="/tasks" end />` | `/tasks/123` | false    |

`<NavLink to="/">`は、_すべての_URLが`/`と一致するため、例外的なケースです。デフォルトですべてのルートに一致しないように、`end`プロパティを無視し、ルートルートにいる場合にのみ一致するようにします。

### `caseSensitive`

`caseSensitive`プロパティを追加すると、マッチングロジックがケースセンシティブになります。

| リンク                                         | URL           | isActive |
| -------------------------------------------- | ------------- | -------- |
| `<NavLink to="/SpOnGe-bOB" />`               | `/sponge-bob` | true     |
| `<NavLink to="/SpOnGe-bOB" caseSensitive />` | `/sponge-bob` | false    |

## `unstable_viewTransition`

`unstable_viewTransition`プロパティは、最終的な状態の更新を[`document.startViewTransition()`][document-start-view-transition]でラップすることにより、このナビゲーションの[ビュー遷移][view-transitions]を有効にします。デフォルトでは、遷移中は[`transitioning`クラス][transitioning-class]が[`<a>`要素][a-element]に追加されるため、ビュー遷移をカスタマイズできます。

```css
a.transitioning p {
  view-transition-name: "image-title";
}

a.transitioning img {
  view-transition-name: "image-expand";
}
```

```tsx
<NavLink to={to} unstable_viewTransition>
  <p>画像番号 {idx}</p>
  <img src={src} alt={`Img ${idx}`} />
</NavLink>
```

[`className`][class-name-prop]/[`style`][style-prop]プロパティや[`children`][children-prop]に渡されるレンダリングプロパティを使用して、`isTransitioning`値に基づいてさらにカスタマイズすることもできます。

```tsx
<NavLink to={to} unstable_viewTransition>
  {({ isTransitioning }) => (
    <>
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
    </>
  )}
</NavLink>
```

<docs-warning>
このAPIは不安定としてマークされており、メジャーリリースなしで破壊的な変更が発生する可能性があります。
</docs-warning>

### `<Link>`プロパティ

[`<Link>`][link-component]の他のすべてのプロパティがサポートされています。

[link-component]: ./link
[aria-current]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current
[view-transition-prop]: #unstableviewtransition
[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[document-start-view-transition]: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
[transitioning-class]: #transitioning
[a-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
[class-name-prop]: #classname-callback
[style-prop]: #style-callback
[children-prop]: #children-callback

