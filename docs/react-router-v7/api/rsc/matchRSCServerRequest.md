---
title: matchRSCServerRequest
unstable: true
---

# unstable_matchRSCServerRequest

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常に**注意を払ってください。</docs-warning>

## 概要

指定されたルートをリクエストにマッチさせ、RSC対応クライアントルーターが利用するための`RSCPayload`をエンコードしたRSCレスポンスを返します。

```tsx filename=entry.rsc.ts
import {
  createTemporaryReferenceSet,
  decodeAction,
  decodeReply,
  loadServerAction,
  renderToReadableStream,
} from "@vitejs/plugin-rsc/rsc";
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";

matchRSCServerRequest({
  createTemporaryReferenceSet,
  decodeAction,
  decodeFormState,
  decodeReply,
  loadServerAction,
  request,
  routes: routes(),
  generateResponse(match) {
    return new Response(
      renderToReadableStream(match.payload),
      {
        status: match.statusCode,
        headers: match.headers,
      }
    );
  },
});
```

## オプション

### basename

リクエストをマッチさせる際に使用するベースネームです。

### decodeAction

サーバーアクションのロードを担当する、`react-server-dom-xyz/server`の`decodeAction`関数です。

### decodeReply

サーバー関数の引数をデコードし、ルーターによる呼び出しのために実装にバインドするために使用される、`react-server-dom-xyz/server`の`decodeReply`関数です。

### decodeFormState

`react-server-dom-xyz/server`の`decodeFormState`を使用して`useActionState`によるプログレッシブエンハンス可能なフォームのフォーム状態をデコードする関数です。

### generateResponse

`renderToReadableStream`を使用して`RSCPayload`をエンコードしたレスポンスを生成する関数です。

### loadServerAction

IDによってサーバーアクションをロードするために使用される、`react-server-dom-xyz/server`の`loadServerAction`関数です。

### request

マッチさせるリクエストです。

### requestContext

リクエストごとに作成され、ローダー、アクション、ミドルウェアに渡される`unstable_RouterContextProvider`のインスタンスです。

### routes

あなたのルート定義です。
