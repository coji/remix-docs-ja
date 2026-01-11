---
title: data
---

# data

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.data.html)

`headers`/`status` を含む "レスポンス" を、実際の [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) へシリアライズすることを強制せずに作成します。

```tsx
import { data } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  let item = await createItem(formData);
  return data(item, {
    headers: { "X-Custom-Header": "value" }
    status: 201,
  });
}
```

## シグネチャ

```tsx
function data<D>(data: D, init?: number | ResponseInit)
```

## パラメータ

### data

レスポンスに含めるデータ。

### init

レスポンスに含めるステータスコード、または `ResponseInit` オブジェクト。

## 戻り値

データとレスポンスの `init` を含む `DataWithResponseInit` インスタンス。