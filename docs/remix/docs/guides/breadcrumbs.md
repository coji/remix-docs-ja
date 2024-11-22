---
title: ブレッドクラムガイド
---

# ブレッドクラムガイド

Remixでは、ルート階層に基づいて動的なブレッドクラムを簡単に構築できます。このガイドでは、[`useMatches`][use-matches]と[`handle`][handle]機能を使用してそのプロセスを説明します。

## 基本の理解

Remixは、React要素ツリーの一番上で、すべてのルートマッチとその関連データへのアクセスを提供します。これにより、[`<Meta />`][meta-component]、[`<Links />`][links-component]、[`<Scripts />`][scripts-component]などのコンポーネントは、ネストされたルートから値を取得し、ドキュメントの一番上にレンダリングできます。

`useMatches`と`handle`関数を用いて同様の戦略を使用できます。ブレッドクラムに焦点を当てていますが、ここで示す原則は、さまざまなシナリオに適用できます。


## ルートのブレッドクラムの定義

ルートの`handle`に`breadcrumb`属性を追加することから始めます。この属性はRemix固有のものではなく、好きな名前を付けることができます。この例では`breadcrumb`と呼びます。

```tsx filename=app/routes/parent.tsx
export const handle = {
  breadcrumb: () => <Link to="/parent">Some Route</Link>,
};
```

同様に、子ルートのブレッドクラムを定義できます。

```tsx filename=app/routes/parent.child.tsx
export const handle = {
  breadcrumb: () => (
    <Link to="/parent/child">Child Route</Link>
  ),
};
```

## ルートルートでのブレッドクラムの集約

次に、`useMatches`を使用してルートルートですべてをまとめます。

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

`match`オブジェクトをブレッドクラムに渡すことに注意してください。これにより、ルートのデータに基づいてブレッドクラムの内容を強化するために`match.data`を利用できる可能性があります。この例では使用していませんが、ブレッドクラムにはローダーデータの値を使用する必要があるでしょう。

`handle`と共に`useMatches`を使用すると、ルートが実際のレンダリングポイントよりも上位の要素ツリーでのレンダリングプロセスに貢献するための堅牢な方法が提供されます。

## 追加のリソース

- [`useMatches`][use-matches]
- [`handle`][handle]

[use-matches]: ../hooks/use-matches
[handle]: ../route/handle
[meta-component]: ../components/meta
[links-component]: ../components/links
[scripts-component]: ../components/scripts

