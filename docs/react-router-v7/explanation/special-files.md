---
title: 特殊なファイル
---

# 特殊なファイル

React Router がプロジェクト内で探すいくつかの特別なファイルがあります。これらのファイルはすべて必須ではありません。

## react-router.config.ts

**このファイルはオプションです**

設定ファイルは、サーバーサイドレンダリングを使用しているかどうか、特定のディレクトリの場所など、アプリの特定の側面を設定するために使用されます。

```tsx filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // 設定オプション...
} satisfies Config;
```

詳細については、[react-router config API][react-router-config] を参照してください。

## root.tsx

**このファイルは必須です**

「ルート」ルート (`app/root.tsx`) は、React Router アプリケーションで _必須_ の唯一のルートです。これは、`routes/` ディレクトリ内のすべてのルートの親であり、ルートの `<html>` ドキュメントのレンダリングを担当するためです。

ルートルートはドキュメントを管理するため、React Router が提供するいくつかの「ドキュメントレベル」コンポーネントをレンダリングするのに適切な場所です。これらのコンポーネントは、ルートルート内で一度だけ使用する必要があり、ページが適切にレンダリングされるために React Router が把握または構築したすべてのものが含まれています。

```tsx filename=app/root.tsx
import type { LinksFunction } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./global-styles.css";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        {/* すべてのルートのすべての `meta` エクスポートがここにレンダリングされます */}
        <Meta />

        {/* すべてのルートのすべての `link` エクスポートがここにレンダリングされます */}
        <Links />
      </head>
      <body>
        {/* 子ルートがここにレンダリングされます */}
        <Outlet />

        {/* クライアントサイドのトランジションのスクロール位置を管理します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合は、`nonce` プロパティを指定する必要があります。それ以外の場合は、ここに示されているように nonce プロパティを省略してください。 */}
        <ScrollRestoration />

        {/* スクリプトタグがここに入ります */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合は、`nonce` プロパティを指定する必要があります。それ以外の場合は、ここに示されているように nonce プロパティを省略してください。 */}
        <Scripts />
      </body>
    </html>
  );
}
```

### Layout エクスポート

ルートルートは、すべての [ルートモジュールエクスポート][route-module] をサポートしています。

ルートルートは、追加のオプションの `Layout` エクスポートもサポートしています。`Layout` コンポーネントには 2 つの目的があります。

1. ドキュメントの「アプリシェル」をルートコンポーネント、`HydrateFallback`、および `ErrorBoundary` 全体で重複させないようにする
2. ルートコンポーネント/`HydrateFallback`/`ErrorBoundary` を切り替えるときに、React がアプリシェルの要素を再マウントするのを防ぎます。これにより、React が `<Links>` コンポーネントから `<link rel="stylesheet">` タグを削除して再追加すると、FOUC が発生する可能性があります。

```tsx filename=app/root.tsx lines=[10-31]
export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* children はルートコンポーネント、ErrorBoundary、または HydrateFallback になります */}
        {children}
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {}
```

**`Layout` コンポーネントでの `useLoaderData` に関する注意**

`useLoaderData` は、ハッピーパスのルートレンダリングを目的としており、その型定義には `loader` が正常に実行され、何かを返したという組み込みの前提があるため、`ErrorBoundary` コンポーネントで使用することは許可されていません。その前提は、`loader` がスローして境界をトリガーした可能性があるため、`ErrorBoundary` では当てはまりません。`ErrorBoundary` でローダーデータにアクセスするには、ローダーデータが `undefined` になる可能性を考慮した `useRouteLoaderData` を使用できます。

`Layout` コンポーネントは成功とエラーの両方のフローで使用されるため、この同じ制限が適用されます。リクエストが成功したかどうかによって `Layout` のロジックを分岐する必要がある場合は、`useRouteLoaderData("root")` と `useRouteError()` を使用できます。

