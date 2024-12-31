---
title: サーバーとクライアントでのコード実行
order: 5
---

# サーバーとクライアントでのコード実行

Remix は、サーバーとブラウザの両方でアプリを実行します。ただし、すべてのコードが両方で実行されるわけではありません。

ビルドステップ中に、コンパイラーはサーバービルドとクライアントビルドの両方を作成します。サーバービルドはすべてを単一のモジュール（または[サーバーバンドル][server-bundles]を使用する場合は複数のモジュール）にバンドルしますが、クライアントビルドはブラウザでの読み込みを最適化するためにアプリを複数のバンドルに分割します。また、バンドルからサーバーコードを削除します。

次のルートのエクスポートと、それらの中で使用される依存関係は、クライアントビルドから削除されます。

- [`action`][action]
- [`headers`][headers]
- [`loader`][loader]

前のセクションのこのルートモジュールを考えてみましょう。

```tsx filename=routes/settings.tsx
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { getUser, updateUser } from "../user";

export const headers: HeadersFunction = () => ({
  "Cache-Control": "max-age=300, s-maxage=3600",
});

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({
    displayName: user.displayName,
    email: user.email,
  });
}

export default function Component() {
  const user = useLoaderData<typeof loader>();
  return (
    <Form action="/account">
      <h1>Settings for {user.displayName}</h1>

      <input
        name="displayName"
        defaultValue={user.displayName}
      />
      <input name="email" defaultValue={user.email} />

      <button type="submit">Save</button>
    </Form>
  );
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await getUser(request);

  await updateUser(user.id, {
    email: formData.get("email"),
    displayName: formData.get("displayName"),
  });

  return json({ ok: true });
}
```

サーバービルドには、最終的なバンドルにモジュール全体が含まれます。ただし、クライアントビルドは、`action`、`headers`、および `loader` を、依存関係とともに削除し、次のようになります。

```tsx filename=routes/settings.tsx
import { useLoaderData } from "@remix-run/react";

export default function Component() {
  const user = useLoaderData();
  return (
    <Form action="/account">
      <h1>Settings for {user.displayName}</h1>

      <input
        name="displayName"
        defaultValue={user.displayName}
      />
      <input name="email" defaultValue={user.email} />

      <button type="submit">Save</button>
    </Form>
  );
}
```

## クライアントとサーバーのコードの分割

デフォルトでは、Vite はサーバー専用コードとクライアントセーフコードを同じモジュールに混在させることをサポートしていません。
Remix は、どのエクスポートがサーバー専用であるかを知っており、クライアントからそれらを削除できるため、ルートに対して例外を設けることができます。

Remix でサーバー専用コードを分離する方法はいくつかあります。
最も簡単な方法は、[`.server`][file_convention_server] および [`.client`][file_convention_client] モジュールを使用することです。

#### `.server` モジュール

厳密には必須ではありませんが、[`.server` モジュール][file_convention_server] は、モジュール全体をサーバー専用として明示的にマークするのに適した方法です。
`.server` ファイルまたは `.server` ディレクトリ内のコードが誤ってクライアントモジュールグラフに含まれると、ビルドは失敗します。

```txt
app
├── .server 👈 このディレクトリ内のすべてのファイルをサーバー専用としてマークします
│   ├── auth.ts
│   └── db.ts
├── cms.server.ts 👈 このファイルをサーバー専用としてマークします
├── root.tsx
└── routes
    └── _index.tsx
```

`.server` モジュールは、Remix アプリケーションディレクトリ内にある必要があります。

<docs-warning>`.server` ディレクトリは、[Remix Vite][remix-vite] を使用する場合にのみサポートされます。[Classic Remix Compiler][classic-remix-compiler] は、`.server` ファイルのみをサポートします。</docs-warning>

#### `.client` モジュール

サーバーでバンドルすることさえ安全ではないクライアントライブラリに依存している場合があります。たとえば、インポートされるだけで [`window`][window_global] にアクセスしようとする場合などです。

ファイル名に `*.client.ts` を追加するか、`.client` ディレクトリ内にネストすることで、これらのモジュールの内容をサーバービルドから削除できます。

<docs-warning>`.client` ディレクトリは、[Remix Vite][remix-vite] を使用する場合にのみサポートされます。[Classic Remix Compiler][classic-remix-compiler] は、`.client` ファイルのみをサポートします。</docs-warning>

#### vite-env-only

サーバー専用コードとクライアントセーフコードを同じモジュールに混在させたい場合は、
<nobr>[vite-env-only][vite-env-only]</nobr> を使用できます。
この Vite プラグインを使用すると、任意の式をサーバー専用として明示的にマークして、クライアントで `undefined` に置き換えることができます。

たとえば、プラグインを [Vite 設定][vite-config] に追加したら、サーバー専用のエクスポートを `serverOnly$` でラップできます。

```tsx
import { serverOnly$ } from "vite-env-only";

import { db } from "~/.server/db";

export const getPosts = serverOnly$(async () => {
  return db.posts.findMany();
});

export const PostPreview = ({ title, description }) => {
  return (
    <article>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
};
```

この例は、クライアント用に次のコードにコンパイルされます。

```tsx
export const getPosts = undefined;

export const PostPreview = ({ title, description }) => {
  return (
    <article>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
};
```

[action]: ../route/action
[headers]: ../route/headers
[loader]: ../route/loader
[file_convention_client]: ../file-conventions/-client
[file_convention_server]: ../file-conventions/-server
[window_global]: https://developer.mozilla.org/en-US/docs/Web/API/Window/window
[server-bundles]: ../guides/server-bundles
[vite-config]: ../file-conventions/vite-config
[vite-env-only]: https://github.com/pcattori/vite-env-only
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite

