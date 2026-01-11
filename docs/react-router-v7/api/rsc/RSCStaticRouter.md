---
title: RSCStaticRouter
unstable: true
---

# unstable_RSCStaticRouter

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的なものであり、マイナー/パッチリリースで破壊的な変更が加えられる可能性があります。使用には注意し、関連する変更についてはリリースノートに**非常**に注意してください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_RSCStaticRouter.html)

[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) をHTMLにプリレンダリングします。通常、[`unstable_routeRSCServerRequest`](../rsc/routeRSCServerRequest) の `renderHTML` コールバックで使用されます。

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
function RSCStaticRouter({ getPayload }: RSCStaticRouterProps)
```

## Props

### getPayload

[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) のデコードを開始する関数です。通常、[`unstable_routeRSCServerRequest`](../rsc/routeRSCServerRequest) の `renderHTML` から渡されます。