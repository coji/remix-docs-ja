---
title: entry.server.tsx
order: 5
---

# entry.server.tsx

[MODES: framework]

## Summary

<docs-info>
このファイルはオプションです
</docs-info>

このファイルは、React Routerアプリケーションがサーバー上でHTTPレスポンスを生成する方法を制御するサーバーサイドのエントリーポイントです。

このモジュールは、現在のリクエストの`context`と`url`を使用して、[`<ServerRouter>`][serverrouter]要素で現在のページのマークアップをレンダリングする必要があります。このマークアップは、ブラウザでJavaScriptがロードされた後、[クライアントエントリーモジュール][client-entry]を使用して（オプションで）再ハイドレートされます。

## `entry.server.tsx`の生成

デフォルトでは、React RouterがHTTPレスポンスの生成を処理します。以下のコマンドでデフォルトのエントリーサーバーファイルを表示できます。

```shellscript nonumber
npx react-router reveal
```

## Exports

### `default`

このモジュールの`default`エクスポートは、HTTPステータス、ヘッダー、HTMLを含むレスポンスを作成できる関数であり、マークアップが生成されクライアントに送信される方法を完全に制御できます。

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
  routerContext: EntryContext
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
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
      }
    );
  });
}
```

### `streamTimeout`

レスポンスを[ストリーミング]している場合、オプションの`streamTimeout`値（ミリ秒単位）をエクスポートできます。これは、未処理のプロミスを拒否してストリームを閉じる前に、サーバーがストリーミングされたプロミスが解決するのを待つ時間を制御します。

この値をReactレンダラーを中止するタイムアウトから切り離すことをお勧めします。Reactレンダリングのタイムアウトは常に高い値に設定し、`streamTimeout`からの基になる拒否をストリームダウンする時間を与えるべきです。

```tsx lines=[1-2,13-15]
// 10秒後にハンドラー関数からの保留中のすべてのプロミスを拒否します
export const streamTimeout = 10000;

export default function handleRequest(...) {
  return new Promise((resolve, reject) => {
    // ...

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      { /* ... */ }
    );

    // 拒否された境界がフラッシュされるように、11秒後にストリーミングレンダリングパスを中止します
    setTimeout(abort, streamTimeout + 1000);
  });
}
```

### `handleDataRequest`

オプションの`handleDataRequest`関数をエクスポートすることで、データリクエストのレスポンスを変更できます。これらはHTMLをレンダリングせず、クライアントサイドのハイドレーションが発生した後に`loader`および`action`データをブラウザに返すリクエストです。

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

### `handleError`

デフォルトでは、React Routerは発生したサーバーサイドエラーをコンソールにログ出力します。ロギングをより細かく制御したい場合、またはこれらのエラーを外部サービスに報告したい場合は、オプションの`handleError`関数をエクスポートできます。これにより制御が可能になり（そして組み込みのエラーロギングは無効になります）。

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

*リクエストが中止された場合、React Routerのキャンセルと競合状態の処理により多くのリクエストが中止される可能性があるため、通常はロギングを避けるべきであることに注意してください。*

__ストリーミングレンダリングエラー__

[`renderToPipeableStream`][rendertopipeablestream]または[`renderToReadableStream`][rendertoreadablestream]を介してHTMLレスポンスをストリーミングしている場合、独自の`handleError`実装は、初期シェルレンダリング中に発生したエラーのみを処理します。その後のストリーミングレンダリング中にレンダリングエラーが発生した場合、React Routerサーバーはすでにその時点でレスポンスを送信しているため、これらのエラーを手動で処理する必要があります。

`renderToPipeableStream`の場合、これらのエラーは`onError`コールバック関数で処理できます。エラーがシェルレンダリングエラーであったか（無視できる）、または非同期であったかを知るために、`onShellReady`でブール値を切り替える必要があります。例については、Nodeのデフォルトの[`entry.server.tsx`][node-streaming-entry-server]を参照してください。

__スローされたレスポンス__

これは、`loader`/`action`関数からスローされた`Response`インスタンスを処理しないことに注意してください。このハンドラーの意図は、予期しないスローされたエラーを引き起こすコードのバグを見つけることです。シナリオを検出し、`loader`/`action`で401/404などの`Response`をスローしている場合、それはコードによって処理される予期されたフローです。それらをログに記録したり、外部サービスに送信したりしたい場合は、レスポンスをスローする時点で行うべきです。

[client-entry]: ./entry.client.tsx
[serverrouter]: ../components/ServerRouter
[streaming]: ../how-to/suspense
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[node-streaming-entry-server]: https://github.com/remix-run/react-router/blob/dev/packages/react-router-dev/config/defaults/entry.server.node.tsx