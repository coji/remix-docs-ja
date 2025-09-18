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

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。注意して使用し、関連する変更についてはリリースノートに**非常に**注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_RSCHydratedRouter.html)

サーバーでレンダリングされた[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)をブラウザでハイドレートします。

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

サーバーからのペイロードをデコードするために使用される、`react-server-dom-xyz/client`の`createFromReadableStream`関数です。

### fetch

オプションのfetch実装です。デフォルトはグローバルの[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)です。

### getContext

[`RouterContextProvider`](../utils/RouterContextProvider)インスタンスを返す関数です。これは、クライアントの[`action`](../../start/data/route-object#action)s、[`loader`](../../start/data/route-object#loader)s、および[middleware](../../how-to/middleware)に`context`引数として提供されます。この関数は、ナビゲーションまたはフェッチャー呼び出しごとに新しい`context`インスタンスを生成するために呼び出されます。

### payload

ハイドレートするデコードされた[`unstable_RSCPayload`](https://api.reactrouter.com/v7/types/react_router.unstable_RSCPayload.html)です。

### routeDiscovery

`"eager"`または`"lazy"` - リンクが積極的に検出されるか、クリックされるまで遅延されるかを決定します。