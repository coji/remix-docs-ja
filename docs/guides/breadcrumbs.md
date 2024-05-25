---
title: パンくずリストガイド
---

# パンくずリストガイド

Remixでは、ルート階層に基づいて動的なパンくずリストを簡単に構築できます。このガイドでは、[`useMatches`][use-matches] と [`handle`][handle] 機能を使用してそのプロセスを説明します。

## 基本の理解

Remixは、React要素ツリーの最上位で、すべてのルートマッチと関連データへのアクセスを提供します。これにより、[`<Meta />`][meta-component]、[`<Links />`][links-component]、[`<Scripts />`][scripts-component]などのコンポーネントは、ネストされたルートから値を取得し、ドキュメントの最上位にレンダリングできます。

`useMatches` と `handle` 関数を使用すると、同様の戦略を使用できます。パンくずリストに焦点を当てていますが、ここで示した原則は、さまざまなシナリオに適用できます。

## ルートのパンくずリストの定義

ルートの `handle` に `breadcrumb` 属性を追加することから始めます。この属性はRemix固有のものではありません。好きな名前をつけることができます。この例では、`breadcrumb` と呼びます。

```tsx filename=app/routes/parent.tsx
export const handle = {
  breadcrumb: () => <Link to="/parent">Some Route</Link>,
};
```

同様に、子ルートのパンくずリストを定義できます。

```tsx filename=app/routes/parent.child.tsx
export const handle = {
  breadcrumb: () => (
    <Link to="/parent/child">Child Route</Link>
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

パンくずリストに `match` オブジェクトを渡すことにより、`match.data` を使用して、ルートのデータに基づいてパンくずリストの内容を強化できることに注意してください。この例では使用されていませんが、パンくずリストにローダーデータの値を使用したいでしょう。

`useMatches` を `handle` と共に使用すると、ルートが要素ツリーの実際のレンダリングポイントよりも上位のレンダリングプロセスに貢献するための堅牢な方法が提供されます。

## さらなるリソース

- [`useMatches`][use-matches]
- [`handle`][handle]

[use-matches]: ../hooks/use-matches
[handle]: ../route/handle
[meta-component]: ../components/meta
[links-component]: ../components/links
[scripts-component]: ../components/scripts
