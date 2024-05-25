---
title: リダイレクト
toc: false
---

# `redirect`

これは30xレスポンスを送信するためのショートカットです。

```tsx lines=[1,7]
import { redirect } from "@remix-run/node"; // または cloudflare/deno

export const action = async () => {
  const userSession = await getUserSessionOrWhatever();

  if (!userSession) {
    return redirect("/login");
  }

  return json({ ok: true });
};
```

デフォルトでは302が送信されますが、希望するリダイレクトステータスコードに変更できます。

```ts
redirect(path, 301);
redirect(path, 303);
```

セッションのコミットなど、ヘッダーを設定するための`ResponseInit`を送信することもできます。

```ts
redirect(path, {
  headers: {
    "Set-Cookie": await commitSession(session),
  },
});

redirect(path, {
  status: 302,
  headers: {
    "Set-Cookie": await commitSession(session),
  },
});
```

もちろん、自分で構築したい場合は、このヘルパーを使わずにリダイレクトを行うこともできます。

```ts
// これはショートカットです...
return redirect("/else/where", 303);

// ...これはこれと同じです
return new Response(null, {
  status: 303,
  headers: {
    Location: "/else/where",
  },
});
```

また、コールスタックを抜け出してすぐにリダイレクトするために、リダイレクトをスローすることもできます。

```ts
if (!session) {
  throw redirect("/login", 302);
}
```


