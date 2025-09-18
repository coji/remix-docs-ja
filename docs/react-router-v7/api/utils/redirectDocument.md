---
title: redirectDocument
---

# redirectDocument

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.redirectDocument.html)

新しい場所へのドキュメントのリロードを強制するリダイレクト[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)です。ステータスコードと[`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location)ヘッダーを設定します。デフォルトは[`302 Found`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/302)です。

```tsx filename=routes/logout.tsx
import { redirectDocument } from "react-router";

import { destroySession } from "../sessions.server";

export async function action({ request }: Route.ActionArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  return redirectDocument("/", {
    headers: { "Set-Cookie": await destroySession(session) }
  });
}
```

## パラメータ

### url

リダイレクト先のURLです。

### init

レスポンスに含めるステータスコード、または `ResponseInit` オブジェクトです。

## 戻り値

リダイレクトステータスと[`Location`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location)ヘッダーを含む[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)オブジェクトです。