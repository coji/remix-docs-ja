---
title: loader
---

# `loader`

<docs-success>📼 Remix Single をご覧下さい: <a href="https://www.youtube.com/playlist?list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">Remix Single</a>: <a href="https://www.youtube.com/watch?v=NXqEP_PsPNc&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">コンポーネントへのデータの読み込み</a></docs-success>

各ルートは、レンダリング時にルートにデータを提供する `loader` 関数を定義できます。

```tsx
import { json } from "@remix-run/node"; // or cloudflare/deno

export const loader = async () => {
  return json({ ok: true });
};
```

この関数は、サーバーでのみ実行されます。最初のサーバーレンダリング時に、HTMLドキュメントにデータを提供します。ブラウザでのナビゲーション時に、Remixはブラウザから[`fetch`][fetch]を介して関数を呼び出します。

つまり、データベースに直接アクセスしたり、サーバー専用のAPIシークレットを使用したりすることができます。UIのレンダリングに使用されないコードはすべて、ブラウザバンドルから削除されます。

データベースORM [Prisma][prisma]を例として使用します。

```tsx lines=[3,5-7]
import { useLoaderData } from "@remix-run/react";

import { prisma } from "../db";

export async function loader() {
  return json(await prisma.user.findMany());
}

export default function Users() {
  const data = useLoaderData<typeof loader>();
  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

`prisma` は `loader` でのみ使用されるため、ハイライトされた行で示されているように、コンパイラによってブラウザバンドルから削除されます。

<docs-error>
`loader` から返されるものはすべてクライアントに公開されます。コンポーネントがレンダリングしない場合でも同様です。`loader` は、パブリックAPIエンドポイントと同じように慎重に扱ってください。
</docs-error>

## 型安全性

`useLoaderData<typeof loader>` を使用すると、`loader` とコンポーネント間のネットワークで型安全性を確保できます。

```tsx lines=[9]
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  return json({ name: "Ryan", date: new Date() });
}

export default function SomeRoute() {
  const data = useLoaderData<typeof loader>();
}
```

- `data.name` は、それが文字列であることを認識します。
- `data.date` も、[`json`][json] に日付オブジェクトを渡したにもかかわらず、それが文字列であることを認識します。クライアント遷移のためにデータがフェッチされると、値は[`JSON.stringify`][json-stringify]でネットワーク経由でシリアル化され、型はそのことを認識しています。

## `params`

ルートパラメータは、ルートファイル名によって定義されます。セグメントが `$` で始まる場合（例：`$invoiceId`）、そのセグメントのURLからの値は、`loader` に渡されます。

```tsx filename=app/routes/invoices.$invoiceId.tsx nocopy
// ユーザーが /invoices/123 を訪問した場合
export async function loader({
  params,
}: LoaderFunctionArgs) {
  params.invoiceId; // "123"
}
```

パラメータは、ほとんどの場合、IDでレコードを検索する場合に役立ちます。

```tsx filename=app/routes/invoices.$invoiceId.tsx
// ユーザーが /invoices/123 を訪問した場合
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const invoice = await fakeDb.getInvoice(params.invoiceId);
  if (!invoice) throw new Response("", { status: 404 });
  return json(invoice);
}
```

## `request`

これは [Fetch Request][request] インスタンスです。すべてのプロパティを確認するには、MDNドキュメントを参照してください。

`loader` で最も一般的なユースケースは、[ヘッダー][request-headers]（Cookieなど）とリクエストのURL [`URLSearchParams`][url-search-params] を読み取ることです。

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // Cookie を読み取る
  const cookie = request.headers.get("Cookie");

  // `?q=` の検索パラメータを解析する
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
}
```

## `context`

これは、サーバーアダプターの `getLoadContext()` 関数に渡されるコンテキストです。アダプターのリクエスト/レスポンスAPIとRemixアプリの間に橋渡しをする方法です。

<docs-info>このAPIはエスケープハッチです。使用する必要はほとんどありません。</docs-info>

expressアダプターを例として使用します。

```ts filename=server.ts
const {
  createRequestHandler,
} = require("@remix-run/express");

app.all(
  "*",
  createRequestHandler({
    getLoadContext(req, res) {
      // これが loader コンテキストになります
      return { expressUser: req.user };
    },
  })
);
```

