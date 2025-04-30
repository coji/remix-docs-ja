---
title: redirect
toc: false
---

# `redirect`

これは、30xレスポンスを送信するためのショートカットです。

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

デフォルトでは302を送信しますが、任意のredirectステータスコードに変更できます。

```ts
redirect(path, 301);
redirect(path, 303);
```

また、セッションのコミットなど、ヘッダーを設定するために`ResponseInit`を送信することもできます。

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

もちろん、自分で構築したい場合は、このヘルパーなしでリダイレクトを行うこともできます。

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

また、コールスタックを中断してすぐにリダイレクトするために、リダイレクトをスローすることもできます。

```ts
if (!session) {
  throw redirect("/login", 302);
}
```

