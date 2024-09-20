---
title: unstable_useViewTransitionState
toc: false
---

# `unstable_useViewTransitionState`

このフックは、指定された場所にアクティブな [View Transition][view-transitions] がある場合に `true` を返します。これを使用すると、要素にさらに細かいスタイルを適用して、ビューの遷移をさらにカスタマイズできます。これには、[`Link`][link-component-view-transition] （または [`Form`][form-component-view-transition]、[`NavLink`][nav-link-component-view-transition]、`navigate`、または `submit` コール）の `unstable_viewTransition` プロパティを使用して、指定されたナビゲーションに対してビューの遷移が有効になっている必要があります。

リスト内の画像をクリックして、宛先ページのヒーロー画像に展開する必要がある場合を考えてみましょう。

```jsx
function NavImage({ src, alt, id }) {
  const to = `/images/${idx}`;
  const vt = unstable_useViewTransitionState(href);
  return (
    <Link to={to} unstable_viewTransition>
      <img
        src={src}
        alt={alt}
        style={{
          viewTransitionName: vt ? "image-expand" : "",
        }}
      />
    </Link>
  );
}
```

[view-transitions]: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
[link-component-view-transition]: ../components/link#unstable_viewtransition
[form-component-view-transition]: ../components/form#unstable_viewtransition
[nav-link-component-view-transition]: ../components/nav-link#unstable_viewtransition
