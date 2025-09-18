---
title: matchRSCServerRequest
unstable: true
---

# unstable_matchRSCServerRequest

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/rsc/server.rsc.ts
-->

[MODES: data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常に**注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/variables/react_router.unstable_matchRSCServerRequest.html)

指定されたルートを[`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)にマッチさせ、[RSC](https://react.dev/reference/rsc/server-components)対応クライアントルーターが利用するための[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)をエンコードした[RSC](https://react.dev/reference/rsc/server-components) [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)を返します。

```tsx
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

## シグネチャ

```tsx
async function matchRSCServerRequest({
  createTemporaryReferenceSet,
  basename,
  decodeReply,
  requestContext,
  loadServerAction,
  decodeAction,
  decodeFormState,
  onError,
  request,
  routes,
  generateResponse,
}: {
  createTemporaryReferenceSet: () => unknown;
  basename?: string;
  decodeReply?: DecodeReplyFunction;
  decodeAction?: DecodeActionFunction;
  decodeFormState?: DecodeFormStateFunction;
  requestContext?: RouterContextProvider;
  loadServerAction?: LoadServerActionFunction;
  onError?: (error: unknown) => void;
  request: Request;
  routes: RSCRouteConfigEntry[];
  generateResponse: (
    match: RSCMatch,
    {
      temporaryReferences,
    }: {
      temporaryReferences: unknown;
    },
  ) => Response;
}): Promise<Response>
```

## パラメータ

### opts.basename

リクエストをマッチさせる際に使用するベースネームです。

### opts.createTemporaryReferenceSet

リクエストの一時的な参照セットを返す関数で、[RSC](https://react.dev/reference/rsc/server-components)ストリーム内の一時的な参照を追跡するために使用されます。

### opts.decodeAction

サーバーアクションのロードを担当する、`react-server-dom-xyz/server`の`decodeAction`関数です。

### opts.decodeFormState

Reactの[`useActionState`](https://react.dev/reference/react/useActionState)を使用し、`react-server-dom-xyz/server`の`decodeFormState`を用いてプログレッシブエンハンス可能なフォームのフォーム状態をデコードする関数です。

### opts.decodeReply

サーバー関数の引数をデコードし、ルーターによる呼び出しのために実装にバインドするために使用される、`react-server-dom-xyz/server`の`decodeReply`関数です。

### opts.generateResponse

`renderToReadableStream`を使用して、[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)をエンコードした[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)を生成する関数です。

### opts.loadServerAction

IDによってサーバーアクションをロードするために使用される、`react-server-dom-xyz/server`の`loadServerAction`関数です。

### opts.onError

リクエスト処理中に発生したエラーで呼び出される、オプションのエラーハンドラです。

### opts.request

マッチさせる[`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)です。

### opts.requestContext

リクエストごとに作成され、[`action`](../../start/data/route-object#action)s、[`loader`](../../start/data/route-object#loader)s、および[middleware](../../how-to/middleware)に渡される[`RouterContextProvider`](../utils/RouterContextProvider)のインスタンスです。

### opts.routes

あなたの[ルート定義](https://api.reactrouter.com/v7/types/react_router.unstable_RSCRouteConfigEntry.html)です。

## 戻り値

ハイドレーション用の[RSC](https://react.dev/reference/rsc/server-components)データを含む[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)です。