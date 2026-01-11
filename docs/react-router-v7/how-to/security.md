---
title: セキュリティ
---

# セキュリティ

[MODES: framework]

<br/>
<br/>

これは決して包括的なガイドではありませんが、React Router は、_セキュリティ_という_非常に大きな_傘の下にあるいくつかの側面に対処するのに役立つ機能を提供します。

## `Content-Security-Policy`

アプリケーションで [Content-Security-Policy (CSP)][csp] を実装している場合、特に `unsafe-inline` ディレクティブを使用している場合は、HTML でレンダリングされるインライン `<script>` 要素に [`nonce`][nonce] 属性を指定する必要があります。これは、インラインスクリプトを生成するすべての API で指定する必要があります。以下を含みます。

- [`<Scripts nonce>`][scripts] (`root.tsx`)
- [`<ScrollRestoration nonce>`][scrollrestoration] (`root.tsx`)
- [`<ServerRouter nonce>`][serverrouter] (`entry.server.tsx`)
- [`renderToPipeableStream(..., { nonce })`][renderToPipeableStream] (`entry.server.tsx`)
- [`renderToReadableStream(..., { nonce })`][renderToReadableStream] (`entry.server.tsx`)

[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
[nonce]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce
[renderToPipeableStream]: https://react.dev/reference/react-dom/server/renderToPipeableStream
[renderToReadableStream]: https://react.dev/reference/react-dom/server/renderToReadableStream
[scripts]: ../api/components/Scripts
[scrollrestoration]: ../api/components/ScrollRestoration
[serverrouter]: ../api/components/ServerRouter