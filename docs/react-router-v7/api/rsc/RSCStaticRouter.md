---
title: RSCStaticRouter
unstable: true
---

# unstable_RSCStaticRouter

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的なものであり、マイナー/パッチリリースで破壊的な変更が行われる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常**に注意を払ってください。</docs-warning>

## 概要

`RSCPayload`をHTMLにプリレンダリングします。通常、`routeRSCServerRequest`の`renderHTML`コールバックで使用されます。

```tsx filename=entry.ssr.tsx
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
// @ts-expect-error
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

## プロパティ

### getPayload

`RSCPayload`のデコードを開始する関数です。通常、`routeRSCServerRequest`の`renderHTML`から渡されます。
