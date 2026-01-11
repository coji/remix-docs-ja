---
title: matchRSCServerRequest
unstable: true
---

# unstable_matchRSCServerRequest

[MODES: data]

<br />
<br />

<docs-warning>この API は実験的であり、マイナー/パッチリリースで破壊的な変更が行われる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常**に注意してください。</docs-warning>

## 概要

[参照ドキュメント ↗](https://api.reactrouter.com/v7/variables/react_router.unstable_matchRSCServerRequest.html)

与えられた `routes` を [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) にマッチさせ、[RSC](https://react.dev/reference/rsc/server-components) 対応のクライアント `router` が利用するための [`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) をエンコードした [RSC](https://react.dev/reference/rsc/server-components) [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) を返します。

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
      onError,
      temporaryReferences,
    }: {
      onError(error: unknown): string | undefined;
      temporaryReferences: unknown;
    },
  ) => Response;
}): Promise<Response>
```

## パラメータ

### opts.basename

リクエストのマッチング時に使用する basename です。

### opts.createTemporaryReferenceSet

リクエストのための一時参照セットを返す関数で、[RSC](https://react.dev/reference/rsc/server-components) ストリーム内の一時参照を追跡するために使用されます。

### opts.decodeAction

`react-server-dom-xyz/server` の `decodeAction` 関数で、サーバー `action` のロードを担当します。

### opts.decodeFormState

React の [`useActionState`](https://react.dev/reference/react/useActionState) を使用して、プログレッシブに強化可能なフォームのフォーム `state` をデコードする関数です。`react-server-dom-xyz/server` の `decodeFormState` を使用します。

### opts.decodeReply

`react-server-dom-xyz/server` の `decodeReply` 関数で、サーバー関数の引数をデコードし、`router` による呼び出しのために実装にバインドするために使用されます。

### opts.generateResponse

あなたの `renderToReadableStream` を使用して、[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) をエンコードする [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) を生成する関数です。

### opts.loadServerAction

`react-server-dom-xyz/server` の `loadServerAction` 関数で、ID によってサーバー `action` をロードするために使用されます。

### opts.onError

リクエスト処理中に発生したエラーで呼び出されるオプションのエラーハンドラです。

### opts.request

マッチング対象となる [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) です。

### opts.requestContext

リクエストごとに作成されるべき [`RouterContextProvider`](../utils/RouterContextProvider) のインスタンスで、`action`、`loader`、および [middleware](../../how-to/middleware) に渡されます。

### opts.routes

あなたの [route 定義](https://api.reactrouter.com/v7/types/react_router.unstable_RSCRouteConfigEntry.html)です。

## 戻り値

ハイドレーションのための [RSC](https://react.dev/reference/rsc/server-components) データを含む [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) です。