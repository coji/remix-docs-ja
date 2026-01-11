---
title: createCallServer
unstable: true
---

# unstable_createCallServer

<!--
⚠️ ⚠️ 重要 ⚠️ ⚠️

ドキュメント改善にご協力いただきありがとうございます！

このファイルはソースコード内の JSDoc コメントから自動生成されます。
したがって、以下のファイルの JSDoc コメントを編集してください。
変更がマージされると、このファイルは再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/rsc/browser.tsx
-->

[MODES: data]

<br />
<br />

<docs-warning>この API は実験的であり、マイナー/パッチリリースで破壊的変更の対象となる可能性があります。使用には注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## Summary

React Router 用の React `callServer` の実装を作成します。

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

`react-server-dom-xyz/client` の `createFromReadableStream` です。サーバーからのペイロードをデコードするために使用されます。

### opts.createTemporaryReferenceSet

[RSC](https://react.dev/reference/rsc/server-components) ペイロード用の一時的な参照セットを作成する関数です。

### opts.encodeReply

`react-server-dom-xyz/client` の `encodeReply` です。サーバーにペイロードを送信するときに使用されます。

### opts.fetch

オプションの [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 実装です。グローバルな [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) がデフォルトです。

## Returns

サーバーアクションを呼び出すために使用できる関数です。