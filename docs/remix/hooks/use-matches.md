---
title: useMatches
toc: false
---

# `useMatches`

現在のページにおけるルートのマッチを返します。これは、現在のルートでレイアウトの抽象化を作成するのに役立ちます。

```tsx
function SomeComponent() {
  const matches = useMatches();

  // ...
}
```

`matches` は次の形状をしています。

```ts
[
  { id, pathname, data, params, handle }, // ルートルート
  { id, pathname, data, params, handle }, // レイアウトルート
  { id, pathname, data, params, handle }, // 子ルート
  // など
];
```

## 追加リソース

- [パンくずリストガイド][breadcrumbs-guide]

[breadcrumbs-guide]: ../guides/breadcrumbs

