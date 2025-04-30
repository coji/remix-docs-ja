---
title: useLocation
---

# useLocation

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useLocation.html)

現在の[Location]([../Other/Location](https://api.reactrouter.com/v7/interfaces/react_router.Location.html))を返します。これは、Locationが変更されるたびに何らかの副作用を実行したい場合に役立ちます。

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
useLocation(): Location
```