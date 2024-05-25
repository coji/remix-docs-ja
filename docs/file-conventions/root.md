---
title: ルート
toc: false
---

# ルートルート

"ルート" ルート (`app/root.tsx`) は、Remix アプリケーションで _必須_ のルートです。これは、`routes/` ディレクトリ内のすべてのルートの親であり、ルート `<html>` ドキュメントのレンダリングを担当します。

それ以外では、他のルートとほとんど同じで、標準のルートエクスポートをすべてサポートしています。

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

ルートルートはドキュメントを管理するため、Remix が提供するいくつかの "ドキュメントレベル" のコンポーネントを適切な場所にレンダリングする場所です。これらのコンポーネントは、ルートルート内で 1 回のみ使用され、ページが正しくレンダリングされるために Remix が理解または構築したすべてのものを含みます。

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
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用している場合、`nonce` プロップを指定する必要があります。そうでない場合は、ここに示されているように nonce プロップを省略します。 */}
        <ScrollRestoration />

        {/* スクリプトタグがここにあります */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用している場合、`nonce` プロップを指定する必要があります。そうでない場合は、ここに示されているように nonce プロップを省略します。 */}
        <Scripts />

        {/* コードを変更すると自動的にリロードされます */}
        {/* 開発中のみ何かを実行します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用している場合、`nonce` プロップを指定する必要があります。そうでない場合は、ここに示されているように nonce プロップを省略します。 */}
        <LiveReload />
      </body>
    </html>
  );
}
```

## レイアウトエクスポート

ルートルートはすべてのルートのドキュメントを管理するため、追加のオプションの `Layout` エクスポートもサポートしています。この [RFC][layout-rfc] で詳細を読むことができますが、レイアウトルートは 2 つの目的を果たします。

- ルートコンポーネント、`HydrateFallback`、および `ErrorBoundary` でドキュメント/"アプリシェル" を複製しないようにします
- React がルートコンポーネント/`HydrateFallback`/`ErrorBoundary` 間で切り替えるときにアプリシェル要素を再マウントしないようにします。これは、React が `<Links>` コンポーネントから `<link rel="stylesheet">` タグを削除して再追加すると、FOUC が発生する可能性があります。

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

**`Layout` コンポーネントの `useLoaderData` についての注意**

`useLoaderData` は `ErrorBoundary` コンポーネントで使用することはできません。これは、ハッピーパスのルートレンダリング用であり、その型付けは `loader` が正常に実行されて何かを返したという組み込みの仮定を持っているためです。この仮定は `ErrorBoundary` では成立しません。なぜなら、境界をトリガーしたのは `loader` である可能性があるためです！`ErrorBoundary` でローダーデータにアクセスするには、`useRouteLoaderData` を使用できます。これは、ローダーデータが `undefined` になる可能性を考慮します。

`Layout` コンポーネントは成功とエラーの両方でフローに使用されるため、同じ制限が適用されます。`Layout` で、それが成功した要求だったのかどうかによってロジックを分岐させる必要がある場合は、`useRouteLoaderData("root")` と `useRouteError()` を使用できます。

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

参照：

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


