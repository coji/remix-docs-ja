---
title: defer
toc: false
---

# `defer`

ストリーミングデータの使用方法については、[ストリーミングガイド][streaming_guide]をご覧ください。

これはストリーミング/遅延レスポンスを作成するためのショートカットです。`utf-8`エンコーディングを使用していると想定しています。開発者の観点から見ると、[`json()`][json]と同じように動作しますが、UIコンポーネントにプロミスを転送する機能があります。

```tsx lines=[1,7-10]
import { defer } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  const aStillRunningPromise = loadSlowDataAsync();

  // これはプロミスを待たずに記述できます。
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


