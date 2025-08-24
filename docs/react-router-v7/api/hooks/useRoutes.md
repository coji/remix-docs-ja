---
title: useRoutes
---

# useRoutes

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useRoutes.html)

コンポーネントの代わりにオブジェクトを使用する [Routes](../components/Routes) のフック版です。これらのオブジェクトは、コンポーネントの props と同じプロパティを持ちます。`useRoutes` の戻り値は、ルートツリーのレンダリングに使用できる有効な React 要素、または一致するものが何もない場合は `null` です。

```tsx
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
function useRoutes(
  routes: RouteObject[],
  locationArg?: Partial<Location> | string,
): React.ReactElement | null
```

## パラメータ

### routes

ルート階層を定義する [`RouteObject`](https://api.reactrouter.com/v7/types/react_router.RouteObject.html) の配列

### locationArg

現在の [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) の代わりに使用する、オプションの [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) オブジェクトまたはパス名文字列

## 戻り値

一致したルートをレンダリングするための React 要素。ルートが一致しない場合は `null`。