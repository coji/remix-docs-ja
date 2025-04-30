---
title: links
---

# `links`

`links` 関数は、ユーザーがルートにアクセスしたときにページに追加する [`<link>` 要素][link-element] を定義します。

```tsx
import type { LinksFunction } from "@remix-run/node"; // または cloudflare/deno

export const links: LinksFunction = () => {
  return [
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
    },
    {
      rel: "stylesheet",
      href: "https://example.com/some/styles.css",
    },
    { page: "/users/123" },
    {
      rel: "preload",
      href: "/images/banner.jpg",
      as: "image",
    },
  ];
};
```

返せるリンク記述子には2つのタイプがあります。

#### `HtmlLinkDescriptor`

これは、通常の `<link {...props} />` 要素のオブジェクト表現です。[link API の MDN ドキュメントを参照してください][link-element]。

ルートからの `links` エクスポートは、`HtmlLinkDescriptor` オブジェクトの配列を返す必要があります。

例：

```tsx
import type { LinksFunction } from "@remix-run/node"; // または cloudflare/deno

import stylesHref from "../styles/something.css";

export const links: LinksFunction = () => {
  return [
    // ファビコンを追加
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
    },

    // 外部スタイルシートを追加
    {
      rel: "stylesheet",
      href: "https://example.com/some/styles.css",
      crossOrigin: "anonymous",
    },

    // ローカルスタイルシートを追加。remix は本番環境でのキャッシュのためにファイル名をフィンガープリントします。
    { rel: "stylesheet", href: stylesHref },

    // ユーザーがこのページを操作する際に表示される可能性の高い画像をブラウザキャッシュにプリフェッチします。
    // たとえば、サマリー/詳細要素で表示するためにボタンをクリックするかもしれません。
    {
      rel: "prefetch",
      as: "image",
      href: "/img/bunny.jpg",
    },

    // より大きな画面の場合のみプリフェッチします。
    {
      rel: "prefetch",
      as: "image",
      href: "/img/bunny.jpg",
      media: "(min-width: 1000px)",
    },
  ];
};
```

#### `PageLinkDescriptor`

これらの記述子を使用すると、ユーザーが移動する可能性の高いページのプリフェッチを行うことができます。この API は便利ですが、代わりに `<Link prefetch="render">` を使用する方が効果的かもしれません。ただし、必要であれば、この API で同じ動作を実現できます。

```tsx
export const links: LinksFunction = () => {
  return [{ page: "/posts/public" }];
};
```

これにより、ユーザーが移動する前に、JavaScript モジュール、ローダーデータ、およびスタイルシート（次のルートの `links` エクスポートで定義）がブラウザキャッシュにロードされます。

<docs-warning>この機能には注意が必要です。ユーザーが訪問する可能性の低いページのために 10MB の JavaScript とデータをダウンロードすることは避けるべきです。</docs-warning>

[link-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link

