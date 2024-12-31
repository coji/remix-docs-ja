---
title: パンくずリストガイド
---

# パンくずリストガイド

Remix では、ルート階層に基づいて動的なパンくずリストを簡単に構築できます。このガイドでは、[`useMatches`][use-matches] および [`handle`][handle] 機能を使用したプロセスについて説明します。

## 基本の理解

Remix は、React 要素ツリーの最上位で、すべてのルートマッチと関連データへのアクセスを提供します。これにより、[`<Meta />`][meta-component]、[`<Links />`][links-component]、および [`<Scripts />`][scripts-component] などのコンポーネントは、ネストされたルートから値を取得し、ドキュメントの最上位にレンダリングできます。

`useMatches` および `handle` 関数を使用して、同様の戦略を使用できます。ここではパンくずリストに焦点を当てていますが、ここで説明する原則は、さまざまなシナリオに適用できます。

## ルートのパンくずリストの定義

まず、ルートの `handle` に `breadcrumb` 属性を追加します。この属性は Remix に固有のものではありません。好きな名前を付けることができます。この例では、`breadcrumb` と呼びます。

```tsx filename=app/routes/parent.tsx
export const handle = {
  breadcrumb: () => <Link to="/parent">親ルート</Link>,
};
```

同様に、子ルートのパンくずリストを定義できます。

```tsx filename=app/routes/parent.child.tsx
export const handle = {
  breadcrumb: () => (
    <Link to="/parent/child">子ルート</Link>
  ),
};
```

## ルートルートでのパンくずリストの集約

次に、`useMatches` を使用してルートルートですべてをまとめます。

```tsx filename=app/root.tsx lines=[5,9,19-28]
import {
  Links,
  Scripts,
  useLoaderData,
  useMatches,
} from "@remix-run/react";

export default function Root() {
  const matches = useMatches();

  return (
    <html lang="en">
      <head>
        <Links />
      </head>
      <body>
        <header>
          <ol>
            {matches
              .filter(
                (match) =>
                  match.handle && match.handle.breadcrumb
              )
              .map((match, index) => (
                <li key={index}>
                  {match.handle.breadcrumb(match)}
                </li>
              ))}
          </ol>
        </header>
        <Outlet />
      </body>
    </html>
  );
}
```

`match` オブジェクトをパンくずリストに渡すことに注意してください。これにより、ルートのデータに基づいてパンくずリストの内容を強化するために `match.data` を利用できる可能性があります。この例では使用していませんが、パンくずリストにはローダーデータからの値を使用することをお勧めします。

`useMatches` を `handle` と共に使用すると、ルートが実際のレンダリングポイントよりも要素ツリーの上位のレンダリングプロセスに貢献するための堅牢な方法が提供されます。

## 追加リソース

- [`useMatches`][use-matches]
- [`handle`][handle]

[use-matches]: ../hooks/use-matches
[handle]: ../route/handle
[meta-component]: ../components/meta
[links-component]: ../components/links
[scripts-component]: ../components/scripts

