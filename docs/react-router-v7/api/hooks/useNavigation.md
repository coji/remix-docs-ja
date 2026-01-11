---
title: useNavigation
---

# useNavigation

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useNavigation.html)

現在の [`Navigation`](https://api.reactrouter.com/v7/types/react_router.Navigation.html) を返します。ナビゲーションが進行中でない場合は、デフォルトで "idle" ナビゲーションになります。これを使用して、保留中の UI (グローバルスピナーなど) をレンダリングしたり、フォームナビゲーションから [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) を読み取ったりできます。

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
function useNavigation(): Navigation
```

## Returns

現在の [`Navigation`](https://api.reactrouter.com/v7/types/react_router.Navigation.html) オブジェクト