---
title: Links
---

# リンク

[MODES: フレームワーク]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Links.html)

ルートモジュールの [`links`](../../start/framework/route-module#links) エクスポートによって作成されたすべての `<link>` タグをレンダリングします。ドキュメントの `<head>` 内にレンダリングする必要があります。

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

## Props

なし
