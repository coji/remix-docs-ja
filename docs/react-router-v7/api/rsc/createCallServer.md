---
title: createCallServer
unstable: true
---

# unstable_createCallServer

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。使用には注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

React Router用のReact `callServer` 実装を作成します。

```tsx filename=entry.browser.tsx
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

## オプション

### createFromReadableStream

あなたの `react-server-dom-xyz/client` の `createFromReadableStream`。サーバーからのペイロードをデコードするために使用されます。

### encodeReply

あなたの `react-server-dom-xyz/client` の `encodeReply`。サーバーにペイロードを送信する際に使用されます。