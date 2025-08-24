---
title: getRSCStream
unstable: true
---

# unstable_getRSCStream

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/rsc/html-stream/browser.ts
-->

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が発生する可能性があります。使用には注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_getRSCStream.html)

ハイドレーション用のプリレンダリングされた[RSC](https://react.dev/reference/rsc/server-components)ストリームを取得します。通常、`react-server-dom-xyz/client`の`createFromReadableStream`に直接渡されます。

```tsx
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
} from "react-router";
import type { unstable_RSCPayload as RSCPayload } from "react-router";

createFromReadableStream(getRSCStream()).then(
  (payload: RSCServerPayload) => {
    startTransition(async () => {
      hydrateRoot(
        document,
        <StrictMode>
          <RSCHydratedRouter {...props} />
        </StrictMode>,
        {
          // Options
        }
      );
    });
  }
);
```

## シグネチャ

```tsx
function getRSCStream(): ReadableStream
```

## 戻り値

ハイドレーション用の[RSC](https://react.dev/reference/rsc/server-components)データを含む[`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)です。