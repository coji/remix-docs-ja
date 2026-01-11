---
title: handle の使用
---

# `handle` の使用

[MODES: framework]

<br/>
<br/>

[`useMatches`][use-matches] hook と [`handle`][handle] ルートエクスポートを使用して、ルート階層に基づいてパンくずリストのような動的な UI 要素を構築できます。

## 基本を理解する

React Router は、コンポーネントツリー全体で、すべてのルートマッチとそのデータへのアクセスを提供します。これにより、ルートは `handle` エクスポートを介してメタデータを提供し、祖先コンポーネントによってレンダリングされることが可能になります。

`useMatches` hook と `handle` エクスポートを組み合わせることで、ルートは実際のレンダリングポイントよりもコンポーネントツリーの上位でレンダリングプロセスに貢献できます。パンくずリストを例として使用しますが、このパターンは、ルートが祖先に付加情報を提供する必要があるあらゆるシナリオで機能します。

## ルートの `handle` を定義する

以下のようなルート構造を使用します。

```ts filename=app/routes.ts
import { route } from "@react-router/dev/routes";

export default [
  route("parent", "./routes/parent.tsx", [
    route("child", "./routes/child.tsx"),
  ]),
] satisfies RouteConfig;
```

"parent" ルートの `handle` エクスポートに `breadcrumb` プロパティを追加します。このプロパティの名前は、ユースケースに合わせて意味のあるものにすることができます。

```tsx filename=app/routes/parent.tsx
import { Link } from "react-router";

export const handle = {
  breadcrumb: () => <Link to="/parent">Some Route</Link>,
};
```

子ルートのパンくずリストも定義できます。

```tsx filename=app/routes/child.tsx
import { Link } from "react-router";

export const handle = {
  breadcrumb: () => (
    <Link to="/parent/child">Child Route</Link>
  ),
};
```

## ルートの `handle` を使用する

ルートレイアウトまたは任意の祖先コンポーネントで `useMatches` hook を使用して、`handle` エクスポートで定義されたコンポーネントを収集し、レンダリングします。

```tsx filename=app/root.tsx lines=[7,11,22-31]
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "react-router";

export function Layout({ children }) {
  const matches = useMatches();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <ol>
            {matches
              .filter(
                (match) =>
                  match.handle && match.handle.breadcrumb,
              )
              .map((match, index) => (
                <li key={index}>
                  {match.handle.breadcrumb(match)}
                </li>
              ))}
          </ol>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
```

`match` オブジェクトは各パンくずリスト関数に渡され、`match.data` (loader から) やその他のルート情報にアクセスできるようになるため、ルートのデータに基づいて動的なパンくずリストを作成できます。

このパターンは、ルートが祖先コンポーネントによって消費およびレンダリングできるメタデータを提供するクリーンな方法を提供します。

## その他のリソース

- [`useMatches`][use-matches]
- [`handle`][handle]

[use-matches]: ../api/hooks/useMatches
[handle]: ../start/framework/route-module#handle