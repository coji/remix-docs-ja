---
title: useLocation
---

# `useLocation`

現在のロケーションオブジェクトを返します。

```tsx
import { useLocation } from "@remix-run/react";

function SomeComponent() {
  const location = useLocation();
  // ...
}
```

## プロパティ

### `location.hash`

現在のURLのハッシュ。

### `location.key`

このロケーションの一意なキー。

### `location.pathname`

現在のURLのパス。

### `location.search`

現在のURLのクエリ文字列。

### `location.state`

[`<Link state>`][link_component_state] または [`navigate`][navigate] によって作成されたロケーションのステート値。

[link_component_state]: ../components/link#state
[navigate]: ./use-navigate


