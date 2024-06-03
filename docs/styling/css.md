---
title: 通常のCSS
---

# 通常のCSS

Remixは、ネストされたルートと[`links`][links]を使用して、通常のCSSでアプリをスケールアップするのに役立ちます。

CSSのメンテナンスの問題は、いくつかの理由でWebアプリに忍び寄ってくる可能性があります。次のように知ることは困難になる可能性があります。

- CSSをいつどのようにロードするか。そのため、通常はすべてのページにロードされていました
- 使用しているクラス名とセレクターがアプリの他のUIを誤ってスタイル設定しているかどうか
- CSSソースコードが時間の経過とともに増加するにつれて、一部のルールがもはや使用されていないかどうか

Remixは、ルートベースのスタイルシートでこれらの問題を軽減します。ネストされたルートはそれぞれ、独自のスタイルシートをページに追加することができ、Remixは自動的にそれらをプリフェッチ、ロード、アンロードします。懸念範囲がアクティブなルートのみに限定されている場合、これらの問題のリスクは大幅に軽減されます。競合が発生する可能性があるのは、親ルートのスタイルだけです（それでも、親ルートもレンダリングしているので、競合が表示される可能性があります）。

<docs-warning> [Classic Remix Compiler][classic-remix-compiler]ではなく[Remix Vite][remix-vite]を使用している場合は、CSSインポートパスの末尾から`?url`を削除する必要があります。</docs-warning>

### ルートスタイル

各ルートは、ページにスタイルリンクを追加できます。たとえば、

```tsx filename=app/routes/dashboard.tsx
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "~/styles/dashboard.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];
```

```tsx filename=app/routes/dashboard.accounts.tsx
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "~/styles/accounts.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];
```

```tsx filename=app/routes/dashboard.sales.tsx
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "~/styles/sales.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];
```

これらのルートを考えると、この表は、特定のURLでどのCSSが適用されるかを示しています。

| URL                 | スタイルシート                    |
| ------------------- | ------------------------------ |
| /dashboard          | dashboard.css                  |
| /dashboard/accounts | dashboard.css<br/>accounts.css |
| /dashboard/sales    | dashboard.css<br/>sales.css    |

これは微妙なことですが、この小さな機能は、プレーンなスタイルシートを使用してアプリをスタイル設定する場合の多くの難しさを解消します。

### 共有コンポーネントスタイル

大小さまざまなWebサイトは通常、アプリの残りの部分で使用される共有コンポーネントセット（ボタン、フォーム要素、レイアウトなど）を持っています。Remixでプレーンスタイルシートを使用する場合、推奨される2つのアプローチがあります。

#### 共有スタイルシート

最初の方法は非常に簡単です。それらをすべて`app/root.tsx`に含まれる`shared.css`ファイルに入れます。これにより、コンポーネント自体がCSSコードを共有することが容易になり（そして、エディターが[カスタムプロパティ][custom-properties]などのインテリセンスを提供することもできます）、各コンポーネントはすでにJavaScriptで一意のモジュール名が必要なので、スタイルを一意のクラス名またはデータ属性にスコープできます。

```css filename=app/styles/shared.css
/* クラス名でスコープ */
.PrimaryButton {
  /* ... */
}

.TileGrid {
  /* ... */
}

/* または、classNameプロパティの連結を回避するためにデータ属性でスコープしますが、実際にはあなた次第です */
[data-primary-button] {
  /* ... */
}

[data-tile-grid] {
  /* ... */
}
```

このファイルは大きくなる可能性がありますが、アプリのすべてのルートで共有される単一のURLになります。

これにより、ルートがコンポーネントのスタイルを調整することも容易になり、コンポーネントに公式の新しいバリアントを追加する必要はありません。あなたは、それが`/accounts`ルート以外ではコンポーネントに影響を与えないことを知っています。

```css filename=app/styles/accounts.css
.PrimaryButton {
  background: blue;
}
```

#### スタイルの露出

2番目のアプローチは、コンポーネントごとに個別のCSSファイルを作成し、それらのスタイルをそれらを使用するルートに「公開する」ことです。

おそらく、`app/components/button/index.tsx`に`app/components/button/styles.css`にあるスタイルの`<Button>`と、それを拡張する`<PrimaryButton>`があります。

これらはルートではないことに注意してください。ただし、ルートのように`links`関数をエクスポートします。これを使用して、それらのスタイルを使用するルートに公開します。

```css filename=app/components/button/styles.css
[data-button] {
  border: solid 1px;
  background: white;
  color: #454545;
}
```

```tsx filename=app/components/button/index.tsx lines=[1,3,5-7]
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "./styles.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export const Button = React.forwardRef(
  ({ children, ...props }, ref) => {
    return <button {...props} ref={ref} data-button />;
  }
);
Button.displayName = "Button";
```

そして、それを拡張する`<PrimaryButton>`：

```css filename=app/components/primary-button/styles.css
[data-primary-button] {
  background: blue;
  color: white;
}
```

```tsx filename=app/components/primary-button/index.tsx lines=[3,8,15]
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import { Button, links as buttonLinks } from "../button";

import styles from "./styles.css?url";

export const links: LinksFunction = () => [
  ...buttonLinks(),
  { rel: "stylesheet", href: styles },
];

export const PrimaryButton = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <Button {...props} ref={ref} data-primary-button />
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";
```

