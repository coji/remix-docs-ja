---
title: useNavigation
---

# useNavigation

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useNavigation.html)

現在のナビゲーションを返します。ナビゲーションが進行中でない場合は、デフォルトで "idle" ナビゲーションになります。これを使用して、保留中の UI (グローバルスピナーなど) をレンダリングしたり、フォームナビゲーションから FormData を読み取ったりできます。

```tsx
import { useNavigation } from "react-router";

function SomeComponent() {
  let navigation = useNavigation();
  navigation.state;
  navigation.formData;
  // etc.
}
```

## シグネチャ

```tsx
useNavigation(): Navigation
```

