---
title: root
toc: false
---

# ルートルート

"ルート" ルート (`app/root.tsx`) は、`routes/` ディレクトリ内のすべてのルートの親であり、ルート `<html>` ドキュメントのレンダリングを担当するため、Remix アプリケーションで唯一 _必須_ のルートです。

それ以外では、ほとんど他のルートと同じように、標準的なルートのエクスポートをすべてサポートしています。

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

ルートルートはドキュメントを管理するため、Remix が提供するいくつかの "ドキュメントレベル" コンポーネントをレンダリングするのに適した場所です。これらのコンポーネントは、ルートルート内で一度使用され、ページを正しくレンダリングするために Remix が判別または構築したすべてのものを含んでいます。

```tsx filename=app/root.tsx
import type { LinksFunction } from "@remix-run/node"; // または cloudflare/deno
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

        {/* クライアント側の遷移のスクロール位置を管理します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合、`nonce` プロップを指定する必要があります。そうでない場合は、ここで示すように、nonce プロップを省略してください。 */}
        <ScrollRestoration />

        {/* スクリプトタグがここにあります */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合、`nonce` プロップを指定する必要があります。そうでない場合は、ここで示すように、nonce プロップを省略してください。 */}
        <Scripts />

        {/* コードを変更すると自動的に再読み込みされます */}
        {/* 開発時にのみ動作します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合、`nonce` プロップを指定する必要があります。そうでない場合は、ここで示すように、nonce プロップを省略してください。 */}
        <LiveReload />
      </body>
    </html>
  );
}
```

## レイアウトエクスポート

ルートルートはすべてのルートのドキュメントを管理するため、追加のオプションの `Layout` エクスポートもサポートしています。この [RFC][layout-rfc] で詳細を読むことができますが、レイアウトルートは 2 つの目的を果たします。

- ルートコンポーネント、`HydrateFallback`、および `ErrorBoundary` にわたってドキュメント/ "アプリシェル" を複製しないようにします。
- React がルートコンポーネント/`HydrateFallback`/`ErrorBoundary` 間を切り替えるときにアプリシェルの要素を再マウントしないようにします。これは、React が `<Links>` コンポーネントから `<link rel="stylesheet">` タグを削除して再追加した場合、FOUC が発生する可能性があります。

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
        {/* children は、ルートコンポーネント、ErrorBoundary、または HydrateFallback です */}
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

**`Layout` コンポーネントでの `useLoaderData` に関する注意**

`useLoaderData` は、`ErrorBoundary` コンポーネントで使用することはできません。これは、ハッピーパスルートのレンダリングを目的としており、その型には、`loader` が正常に実行されて何かを返したという組み込みの仮定があるためです。その仮定は、`ErrorBoundary` では成り立ちません。これは、`loader` がエラーをスローして境界をトリガーしている可能性があるためです。`ErrorBoundary` でローダーデータにアクセスするには、`useRouteLoaderData` を使用できます。これは、ローダーデータが `undefined` になる可能性を考慮しています。

`Layout` コンポーネントは成功フローとエラーフローの両方で使用されるため、この同じ制限が適用されます。`Layout` で成功したリクエストかどうかに応じてロジックを分岐する必要がある場合は、`useRouteLoaderData("root")` と `useRouteError()` を使用できます。

<docs-warn>`<Layout>` コンポーネントは `ErrorBoundary` をレンダリングするために使用されるため、レンダリングエラーが発生しないように、非常に防御的にする必要があります。`Layout` が境界をレンダリングしようとして別のエラーをスローした場合、`Layout` は使用できず、UI は非常に最小限の組み込みのデフォルト `ErrorBoundary` にフォールバックします。</docs-warn>

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

