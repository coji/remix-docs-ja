---
title: useActionData
toc: false
---

# `useActionData`

最新のルートの[アクション][action]からシリアライズされたデータを返します。アクションがない場合は `undefined` を返します。このフックは、コンテキスト内のルートからのアクションデータのみを返します。他の親または子ルートからのデータにはアクセスできません。

```tsx lines=[10,14]
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
import { Form, useActionData } from "@remix-run/react";

export async function action({
  request,
}: ActionFunctionArgs) {
  const body = await request.formData();
  const name = body.get("visitorsName");
  return json({ message: `Hello, ${name}` });
}

export default function Invoices() {
  const data = useActionData<typeof action>();
  return (
    <Form method="post">
      <input type="text" name="visitorsName" />
      {data ? data.message : "Waiting..."}
    </Form>
  );
}
```

## 追加リソース

**ガイド**

- [フォームのバリデーション][form_validation]

**関連API**

- [`action`][action]
- [`useNavigation`][use_navigation]

**ディスカッション**

- [フルスタックデータフロー][fullstack_data_flow]

[form_validation]: ../guides/form-validation
[action]: ../route/action
[use_navigation]: ../hooks/use-navigation
[fullstack_data_flow]: ../discussion/data-flow

