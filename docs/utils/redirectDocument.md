---
title: redirectDocument
toc: false
---

# `redirectDocument`

これは、[`redirect`][redirect] をラップしたもので、クライアント側のナビゲーションではなく、ドキュメントレベルのリダイレクトを新しい場所にトリガーします。

これは、同じドメイン上に Remix アプリと非 Remix アプリが隣接しており、Remix アプリから非 Remix アプリにリダイレクトする必要がある場合に最も役立ちます。

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

[`redirect`][redirect] と同様に、ステータスコードまたは `ResponseInit` を 2 番目のパラメータとして受け付けます。

```ts
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


