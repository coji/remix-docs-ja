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

「root」route (`app/root.tsx`) は、すべての route の親であり、root の `<html>` ドキュメントのレンダリングを担当するため、React Router アプリケーションで唯一 _必須_ の route です。

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

root route はドキュメントを管理するため、React Router が提供するいくつかの「ドキュメントレベル」のコンポーネントをレンダリングするのに適切な場所です。これらのコンポーネントは root route 内で一度使用され、ページが適切にレンダリングされるために React Router が見つけ出した、または構築したすべてを含みます。

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
        {/* 子 route はここにレンダリングされます */}
        <Outlet />

        {/* クライアントサイドのトランジションでのスクロール位置を管理します */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合、`nonce` prop を指定する必要があります。それ以外の場合は、ここに示されているように nonce prop を省略してください。 */}
        <ScrollRestoration />

        {/* スクリプトタグはここに入ります */}
        {/* スクリプトに nonce ベースのコンテンツセキュリティポリシーを使用する場合、`nonce` prop を指定する必要があります。それ以外の場合は、ここに示されているように nonce prop を省略してください。 */}
        <Scripts />
      </body>
    </html>
  );
}
```

React 19 を使用していない場合、または React の [`<link>`][react-link]、[`<title>`][react-title]、および [`<meta>`][react-meta] コンポーネントを使用しないことを選択し、代わりに React Router の [`links`][react-router-links] および [`meta`][react-router-meta] export に依存している場合は、root route に以下を追加する必要があります。

```tsx filename=app/root.tsx
import { Links, Meta } from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        {/* すべての route の `meta` export はここにレンダリングされます */}
        <Meta />

        {/* すべての route の `link` export はここにレンダリングされます */}
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

## Layout Export

root route はすべての [route module export][route-module] をサポートしています。

root route は、追加のオプションの `Layout` export もサポートしています。`Layout` コンポーネントには 2 つの目的があります。

1. root コンポーネント、`HydrateFallback`、および `ErrorBoundary` 全体でドキュメントの「app shell」が重複するのを避ける
2. root コンポーネント / `HydrateFallback` / `ErrorBoundary` 間を切り替えるときに React が app shell 要素を再マウントするのを防ぐ。これにより、React が `<Links>` コンポーネントから `<link rel="stylesheet">` タグを削除して再度追加すると、FOUC が発生する可能性があります。

`Layout` は単一の `children` prop を受け取ります。これは `default` export (例: `App`)、`HydrateFallback`、または `ErrorBoundary` のいずれかです。

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
        {/* children は、root Component、ErrorBoundary、または HydrateFallback になります */}
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

**`Layout` コンポーネントにおける `useLoaderData` に関する注意点**

`useLoaderData` は `ErrorBoundary` コンポーネントでの使用が許可されていません。これは、正常な route レンダリングを意図しており、その型定義には `loader` が正常に実行され何かを返したという組み込みの前提があるためです。`loader` がエラーをスローして境界をトリガーした可能性があるため、`ErrorBoundary` ではその前提は成り立ちません！`ErrorBoundary` で loader data にアクセスするには、loader data が `undefined` である可能性を考慮する `useRouteLoaderData` を使用できます。

`Layout` コンポーネントは成功フローとエラーフローの両方で使用されるため、同じ制限が適用されます。`Layout` 内で、それが成功したリクエストであるかどうかに応じてロジックを分岐させる必要がある場合は、`useRouteLoaderData("root")` と `useRouteError()` を使用できます。

<docs-warn> `<Layout>` コンポーネントは `ErrorBoundary` のレンダリングに使用されるため、レンダリングエラーなしで `ErrorBoundary` をレンダリングできるように _非常に注意深く_ 確認する必要があります。`Layout` が境界をレンダリングしようとして別のエラーをスローすると、使用できなくなり、UI は非常に最小限の組み込みのデフォルト `ErrorBoundary` にフォールバックします。</docs-warn>

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