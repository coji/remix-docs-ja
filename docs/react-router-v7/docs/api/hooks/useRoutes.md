---
title: useRoutes
---

# useRoutes

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useRoutes.html)

コンポーネントの代わりにオブジェクトを使用する [Routes](../components/Routes) のフック版です。これらのオブジェクトは、コンポーネントの props と同じプロパティを持ちます。

`useRoutes` の戻り値は、ルートツリーのレンダリングに使用できる有効な React 要素、または一致するものが何もない場合は `null` です。

```tsx
import * as React from "react";
import { useRoutes } from "react-router";

function App() {
  let element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        {
          path: "messages",
          element: <DashboardMessages />,
        },
        { path: "tasks", element: <DashboardTasks /> },
      ],
    },
    { path: "team", element: <AboutPage /> },
  ]);

  return element;
}
```

## シグネチャ

```tsx
useRoutes(routes, locationArg): undefined
```

## パラメータ

### routes

[modes: framework, data, declarative]

_ドキュメントはありません_

### locationArg

[modes: framework, data, declarative]

_ドキュメントはありません_

