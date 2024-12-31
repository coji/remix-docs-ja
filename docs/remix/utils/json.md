---
title: json
toc: false
---

# `json`

これは `application/json` レスポンスを作成するためのショートカットです。`utf-8` エンコーディングを使用することを前提としています。

```tsx lines=[1,5]
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  // このように書くことができます:
  return json({ any: "thing" });

  // 代わりにこのように書くこともできます:
  return new Response(JSON.stringify({ any: "thing" }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
```

ステータスコードとヘッダーを渡すこともできます。

```tsx lines=[4-9]
export const loader = async () => {
  return json(
    { not: "coffee" },
    {
      status: 418,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
};
```

