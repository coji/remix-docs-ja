---
title: Links
---

# リンク

[MODES: フレームワーク]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Links.html)

ルートモジュールの [`links`](../../start/framework/route-module#links) export によって作成されたすべての [`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) タグをレンダリングします。ドキュメントの [`<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) 内にレンダリングする必要があります。

```tsx
import { Links } from "react-router";

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

## シグネチャ

```tsx
function Links({ nonce }: LinksProps): React.JSX.Element
```

## Props

### nonce

[`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) 要素にレンダリングする [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) 属性です。