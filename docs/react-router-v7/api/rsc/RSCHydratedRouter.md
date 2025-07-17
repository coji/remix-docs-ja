---
title: RSCHydratedRouter
unstable: true
---

# unstable_RSCHydratedRouter

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常に**注意を払ってください。</docs-warning>

## 概要

サーバーでレンダリングされた`RSCPayload`をブラウザでハイドレートします。

```tsx filename=entry.browser.tsx
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
          <RSCHydratedRouter
            createFromReadableStream={
              createFromReadableStream
            }
            payload={payload}
          />
        </StrictMode>,
        {
          formState: await getFormState(payload),
        }
      );
    });
  }
);
```

## Props

### createFromReadableStream

サーバーからのペイロードをデコードするために使用される、`react-server-dom-xyz/client`の`createFromReadableStream`関数です。

### payload

ハイドレートするデコードされた`RSCPayload`です。

### routeDiscovery

`eager`または`lazy` - リンクが積極的に検出されるか、クリックされるまで遅延されるかを決定します。

### unstable_getContext

クライアントのローダー、アクション、ミドルウェアで使用するための`unstable_InitialContext`オブジェクト（`Map<RouterContext, unknown>`）を返す関数です。
