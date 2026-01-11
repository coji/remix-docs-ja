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

<docs-warning>この API は実験的であり、マイナー/パッチリリースで破壊的変更が加えられる可能性があります。使用には注意を払い、関連する変更についてはリリースノートに**非常**に注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_routeRSCServerRequest.html)

受信した [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) を [RSC](https://react.dev/reference/rsc/server-components) サーバーにルーティングし、データ/リソースリクエストに対してはサーバー Response を適切にプロキシするか、ドキュメントリクエストに対しては HTML をレンダーします。

```tsx
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import * as ReactDomServer from "react-dom/server.edge";
import {
  unstable_RSCStaticRouter as RSCStaticRouter,
  unstable_routeRSCServerRequest as routeRSCServerRequest,
} from "react-router";

routeRSCServerRequest({
  request,
  serverResponse,
  createFromReadableStream,
  async renderHTML(getPayload) {
    const payload = getPayload();

    return await renderHTMLToReadableStream(
      <RSCStaticRouter getPayload={getPayload} />,
      {
        bootstrapScriptContent,
        formState: await payload.formState,
      }
    );
  },
});
```

## シグネチャ

```tsx
async function routeRSCServerRequest({
  request,
  serverResponse,
  createFromReadableStream,
  renderHTML,
  hydrate = true,
}: {
  request: Request;
  serverResponse: Response;
  createFromReadableStream: SSRCreateFromReadableStreamFunction;
  renderHTML: (
    getPayload: () => DecodedPayload,
    options: {
      onError(error: unknown): string | undefined;
      onHeaders(headers: Headers): void;
    },
  ) => ReadableStream<Uint8Array> | Promise<ReadableStream<Uint8Array>>;
  hydrate?: boolean;
}): Promise<Response>
```

## パラメータ

### opts.createFromReadableStream

サーバーからのペイロードをデコードするために使用される、`react-server-dom-xyz/client` の `createFromReadableStream` 関数です。

### opts.serverResponse

シリアライズされた [`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) を含む、[RSC](https://react.dev/reference/rsc/server-components) ハンドラーによって生成された Response または部分的な Response です。

### opts.hydrate

サーバー Response を RSC ペイロードでハイドレートするかどうか。デフォルトは `true` です。

### opts.renderHTML

[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) を HTML にレンダーする関数で、通常は [`<RSCStaticRouter>`](../rsc/RSCStaticRouter) を使用します。

### opts.request

ルーティングする Request です。

## 戻り値

データリクエストのための [RSC](https://react.dev/reference/rsc/server-components) ペイロードを含んでいるか、またはドキュメントリクエストのための HTML をレンダーする [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) です。