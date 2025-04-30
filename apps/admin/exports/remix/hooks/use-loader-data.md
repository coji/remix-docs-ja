---
title: useLoaderData
---

# `useLoaderData`

最も近いルートの[`loader`][loader]からシリアライズされたデータを返します。

```tsx lines=[2,9]
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  return json(await fakeDb.invoices.findAll());
}

export default function Invoices() {
  const invoices = useLoaderData<typeof loader>();
  // ...
}
```

## 追加リソース

**ディスカッション**

- [フルスタックデータフロー][fullstack_data_flow]
- [状態管理][state_management]

**API**

- [`loader`][loader]
- [`useFetcher`][use_fetcher]

[loader]: ../route/loader
[fullstack_data_flow]: ../discussion/data-flow
[state_management]: ../discussion/state-management
[use_fetcher]: ./use-fetcher

