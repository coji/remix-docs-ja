---
title: useParams
---

# `useParams`

現在のURLから、ルートによってマッチした動的なパラメータのキーと値のペアのオブジェクトを返します。子ルートは、親ルートからすべてのパラメータを継承します。

```tsx
import { useParams } from "@remix-run/react";

function SomeComponent() {
  const params = useParams();
  // ...
}
```

`routes/posts/$postId.tsx` のようなルートが `/posts/123` によってマッチした場合、`params.postId` は `"123"` になります。[スプラットルート][splat-routes]のパラメータは `params["*"]` として利用できます。

[splat-routes]: ../file-conventions/routes#splat-routes

