---
title: 特殊ファイル
---

# 特殊ファイル

React Routerは、プロジェクト内でいくつかの特殊ファイルを探します。これらのファイルはすべて必須ではありません。

## react-router.config.ts

**このファイルはオプションです**

設定ファイルは、サーバーサイドレンダリングを使用しているかどうか、特定のディレクトリの場所など、アプリの特定の側面を設定するために使用されます。

```tsx filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // 設定オプション...
} satisfies Config;
```

詳細は、[react-router設定API][react-router-config]を参照してください。

## root.tsx

**このファイルは必須です**

"ルート"ルート (`app/root.tsx`) は、React Routerアプリケーションで唯一の_必須_ルートです。これは、`routes/`ディレクトリ内のすべてのルートの親であり、ルートの`<html>`ドキュメントのレンダリングを担当します。

ルートルートはドキュメントを管理するため、React Routerが提供するいくつかの「ドキュメントレベル」コンポーネントをレンダリングする適切な場所です。これらのコンポーネントは、ルートルート内で一度使用され、ページが正しくレンダリングされるためにReact Routerが把握または構築したすべてのものを含みます。

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

        {/* すべてのルートのすべての`meta`エクスポートはここでレンダリングされます */}
        <Meta />

        {/* すべてのルートのすべての`link`エクスポートはここでレンダリングされます */}
        <Links />
      </head>
      <body>
        {/* 子ルートはここでレンダリングされます */}
        <Outlet />

        {/* クライアント側のトランジションのスクロール位置を管理します */}
        {/* スクリプトにnonceベースのコンテンツセキュリティポリシーを使用する場合は、`nonce`プロップを指定する必要があります。そうでない場合は、ここに示すようにnonceプロップを省略します。 */}
        <ScrollRestoration />

        {/* スクリプトタグはここにあります */}
        {/* スクリプトにnonceベースのコンテンツセキュリティポリシーを使用する場合は、`nonce`プロップを指定する必要があります。そうでない場合は、ここに示すようにnonceプロップを省略します。 */}
        <Scripts />
      </body>
    </html>
  );
}
```

### レイアウトエクスポート

ルートルートは、すべての[ルートモジュールエクスポート][route-module]をサポートしています。

ルートルートは、追加のオプションの`Layout`エクスポートもサポートしています。`Layout`コンポーネントは2つの目的を果たします。

1. ルートコンポーネント、`HydrateFallback`、`ErrorBoundary`全体でドキュメントの「アプリシェル」を複製することを避けます。
2. ルートコンポーネント/`HydrateFallback`/`ErrorBoundary`を切り替えるときに、Reactがアプリシェルの要素を再マウントするのを防ぎます。これにより、Reactが`<Links>`コンポーネントから`<link rel="stylesheet">`タグを削除して追加し直すと、FOUCが発生する可能性があります。

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
        {/* childrenは、ルートコンポーネント、ErrorBoundary、またはHydrateFallbackになります */}
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

**`Layout`コンポーネントでの`useLoaderData`に関するメモ**

`useLoaderData`は、`ErrorBoundary`コンポーネントでは使用できません。これは、ハッピーパスルートレンダリングを目的としており、その型定義には、`loader`が正常に実行され、何かを返したという組み込みの仮定があるためです。`loader`がスローして境界をトリガーした可能性があるため、`ErrorBoundary`ではこの仮定が成立しません！`ErrorBoundary`でローダーデータにアクセスするには、`useRouteLoaderData`を使用できます。これは、ローダーデータが`undefined`である可能性を考慮に入れています。

`Layout`コンポーネントは成功とエラーの両方でフローで使用されるため、この同じ制限が適用されます。成功したリクエストかどうかによって`Layout`のロジックを分岐する必要がある場合は、`useRouteLoaderData("root")`と`useRouteError()`を使用できます。

<docs-warn>`<Layout>`コンポーネントは`ErrorBoundary`のレンダリングに使用されるため、`ErrorBoundary`をレンダリング中にレンダリングエラーが発生しないように、_非常に防御的に_する必要があります。`Layout`が境界をレンダリングしようとして別のエラーをスローすると、使用できなくなり、UIは非常に最小限の組み込みデフォルト`ErrorBoundary`にフォールバックします。</docs-warn>

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

`routes.ts`ファイルは、どのURLパターンがどのルートモジュールにマッチングされるかを設定するために使用されます。

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

詳細は、[ルーティングガイド][routing]を参照してください。

## entry.client.tsx

**このファイルはオプションです**

デフォルトでは、React Routerはクライアントでのアプリのハイドレーションを処理します。次のコマンドでデフォルトのエントリクライアントファイルを表示できます。

```shellscript nonumber
react-router reveal
```

このファイルはブラウザのエントリポイントであり、[サーバーエントリモジュール][server-entry]でサーバーによって生成されたマークアップをハイドレートする役割を果たしますが、ここで他のクライアントサイドコードを初期化することもできます。

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

これはブラウザで最初に実行されるコードです。クライアントサイドライブラリを初期化したり、クライアント専用のプロバイダーを追加したりできます。

## entry.server.tsx

**このファイルはオプションです**

デフォルトでは、React RouterはHTTPレスポンスの生成を処理します。次のコマンドでデフォルトのエントリサーバーファイルを表示できます。

```shellscript nonumber
react-router reveal
```

このモジュールの`default`エクスポートは、HTTPステータス、ヘッダー、HTMLを含むレスポンスを作成できる関数であり、マークアップの生成とクライアントへの送信方法を完全に制御できます。

このモジュールは、現在のリクエストの`context`と`url`を使用して`<ServerRouter>`要素を使用して現在のページのマークアップをレンダリングする必要があります。このマークアップは（オプションで）、[クライアントエントリモジュール][client-entry]を使用してJavaScriptがブラウザにロードされた後に再ハイドレートされます。

### `handleDataRequest`

データリクエストのレスポンスを変更できるオプションの`handleDataRequest`関数をエクスポートできます。これらは、HTMLをレンダリングしないリクエストですが、クライアント側のハイドレーションが行われた後にローダーデータとアクションデータをブラウザに返します。

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

デフォルトでは、React Routerは発生したサーバー側のエラーをコンソールに出力します。ログをより詳細に制御したい場合、またはこれらのエラーを外部サービスにも報告したい場合は、オプションの`handleError`関数をエクスポートできます。これにより制御が可能になり（そして組み込みのエラーログは無効になります）。

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

_リクエストが中断された場合は一般的にログを避けることをお勧めします。React Routerの中止と競合状態の処理により、多くのリクエストが中断される可能性があるためです。_

### ストリーミングレンダリングエラー

[`renderToPipeableStream`][rendertopipeablestream]または[`renderToReadableStream`][rendertoreadablestream]を介してHTMLレスポンスをストリーミングしている場合、独自の`handleError`実装は、最初のシェルレンダリング中に発生したエラーのみを処理します。後続のストリーミングレンダリング中にレンダリングエラーが発生した場合、React Routerサーバーはその時点で既にレスポンスを送信しているため、これらのエラーを手動で処理する必要があります。

`renderToPipeableStream`では、`onError`コールバック関数でこれらのエラーを処理できます。`onShellReady`でブール値を切り替える必要があります。これにより、エラーがシェルレンダリングエラーであるか（無視できます）、非同期エラーであるかがわかります。

例については、Nodeのデフォルトの[`entry.server.tsx`][node-streaming-entry-server]を参照してください。

**スローされたレスポンス**

これは、`loader`/`action`関数からのスローされた`Response`インスタンスは処理しません。このハンドラの目的は、予期しないスローされたエラーにつながるコードのバグを見つけることです。シナリオを検出して`loader`/`action`で401/404などの`Response`をスローしている場合、それはコードによって処理される予期されるフローです。それらをログに記録したり、外部サービスに送信したりする場合も、レスポンスをスローした時点で実行する必要があります。

## `.server` モジュール

厳密には必須ではありませんが、`.server`モジュールは、モジュール全体をサーバー専用として明示的にマークする良い方法です。`.server`ファイルまたは`.server`ディレクトリ内のコードが誤ってクライアントモジュールグラフに含まれると、ビルドは失敗します。

```txt
app
├── .server 👈 このディレクトリ内のすべてのファイルをサーバー専用としてマークします
│   ├── auth.ts
│   └── db.ts
├── cms.server.ts 👈 このファイルをサーバー専用としてマークします
├── root.tsx
└── routes.ts
```

`.server`モジュールは、アプリディレクトリ内にある必要があります。

詳細については、サイドバーのルートモジュールセクションを参照してください。

## `.client` モジュール

一般的ではありませんが、ブラウザでモジュールサイドエフェクトを使用するファイルや依存関係がある場合があります。ファイル名に`*.client.ts`を使用するか、`.client`ディレクトリ内にファイルをネストして、サーバーバンドルから強制的に除外できます。

```ts filename=feature-check.client.ts
// これはサーバーを壊します
export const supportsVibrationAPI =
  "vibrate" in window.navigator;
```

このモジュールからエクスポートされた値はサーバー上ではすべて`undefined`であるため、それらを使用できる場所は[`useEffect`][use_effect]とクリックハンドラなどのユーザーイベントだけです。

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
[use_effect]: https://react.dev/reference/react/useEffect


