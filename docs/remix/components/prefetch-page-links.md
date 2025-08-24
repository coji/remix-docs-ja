---
title: PrefetchPageLinks
toc: false
---

# `<PrefetchPageLinks />`

このコンポーネントは、ページへの即時ナビゲーションを可能にするために、ページのすべてのアセットのプリフェッチを有効にします。これは、指定されたページのすべてのアセット（データ、モジュール、CSS）に対して `<link rel="prefetch">` および `<link rel="modulepreload"/>` タグをレンダリングすることによって行われます。

`<Link rel="prefetch">` は内部でこれを使用しますが、他の理由でページをプリフェッチするためにレンダリングすることもできます。

```tsx
<PrefetchPageLinks page="/absolute/path/to/your-path" />
```

**注意:** 絶対パスを使用する必要があります。
