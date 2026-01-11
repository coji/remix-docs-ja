---
title: ScrollRestoration
---

# ScrollRestoration

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.ScrollRestoration.html)

位置の変更時にブラウザのスクロール復元をエミュレートします。アプリは、[`Scripts`](../components/Scripts) コンポーネントの直前に、これらのうち1つだけをレンダリングする必要があります。

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

このコンポーネントは、スクロールのちらつきを防ぐためにインラインの`<script>`をレンダーします。 `nonce` プロパティは、CSP nonce の使用を許可するために script タグに渡されます。

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

スクロール復元に使用するキーを返す関数です。これは、カスタムスクロール復元ロジックに役立ちます。例えば、pathname のみを使用して、以前のパスへのその後のナビゲーションでスクロールが復元されるようにする場合などです。デフォルトは `location.key` です。[`GetScrollRestorationKeyFunction`](https://api.reactrouter.com/v7/interfaces/react_router.GetScrollRestorationKeyFunction.html) を参照してください。

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

[`<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) 要素にレンダーされる [`nonce`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce) 属性。

### storageKey

[`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) にスクロール位置を保存するために使用するキーです。デフォルトは `"react-router-scroll-positions"` です。