<docs-warn> `<Layout>` コンポーネントは `ErrorBoundary` のレンダリングに使用されるため、レンダリングエラーが発生することなく `ErrorBoundary` をレンダリングできるように、_非常に防御的_ である必要があります。`Layout` が境界をレンダリングしようとして別のエラーをスローした場合、それを使用することはできず、UI は非常に最小限の組み込みのデフォルトの `ErrorBoundary` にフォールバックします。</docs-warn>

```tsx filename=app/root.tsx lines=[6-7,19-29,32-34]
export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = useRouteLoaderData("root");
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --themeVar: ${
                  data?.themeVar || defaultThemeVar
                }
              }
            `,
          }}
        />
      </head>
      <body>
        {data ? (
          <Analytics token={data.analyticsToken} />
        ) : null}
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## routes.ts

**このファイルは必須です**

`routes.ts` ファイルは、どの URL パターンがどのルートモジュールに一致するかを設定するために使用されます。

```tsx filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("some/path", "./some/file.tsx"),
  // パターン ^           ^ モジュールファイル
] satisfies RouteConfig;
```

詳細については、[ルーティングガイド][routing] を参照してください。

## entry.client.tsx

**このファイルはオプションです**

デフォルトでは、React Router はクライアントでのアプリのハイドレーションを処理します。次のコマンドを使用して、デフォルトのエントリクライアントファイルを表示できます。

```shellscript nonumber
react-router reveal
```

このファイルはブラウザのエントリポイントであり、[サーバーエントリモジュール][server-entry] でサーバーによって生成されたマークアップをハイドレートする役割を担っていますが、他のクライアントサイドコードをここで初期化することもできます。

```tsx filename=app/entry.client.tsx
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
```

これは、ブラウザで最初に実行されるコードです。クライアントサイドライブラリを初期化したり、クライアントのみのプロバイダーを追加したりできます。

## entry.server.tsx

**このファイルはオプションです**

デフォルトでは、React Router は HTTP レスポンスの生成を処理します。次のコマンドを使用して、デフォルトのエントリサーバーファイルを表示できます。

```shellscript nonumber
react-router reveal
```

このモジュールの `default` エクスポートは、HTTP ステータス、ヘッダー、HTML を含むレスポンスを作成できる関数であり、マークアップが生成されてクライアントに送信される方法を完全に制御できます。

このモジュールは、現在のリクエストの `context` と `url` を持つ `<ServerRouter>` 要素を使用して、現在のページのマークアップをレンダリングする必要があります。このマークアップは、[クライアントエントリモジュール][client-entry] を使用してブラウザで JavaScript がロードされると、（オプションで）再ハイドレートされます。

### `streamTimeout`

レスポンスを [ストリーミング] している場合は、ストリーミングされた Promise が解決されるのをサーバーが待機する時間（ミリ秒単位）を制御するオプションの `streamTimeout` 値をエクスポートできます。この時間を過ぎると、未解決の Promise が拒否され、ストリームが閉じられます。

この値を、React レンダラーを中止するタイムアウトから切り離すことをお勧めします。React レンダリングタイムアウトは、`streamTimeout` からの基になる拒否をストリームダウンする時間があるように、常に高い値に設定する必要があります。

```tsx lines=[1-2,13-15]
// 10 秒後にハンドラー関数からの保留中のすべての Promise を拒否します
export const streamTimeout = 10000;

export default function handleRequest(...) {
  return new Promise((resolve, reject) => {
    // ...

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      { /* ... */ }
    );

    // 拒否された境界をフラッシュできるように、11 秒後にストリーミングレンダリングパスを中止します
    setTimeout(abort, streamTimeout + 1000);
  });
}
```

### `handleDataRequest`

オプションの `handleDataRequest` 関数をエクスポートして、データリクエストのレスポンスを変更できます。これらは HTML をレンダリングするのではなく、クライアントサイドのハイドレーションが発生した後にローダーとアクションデータをブラウザに返すリクエストです。

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

