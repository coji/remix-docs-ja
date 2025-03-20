---
title: Scripts
---

# Scripts

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Scripts.html)

アプリのクライアントランタイムをレンダリングします。ドキュメントの `<body>` 内にレンダリングする必要があります。

```tsx
import { Scripts } from "react-router";

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

サーバーレンダリングの場合、`<Scripts/>` を省略すると、アプリは JavaScript なしの従来の Web アプリとして動作し、HTML とブラウザの動作のみに依存します。

## Props

### ScriptsProps

[modes: framework]

いくつかの一般的な属性：

- アプリとは異なるサーバーで静的アセットをホストするための `<Scripts crossOrigin>`。
- `<script>` タグの [nonce-sources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources) を使用した [スクリプトのコンテンツセキュリティポリシー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) をサポートするための `<Scripts nonce>`。

`async`、`defer`、`src`、`type`、`noModule` などの属性は、React Router によって内部的に管理されているため、渡すことはできません。

