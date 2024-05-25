---
title: アウトレット
---

# `<Outlet>`

親ルートのマッチする子ルートをレンダリングします。

```tsx
import { Outlet } from "@remix-run/react";

export default function SomeParent() {
  return (
    <div>
      <h1>親コンテンツ</h1>

      <Outlet />
    </div>
  );
}
```

## プロパティ

### `context`

アウトレットの下の要素ツリーにコンテキスト値を提供します。親ルートが子ルートに値を提供する必要がある場合に使用します。

```tsx
<Outlet context={myContextValue} />
```

こちらも参照してください: [`useOutletContext`][use-outlet-context]

[use-outlet-context]: ../hooks/use-outlet-context 
