---
title: ルート
toc: false
---

# ルートルート

"ルート" ルート (`app/root.tsx`) は、Remix アプリケーションで唯一 _必須_ のルートです。これは、`routes/` ディレクトリ内のすべてのルートの親であり、ルート `<html>` ドキュメントのレンダリングを担当します。

それ以外では、他のルートとほとんど同じで、すべての標準ルートエクスポートをサポートしています。

- [`headers`][headers]
- [`meta`][meta]
- [`links`][links]
- [`loader`][loader]
- [`clientLoader`][clientloader]
- [`action`][action]
- [`clientAction`][clientaction]
- [`default`][component]
- [`ErrorBoundary`][errorboundary]
- [`HydrateFallback`][hydratefallback]
- [`handle`][handle]
- [`shouldRevalidate`][shouldrevalidate]

ルートルートはドキュメントを管理するため、Remix が提供するいくつかの "ドキュメントレベル" コンポーネントをレンダリングする適切な場所です。これらのコンポーネントは、ルートルート内で 1 回だけ使用され、ページが正しくレンダリングされるために Remix が把握した情報や構築した情報が含まれています。

```tsx filename=app/root.tsx
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import globalStylesheetUrl from "./global-styles.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: globalStylesheetUrl }];
};

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

        {/* クライアント側のトランジションのスクロール位置を管理します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用している場合は、`nonce` プロップを提供する必要があります。それ以外の場合は、ここに示すように nonce プロップを省略してください。 */}
        <ScrollRestoration />

        {/* スクリプトタグはここにあります */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用している場合は、`nonce` プロップを提供する必要があります。それ以外の場合は、ここに示すように nonce プロップを省略してください。 */}
        <Scripts />

        {/* コードを変更すると自動的にリロードされます */}
        {/* 開発中はのみ機能します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用している場合は、`nonce` プロップを提供する必要があります。それ以外の場合は、ここに示すように nonce プロップを省略してください。 */}
        <LiveReload />
      </body>
    </html>
  );
}
```

## レイアウトエクスポート

ルートルートはすべてのルートのドキュメントを管理するため、追加のオプションの `Layout` エクスポートもサポートしています。詳細については、この [RFC][layout-rfc] を参照してください。レイアウトルートには、2 つの目的があります。

- ルートコンポーネント、`HydrateFallback`、`ErrorBoundary` でドキュメント/"アプリシェル" を複製しない。
- React がルートコンポーネント/`HydrateFallback`/`ErrorBoundary` 間を切り替える際にアプリシェル要素を再マウントしないようにします。これは、React が `<Links>` コンポーネントから `<link rel="stylesheet">` タグを削除して再追加すると FOUC が発生する可能性があるためです。

```tsx filename=app/root.tsx lines=[10-31]
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

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
        {/* children は、ルートコンポーネント、ErrorBoundary、または HydrateFallback になります */}
        {children}
        <Scripts />
        <ScrollRestoration />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  return (
    <>
      <h1>Error!</h1>
      <p>{error?.message ?? "Unknown error"}</p>
    </>
  );
}
```

**`Layout` コンポーネントにおける `useLoaderData` について**

`useLoaderData` は、`ErrorBoundary` コンポーネントで使用することはできません。これは、ハッピーパスのルートレンダリングを目的としており、その型定義には、`loader` が正常に実行され、何かを返したという前提が組み込まれているためです。この前提は、`ErrorBoundary` では成立しません。これは、`loader` がエラーをスローして境界をトリガーした可能性があるためです。`ErrorBoundary` でローダーデータにアクセスするには、`useRouteLoaderData` を使用できます。これは、ローダーデータが `undefined` になる可能性を考慮しています。

`Layout` コンポーネントは成功フローとエラーフローの両方で使用されるため、同じ制限が適用されます。成功したリクエストかどうかで `Layout` 内のロジックを分岐する必要がある場合は、`useRouteLoaderData("root")` と `useRouteError()` を使用できます。

<docs-warn>`<Layout>` コンポーネントは `ErrorBoundary` のレンダリングに使用されるため、レンダリングエラーが発生しないように _非常に防御的_ である必要があります。`Layout` が境界のレンダリングを試みて別のエラーをスローした場合、`Layout` を使用することはできず、UI は非常に最小限の組み込みのデフォルト `ErrorBoundary` にフォールバックします。</docs-warn>

```tsx filename="app/root.tsx" lines=[6-7,19-29,32-34]
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

関連項目:

- [`<Meta>`][meta-component]
- [`<Links>`][links-component]
- [`<Outlet>`][outlet-component]
- [`<ScrollRestoration>`][scrollrestoration-component]
- [`<Scripts>`][scripts-component]
- [`<LiveReload>`][livereload-component]

[headers]: ../route/headers
[meta]: ../route/meta
[links]: ../route/links
[loader]: ../route/loader
[clientloader]: ../route/client-loader
[action]: ../route/action
[clientaction]: ../route/client-action
[component]: ../route/component
[errorboundary]: ../route/error-boundary
[hydratefallback]: ../route/hydrate-fallback
[handle]: ../route/handle
[shouldrevalidate]: ../route/should-revalidate
[layout-rfc]: https://github.com/remix-run/remix/discussions/8702
[scripts-component]: ../components/scripts
[links-component]: ../components/links
[meta-component]: ../components/meta
[livereload-component]: ../components/live-reload
[scrollrestoration-component]: ../components/scroll-restoration
[outlet-component]: ../components/outlet


