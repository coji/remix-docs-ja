---
title: defer
toc: false
---

# `defer`

ストリーミングデータの利用を開始するには、[ストリーミングガイド][streaming_guide]を参照してください。

これは、ストリーミング/遅延レスポンスを作成するためのショートカットです。`utf-8`エンコーディングを使用していることを前提としています。開発者の視点からは、[`json()`][json]とまったく同じように動作しますが、PromiseをUIコンポーネントに転送する機能が追加されています。

```tsx lines=[1,7-10]
import { defer } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  const aStillRunningPromise = loadSlowDataAsync();

  // Promiseをawaitせずにこのように書くことができます。
  return defer({
    critical: "data",
    slowPromise: aStillRunningPromise,
  });
};
```

ステータスコードとヘッダーを渡すこともできます。

```tsx lines=[9-14]
export const loader = async () => {
  const aStillRunningPromise = loadSlowDataAsync();

  return defer(
    {
      critical: "data",
      slowPromise: aStillRunningPromise,
    },
    {
      status: 418,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
};
```

[streaming_guide]: ../guides/streaming
[json]: ./json

