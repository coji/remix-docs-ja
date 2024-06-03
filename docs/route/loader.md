---
title: loader
---

# `loader`

<docs-success>📼 Remix シングルを見る: <a href="https://www.youtube.com/playlist?list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">Remix シングル プレイリスト</a>:<a href="https://www.youtube.com/watch?v=NXqEP_PsPNc&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">コンポーネントへのデータの読み込み</a></docs-success>

各ルートは、レンダリング時にルートにデータを提供する`loader`関数定義できます。

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  return json({ ok: true });
};
```

この関数はサーバーでのみ実行されます。最初のサーバーレンダリング時に、HTMLドキュメントにデータを提供します。ブラウザ内のナビゲーションでは、Remixは [`fetch`][fetch] を介してブラウザから関数を呼び出します。

これは、データベースに直接アクセスしたり、サーバー専用のAPIシークレットを使用したりできることを意味します。UIのレンダリングに使用されないコードは、ブラウザバンドルから削除されます。

データベースORM[Prisma][prisma] を例として使用します。

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

`prisma` は`loader`でのみ使用されるため、コンパイラによってブラウザバンドルから削除されます。これは、強調表示された行で示されています。

<docs-error>
`loader`から返すものは何でも、コンポーネントがレンダリングしない場合でも、クライアントに公開されます。`loader`は公開APIエンドポイントと同じように注意して扱いましょう。
</docs-error>

## タイプセーフティ

`useLoaderData<typeof loader>`を使用して、`loader`とコンポーネント間のネットワークに対してタイプセーフティを得ることができます。

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

- `data.name` は文字列であることがわかります。
- `data.date` も文字列であることがわかります。これは、[`json`][json] に日付オブジェクトを渡したとしても、データがクライアント遷移のために取得されると、値は [`JSON.stringify`][json-stringify] を使用してネットワーク経由でシリアル化され、タイプはそのことを認識しているためです。

## `params`

ルートパラメータは、ルートファイル名によって定義されます。セグメントが`$`で始まる場合（例：`$invoiceId`）、そのセグメントのURLからの値は`loader`に渡されます。

```tsx filename=app/routes/invoices.$invoiceId.tsx nocopy
// ユーザーが /invoices/123 にアクセスした場合
export async function loader({
  params,
}: LoaderFunctionArgs) {
  params.invoiceId; // "123"
}
```

パラメータは、主にIDでレコードを検索する際に役立ちます。

```tsx filename=app/routes/invoices.$invoiceId.tsx
// ユーザーが /invoices/123 にアクセスした場合
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const invoice = await fakeDb.getInvoice(params.invoiceId);
  if (!invoice) throw new Response("", { status: 404 });
  return json(invoice);
}
```

## `request`

これは[Fetch Request][request]インスタンスです。MDNドキュメントを読んで、すべてのプロパティを確認できます。

`loader`で最も一般的なユースケースは、[ヘッダー][request-headers]（Cookieなど）とリクエストのURL [`URLSearchParams`][url-search-params] を読み取ることです。

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // Cookieを読み取る
  const cookie = request.headers.get("Cookie");

  // `?q=` のクエリパラメータを解析する
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
}
```

## `context`

これは、サーバーアダプターの `getLoadContext()` 関数に渡されるコンテキストです。これは、アダプターのリクエスト/レスポンスAPIとRemixアプリ間のギャップを埋める方法です。

<docs-info>このAPIはエスケープハッチであり、必要になることはまれです</docs-info>

Expressアダプターを例として使用します。

```ts filename=server.ts
const {
  createRequestHandler,
} = require("@remix-run/express");

app.all(
  "*",
  createRequestHandler({
    getLoadContext(req, res) {
      // これは loader コンテキストになります
      return { expressUser: req.user };
    },
  })
);
```

そして、`loader`はアクセスできます。

```tsx filename=app/routes/some-route.tsx
export async function loader({
  context,
}: LoaderFunctionArgs) {
  const { expressUser } = context;
  // ...
}
```

## レスポンスインスタンスを返す

`loader`から[Fetch Response][response]を返す必要があります。

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

[`json` ヘルパー][json]を使用すると、これを簡素化できます。そのため、自分で構築する必要はありません。しかし、これらの2つの例は実際には同じです。

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  const users = await fakeDb.users.findMany();
  return json(users);
};
```

`json`がどのように少しだけ作業を行い、`loader`をはるかにクリーンにするかを見ることができます。`json`ヘルパーを使用して、ヘッダーまたはステータスコードをレスポンスに追加することもできます。

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

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

以下も参照してください。

- [`headers`][headers]
- [MDN Response Docs][response]

## ローダーでレスポンスをスローする

レスポンスを返すことに加えて、`loader`から`Response`オブジェクトをスローすることもできます。これにより、コールスタックを突破して、次のいずれかを実行できます。

- 別のURLにリダイレクトする
- `ErrorBoundary` を通じてコンテキストデータを含む代替UIを表示する

これは、ローダーでコードの実行を停止し、代替UIを表示するレスポンスをスローするユーティリティ関数をどのように作成できるかを示す完全な例です。

```ts filename=app/db.ts
import { json } from "@remix-run/node"; // または cloudflare/deno

export function getInvoice(id, user) {
  const invoice = db.invoice.find({ where: { id } });
  if (invoice === null) {
    throw json("Not Found", { status: 404 });
  }
  return invoice;
}
```

```ts filename=app/http.ts
import { redirect } from "@remix-run/node"; // または cloudflare/deno

import { getSession } from "./session";

export async function requireUserSession(request) {
  const session = await getSession(
    request.headers.get("cookie")
  );
  if (!session) {
    // `redirect` や `json` などのヘルパーをスローできます。これは、`Response` オブジェクトを返すためです。`redirect` レスポンスは別の URL にリダイレクトしますが、他のレスポンスは `ErrorBoundary` でレンダリングされた UI をトリガーします。
    throw redirect("/login", 302);
  }
  return session.get("user");
}
```

```tsx filename=app/routes/invoice.$invoiceId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno
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
            <p>この請求書へのアクセス権がありません。</p>
            <p>
              アクセスを得るには、{error.data.invoiceOwnerEmail} に連絡してください
            </p>
          </div>
        );
      case 404:
        return <div>請求書が見つかりません!</div>;
    }

    return (
      <div>
        エラーが発生しました: {error.status}{" "}
        {error.statusText}
      </div>
    );
  }

  return (
    <div>
      エラーが発生しました:{" "}
      {error?.message || "不明なエラー"}
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
