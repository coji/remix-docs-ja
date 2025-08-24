---
title: Regular CSS
---

# 通常のCSS

Remixは、ネストされたルートと[`links`][links]を使って、通常のCSSでアプリをスケールさせるのに役立ちます。

CSSのメンテナンスの問題は、いくつかの理由でWebアプリに忍び寄ることがあります。以下のことが分かりにくくなる可能性があります。

* CSSをどのように、いつロードするか。そのため、通常はすべてのページでロードされていました。
* 使用しているクラス名とセレクターが、アプリ内の他のUIを誤ってスタイルしているかどうか。
* CSSのソースコードが時間とともに増えるにつれて、一部のルールがもはや使用されていないかどうか。

Remixは、ルートベースのスタイルシートでこれらの問題を軽減します。ネストされたルートはそれぞれ独自のスタイルシートをページに追加でき、Remixはルートとともに自動的にプリフェッチ、ロード、アンロードを行います。関心の範囲がアクティブなルートのみに限定されると、これらの問題のリスクは大幅に軽減されます。競合の可能性は、親ルートのスタイルとの間のみです（それでも、親ルートもレンダリングされているため、競合が発生する可能性が高いです）。

<docs-warning>[Remix Vite][remix-vite]ではなく、[Classic Remix Compiler][classic-remix-compiler]を使用している場合は、CSSインポートパスの末尾から`?url`を削除する必要があります。</docs-warning>

### ルートのスタイル

各ルートは、ページにスタイルリンクを追加できます。例を以下に示します。

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

これらのルートが与えられた場合、次の表は特定のURLでどのCSSが適用されるかを示しています。

| URL                 | スタイルシート                    |
| ------------------- | ------------------------------ |
| /dashboard          | dashboard.css                  |
| /dashboard/accounts | dashboard.css<br/>accounts.css |
| /dashboard/sales    | dashboard.css<br/>sales.css    |

これは微妙な点ですが、この小さな機能により、プレーンなスタイルシートでアプリをスタイリングする際の多くの困難が解消されます。

### 共有コンポーネントのスタイル

大小を問わず、ウェブサイトには通常、アプリ全体で使用される共有コンポーネントのセットがあります。ボタン、フォーム要素、レイアウトなどです。Remixでプレーンなスタイルシートを使用する場合、推奨されるアプローチが2つあります。

#### 共有スタイルシート

最初のアプローチは非常にシンプルです。すべてのスタイルを `app/root.tsx` に含まれる `shared.css` ファイルにまとめます。これにより、コンポーネント自体が CSS コードを共有しやすくなり（また、エディターが[カスタムプロパティ][custom-properties]のようなものに対してインテリセンスを提供できるようになります）、各コンポーネントはすでに JavaScript で一意のモジュール名を必要とするため、スタイルを一意のクラス名またはデータ属性にスコープすることができます。

```css filename=app/styles/shared.css
/* クラス名でスコープ */
.PrimaryButton {
  /* ... */
}

.TileGrid {
  /* ... */
}

/* または、className プロパティを連結するのを避けるためにデータ属性でスコープ
   ただし、これは完全にあなた次第です */
[data-primary-button] {
  /* ... */
}

[data-tile-grid] {
  /* ... */
}
```

このファイルは大きくなる可能性がありますが、アプリ内のすべてのルートで共有される単一の URL になります。

また、これにより、ルートがコンポーネントの API に公式の新しいバリアントを追加する必要なく、コンポーネントのスタイルを調整することも簡単になります。`/accounts` ルート以外ではコンポーネントに影響を与えないことがわかります。

```css filename=app/styles/accounts.css
.PrimaryButton {
  background: blue;
}
```

#### スタイルの表面化

2つ目のアプローチは、コンポーネントごとに個別のCSSファイルを作成し、それらのスタイルを使用するルートに「表面化」させることです。

例えば、`app/components/button/index.tsx` に `<Button>` があり、`app/components/button/styles.css` にスタイルがあり、それを拡張する `<PrimaryButton>` があるとします。

これらはルートではありませんが、ルートであるかのように `links` 関数をエクスポートします。これを使用して、スタイルを使用するルートにスタイルを表面化します。

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

そして、それを拡張する `<PrimaryButton>`:

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

プライマリボタンの `links` には、ベースボタンのリンクが含まれていることに注意してください。これにより、`<PrimaryButton>` の利用者は、その依存関係を知る必要がありません（JavaScriptのインポートと同様）。

これらのボタンはルートではなく、したがってURLセグメントに関連付けられていないため、Remixはいつスタイルをプリフェッチ、ロード、またはアンロードするかを認識しません。コンポーネントを使用するルートにリンクを「表面化」する必要があります。

`app/routes/_index.tsx` がプライマリボタンコンポーネントを使用しているとします。

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

これで、Remixは `button.css`、`primary-button.css`、およびルートの `index.css` のスタイルをプリフェッチ、ロード、およびアンロードできます。

これに対する最初の反応は、ルートが望むよりも多くのことを知る必要があるということです。各コンポーネントはすでにインポートされている必要があることを覚えておいてください。つまり、新しい依存関係を導入するのではなく、アセットを取得するためのボイラープレートを導入するだけです。たとえば、次のような製品カテゴリページを考えてみましょう。

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

コンポーネントのインポートはすでに存在するため、アセットを表面化するだけです。

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

これは少しボイラープレートですが、多くのことを可能にします。

* ネットワークタブを制御し、CSSの依存関係がコードで明確になります。
* コンポーネントとスタイルを同じ場所に配置します。
* ロードされるCSSは、現在のページで使用されているCSSのみです。
* コンポーネントがルートで使用されていない場合、そのCSSはページからアンロードされます。
* Remixは、[`<Link prefetch>`][link]を使用して、次のページのCSSをプリフェッチします。
* あるコンポーネントのスタイルが変更されても、他のコンポーネントのブラウザとCDNキャッシュは、すべて独自のURLを持っているため、壊れません。
* コンポーネントのJavaScriptが変更されても、スタイルが変更されない場合、スタイルのキャッシュは壊れません。

#### アセットのプリロード

これらは単なる `<link>` タグなので、スタイルシートのリンクだけでなく、要素の SVG アイコン背景のアセットプリロードを追加するなど、さまざまなことができます。

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

これにより、ネットワークタブでアセットの優先度が高くなるだけでなく、Remix は、[`<Link prefetch>`][link] を使用してページにリンクすると、その `preload` を `prefetch` に変換します。これにより、SVG 背景は、次のルートのデータ、モジュール、スタイルシート、およびその他のプリロードと並行してプリフェッチされます。

### メディアクエリをリンクする

プレーンなスタイルシートと `<link>` タグを使用すると、ユーザーのブラウザが画面をペイントする際に処理する必要がある CSS の量を減らすこともできます。リンクタグは `media` をサポートしているため、次のように記述できます。

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
