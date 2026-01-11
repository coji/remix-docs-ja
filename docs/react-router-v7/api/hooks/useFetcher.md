---
title: useFetcher
---

# useFetcher

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

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.useFetcher.html)

ナビゲーションを引き起こすことなく、複数の同時データインタラクションを必要とする複雑で動的なユーザーインターフェースを作成するのに役立ちます。

Fetcher は、独自の独立した状態を追跡し、データのロード、フォームの送信、および一般的に[`action`](../../start/framework/route-module#action)関数や[`loader`](../../start/framework/route-module#loader)関数とインタラクトするために使用できます。

```tsx
import { useFetcher } from "react-router"

function SomeComponent() {
  let fetcher = useFetcher()

  // states are available on the fetcher
  fetcher.state // "idle" | "loading" | "submitting"
  fetcher.data // the data returned from the action or loader

  // render a form
  <fetcher.Form method="post" />

  // load data
  fetcher.load("/some/route")

  // submit data
  fetcher.submit(someFormRef, { method: "post" })
  fetcher.submit(someData, {
    method: "post",
    encType: "application/json"
  })

  // reset fetcher
  fetcher.reset()
}
```

## Signature

```tsx
function useFetcher<T = any>({
  key,
}: {
  key?: string;
} = ): FetcherWithComponents<SerializeFrom<T>> {}
```

## Params

### options.key

Fetcher を識別するためのユニークな key です。デフォルトでは、`useFetcher` はそのコンポーネントにスコープされたユニークな fetcher を生成します。アプリの他の場所から fetcher にアクセスできるよう、独自の key で fetcher を識別したい場合は、`key` オプションを使用できます。

```tsx
function SomeComp() {
  let fetcher = useFetcher({ key: "my-key" })
  // ...
}

// Somewhere else
function AnotherComp() {
  // this will be the same fetcher, sharing the state across the app
  let fetcher = useFetcher({ key: "my-key" });
  // ...
}
```

## Returns

Fetcher の state、data、およびフォーム送信やデータロードのためのコンポーネントを含む [`FetcherWithComponents`](https://api.reactrouter.com/v7/types/react_router.FetcherWithComponents.html) オブジェクトを返します。