---
title: createCallServer
unstable: true
---

# unstable_createCallServer

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/rsc/browser.tsx
-->

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。使用には注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_createCallServer.html)

React Router用のReact `callServer` 実装を作成します。

```tsx
import {
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  setServerCallback,
} from "@vitejs/plugin-rsc/browser";
import { unstable_createCallServer as createCallServer } from "react-router";

setServerCallback(
  createCallServer({
    createFromReadableStream,
    createTemporaryReferenceSet,
    encodeReply,
  })
);
```

## Signature

```tsx
function createCallServer({
  createFromReadableStream,
  createTemporaryReferenceSet,
  encodeReply,
  fetch: fetchImplementation = fetch,
}: {
  createFromReadableStream: BrowserCreateFromReadableStreamFunction;
  createTemporaryReferenceSet: () => unknown;
  encodeReply: EncodeReplyFunction;
  fetch?: (request: Request) => Promise<Response>;
})
```

## Params

### opts.createFromReadableStream

あなたの `react-server-dom-xyz/client` の `createFromReadableStream`。サーバーからのペイロードをデコードするために使用されます。

### opts.createTemporaryReferenceSet

[RSC](https://react.dev/reference/rsc/server-components) ペイロードのための一時的な参照セットを作成する関数。

### opts.encodeReply

あなたの `react-server-dom-xyz/client` の `encodeReply`。サーバーにペイロードを送信する際に使用されます。

### opts.fetch

オプションの[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)実装。デフォルトはグローバルの[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)です。

## Returns

サーバーアクションを呼び出すために使用できる関数。