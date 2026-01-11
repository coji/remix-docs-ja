---
title: RSCHydratedRouter
unstable: true
---

# unstable_RSCHydratedRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/rsc/browser.tsx
-->

[MODES: data]

<br />
<br />

<docs-warning>この API は実験的なものであり、マイナーリリースやパッチリリースで破壊的変更が行われる可能性があります。使用する際は注意し、関連する変更についてはリリースノートに**非常**に注意してください。</docs-warning>

## 概要

ブラウザでサーバーレンダリングされた [`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) をハイドレートします。

```tsx
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import {
  unstable_getRSCStream as getRSCStream,
  unstable_RSCHydratedRouter as RSCHydratedRouter,
} from "react-router";
import type { unstable_RSCPayload as RSCPayload } from "react-router";

createFromReadableStream(getRSCStream()).then((payload) =>
  startTransition(async () => {
    hydrateRoot(
      document,
      <StrictMode>
        <RSCHydratedRouter
          createFromReadableStream={createFromReadableStream}
          payload={payload}
        />
      </StrictMode>,
      { formState: await getFormState(payload) },
    );
  }),
);
```

## シグネチャ

```tsx
function RSCHydratedRouter({
  createFromReadableStream,
  fetch: fetchImplementation = fetch,
  payload,
  routeDiscovery = "eager",
  getContext,
}: RSCHydratedRouterProps)
```

## Props

### createFromReadableStream

サーバーからの payload をデコードするために使用される、`react-server-dom-xyz/client` の `createFromReadableStream` 関数です。

### fetch

オプションの `fetch` の実装です。デフォルトはグローバルな [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) です。

### getContext

クライアントの [`action`](../../start/data/route-object#action)、[`loader`](../../start/data/route-object#loader)、および [`middleware`](../../how-to/middleware) に `context` 引数として提供される、[`RouterContextProvider`](../utils/RouterContextProvider) インスタンスを返す関数です。この関数は、ナビゲーションまたはフェッチャーの呼び出しごとに新しい `context` インスタンスを生成するために呼び出されます。

### payload

ハイドレートするデコードされた [`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html) です。

### routeDiscovery

`"eager"` または `"lazy"` - リンクが積極的に発見されるか、クリックされるまで遅延されるかを決定します。