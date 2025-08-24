---
title: ScrollRestoration
---

# ScrollRestoration

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: framework, data]

## Summary

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

## シグネチャ

```tsx
function ScrollRestoration({
  getKey,
  storageKey,
  ...props
}: ScrollRestorationProps)
```

## Props

### getKey

スクロール復元に使用するキーを返す関数です。これは、カスタムスクロール復元ロジックに役立ちます。例えば、pathnameのみを使用して、以前のパスへのその後のナビゲーションでスクロールを復元する場合などです。デフォルトは`location.key`です。[`GetScrollRestorationKeyFunction`](https://api.reactrouter.com/v7/interfaces/react_router.GetScrollRestorationKeyFunction.html)を参照してください。

```tsx
<ScrollRestoration
  getKey={(location, matches) => {
    // Restore based on a unique location key (default behavior)
    return location.key

    // Restore based on pathname
    return location.pathname
  }}
/>
```

### nonce

[`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)要素にレンダリングする[`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce)属性です。

### storageKey

[`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)にスクロール位置を保存するために使用するキーです。デフォルトは`"react-router-scroll-positions"`です。