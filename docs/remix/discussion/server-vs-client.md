---
title: サーバー側コード実行とクライアント側コード実行
order: 5
---

# サーバー側コード実行とクライアント側コード実行

Remix は、サーバーとブラウザの両方でアプリを実行します。ただし、すべてのコードが両方の場所で実行されるわけではありません。

ビルドステップでは、コンパイラによってサーバービルドとクライアントビルドの両方が作成されます。サーバービルドは、すべてを単一のモジュールにバンドルします（[サーバーバンドル][server-bundles]を使用する場合、複数のモジュールに分割されます）。ただし、クライアントビルドは、アプリを複数のバンドルに分割して、ブラウザでの読み込みを最適化します。また、バンドルからサーバーコードを削除します。

次のルートのエクスポートと、それらで使用される依存関係は、クライアントビルドから削除されます。

- [`action`][action]
- [`headers`][headers]
- [`loader`][loader]

前回のセクションのこのルートモジュールを考えてみましょう。

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

サーバービルドは、最終的なバンドルにモジュール全体を含みます。ただし、クライアントビルドは、`action`、`headers`、`loader`、および依存関係を削除して、次のような結果になります。

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

## クライアントコードとサーバーコードを分割する

デフォルトでは、Vite は、同じモジュール内のサーバー専用コードとクライアントセーフなコードの混在をサポートしていません。
Remix は、どのエクスポートがサーバー専用であるかを知っており、クライアントから削除できるため、ルートに対して例外を作成できます。

Remix では、サーバー専用コードを分離する方法がいくつかあります。
最も簡単な方法は、[`.server`][file_convention_server] と [`.client`][file_convention_client] モジュールを使用することです。

#### `.server` モジュール

厳密には必須ではありませんが、[`.server` モジュール][file_convention_server] は、モジュール全体をサーバー専用として明示的にマークするのに適した方法です。
ビルドは、`.server` ファイルまたは `.server` ディレクトリ内のコードがクライアントモジュールグラフに誤って含まれた場合に失敗します。

```txt
app
├── .server 👈 このディレクトリ内のすべてのファイルをサーバー専用としてマーク
│   ├── auth.ts
│   └── db.ts
├── cms.server.ts 👈 このファイルをサーバー専用としてマーク
├── root.tsx
└── routes
    └── _index.tsx
```

`.server` モジュールは、Remix アプリのディレクトリ内に存在する必要があります。

<docs-warning>`.server` ディレクトリは、[Remix Vite][remix-vite] を使用している場合にのみサポートされます。[従来の Remix コンパイラ][classic-remix-compiler] は、`.server` ファイルのみをサポートしています。</docs-warning>

#### `.client` モジュール

サーバーでバンドルすることさえ安全でないクライアントライブラリに依存している場合があります。たとえば、単にインポートされるだけで [`window`][window_global] にアクセスしようとする可能性があります。

ファイル名に `*.client.ts` を追加するか、`.client` ディレクトリ内にネストすることで、これらのモジュールの内容をサーバービルドから削除できます。

<docs-warning>`.client` ディレクトリは、[Remix Vite][remix-vite] を使用している場合にのみサポートされます。[従来の Remix コンパイラ][classic-remix-compiler] は、`.client` ファイルのみをサポートしています。</docs-warning>

#### vite-env-only

同じモジュール内でサーバー専用コードとクライアントセーフなコードを混在させる場合は、<nobr>[vite-env-only][vite-env-only]</nobr> を使用できます。
この Vite プラグインを使用すると、任意の式をサーバー専用として明示的にマークして、クライアントで `undefined` に置き換えることができます。

たとえば、[Vite 設定][vite-config] にプラグインを追加したら、サーバー専用エクスポートを `serverOnly$` でラップできます。

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

この例は、クライアント用の次のコードにコンパイルされます。

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


