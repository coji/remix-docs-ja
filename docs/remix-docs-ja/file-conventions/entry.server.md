---
title: entry.server
toc: false
---

# entry.server

デフォルトでは、Remix は HTTP レスポンスの生成を処理します。この動作をカスタマイズしたい場合は、`npx remix reveal` を実行して、`app/entry.server.tsx` (または `.jsx`) を生成できます。これは優先されます。このモジュールの `default` エクスポートは、HTTP ステータス、ヘッダー、HTML を含むレスポンスを作成できる関数であり、マークアップの生成とクライアントへの送信方法を完全に制御できます。

このモジュールは、現在のリクエストの `context` と `url` を使用して、`<RemixServer>` 要素を使用して現在のページのマークアップをレンダリングする必要があります。このマークアップは (オプションで)、[ブラウザのエントリモジュール][browser-entry-module] を使用して JavaScript がブラウザにロードされると、再水和されます。

## `handleDataRequest`

データリクエストのレスポンスを変更できる、オプションの `handleDataRequest` 関数をエクスポートできます。これらは HTML をレンダリングせず、クライアント側の水和が完了したら、ローダーとアクションのデータをブラウザに返すリクエストです。

```tsx
export function handleDataRequest(
  response: Response,
  {
    request,
    params,
    context,
  }: LoaderFunctionArgs | ActionFunctionArgs
) {
  response.headers.set("X-Custom-Header", "value");
  return response;
}
```

## `handleError`

デフォルトでは、Remix は発生したサーバー側のエラーをコンソールにログ出力します。ロギングをより詳細に制御したい場合、またはこれらのエラーを外部サービスにレポートする場合、オプションの `handleError` 関数をエクスポートできます。これにより、制御権が与えられ (組み込みのエラーロギングが無効になります)。

```tsx
export function handleError(
  error: unknown,
  {
    request,
    params,
    context,
  }: LoaderFunctionArgs | ActionFunctionArgs
) {
  if (!request.signal.aborted) {
    sendErrorToErrorReportingService(error);
    console.error(formatErrorForJsonLogging(error));
  }
}
```

_リクエストが中止された場合は、一般的にログ出力しないようにしてください。Remix のキャンセルと競合状態の処理により、多くのリクエストが中止される可能性があります。_

### ストリーミングレンダリングエラー

[`renderToPipeableStream`][rendertopipeablestream] または [`renderToReadableStream`][rendertoreadablestream] を介して HTML レスポンスをストリーミングしている場合、独自の `handleError` 実装は、最初のシェルレンダリング中に発生したエラーのみを処理します。その後のストリーミングレンダリング中にレンダリングエラーが発生した場合、Remix サーバーはその時点ですでにレスポンスを送信しているため、これらのエラーを手動で処理する必要があります。

- `renderToPipeableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。`onShellReady` でブール値を切り替える必要があります。これにより、エラーがシェルレンダリングエラー (無視できます) か非同期レンダリングエラー (処理する必要があります) かがわかります。
  - 例については、Node のデフォルトの [`entry.server.tsx`][node-streaming-entry-server] を参照してください。
- `renderToReadableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。
  - 例については、Cloudflare のデフォルトの [`entry.server.tsx`][cloudflare-streaming-entry-server] を参照してください。

### スローされたレスポンス

これは、`loader` / `action` 関数からスローされた `Response` インスタンスを処理しないことに注意してください。このハンドラの目的は、予期しないスローされたエラーが発生するコードのバグを見つけることです。シナリオを検出して `loader` / `action` で 401/404/などの `Response` をスローしている場合は、コードによって処理される予期されるフローです。これらのログを記録したり、外部サービスに送信したりする場合は、レスポンスをスローしたときに処理する必要があります。

[browser-entry-module]: ./entry.client
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[node-streaming-entry-server]: https://github.com/remix-run/remix/blob/main/packages/remix-dev/config/defaults/entry.server.node.tsx
[cloudflare-streaming-entry-server]: https://github.com/remix-run/remix/blob/main/packages/remix-dev/config/defaults/entry.server.cloudflare.tsx


