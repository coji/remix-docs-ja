---
title: Links
---

# Links

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/ssr/components.tsx
-->

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Links.html)

ルートモジュールの [`links`](../../start/framework/route-module#links) エクスポートによって作成されたすべての [`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) タグをレンダリングします。ドキュメントの [`<head>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) 内にレンダリングする必要があります。

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

[`<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) 要素にレンダリングする [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) 属性。