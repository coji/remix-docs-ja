---
title: RSCStaticRouter
unstable: true
---

# unstable_RSCStaticRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/rsc/server.ssr.tsx
-->

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的なものであり、マイナー/パッチリリースで破壊的な変更が行われる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常**に注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_RSCStaticRouter.html)

[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)をHTMLにプリレンダリングします。通常、[`unstable_routeRSCServerRequest`](../rsc/routeRSCServerRequest)の`renderHTML`コールバックで使用されます。

```tsx
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import * as ReactDomServer from "react-dom/server.edge";
import {
  unstable_RSCStaticRouter as RSCStaticRouter,
  unstable_routeRSCServerRequest as routeRSCServerRequest,
} from "react-router";

routeRSCServerRequest({
  request,
  fetchServer,
  createFromReadableStream,
  async renderHTML(getPayload) {
    const payload = await getPayload();

    return await renderHTMLToReadableStream(
      <RSCStaticRouter getPayload={getPayload} />,
      {
        bootstrapScriptContent,
        formState: await getFormState(payload),
      }
    );
  },
});
```

## シグネチャ

```tsx
function RSCStaticRouter({ getPayload }: RSCStaticRouterProps)
```

## プロパティ

### getPayload

[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)のデコードを開始する関数です。通常、[`unstable_routeRSCServerRequest`](../rsc/routeRSCServerRequest)の`renderHTML`から渡されます。