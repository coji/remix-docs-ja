---
title: useActionData
---

# useActionData

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useActionData.html)

最新の `POST` ナビゲーションフォーム送信からの [`action`](../../start/framework/route-module#action) データを返します。まだ送信がない場合は `undefined` を返します。

```tsx
import { Form, useActionData } from "react-router";

export async function action({ request }) {
  const body = await request.formData();
  const name = body.get("visitorsName");
  return { message: `Hello, ${name}` };
}

export default function Invoices() {
  const data = useActionData();
  return (
    <Form method="post">
      <input type="text" name="visitorsName" />
      {data ? data.message : "Waiting..."}
    </Form>
  );
}
```

## シグネチャ

```tsx
function useActionData<T = any>(): SerializeFrom<T> | undefined
```

## 戻り値

ルートの [`action`](../../start/framework/route-module#action) 関数から返されたデータ、または [`action`](../../start/framework/route-module#action) が呼び出されていない場合は `undefined`。