プライマリボタンの`links`には、ベースボタンのリンクが含まれていることに注意してください。このようにして、`<PrimaryButton>`のコンシューマーは、その依存関係を知る必要はありません（JavaScriptインポートと同じです）。

これらのボタンはルートではなく、URLセグメントに関連付けられていないため、Remixはスタイルをいつプリフェッチ、ロード、またはアンロードするかを認識しません。コンポーネントを使用するルートにリンクを「公開する」必要があります。

`app/routes/_index.tsx`がプライマリボタンコンポーネントを使用することを考えてみましょう。

```tsx filename=app/routes/_index.tsx lines=[3-6,10]
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import {
  PrimaryButton,
  links as primaryButtonLinks,
} from "~/components/primary-button";
import styles from "~/styles/index.css?url";

export const links: LinksFunction = () => [
  ...primaryButtonLinks(),
  { rel: "stylesheet", href: styles },
];
```

これで、Remixは`button.css`、`primary-button.css`、およびルートの`index.css`のスタイルをプリフェッチ、ロード、およびアンロードできます。

これに対する最初の反応は、ルートが望んでいるよりも多くのことを知っておく必要があるということです。各コンポーネントはすでにインポートする必要があるため、新しい依存関係を導入しているわけではなく、単にアセットを取得するためのボイラープレートです。たとえば、次のような製品カテゴリページを考えてみましょう。

```tsx filename=app/routes/$category.tsx lines=[3-7]
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import { AddFavoriteButton } from "~/components/add-favorite-button";
import { ProductDetails } from "~/components/product-details";
import { ProductTile } from "~/components/product-tile";
import { TileGrid } from "~/components/tile-grid";
import styles from "~/styles/$category.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export default function Category() {
  const products = useLoaderData<typeof loader>();
  return (
    <TileGrid>
      {products.map((product) => (
        <ProductTile key={product.id}>
          <ProductDetails product={product} />
          <AddFavoriteButton id={product.id} />
        </ProductTile>
      ))}
    </TileGrid>
  );
}
```

コンポーネントのインポートはすでにそこにあり、アセットを公開するだけです。

```tsx filename=app/routes/$category.tsx
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import {
  AddFavoriteButton,
  links as addFavoriteLinks,
} from "~/components/add-favorite-button";
import {
  ProductDetails,
  links as productDetailsLinks,
} from "~/components/product-details";
import {
  ProductTile,
  links as productTileLinks,
} from "~/components/product-tile";
import {
  TileGrid,
  links as tileGridLinks,
} from "~/components/tile-grid";
import styles from "~/styles/$category.css?url";

export const links: LinksFunction = () => {
  return [
    ...tileGridLinks(),
    ...productTileLinks(),
    ...productDetailsLinks(),
    ...addFavoriteLinks(),
    { rel: "stylesheet", href: styles },
  ];
};

// ...
```

これは少しボイラープレートですが、次のようなことが可能になります。

- ネットワークタブを制御でき、CSS依存関係がコードで明確になります
- コンポーネントと共存するスタイル
- ロードされるCSSは、現在のページで使用されるCSSのみ
- ルートでコンポーネントが使用されない場合、そのCSSはページからアンロードされます
- Remixは、[`<Link prefetch>`][link]を使用して次のページにリンクすると、CSSをプリフェッチします
- コンポーネントのスタイルが変更されても、他のコンポーネントのブラウザとCDNキャッシュは、すべて独自のURLを持っているため壊れません
- コンポーネントのJavaScriptが変更されてもスタイルが変更されない場合、スタイルのキャッシュは壊れません

#### アセットプリロード

これらは単なる`<link>`タグなので、スタイルシートリンク以上のことができます。たとえば、要素のSVGアイコンの背景用のアセットプリロードを追加できます。

```css filename=app/components/copy-to-clipboard.css
[data-copy-to-clipboard] {
  background: url("/icons/clipboard.svg");
}
```

```tsx filename=app/components/copy-to-clipboard.tsx lines=[6-11]
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

import styles from "./styles.css?url";

export const links: LinksFunction = () => [
  {
    rel: "preload",
    href: "/icons/clipboard.svg",
    as: "image",
    type: "image/svg+xml",
  },
  { rel: "stylesheet", href: styles },
];

export const CopyToClipboard = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <Button {...props} ref={ref} data-copy-to-clipboard />
    );
  }
);
CopyToClipboard.displayName = "CopyToClipboard";
```

これにより、ネットワークタブでアセットが優先順位付けされるだけでなく、[`<Link prefetch>`][link]を使用してページにリンクすると、Remixは`preload`を`prefetch`に変換するため、SVGの背景は、次のルートのデータ、モジュール、スタイルシート、およびその他のプリロードと並行してプリフェッチされます。

### リンクメディアクエリ

プレーンなスタイルシートと`<link>`タグを使用すると、ユーザーのブラウザが画面をペイントする場合に、ブラウザが処理する必要があるCSSの量を減らすこともできます。リンクタグは`media`をサポートしているので、次のようなことができます。

```tsx lines=[10,15,20]
export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: mainStyles,
    },
    {
      rel: "stylesheet",
      href: largeStyles,
      media: "(min-width: 1024px)",
    },
    {
      rel: "stylesheet",
      href: xlStyles,
      media: "(min-width: 1280px)",
    },
    {
      rel: "stylesheet",
      href: darkStyles,
      media: "(prefers-color-scheme: dark)",
    },
  ];
};
```

[links]: ../route/links
[custom-properties]: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
[link]: ../components/link
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite


