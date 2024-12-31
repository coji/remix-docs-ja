---
title: useLocation
---

# `useLocation`

現在の location オブジェクトを返します。

```tsx
import { useLocation } from "@remix-run/react";

function SomeComponent() {
  const location = useLocation();
  // ...
}
```

## プロパティ

### `location.hash`

現在の URL のハッシュ。

### `location.key`

この location の一意のキー。

### `location.pathname`

現在の URL のパス。

### `location.search`

現在の URL のクエリ文字列。

### `location.state`

[`<Link state>`][link_component_state] または [`navigate`][navigate] によって作成された location の state 値。

[link_component_state]: ../components/link#state
[navigate]: ./use-navigate

