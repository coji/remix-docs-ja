---
title: getRSCStream
unstable: true
---

# unstable_getRSCStream

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が発生する可能性があります。使用には注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

ハイドレーション用のプリレンダリングされたRSCストリームを取得します。通常、`react-server-dom-xyz/client`の`createFromReadableStream`に直接渡されます。

```tsx filename=entry.browser.ts
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
          <RSCHydratedRouter /* props */ />
        </StrictMode>,
        {
          /* ... */
        }
      );
    });
  }
);
```