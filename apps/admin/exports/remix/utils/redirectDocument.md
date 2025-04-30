---
title: redirectDocument
toc: false
---

# `redirectDocument`

これは、クライアントサイドのナビゲーションではなく、新しいロケーションへのドキュメントレベルのリダイレクトをトリガーする[`redirect`][redirect]の小さなラッパーです。

これは、同じドメイン上にRemixアプリと非Remixアプリが共存しており、Remixアプリから非Remixアプリにリダイレクトする必要がある場合に最も役立ちます。

```tsx lines=[1,7]
import { redirectDocument } from "@remix-run/node"; // または cloudflare/deno

export const action = async () => {
  const userSession = await getUserSessionOrWhatever();

  if (!userSession) {
    // `/login` が別の非Remixアプリであると仮定
    return redirectDocument("/login");
  }

  return json({ ok: true });
};
```

[`redirect`][redirect]と同様に、ステータスコードまたは `ResponseInit` を2番目のパラメータとして受け入れます。

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

