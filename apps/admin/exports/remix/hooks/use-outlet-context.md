---
title: useOutletContext
---

# `useOutletContext`

[React Context][react-context] を利用した便利な API で、最も近い親の [`<Outlet context={val} />`][outlet-context] コンポーネントからコンテキスト値を返します。

```tsx
import { useOutletContext } from "@remix-run/react";

function Child() {
  const myValue = useOutletContext();
  // ...
}
```

## 関連リソース

- [`<Outlet context>`][outlet-context]

[react-context]: https://react.dev/learn/passing-data-deeply-with-context
[outlet-context]: ../components/outlet#context

