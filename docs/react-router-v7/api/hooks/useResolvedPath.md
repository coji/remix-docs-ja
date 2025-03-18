---
title: useResolvedPath
---

# useResolvedPath

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useResolvedPath.html)

指定された `to` 値のパス名を現在のロケーションに対して解決します。[useHref](../hooks/useHref) と似ていますが、文字列ではなく [Path](../Other/Path) を返します。

```tsx
import { useResolvedPath } from "react-router";

function SomeComponent() {
  // ユーザーが /dashboard/profile にいる場合
  let path = useResolvedPath("../accounts");
  path.pathname; // "/dashboard/accounts"
  path.search; // ""
  path.hash; // ""
}
```

## シグネチャ

```tsx
useResolvedPath(to, __namedParameters): Path
```

## パラメータ

### to

[modes: framework, data, declarative]

_ドキュメントなし_

### \_\_namedParameters

[modes: framework, data, declarative]

_ドキュメントなし_

