---
title: useOutletContext
---

# `useOutletContext`

[`<Outlet context={val} />`][outlet-context] コンポーネントの最も近い親からコンテキスト値を返す、[React Context][react-context] 上の便利な API です。

```tsx
import { useOutletContext } from "@remix-run/react";

function Child() {
  const myValue = useOutletContext();
  // ...
}
```

## 追加リソース

- [`<Outlet context>`][outlet-context]

[react-context]: https://react.dev/learn/passing-data-deeply-with-context
[outlet-context]: ../components/outlet#context
