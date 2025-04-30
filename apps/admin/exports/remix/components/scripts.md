---
title: スクリプト
toc: false
---

# `<Scripts />`

このコンポーネントは、アプリのクライアントランタイムをレンダリングします。HTML の [`<body>`][body-element] 内、通常は [`app/root.tsx`][root] でレンダリングする必要があります。

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

`<Scripts/>` コンポーネントをレンダリングしない場合、アプリは JavaScript なしの従来の Web アプリのように動作し、HTML とブラウザの動作のみに依存します。

## Props

`<Scripts>` コンポーネントは、以下のような特定の属性を基になる `<script>` タグに渡すことができます。

- アプリとは異なるサーバーで静的アセットをホストするための `<Scripts crossOrigin>`。
- `<script>` タグの [nonce-sources][csp-nonce] を使用した [スクリプトのコンテンツセキュリティポリシー][csp] をサポートするための `<Scripts nonce>`。

`async`/`defer`/`src`/`type`/`noModule` などの属性は、Remix によって内部的に管理されているため、渡すことはできません。

[body-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
[csp-nonce]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources
[root]: ../file-conventions/root

