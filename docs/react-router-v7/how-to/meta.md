---
title: メタタグとSEO
hidden: true
---

[ルートモジュールのドキュメントからコピーペースト]

デフォルトでは、メタ記述子はほとんどの場合、[`<meta>`タグ][meta-element]をレンダリングします。2つの例外があります。

- `{ title }` は `<title>` タグをレンダリングします
- `{ "script:ld+json" }` は `<script type="application/ld+json">` タグをレンダリングし、その値はシリアライズ可能なオブジェクトである必要があり、文字列化されてタグに挿入されます。

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

メタ記述子は、`tagName` プロパティを `"link"` に設定することで、[`<link>` タグ][link-element]をレンダリングすることもできます。これは、`canonical` URLのようなSEOに関連する`<link>`タグに役立ちます。スタイルシートやファビコンのようなアセットリンクには、代わりに[`links`エクスポート][links]を使用する必要があります。

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

