---
title: 通常のCSS
---

# 通常のCSS

Remixは、ネストされたルートと [`links`][links] を使用して、通常のCSSでアプリをスケールアップするのに役立ちます。

CSSのメンテナンスの問題は、いくつかの理由でウェブアプリに忍び寄る可能性があります。以下を知ることは困難になる可能性があります。

- いつ、どのようにCSSをロードするか。そのため、通常はすべてのページでロードされていました
- 使用しているクラス名やセレクターが、アプリ内の他のUIを誤ってスタイル設定していないか
- CSSソースコードが時間の経過とともに増えるにつれて、一部のルールがもはや使用されなくなったかどうか

Remixは、ルートベースのスタイルシートによってこれらの問題を軽減します。ネストされたルートはそれぞれ、ページに独自のスタイルシートを追加することができ、Remixは自動的にそれらをprefetch、ロード、アンロードします。懸念の範囲がアクティブなルートのみに制限されている場合、これらの問題のリスクは大幅に軽減されます。競合が発生する可能性があるのは、親ルートのスタイルだけです（それでも、親ルートもレンダリングされているため、競合が見られる可能性があります）。

<docs-warning> [Classic Remix Compiler][classic-remix-compiler]ではなく[Remix Vite][remix-vite]を使用している場合は、CSSインポートパスの末尾から`?url`を削除する必要があります。</docs-warning>

### ルートスタイル

各ルートはページにスタイルリンクを追加できます。たとえば、次のようになります。

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

これらのルートを考えると、この表は特定のURLでどのCSSが適用されるかを示しています。

| URL                 | スタイルシート                    |
| ------------------- | ------------------------------ |
| /dashboard          | dashboard.css                  |
| /dashboard/accounts | dashboard.css<br/>accounts.css |
| /dashboard/sales    | dashboard.css<br/>sales.css    |

微妙ですが、この小さな機能は、プレーンなスタイルシートでアプリをスタイル設定する際の多くの困難を解消します。

### 共有コンポーネントのスタイル

ウェブサイトは、大小にかかわらず、アプリ全体で使用される共有コンポーネントのセット（ボタン、フォーム要素、レイアウトなど）を持っています。Remixでプレーンなスタイルシートを使用する場合、推奨される2つのアプローチがあります。

#### 共有スタイルシート

最初の方法は非常に簡単です。すべてを `app/root.tsx` に含まれる `shared.css` ファイルに入れます。これにより、コンポーネント自体がCSSコードを簡単に共有できるようになり（エディターは[カスタムプロパティ][custom-properties]などのインテリセンスを提供します）、各コンポーネントはすでにJavaScriptで一意のモジュール名が必要となるため、スタイルを一意のクラス名またはデータ属性にスコープすることができます。

```css filename=app/styles/shared.css
/* クラス名でスコープ */
.PrimaryButton {
  /* ... */
}

.TileGrid {
  /* ... */
}

/* または、className propsの連結を避けるためにデータ属性でスコープしますが、実際にはあなた次第です */
[data-primary-button] {
  /* ... */
}

[data-tile-grid] {
  /* ... */
}
```

このファイルは大きくなる可能性がありますが、アプリ内のすべてのルートで共有される単一のURLにあります。

これにより、ルートは、コンポーネントのAPIに公式の新しいバリアントを追加する必要なく、コンポーネントのスタイルを簡単に調整することもできます。`/accounts`ルート以外では、コンポーネントに影響を与えないことがわかっています。

```css filename=app/styles/accounts.css
.PrimaryButton {
  background: blue;
}
```

#### スタイルを公開する

2番目のアプローチは、コンポーネントごとに個別のcssファイルを記述し、使用しているルートにスタイルを「公開する」ことです。

たとえば、`app/components/button/index.tsx` に `<Button>` があり、`app/components/button/styles.css` にスタイルがある場合、それを拡張する `<PrimaryButton>` もあります。

これらはルートではないことに注意してください。しかし、ルートであるかのように `links` 関数をエクスポートしています。これは、スタイルをそれらを使用するルートに公開するために使用します。

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

そして、それを拡張する `<PrimaryButton>` です。

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

プライマリボタンの `links` には、ベースボタンのリンクが含まれていることに注意してください。これにより、`<PrimaryButton>` の利用者はその依存関係を知る必要がありません（JavaScriptのインポートと同じように）。

これらのボタンはルートではないため、URLセグメントに関連付けられていません。そのため、Remixはいつスタイルをprefetch、ロード、アンロードするかを知りません。コンポーネントを使用するルートにリンクを「公開する」必要があります。

`app/routes/_index.tsx` がプライマリボタンコンポーネントを使用していることを考えてみてください。

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

これで、Remixは `button.css`、`primary-button.css`、ルートの `index.css` のスタイルをprefetch、ロード、アンロードできます。

これに対する最初の反応は、ルートが望む以上のものを知る必要があるということです。各コンポーネントはすでにインポートされている必要があることに注意してください。そのため、新しい依存関係が導入されるのではなく、アセットを取得するためのボイラープレートを追加するだけです。たとえば、次のような製品カテゴリページを考えてみてください。

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

コンポーネントのインポートはすでにあります。アセットを公開するだけです。

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

これはボイラープレートですが、多くのことを可能にします。

- ネットワークタブを制御でき、CSSの依存関係はコード内で明確になります
- コンポーネントと共存するスタイル
- ロードされるCSSは、現在のページで使用されているCSSだけです
- ルートでコンポーネントが使用されない場合、そのCSSはページからアンロードされます
- Remixは、[`<Link prefetch>`][link] を使用して次のページにリンクすると、CSSをprefetchします。そのため、SVGの背景は、次のルートのデータ、モジュール、スタイルシート、および他のprefetchと並行してprefetchされます。
- コンポーネントのJavaScriptが変更されてもスタイルが変更されなければ、スタイルのキャッシュは破損しません。
- コンポーネントのJavaScriptが変更されてもスタイルが変更されなければ、スタイルのキャッシュは破損しません。

#### アセットのプリロード

これらは単なる `<link>` タグなので、スタイルシートリンク以外にも、要素のSVGアイコンの背景のアセットプリロードを追加できます。

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

これにより、アセットはネットワークタブで優先順位が高くなるだけでなく、[`<Link prefetch>`][link] を使用してページにリンクすると、Remixは `preload` を `prefetch` に変換します。そのため、SVGの背景は、次のルートのデータ、モジュール、スタイルシート、および他のプリロードと並行してprefetchされます。

### リンクメディアクエリ

プレーンなスタイルシートと `<link>` タグを使用すると、ユーザーのブラウザが画面をペイントする際に処理する必要があるCSSの量を減らすことができます。リンクタグは `media` をサポートしているため、次のようにすることができます。

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

