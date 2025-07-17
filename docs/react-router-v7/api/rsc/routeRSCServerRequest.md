---
title: routeRSCServerRequest
unstable: true
---

# unstable_routeRSCServerRequest

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。使用には注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

受信したリクエストをRSCサーバーにルーティングし、データ/リソースリクエストの場合はサーバー応答を適切にプロキシし、ドキュメントリクエストの場合はHTMLにレンダリングします。

```tsx filename=entry.ssr.tsx
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

## オプション

### createFromReadableStream

サーバーからのペイロードをデコードするために使用される、`react-server-dom-xyz/client`の`createFromReadableStream`関数。

### fetchServer

`Request`をRSCハンドラーに転送し、シリアライズされた`RSCPayload`を含む`Promise<Response>`を返す関数。

### renderHTML

`RSCPayload`をHTMLにレンダリングする関数。通常は`<RSCStaticRouter>`を使用します。

### request

ルーティングするリクエスト。
