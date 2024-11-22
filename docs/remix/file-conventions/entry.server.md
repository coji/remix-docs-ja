---
title: entry.server
toc: false
---

# entry.server

デフォルトでは、Remix は HTTP レスポンスの生成を処理します。この動作をカスタマイズしたい場合は、`npx remix reveal` を実行して `app/entry.server.tsx` (または `.jsx`) を生成できます。このファイルは優先されます。このモジュールの `default` エクスポートは、HTTP ステータス、ヘッダー、HTML を含むレスポンスを作成できる関数で、マークアップの生成とクライアントへの送信方法を完全に制御できます。

このモジュールは、現在のリクエストの `context` と `url` を持つ `<RemixServer>` 要素を使用して、現在のページのマークアップをレンダリングする必要があります。このマークアップは、JavaScript がブラウザでロードされると、[ブラウザのエントリモジュール][browser-entry-module] を使用して（オプションで）再水和されます。

## `handleDataRequest`

データリクエストのレスポンスを変更できるオプションの `handleDataRequest` 関数をエクスポートできます。これらは HTML をレンダリングしないリクエストですが、クライアント側の水和が発生すると、ローダーとアクションのデータをブラウザに返します。

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

デフォルトでは、Remix は発生したサーバー側のエラーをコンソールに出力します。ログをさらに制御したい場合、またはこれらのエラーを外部サービスにも報告したい場合は、オプションの `handleError` 関数をエクスポートできます。この関数は制御を提供し、組み込みのエラーログを無効にします。

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

_リクエストが中止された場合は、一般的にログを避けるべきです。なぜなら、Remix のキャンセルと競合状態の処理によって、多くのリクエストが中止される可能性があるからです。_

### ストリーミングレンダリングエラー

[`renderToPipeableStream`][rendertopipeablestream] または [`renderToReadableStream`][rendertoreadablestream] を介して HTML レスポンスをストリーミングしている場合、独自の `handleError` 実装は、最初のシェルレンダリング中に発生したエラーのみを処理します。後続のストリーミングレンダリング中にレンダリングエラーが発生した場合は、Remix サーバーが既にレスポンスを送信しているため、これらのエラーを手動で処理する必要があります。

- `renderToPipeableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。エラーがシェルレンダリングエラー（無視できる）か、非同期レンダリングエラー（処理する必要がある）かを知るために、`onShellReady` でブール値を切り替える必要があります。
  - 例については、Node のデフォルトの [`entry.server.tsx`][node-streaming-entry-server] を参照してください。
- `renderToReadableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。
  - 例については、Cloudflare のデフォルトの [`entry.server.tsx`][cloudflare-streaming-entry-server] を参照してください。

### スローされたレスポンス

これは、`loader`/`action` 関数からスローされた `Response` インスタンスは処理しません。このハンドラーの意図は、予期せずスローされたエラーが発生するコード内のバグを見つけることです。`loader`/`action` でシナリオを検出して 401/404/などの `Response` をスローしている場合は、コードによって処理される予期されたフローです。これらのログを記録したり、外部サービスに送信したりする場合、レスポンスをスローしたときに実行する必要があります。

[browser-entry-module]: ./entry.client
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[node-streaming-entry-server]: https://github.com/remix-run/remix/blob/main/packages/remix-dev/config/defaults/entry.server.node.tsx
[cloudflare-streaming-entry-server]: https://github.com/remix-run/remix/blob/main/packages/remix-dev/config/defaults/entry.server.cloudflare.tsx



