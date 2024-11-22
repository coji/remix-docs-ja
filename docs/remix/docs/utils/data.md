---
title: data
toc: false
---

# `data`

これは、[Single Fetch][single-fetch] で使用するユーティリティで、ステータスコードまたはカスタムレスポンスヘッダーと共に生のデータを返します。これにより、カスタムステータス/ヘッダーを提供するためにデータを `Response` インスタンスにシリアル化する必要がなくなります。これは、一般的に Single Fetch 以前は [`json`][json] または [`defer`][defer] を使用していた `loader`/`action` 関数の代替となります。

```tsx
import { data } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  return data(
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

カスタムステータス/ヘッダーを返す必要がない場合は、この関数を使用すべきではありません。その場合、データを直接返してください。

```tsx
export const loader = async () => {
  // ❌ 良くない
  return data({ not: "coffee" });

  // ✅ 良い
  return { not: "coffee" };
};
```

[single-fetch]: ../guides/single-fetch
[json]: ./json
[defer]: ./defer

