---
title: ScrollRestoration
---

# ScrollRestoration

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.ScrollRestoration.html)

位置の変更時にブラウザのスクロール復元をエミュレートします。アプリは、[Scripts](../components/Scripts)コンポーネントの直前に、これらのうち1つだけをレンダリングする必要があります。

```tsx
import { ScrollRestoration } from "react-router";

export default function Root() {
  return (
    <html>
      <body>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

このコンポーネントは、スクロールのちらつきを防ぐためにインラインの`<script>`をレンダリングします。 `nonce`プロパティは、CSP nonceの使用を許可するためにscriptタグに渡されます。

```tsx
<ScrollRestoration nonce={cspNonce} />
```

## Props

### ScriptsProps

[modes: framework, data]

いくつかの一般的な属性：

- アプリとは異なるサーバーで静的アセットをホストするための`<Scripts crossOrigin>`。
- `<script>`タグの[nonce-sources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#sources)を使用した[スクリプトのコンテンツセキュリティポリシー](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)をサポートするための`<Scripts nonce>`。

`async`、`defer`、`src`、`type`、`noModule`などの属性は、React Routerによって内部的に管理されているため、渡すことはできません。