デフォルトでは、React Router は発生したサーバーサイドエラーをコンソールに記録します。ログ記録をより詳細に制御したい場合、またはこれらのエラーを外部サービスにも報告したい場合は、オプションの `handleError` 関数をエクスポートできます。これにより、制御が可能になり（組み込みのエラーログが無効になります）。

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

_React Router のキャンセルと競合状態の処理により、多くのリクエストが中止される可能性があるため、リクエストが中止された場合は一般的にログ記録を避ける必要があります。_

### ストリーミングレンダリングエラー

[`renderToPipeableStream`][rendertopipeablestream] または [`renderToReadableStream`][rendertoreadablestream] を介して HTML レスポンスをストリーミングしている場合、独自の `handleError` 実装は、最初のシェルレンダリング中に発生したエラーのみを処理します。後続のストリーミングレンダリング中にレンダリングエラーが発生した場合は、React Router サーバーがその時点でレスポンスを送信済みであるため、これらのエラーを手動で処理する必要があります。

`renderToPipeableStream` の場合、これらのエラーは `onError` コールバック関数で処理できます。エラーがシェルレンダリングエラー（無視できる）か、非同期エラーかを知るために、`onShellReady` でブール値を切り替える必要があります。

例については、Node のデフォルトの [`entry.server.tsx`][node-streaming-entry-server] を参照してください。

**スローされたレスポンス**

これは、`loader`/`action` 関数からスローされた `Response` インスタンスを処理しないことに注意してください。このハンドラーの目的は、予期しないスローされたエラーにつながるコードのバグを見つけることです。シナリオを検出して、`loader`/`action` で 401/404/などの `Response` をスローする場合は、コードによって処理される予期されたフローです。ログに記録したり、外部サービスに送信したりする場合は、レスポンスをスローするときに行う必要があります。

## `.server` モジュール

厳密には必須ではありませんが、`.server` モジュールは、モジュール全体をサーバー専用として明示的にマークするのに適した方法です。
`.server` ファイルまたは `.server` ディレクトリ内のコードが誤ってクライアントモジュールグラフに含まれると、ビルドは失敗します。

```txt
app
├── .server 👈 このディレクトリ内のすべてのファイルをサーバー専用としてマークします
│   ├── auth.ts
│   └── db.ts
├── cms.server.ts 👈 このファイルをサーバー専用としてマークします
├── root.tsx
└── routes.ts
```

`.server` モジュールは、アプリディレクトリ内にある必要があります。

詳細については、サイドバーのルートモジュールセクションを参照してください。

## `.client` モジュール

一般的ではありませんが、ブラウザでモジュール副作用を使用するファイルまたは依存関係がある場合があります。ファイル名に `*.client.ts` を使用するか、`.client` ディレクトリ内にファイルをネストして、サーバーバンドルから強制的に除外できます。

```ts filename=feature-check.client.ts
// これはサーバーを壊します
export const supportsVibrationAPI =
  "vibrate" in window.navigator;
```

このモジュールからエクスポートされた値はすべてサーバーでは `undefined` になるため、それらを使用できる場所は [`useEffect`][use_effect] やクリックハンドラーなどのユーザーイベントのみであることに注意してください。

```ts
import { supportsVibrationAPI } from "./feature-check.client.ts";

console.log(supportsVibrationAPI);
// サーバー: undefined
// クライアント: true | false
```

[react-router-config]: https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html
[route-module]: ../start/framework/route-module
[routing]: ../start/framework/routing
[server-entry]: #entryservertsx
[client-entry]: #entryclienttsx
[rendertopipeablestream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[rendertoreadablestream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[node-streaming-entry-server]: https://github.com/remix-run/react-router/blob/dev/packages/react-router-dev/config/defaults/entry.server.node.tsx
[streaming]: ../how-to/suspense
[use_effect]: https://react.dev/reference/react/useEffect

