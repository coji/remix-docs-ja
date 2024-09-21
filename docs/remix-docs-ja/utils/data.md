---
title: unstable_data
toc: false
---

# `unstable_data`

これは、[Single Fetch][single-fetch] と共に使用するユーティリティで、ステータスコードまたはカスタムレスポンスヘッダーを伴う生データを返します。これにより、カスタムステータス/ヘッダーを提供するためにデータを `Response` インスタンスにシリアル化する必要がなくなります。これは、一般的に Single Fetch 以前の `json`[json] または `defer`[defer] を使用した `loader` / `action` 関数の代替です。

```tsx
import { unstable_data as data } from "@remix-run/node"; // または cloudflare/deno

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

カスタムステータス/ヘッダーを返す必要がない場合は、この関数を使用しないでください。その場合は、データを直接返してください。

```tsx
export const loader = async () => {
  // ❌ 悪い
  return data({ not: "coffee" });

  // ✅ 良い
  return { not: "coffee" };
};
```

[single-fetch]: ../guides/single-fetch
[json]: ./json
[defer]: ./defer

