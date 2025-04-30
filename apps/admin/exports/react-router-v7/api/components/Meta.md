---
title: Meta
---

# Meta

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Meta.html)

ルートモジュールの [`meta`](../../start/framework/route-module#meta) エクスポートによって作成されたすべての `<meta>` タグをレンダリングします。HTML の `<head>` 内にレンダリングする必要があります。

```tsx
import { Meta } from "react-router";

export default function Root() {
  return (
    <html>
      <head>
        <Meta />
      </head>
    </html>
  );
}
```

## Props

なし
