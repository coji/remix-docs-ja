---
title: useLocation
---

# useLocation

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useLocation.html)

現在の[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)を返します。これは、Location が変更されるたびに何らかの副作用を実行したい場合に役立ちます。

```tsx
import * as React from 'react'
import { useLocation } from 'react-router'

function SomeComponent() {
  let location = useLocation()

  React.useEffect(() => {
    // Google Analytics
    ga('send', 'pageview')
  }, [location]);

  return (
    // ...
  );
}
```

## シグネチャ

```tsx
function useLocation(): Location
```

## 戻り値

現在の[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)オブジェクト