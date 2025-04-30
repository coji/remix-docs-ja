---
title: href
---

# href

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.href.html)

指定されたルートに対する解決済みのURLパスを返します。

```tsx
const h = href("/:lang?/about", { lang: "en" })
// -> `/en/about`

<Link to={href("/products/:id", { id: "abc123" })} />
```

