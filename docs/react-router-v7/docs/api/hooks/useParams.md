---
title: useParams
---

# useParams

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useParams.html)

現在のURLから、ルートによってマッチした動的なパラメータのキーと値のペアのオブジェクトを返します。子ルートは、親ルートからすべてのパラメータを継承します。

```tsx
import { useParams } from "react-router"

function SomeComponent() {
  let params = useParams()
  params.postId
}
```

`/posts/:postId` のようなルートパターンが `/posts/123` にマッチした場合、`params.postId` は `"123"` になります。

## シグネチャ

```tsx
useParams(): Readonly
```

