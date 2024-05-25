---
title: useParams
---

# `useParams`

現在の URL からルートによって一致した動的パラメータのキー/値のペアオブジェクトを返します。子ルートは、親ルートからすべてのパラメータを継承します。

```tsx
import { useParams } from "@remix-run/react";

function SomeComponent() {
  const params = useParams();
  // ...
}
```

`routes/posts/$postId.tsx` などのルートが `/posts/123` によって一致する場合、`params.postId` は `"123"` になります。[スプラットルート][splat-routes] のパラメータは `params["*"]` として使用できます。

[splat-routes]: ../file-conventions/routes#splat-routes 
