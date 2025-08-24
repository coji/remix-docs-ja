---
title: Scripts
---

# Scripts

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/ssr/components.tsx
-->

[MODES: framework]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.Scripts.html)

アプリのクライアントランタイムをレンダリングします。ドキュメントの [`<body>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body) 内にレンダリングする必要があります。

サーバーレンダリングの場合、`<Scripts/>` を省略すると、アプリは JavaScript なしの従来の Web アプリとして動作し、HTML とブラウザの動作のみに依存します。

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

## Signature

```tsx
function Scripts(scriptProps: ScriptsProps): React.JSX.Element | null
```

## Props

### scriptProps

[`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) タグに展開される追加の props です。[`crossOrigin`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/crossOrigin) や [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) などがあります。