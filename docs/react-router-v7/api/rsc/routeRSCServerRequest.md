---
title: routeRSCServerRequest
unstable: true
---

# unstable_routeRSCServerRequest

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

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。使用には注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_routeRSCServerRequest.html)

受信した[`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)を[RSC](https://react.dev/reference/rsc/server-components)サーバーにルーティングし、データ/リソースリクエストの場合はサーバー応答を適切にプロキシし、ドキュメントリクエストの場合はHTMLにレンダリングします。

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

## Signature

```tsx
async function routeRSCServerRequest({
  request,
  fetchServer,
  createFromReadableStream,
  renderHTML,
  hydrate = true,
}: {
  request: Request;
  fetchServer: (request: Request) => Promise<Response>;
  createFromReadableStream: SSRCreateFromReadableStreamFunction;
  renderHTML: (
    getPayload: () => Promise<RSCPayload>,
  ) => ReadableStream<Uint8Array> | Promise<ReadableStream<Uint8Array>>;
  hydrate?: boolean;
}): Promise<Response>
```

## Params

### opts.createFromReadableStream

`react-server-dom-xyz/client`の`createFromReadableStream`関数。サーバーからのペイロードをデコードするために使用されます。

### opts.fetchServer

[`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)を[RSC](https://react.dev/reference/rsc/server-components)ハンドラーに転送し、シリアライズされた[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)を含む`Promise<Response>`を返す関数。

### opts.hydrate

RSCペイロードでサーバー応答をハイドレートするかどうか。デフォルトは`true`です。

### opts.renderHTML

[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)をHTMLにレンダリングする関数。通常は[`<RSCStaticRouter>`](../rsc/RSCStaticRouter)を使用します。

### opts.request

ルーティングするリクエスト。

## Returns

データリクエストの場合は[RSC](https://react.dev/reference/rsc/server-components)ペイロードを含むか、ドキュメントリクエストの場合はHTMLをレンダリングする[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)。