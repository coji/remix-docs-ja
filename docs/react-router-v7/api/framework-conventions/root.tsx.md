---
title: root.tsx
order: 1
---

# root.tsx

[MODES: framework]

## 概要

<docs-info>
このファイルは必須です
</docs-info>

"root" ルート (`app/root.tsx`) は、React Router アプリケーションにおいて唯一の _必須_ ルートです。なぜなら、すべてのルートの親であり、ルートの `<html>` ドキュメントのレンダリングを担当するからです。

```tsx filename=app/root.tsx
import { Outlet, Scripts } from "react-router";

import "./global-styles.css";

export default function App() {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

## レンダリングするコンポーネント

ルートルートはドキュメントを管理するため、React Router が提供するいくつかの「ドキュメントレベル」コンポーネントをレンダリングするのに適切な場所です。これらのコンポーネントはルートルート内で一度だけ使用され、ページが適切にレンダリングされるために React Router が特定または構築したすべてを含みます。

```tsx filename=app/root.tsx
import {
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>
      <body>
        {/* 子ルートはここにレンダリングされます */}
        <Outlet />

        {/* クライアントサイドの遷移におけるスクロール位置を管理します */}
        {/* スクリプトにnonceベースのコンテンツセキュリティポリシーを使用する場合、`nonce`プロップを提供する必要があります。そうでない場合は、ここに示されているようにnonceプロップを省略してください。 */}
        <ScrollRestoration />

        {/* スクリプトタグはここに入ります */}
        {/* スクリプトにnonceベースのコンテンツセキュリティポリシーを使用する場合、`nonce`プロップを提供する必要があります。そうでない場合は、ここに示されているようにnonceプロップを省略してください。 */}
        <Scripts />
      </body>
    </html>
  );
}
```

React 19 を使用していない場合、または React の [`<link>`][react-link]、[`<title>`][react-title]、[`<meta>`][react-meta] コンポーネントを使用せず、代わりに React Router の [`links`][react-router-links] および [`meta`][react-router-meta] エクスポートに依存している場合は、ルートルートに以下を追加する必要があります。

```tsx filename=app/root.tsx
import { Links, Meta } from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        {/* すべてのルートのすべての`meta`エクスポートはここにレンダリングされます */}
        <Meta />

        {/* すべてのルートのすべての`link`エクスポートはここにレンダリングされます */}
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## レイアウトのエクスポート

ルートルートはすべての [ルートモジュールエクスポート][route-module] をサポートしています。

ルートルートは、追加のオプションの `Layout` エクスポートもサポートしています。`Layout` コンポーネントには2つの目的があります。

1. ルートコンポーネント、`HydrateFallback`、および `ErrorBoundary` 間でドキュメントの「アプリシェル」の重複を避ける
2. ルートコンポーネント/`HydrateFallback`/`ErrorBoundary` 間を切り替える際に、React がアプリシェル要素を再マウントするのを防ぐ。これにより、React が `<Links>` コンポーネントから `<link rel="stylesheet">` タグを削除したり再追加したりすると、FOUC（Flash of Unstyled Content）が発生する可能性があります。

`Layout` は単一の `children` プロップを受け取ります。これは `default` エクスポート（例: `App`）、`HydrateFallback`、または `ErrorBoundary` です。

```tsx filename=app/root.tsx
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
        {/* children はルートコンポーネント、ErrorBoundary、またはHydrateFallbackになります */}
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

**`Layout` コンポーネントにおける `useLoaderData` についての注意**

`useLoaderData` は、正常なルートレンダリングを意図しており、その型定義には `loader` が正常に実行され、何かを返したという組み込みの仮定があるため、`ErrorBoundary` コンポーネントでの使用は許可されていません。`ErrorBoundary` では、`loader` がエラーをスローして境界をトリガーした可能性があるため、この仮定は成り立ちません！`ErrorBoundary` でローダーデータにアクセスするには、ローダーデータが `undefined` である可能性を考慮した `useRouteLoaderData` を使用できます。

`Layout` コンポーネントは成功時とエラー時の両方のフローで使用されるため、この同じ制限が適用されます。`Layout` で、リクエストが成功したかどうかに応じてロジックを分岐させる必要がある場合は、`useRouteLoaderData("root")` と `useRouteError()` を使用できます。

<docs-warn>あなたの `<Layout>` コンポーネントは `ErrorBoundary` のレンダリングに使用されるため、レンダリングエラーに遭遇することなく `ErrorBoundary` をレンダリングできることを _非常に慎重に_ 確認する必要があります。もし `Layout` が境界をレンダリングしようとして別のエラーをスローした場合、それは使用できなくなり、UIは非常に最小限の組み込みのデフォルト `ErrorBoundary` にフォールバックします。</docs-warn>

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

[route-module]: ../../start/framework/route-module
[react-link]: https://react.dev/reference/react-dom/components/link
[react-meta]: https://react.dev/reference/react-dom/components/meta
[react-title]: https://react.dev/reference/react-dom/components/title
[react-router-links]: ../../start/framework/route-module#links
[react-router-meta]: ../../start/framework/route-module#meta