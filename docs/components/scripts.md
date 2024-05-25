---
title: スクリプト
toc: false
---

# `<Scripts />`

このコンポーネントは、アプリのクライアントランタイムをレンダリングします。これは、HTML の [`<body>`][body-element] 内、通常は [`app/root.tsx`][root] でレンダリングする必要があります。

```tsx filename=app/root.tsx lines=[8]
import { Scripts } from "@remix-run/react";

export default function Root() {
  return (
    <html>
      <head />
      <body>
        <Scripts />
      </body>
    </html>
  );
}
```

`<Scripts/>` コンポーネントをレンダリングしないと、アプリは JavaScript を使用しない従来の Web アプリのように動作し、HTML とブラウザの動作のみに依存します。

## プロパティ

`<Scripts>` コンポーネントは、次のような特定の属性を基礎となる `<script>` タグに渡すことができます。

- `<Scripts crossOrigin>` は、アプリとは異なるサーバーに静的アセットをホストする場合に使用します。
- `<Scripts nonce>` は、`<script>` タグの [nonce ソース][csp-nonce] を使用して、[スクリプト用のコンテンツセキュリティポリシー][csp] をサポートする場合に使用します。

`async`/`defer`/`src`/`type`/`noModule` などの属性は、Remix で内部的に管理されているため、渡すことはできません。

[body-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[root]: ../file-conventions/root
