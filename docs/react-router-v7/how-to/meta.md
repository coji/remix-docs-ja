---
title: メタタグとSEO
hidden: true
---

[ルートモジュールドキュメントからコピー]

デフォルトでは、メタ記述子はほとんどの場合[`<meta>` タグ][meta-element] をレンダリングします。2つの例外があります。

- `{ title }` は `<title>` タグをレンダリングします。
- `{ "script:ld+json" }` は `<script type="application/ld+json">` タグをレンダリングし、その値は文字列化されてタグに挿入されるシリアライズ可能なオブジェクトである必要があります。

```tsx
export function meta() {
  return [
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "React Router",
        url: "https://reactrouter.com",
      },
    },
  ];
}
```

メタ記述子は、`tagName` プロパティを`"link"`に設定することで[`<link>` タグ][link-element] をレンダリングすることもできます。これは、`canonical` URLなど、SEOに関連付けられた`<link>`タグに役立ちます。スタイルシートやファビコンなどのアセットリンクには、代わりに[`links` エクスポート][links]を使用する必要があります。

```tsx
export function meta() {
  return [
    {
      tagName: "link",
      rel: "canonical",
      href: "https://reactrouter.com",
    },
  ];
}
```


[meta-element]: リンク先URL(meta要素の説明へのリンクをここに挿入)
[link-element]: リンク先URL(link要素の説明へのリンクをここに挿入)
[links]: リンク先URL(links exportの説明へのリンクをここに挿入)


**注:**  `[meta-element]`、`[link-element]`、`[links]` には、それぞれの要素やエクスポートに関する適切なドキュメントへのリンクを挿入する必要があります。

