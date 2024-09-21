---
title: useMatches
toc: false
---

# `useMatches`

ページ上の現在のルートマッチを返します。これは、現在のルートを使用してレイアウト抽象化を作成するのに役立ちます。

```tsx
function SomeComponent() {
  const matches = useMatches();

  // ...
}
```

`matches` は次の形をしています。

```ts
[
  { id, pathname, data, params, handle }, // ルートルート
  { id, pathname, data, params, handle }, // レイアウトルート
  { id, pathname, data, params, handle }, // 子ルート
  // など
];
```

## さらなるリソース

- [パンくずリストガイド][breadcrumbs-guide]

[breadcrumbs-guide]: ../guides/breadcrumbs 
