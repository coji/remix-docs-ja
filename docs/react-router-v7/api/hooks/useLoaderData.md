---
title: useLoaderData
---

# useLoaderData

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useLoaderData.html)

最も近いルートの[LoaderFunction](https://api.reactrouter.com/v7/types/react_router.LoaderFunction.html)または[ClientLoaderFunction](https://api.reactrouter.com/v7/types/react_router.ClientLoaderFunction.html)からのデータを返します。

```tsx
import { useLoaderData } from "react-router";

export async function loader() {
  return await fakeDb.invoices.findAll();
}

export default function Invoices() {
  let invoices = useLoaderData<typeof loader>();
  // ...
}
```

## シグネチャ

```tsx
useLoaderData(): SerializeFrom
```