---
title: リンク
---

# `links`

`links`関数は、ユーザーがルートにアクセスしたときにページに追加する [`<link>`要素][link-element] を定義します。

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

返せるリンク記述子は2種類あります。

#### `HtmlLinkDescriptor`

これは、通常の `<link {...props} />` 要素のオブジェクト表現です。 [リンク API の MDN ドキュメントをご覧ください][link-element]。

ルートからの `links` エクスポートは、`HtmlLinkDescriptor` オブジェクトの配列を返す必要があります。

例:

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

    // 外部のスタイルシートを追加
    {
      rel: "stylesheet",
      href: "https://example.com/some/styles.css",
      crossOrigin: "anonymous",
    },

    // ローカルのスタイルシートを追加、Remix は本番環境のキャッシュのためにファイル名をフィンガープリント化します
    { rel: "stylesheet", href: stylesHref },

    // ユーザーがページとやり取りする際に表示される可能性のある画像をブラウザのキャッシュに事前に取得します。たとえば、ユーザーがボタンをクリックしてサマリー/詳細要素に表示する場合などです。
    {
      rel: "prefetch",
      as: "image",
      href: "/img/bunny.jpg",
    },

    // 画面が大きい場合にのみ事前に取得
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

これらの記述子を使用すると、ユーザーが移動する可能性のあるページのリソースを事前に取得できます。 この API は便利ですが、代わりに `<Link prefetch="render">` を使用したほうが効果的な場合があります。 ただし、必要に応じて、この API を使用して同じ動作を実現できます。

```tsx
export const links: LinksFunction = () => {
  return [{ page: "/posts/public" }];
};
```

これにより、ユーザーが移動する前に、JavaScript モジュール、ローダーデータ、次のルートの `links` エクスポートで定義されているスタイルシートがブラウザのキャッシュに読み込まれます。

<docs-warning>この機能の使用には注意が必要です。 ユーザーが訪問しない可能性のあるページの JavaScript やデータが 10 MB もダウンロードされないようにしてください。</docs-warning>

[link-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link

