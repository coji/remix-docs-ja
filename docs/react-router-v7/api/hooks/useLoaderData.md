---
title: useLoaderData
---

# useLoaderData

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useLoaderData.html)

最も近いルートの[`loader`](../../start/framework/route-module#loader)または[`clientLoader`](../../start/framework/route-module#clientloader)からのデータを返します。

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
function useLoaderData<T = any>(): SerializeFrom<T>
```

## 戻り値

ルートの[`loader`](../../start/framework/route-module#loader)または[`clientLoader`](../../start/framework/route-module#clientloader)関数から返されるデータ