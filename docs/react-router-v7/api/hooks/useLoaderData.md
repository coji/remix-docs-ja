---
title: useLoaderData
---

# useLoaderData

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