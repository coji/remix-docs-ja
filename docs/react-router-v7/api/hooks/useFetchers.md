---
title: useFetchers
---

# useFetchers

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useFetchers.html)

実行中のすべての[`Fetcher`](https://api.reactrouter.com/v7/types/react_router.Fetcher.html)の配列を返します。これは、フェッチャーを作成しなかったが、楽観的なUIに参加するためにそれらの送信を使用したいアプリ全体のコンポーネントに役立ちます。

```tsx
import { useFetchers } from "react-router";

function SomeComponent() {
  const fetchers = useFetchers();
  fetchers[0].formData; // FormData
  fetchers[0].state; // etc.
  // ...
}
```

## シグネチャ

```tsx
function useFetchers(): (Fetcher & {
  key: string;
})[]
```

## 戻り値

実行中のすべての[`Fetcher`](https://api.reactrouter.com/v7/types/react_router.Fetcher.html)の配列を返します。各要素は一意の `key` プロパティを持ちます。