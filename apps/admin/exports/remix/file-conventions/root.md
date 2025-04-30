---
title: root
toc: false
---

# ルートルート

「ルート」ルート (`app/root.tsx`) は、Remix アプリケーションで _必須_ の唯一のルートです。これは、`routes/` ディレクトリ内のすべてのルートの親であり、ルート `<html>` ドキュメントのレンダリングを担当するためです。

それ以外は、ほとんど他のルートと同じであり、標準のルートエクスポートをすべてサポートしています。

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

ルートルートはドキュメントを管理するため、Remix が提供するいくつかの「ドキュメントレベル」コンポーネントをレンダリングするのに適切な場所です。これらのコンポーネントは、ルートルート内で一度だけ使用する必要があり、ページを正しくレンダリングするために Remix が把握または構築したすべてのものが含まれています。

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
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合は、`nonce` プロパティを指定する必要があります。それ以外の場合は、ここに示されているように nonce プロパティを省略してください。 */}
        <ScrollRestoration />

        {/* スクリプトタグがここに入ります */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合は、`nonce` プロパティを指定する必要があります。それ以外の場合は、ここに示されているように nonce プロパティを省略してください。 */}
        <Scripts />

        {/* コードを変更したときに自動リロードを設定します */}
        {/* 開発中にのみ機能します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合は、`nonce` プロパティを指定する必要があります。それ以外の場合は、ここに示されているように nonce プロパティを省略してください。 */}
        <LiveReload />
      </body>
    </html>
  );
}
```

## Layout エクスポート

ルートルートはすべてのルートのドキュメントを管理するため、追加のオプションの `Layout` エクスポートもサポートしています。この [RFC][layout-rfc] で詳細を読むことができますが、レイアウトルートには 2 つの目的があります。

- ルートコンポーネント、`HydrateFallback`、および `ErrorBoundary` 全体でドキュメント/「アプリシェル」を複製することを回避します。
- ルートコンポーネント/`HydrateFallback`/`ErrorBoundary` を切り替えるときに、React がアプリシェルの要素を再マウントすることを回避します。これにより、React が `<Links>` コンポーネントから `<link rel="stylesheet">` タグを削除して再追加すると、FOUC が発生する可能性があります。

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
        {/* children はルートコンポーネント、ErrorBoundary、または HydrateFallback になります */}
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
      <h1>エラー！</h1>
      <p>{error?.message ?? "不明なエラー"}</p>
    </>
  );
}
```

**`Layout` コンポーネントでの `useLoaderData` に関する注意**

`useLoaderData` は、ハッピーパスルートのレンダリングを目的としており、その型には `loader` が正常に実行されて何かを返したという組み込みの前提があるため、`ErrorBoundary` コンポーネントで使用することは許可されていません。その前提は、`loader` がスローして境界をトリガーした可能性があるため、`ErrorBoundary` では当てはまりません。`ErrorBoundary` でローダーデータにアクセスするには、ローダーデータが `undefined` になる可能性を考慮した `useRouteLoaderData` を使用できます。

`Layout` コンポーネントは成功フローとエラーフローの両方で使用されるため、この同じ制限が適用されます。成功したリクエストかどうかによって `Layout` のロジックを分岐する必要がある場合は、`useRouteLoaderData("root")` と `useRouteError()` を使用できます。

<docs-warn> `<Layout>` コンポーネントは `ErrorBoundary` のレンダリングに使用されるため、レンダリングエラーが発生することなく `ErrorBoundary` をレンダリングできるように、_非常に防御的_ である必要があります。`Layout` が境界をレンダリングしようとして別のエラーをスローした場合、それを使用することはできず、UI は非常に最小限の組み込みのデフォルト `ErrorBoundary` にフォールバックします。</docs-warn>

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

以下も参照してください。

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

