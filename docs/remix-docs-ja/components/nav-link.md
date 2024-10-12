---
title: NavLink
---

# `<NavLink>`

[`<Link>`][link-component] に、アクティブ状態と保留状態のスタイリング用の追加のプロパティをラップしたものです。

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

`<NavLink>` がアクティブな場合、基になるアンカータグに `<a aria-current="page">` が自動的に適用されます。MDN の [`aria-current`][aria-current] を参照してください。

### `.pending`

`<NavLink>` コンポーネントがナビゲーション中に保留状態の場合、`pending` クラスが追加されるため、CSS を使用してスタイルを設定できます。

```tsx
<NavLink to="/messages" />
```

```css
a.pending {
  color: red;
}
```

### `.transitioning`

ナビゲーション中に移行している場合、[`<NavLink viewTransition>`][view-transition-prop] コンポーネントには `transitioning` クラスが追加されます。これにより、CSS を使用してスタイルを設定できます。

```tsx
<NavLink to="/messages" viewTransition />
```

```css
a.transitioning {
  view-transition-name: my-transition;
}
```

## プロパティ

### `className` コールバック

アクティブ状態と保留状態を使用して、適用されるクラス名をカスタマイズできます。

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

アクティブ状態と保留状態を使用して、適用されるスタイルをカスタマイズできます。

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

アクティブ状態と保留状態を使用して、`<NavLink>` のコンテンツをカスタマイズできます。

```tsx
<NavLink to="/tasks">
  {({ isActive, isPending }) => (
    <span className={isActive ? "active" : ""}>Tasks</span>
  )}
</NavLink>
```

### `end`

`end` プロパティは、`active` 状態と `pending` 状態の照合ロジックを変更し、`NavLinks` の `to` パス末尾のみに照合されるようにします。URL が `to` より長い場合、アクティブとはみなされません。

| リンク                          | URL          | isActive |
| ----------------------------- | ------------ | -------- |
| `<NavLink to="/tasks" />`     | `/tasks`     | true     |
| `<NavLink to="/tasks" />`     | `/tasks/123` | true     |
| `<NavLink to="/tasks" end />` | `/tasks`     | true     |
| `<NavLink to="/tasks" end />` | `/tasks/123` | false    |

`<NavLink to="/">` は例外的なケースです。これは、すべての URL が `/` に一致するためです。デフォルトで、すべてのルートに一致しないようにするために、`end` プロパティは事実上無視され、ルートルートにいる場合にのみ一致されます。

### `caseSensitive`

`caseSensitive` プロパティを追加すると、照合ロジックが変更され、大文字と小文字が区別されるようになります。

| リンク                                         | URL           | isActive |
| -------------------------------------------- | ------------- | -------- |
| `<NavLink to="/SpOnGe-bOB" />`               | `/sponge-bob` | true     |
| `<NavLink to="/SpOnGe-bOB" caseSensitive />` | `/sponge-bob` | false    |

## `viewTransition`

`viewTransition` プロパティは、最終状態の更新を [`document.startViewTransition()`][document-start-view-transition] でラップすることで、このナビゲーションの [ビュー遷移][view-transitions] を有効にします。デフォルトでは、遷移中に [`transitioning` クラス][transitioning-class] が [`<a>` 要素][a-element] に追加され、ビュー遷移をカスタマイズするために使用できます。

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

[`className`][class-name-prop]/[`style`][style-prop] プロパティまたは [`children`][children-prop] に渡されるレンダープロパティを使用して、`isTransitioning` 値に基づいてさらにカスタマイズすることもできます。

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

### `<Link>` プロパティ

[`<Link>`][link-component] の他のすべてプロパティがサポートされています。

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

