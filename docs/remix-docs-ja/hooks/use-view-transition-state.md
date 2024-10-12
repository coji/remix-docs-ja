---
title: useViewTransitionState
toc: false
---

# `useViewTransitionState`

このフックは、指定された場所にアクティブな [ビュートランジション][view-transitions] がある場合に `true` を返します。これは、ビュートランジションをさらにカスタマイズするために、要素にきめ細かいスタイルを適用するために使用できます。これには、[`Link`][link-component-view-transition]（または[`Form`][form-component-view-transition]、[`NavLink`][nav-link-component-view-transition]、`navigate`、`submit` 呼び出し）の `viewTransition` プロパティを介して、指定されたナビゲーションに対してビュートランジションが有効になっている必要があります。

リスト内の画像をクリックして、目的のページのヒーロー画像に展開する必要があるとします。

```jsx
function NavImage({ src, alt, id }) {
  const to = `/images/${idx}`;
  const vt = useViewTransitionState(href);
  return (
    <Link to={to} viewTransition>
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
[link-component-view-transition]: ../components/link#viewtransition
[form-component-view-transition]: ../components/form#viewtransition
[nav-link-component-view-transition]: ../components/nav-link#viewtransition

