---
title: entry.server.tsx
order: 5
---

# entry.server.tsx

[MODES: framework]

## 概要

このファイルは、あなたの React Router アプリケーションがサーバー上で HTTP レスポンスを生成する方法を制御する、サーバーサイドのエントリーポイントです。

このモジュールは、現在のリクエストに対する `context` と `url` を [`<ServerRouter>`][serverrouter] 要素とともに使用して、現在のページのマークアップをレンダリングする必要があります。このマークアップは、ブラウザで JavaScript が読み込まれると、[クライアントエントリーモジュール][client-entry]を使用して（オプションで）再ハイドレーションされます。

<docs-info>このファイルは、Node で実行している場合はオプションです。存在しない場合、[デフォルトの実装][node-streaming-entry-server]が使用されます。
<br/>
<br/>
他のランタイム（例: Cloudflare）を使用している場合は、このファイルを含める必要があります。[テンプレートリポジトリ][templates-repo]でサンプル実装を見つけることができます。</docs-info>

## `entry.server.tsx` の生成

Node で実行している場合、React Router が HTTP レスポンスの生成を処理します。デフォルトのエントリーサーバーファイルは、以下で表示できます。

```shellscript nonumber
npx react-router reveal
```

## エクスポート

### `default`

このモジュールの `default` エクスポートは、HTTP ステータス、ヘッダー、HTML を含むレスポンスを作成できる関数であり、マークアップが生成されクライアントに送信される方法を完全に制御できます。

```tsx filename=app/entry.server.tsx
import { PassThrough } from "node:stream";
import type { EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { renderToPipeableStream } from "react-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter
        context={routerContext}
        url={request.url}
      />,
      {
        onShellReady() {
          responseHeaders.set("Content-Type", "text/html");

          const body = new PassThrough();
          const stream =
            createReadableStreamFromReadable(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
      },
    );
  });
}
```

### `streamTimeout`

レスポンスを[ストリーミング]している場合、オプションの `streamTimeout` 値（ミリ秒単位）をエクスポートできます。これは、サーバーがストリーミングされた Promise が解決されるのを待つ時間を制御し、未解決の Promise を拒否してストリームを閉じる前にその時間を設定します。

この値を、React レンダラーを中止する際のタイムアウトとは切り離すことをお勧めします。React のレンダリングタイムアウトは常に、`streamTimeout` からの基盤となる拒否をストリーミングする時間を確保できるように、より高い値に設定する必要があります。

```tsx lines=[1-2,13-15]
// Reject all pending promises from handler functions after 10 seconds
export const streamTimeout = 10000;

export default function handleRequest(...) {
  return new Promise((resolve, reject) => {
    // ...

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      { /* ... */ }
    );

    // Abort the streaming render pass after 11 seconds to allow the rejected
    // boundaries to be flushed
    setTimeout(abort, streamTimeout + 1000);
  });
}
```

### `handleDataRequest`

データリクエストのレスポンスを変更できるオプションの `handleDataRequest` 関数をエクスポートできます。これらは HTML をレンダリングせず、クライアントサイドのハイドレーションが発生した後、`loader` および `action` データをブラウザに返すリクエストです。

```tsx
export function handleDataRequest(
  response: Response,
  {
    request,
    params,
    context,
  }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  response.headers.set("X-Custom-Header", "value");
  return response;
}
```

### `handleError`

デフォルトでは、React Router は発生したサーバーサイドのエラーをコンソールにログ出力します。ロギングをより詳細に制御したい場合、またはこれらのエラーを外部サービスにも報告したい場合は、制御を可能にするオプションの `handleError` 関数をエクスポートできます（そして、組み込みのエラーロギングは無効になります）。

```tsx
export function handleError(
  error: unknown,
  {
    request,
    params,
    context,
  }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  if (!request.signal.aborted) {
    sendErrorToErrorReportingService(error);
    console.error(formatErrorForJsonLogging(error));
  }
}
```

_リクエストが中止されたときにロギングを避けるのが一般的であることに注意してください。React Router のキャンセル処理と競合状態の処理により、多くのリクエストが中止される可能性があるためです。_

**ストリーミングレンダリングエラー**

[`renderToPipeableStream`][rendertopipeablestream] または [`renderToReadableStream`][rendertoreadablestream] を介して HTML レスポンスをストリーミングしている場合、独自の `handleError` 実装は初期のシェルレンダリング中に発生したエラーのみを処理します。後続のストリーミングレンダリング中にレンダリングエラーが発生した場合、React Router サーバーはその時点で既にレスポンスを送信しているため、これらのエラーは手動で処理する必要があります。

`renderToPipeableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。エラーがシェルレンダリングエラー（無視できる）なのか、非同期エラーなのかを知るために、`onShellReady` で boolean を切り替える必要があります。

例については、Node のデフォルトの [`entry.server.tsx`][node-streaming-entry-server] を参照してください。

**スローされたレスポンス**

これは、`loader`/`action` 関数からスローされた `Response` インスタンスを処理しないことに注意してください。このハンドラーの意図は、予期しないスローされたエラーを引き起こすコードのバグを見つけることです。シナリオを検出し、`loader`/`action` で 401/404 などの `Response` をスローしている場合、それはコードによって処理される予期されたフローです。それらをログに記録したり、外部サービスに送信したりしたい場合も、レスポンスをスローする時点で行うべきです。

[client-entry]: ./entry.client.tsx
[serverrouter]: ../framework-routers/ServerRouter
[streaming]: ../../how-to/suspense
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[node-streaming-entry-server]: https://github.com/remix-run/react-router/blob/dev/packages/react-router-dev/config/defaults/entry.server.node.tsx
[templates-repo]: https://github.com/remix-run/react-router-templates