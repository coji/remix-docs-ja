---
title: RouterProvider
---

# RouterProvider

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.RouterProvider.html)

データルーターを初期化し、その変更をサブスクライブし、一致するコンポーネントをレンダリングします。通常、アプリの要素ツリーの最上位に配置する必要があります。

```tsx
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router";
import { createRoot } from "react-dom/client";
let router = createBrowserRouter();
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
```

## Props

### flushSync

[modes: data]

_ドキュメントなし_

### router

[modes: data]

_ドキュメントなし_

