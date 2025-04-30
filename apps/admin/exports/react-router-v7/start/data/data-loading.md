---
title: データローディング
order: 4
---

# データローディング

[MODES: data]

## データを提供する

データはルートローダーからルートコンポーネントに提供されます:

```tsx
createBrowserRouter([
  {
    path: "/",
    loader: () => {
      // ここからデータを返す
      return { records: await getSomeRecords() };
    },
    Component: MyRoute,
  },
]);
```

## データにアクセスする

データは `useLoaderData` を使用してルートコンポーネントで利用できます。

```tsx
import { useLoaderData } from "react-router";

function MyRoute() {
  const { records } = useLoaderData();
  return <div>{records.length}</div>;
}
```

ユーザーがルート間を移動すると、ルートコンポーネントがレンダリングされる前にローダーが呼び出されます。