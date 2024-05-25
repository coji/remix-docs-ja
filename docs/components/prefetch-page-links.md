---
title: PrefetchPageLinks
toc: false
---

# `<PrefetchPageLinks />`

このコンポーネントは、ページのすべての資産をプリフェッチすることで、そのページへのインスタントナビゲーションを可能にします。これは、指定されたページのすべての資産（データ、モジュール、CSS）に対して `<link rel="prefetch">` と `<link rel="modulepreload"/>` タグをレンダリングすることで実現します。

`<Link rel="prefetch">` は内部的にこれを使用しますが、他の理由でページをプリフェッチするためにレンダリングすることもできます。

```tsx
<PrefetchPageLinks page="/absolute/path/to/your-path" />
```

**注:** 絶対パスを使用する必要があります。 
