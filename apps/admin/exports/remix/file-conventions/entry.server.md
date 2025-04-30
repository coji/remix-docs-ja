---
title: entry.server
toc: false
---

# entry.server

デフォルトでは、Remix は HTTP レスポンスの生成を処理します。この動作をカスタマイズしたい場合は、`npx remix reveal` を実行して、優先される `app/entry.server.tsx` (または `.jsx`) を生成できます。このモジュールの `default` エクスポートは、HTTP ステータス、ヘッダー、HTML を含むレスポンスを作成できる関数であり、マークアップの生成方法とクライアントへの送信方法を完全に制御できます。

このモジュールは、現在のリクエストの `context` と `url` を持つ `<RemixServer>` 要素を使用して、現在のページのマークアップをレンダリングする必要があります。このマークアップは、[ブラウザエントリモジュール][browser-entry-module]を使用して、ブラウザで JavaScript がロードされると（オプションで）再ハイドレーションされます。

## `handleDataRequest`

オプションの `handleDataRequest` 関数をエクスポートして、データリクエストのレスポンスを変更できます。これらは HTML をレンダリングせず、クライアント側のハイドレーションが発生した後にローダーとアクションのデータをブラウザに返すリクエストです。

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

デフォルトでは、Remix はサーバー側で発生したエラーをコンソールに記録します。ログ記録をより詳細に制御したい場合や、これらのエラーを外部サービスに報告したい場合は、オプションの `handleError` 関数をエクスポートできます。これにより、制御が可能になり（組み込みのエラーログが無効になります）。

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

_Remix のキャンセルと競合状態の処理により、多くのリクエストが中断される可能性があるため、リクエストが中断された場合は通常、ログ記録を避ける必要があります。_

### ストリーミングレンダリングエラー

[`renderToPipeableStream`][rendertopipeablestream] または [`renderToReadableStream`][rendertoreadablestream] を介して HTML レスポンスをストリーミングしている場合、独自の `handleError` 実装は、最初のシェルレンダリング中に発生したエラーのみを処理します。後続のストリーミングレンダリング中にレンダリングエラーが発生した場合は、Remix サーバーがその時点でレスポンスを送信済みであるため、これらのエラーを手動で処理する必要があります。

- `renderToPipeableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。エラーがシェルレンダリングエラー（無視できる）か、非同期レンダリングエラー（処理する必要がある）かを判断できるように、`onShellReady` でブール値を切り替える必要があります。
  - 例については、Node のデフォルトの [`entry.server.tsx`][node-streaming-entry-server] を参照してください。
- `renderToReadableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。
  - 例については、Cloudflare のデフォルトの [`entry.server.tsx`][cloudflare-streaming-entry-server] を参照してください。

### スローされたレスポンス

これは、`loader`/`action` 関数からスローされた `Response` インスタンスを処理しないことに注意してください。このハンドラーの目的は、予期しないスローされたエラーにつながるコードのバグを見つけることです。シナリオを検出して、`loader`/`action` で 401/404/などの `Response` をスローする場合は、コードによって処理される予期されたフローです。それらをログに記録したり、外部サービスに送信したりする場合は、レスポンスをスローするときに行う必要があります。

[browser-entry-module]: ./entry.client
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[node-streaming-entry-server]: https://github.com/remix-run/remix/blob/main/packages/remix-dev/config/defaults/entry.server.node.tsx
[cloudflare-streaming-entry-server]: https://github.com/remix-run/remix/blob/main/packages/remix-dev/config/defaults/entry.server.cloudflare.tsx