そして、`loader` はそれにアクセスできます。

```tsx filename=app/routes/some-route.tsx
export async function loader({
  context,
}: LoaderFunctionArgs) {
  const { expressUser } = context;
  // ...
}
```

## レスポンスインスタンスの返却

`loader` から [Fetch Response][response] を返す必要があります。

```tsx
export async function loader() {
  const users = await db.users.findMany();
  const body = JSON.stringify(users);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
```

[`json ヘルパー`][json] を使用すると、これを簡略化できるので、自分で作成する必要はありませんが、これらの2つの例は、実際には同じです。

```tsx
import { json } from "@remix-run/node"; // or cloudflare/deno

export const loader = async () => {
  const users = await fakeDb.users.findMany();
  return json(users);
};
```

`json` は、`loader` をはるかにクリーンにするために少しの作業を行う方法がわかります。`json` ヘルパーを使用して、レスポンスにヘッダーまたはステータスコードを追加することもできます。

```tsx
import { json } from "@remix-run/node"; // or cloudflare/deno

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  const project = await fakeDb.project.findOne({
    where: { id: params.id },
  });

  if (!project) {
    return json("Project not found", { status: 404 });
  }

  return json(project);
};
```

こちらも参照してください。

- [`headers`][headers]
- [MDN Response Docs][response]

## Loader でのレスポンスの投げ込み

レスポンスを返すことに加えて、`loader` から `Response` オブジェクトをスローすることもできます。これにより、コールスタックを突破して、次のいずれかを行うことができます。

- 別のURLにリダイレクトする
- `ErrorBoundary` を介してコンテキストデータを含む代替UIを表示する

以下は、ローダーでのコードの実行を停止し、代替UIを表示するためにレスポンスをスローするユーティリティ関数の作成方法を示す完全な例です。

```ts filename=app/db.ts
import { json } from "@remix-run/node"; // or cloudflare/deno

export function getInvoice(id) {
  const invoice = db.invoice.find({ where: { id } });
  if (invoice === null) {
    throw json("Not Found", { status: 404 });
  }
  return invoice;
}
```

```ts filename=app/http.ts
import { redirect } from "@remix-run/node"; // or cloudflare/deno

import { getSession } from "./session";

export async function requireUserSession(request) {
  const session = await getSession(
    request.headers.get("cookie")
  );
  if (!session) {
    // `redirect` や `json` などのヘルパーをスローできます。これらのヘルパーは `Response` オブジェクトを返します。`redirect` レスポンスは別のURLにリダイレクトし、その他のレスポンスは `ErrorBoundary` でレンダリングされたUIをトリガーします。
    throw redirect("/login", 302);
  }
  return session.get("user");
}
```

```tsx filename=app/routes/invoice.$invoiceId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { getInvoice } from "~/db";
import { requireUserSession } from "~/http";

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);
  const invoice = getInvoice(params.invoiceId);

  if (!invoice.userIds.includes(user.id)) {
    throw json(
      { invoiceOwnerEmail: invoice.owner.email },
      { status: 401 }
    );
  }

  return json(invoice);
};

export default function InvoiceRoute() {
  const invoice = useLoaderData<typeof loader>();
  return <InvoiceView invoice={invoice} />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 401:
        return (
          <div>
            <p>You don't have access to this invoice.</p>
            <p>
              Contact {error.data.invoiceOwnerEmail} to get
              access
            </p>
          </div>
        );
      case 404:
        return <div>Invoice not found!</div>;
    }

    return (
      <div>
        Something went wrong: {error.status}{" "}
        {error.statusText}
      </div>
    );
  }

  return (
    <div>
      Something went wrong:{" "}
      {error?.message || "Unknown Error"}
    </div>
  );
}
```

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[prisma]: https://www.prisma.io
[json]: ../utils/json
[json-stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[request]: https://developer.mozilla.org/en-US/docs/Web/API/Request
[request-headers]: https://developer.mozilla.org/en-US/docs/Web/API/Response/headers
[url-search-params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[headers]: ../route/headers



