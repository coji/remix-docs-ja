---
title: data
---

# data

<!--
⚠️ ⚠️ 重要 ⚠️ ⚠️ 

ドキュメントの改善にご協力いただきありがとうございます！

このファイルはソースコード内のJSDocコメントから自動生成されています。そのため、以下のファイルのJSDocコメントを編集してください。変更がマージされると、このファイルは再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.data.html)

実際の [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) へのシリアライズを強制することなく、`headers`/`status` を含む「レスポンス」を作成します。

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

データとレスポンスの初期設定を含む `DataWithResponseInit` インスタンス。