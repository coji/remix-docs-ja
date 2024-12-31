---
title: data
toc: false
---

# `data`

これは、[Single Fetch][single-fetch] で使用するためのユーティリティで、生のデータとステータスコードまたはカスタムレスポンスヘッダーを返します。これにより、カスタムステータス/ヘッダーを提供するためにデータを `Response` インスタンスにシリアライズする必要がなくなります。これは一般的に、Single Fetch 以前に [`json`][json] または [`defer`][defer] を使用していた `loader`/`action` 関数の代替となります。

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

カスタムステータス/ヘッダーを返す必要がない場合は、この関数を使用するべきではありません。その場合は、データを直接返してください。

```tsx
export const loader = async () => {
  // ❌ 悪い例
  return data({ not: "coffee" });

  // ✅ 良い例
  return { not: "coffee" };
};
```

[single-fetch]: ../guides/single-fetch
[json]: ./json
[defer]: ./defer

