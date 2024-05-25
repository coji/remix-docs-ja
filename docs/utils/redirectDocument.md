---
title: redirectDocument
toc: false
---

# `redirectDocument`

これは、[`redirect`][redirect] の小さなラッパーであり、クライアント側のナビゲーションではなく、新しい場所にドキュメントレベルのリダイレクトをトリガーします。

これは、同じドメインで非 Remix アプリの隣に Remix アプリがあり、Remix アプリから非 Remix アプリにリダイレクトする必要がある場合に最も役立ちます。

```tsx lines=[1,7]
import { redirectDocument } from "@remix-run/node"; // または cloudflare/deno

export const action = async () => {
  const userSession = await getUserSessionOrWhatever();

  if (!userSession) {
    // `/login` は別の非 Remix アプリであると仮定
    return redirectDocument("/login");
  }

  return json({ ok: true });
};
```

[`redirect`][redirect] と同様に、ステータスコードまたは `ResponseInit` を2番目のパラメーターとして受け付けます。

```
redirectDocument(path, 301);
redirectDocument(path, 303);
```

```ts
redirectDocument(path, {
  headers: {
    "Set-Cookie": await commitSession(session),
  },
});
```

[redirect]: ./redirect
