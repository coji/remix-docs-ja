---
title: リンク
toc: false
---

# `<Links />`

`<Links/>` コンポーネントは、ルートモジュール [`links`][links] エクスポートによって作成されたすべての [`<link>`][link_element] タグをレンダリングします。通常は `app/root.tsx` の HTML の [`<head>`][head_element] 内にレンダリングする必要があります。

```tsx filename=app/root.tsx lines=[7]
import { Links } from "@remix-run/react";

export default function Root() {
  return (
    <html>
      <head>
        <Links />
      </head>
      <body></body>
    </html>
  );
}
```

[link_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[head_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head
[links]: ../route/links
