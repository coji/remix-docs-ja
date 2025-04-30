---
title: useViewTransitionState
toc: false
---

# `useViewTransitionState`

このフックは、指定されたロケーションへのアクティブな[View Transition][view-transitions]がある場合に `true` を返します。これは、要素にさらに細かいスタイルを適用して、ビュー遷移をさらにカスタマイズするために使用できます。これには、[`Link`][link-component-view-transition]（または[`Form`][form-component-view-transition]、[`NavLink`][nav-link-component-view-transition]、`navigate`、または `submit` 呼び出し）の `viewTransition` プロパティを介して、特定のナビゲーションでビュー遷移が有効になっている必要があります。

リスト内の画像をクリックして、遷移先のページのヒーロー画像に展開する必要がある場合を考えてみましょう。

```jsx
function NavImage({ src, alt, id }) {
  const to = `/images/${idx}`;
  const vt = useViewTransitionState(to);
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

[view-transitions]: https://developer.mozilla.org/ja/docs/Web/API/View_Transitions_API
[link-component-view-transition]: ../components/link#viewtransition
[form-component-view-transition]: ../components/form#viewtransition
[nav-link-component-view-transition]: ../components/nav-link#viewtransition

