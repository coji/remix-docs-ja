---
title: NavLink
---

# `<NavLink>`

アクティブおよび保留中の状態をスタイルするための追加の props を持つ [`<Link>`][link-component] をラップします。

```tsx
import { NavLink } from "@remix-run/react";

<NavLink
  to="/messages"
  className={({ isActive, isPending }) =>
    isPending ? "pending" : isActive ? "active" : ""
  }
>
  Messages
</NavLink>;
```

## 自動属性

### `.active`

`<NavLink>` コンポーネントがアクティブな場合、`active` クラスが追加されるため、CSS を使用してスタイルを設定できます。

```tsx
<NavLink to="/messages" />
```

```css
a.active {
  color: red;
}
```

### `aria-current`

`NavLink` がアクティブな場合、基になるアンカータグに `<a aria-current="page">` が自動的に適用されます。MDN の [`aria-current`][aria-current] を参照してください。

### `.pending`

ナビゲーション中に `<NavLink>` コンポーネントが保留中の場合、`pending` クラスが追加されるため、CSS を使用してスタイルを設定できます。

```tsx
<NavLink to="/messages" />
```

```css
a.pending {
  color: red;
}
```

### `.transitioning`

ナビゲーション中に [`<NavLink viewTransition>`][view-transition-prop] コンポーネントがトランジション中の場合、`transitioning` クラスが追加されるため、CSS を使用してスタイルを設定できます。

```tsx
<NavLink to="/messages" viewTransition />
```

```css
a.transitioning {
  view-transition-name: my-transition;
}
```

## Props

### `className` コールバック

適用されるクラス名をカスタマイズできるように、アクティブおよび保留中の状態をコールバックします。

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

### `style` コールバック

適用されるスタイルをカスタマイズできるように、アクティブおよび保留中の状態をコールバックします。

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
  Messages
</NavLink>
```

### `children` コールバック

`<NavLink>` のコンテンツをカスタマイズできるように、アクティブおよび保留中の状態をコールバックします。

```tsx
<NavLink to="/tasks">
  {({ isActive, isPending }) => (
    <span className={isActive ? "active" : ""}>Tasks</span>
  )}
</NavLink>
```

### `end`

`end` prop は、`active` および `pending` 状態のマッチングロジックを、`NavLinks` の `to` パスの「末尾」のみに一致するように変更します。URL が `to` より長い場合、アクティブとは見なされなくなります。

| リンク                          | URL          | isActive |
| ----------------------------- | ------------ | -------- |
| `<NavLink to="/tasks" />`     | `/tasks`     | true     |
| `<NavLink to="/tasks" />`     | `/tasks/123` | true     |
| `<NavLink to="/tasks" end />` | `/tasks`     | true     |
| `<NavLink to="/tasks" end />` | `/tasks/123` | false    |

`<NavLink to="/">` は、_すべての_ URL が `/` に一致するため、例外的なケースです。デフォルトでこのすべてのルートに一致するのを避けるために、事実上 `end` prop を無視し、ルートルートにいる場合にのみ一致します。

### `caseSensitive`

`caseSensitive` prop を追加すると、マッチングロジックが変更され、大文字と小文字が区別されるようになります。

| リンク                                         | URL           | isActive |
| -------------------------------------------- | ------------- | -------- |
| `<NavLink to="/SpOnGe-bOB" />`               | `/sponge-bob` | true     |
| `<NavLink to="/SpOnGe-bOB" caseSensitive />` | `/sponge-bob` | false    |

## `viewTransition`

`viewTransition` prop は、最終的な状態の更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることにより、このナビゲーションの [View Transition][view-transitions] を有効にします。デフォルトでは、トランジション中に、[`<a>` 要素][a-element] に [`transitioning` クラス][transitioning-class] が追加され、これを使用してビューのトランジションをカスタマイズできます。

```css
a.transitioning p {
  view-transition-name: "image-title";
}

a.transitioning img {
  view-transition-name: "image-expand";
}
```

```tsx
<NavLink to={to} viewTransition>
  <p>Image Number {idx}</p>
  <img src={src} alt={`Img ${idx}`} />
</NavLink>
```

[`className`][class-name-prop]/[`style`][style-prop] props または [`children`][children-prop] に渡されるレンダー props を使用して、`isTransitioning` 値に基づいてさらにカスタマイズすることもできます。

```tsx
<NavLink to={to} viewTransition>
  {({ isTransitioning }) => (
    <>
      <p
        style={{
          viewTransitionName: isTransitioning
            ? "image-title"
            : "",
        }}
      >
        Image Number {idx}
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

### `<Link>` props

[`<Link>`][link-component] の他のすべての props がサポートされています。

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

