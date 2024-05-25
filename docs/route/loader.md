---
title: ローダー
---

# `loader`

<docs-success>Remix Single の <a href="https://www.youtube.com/playlist?list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">📼 動画</a> をご覧ください: <a href="https://www.youtube.com/watch?v=NXqEP_PsPNc&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">コンポーネントへのデータの読み込み</a></docs-success>

各ルートは、レンダリング時にルートにデータを提供する `loader` 関数を定義できます。

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  return json({ ok: true });
};
```

この関数は、サーバーでのみ実行されます。最初のサーバーレンダリング時に、HTML ドキュメントにデータを提供します。ブラウザでのナビゲーション時に、Remix はブラウザから [`fetch`][fetch] を使用して関数を呼び出します。

つまり、データベースに直接アクセスしたり、サーバー専用の API シークレットを使用したりできます。UI のレンダリングに使用されないコードは、ブラウザバンドルから削除されます。

データベース ORM [Prisma][prisma] を例として使用します。

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

`prisma` は `loader` でのみ使用されるため、コンパイラによってブラウザバンドルから削除されます。強調表示された行で示されています。

<docs-error>
`loader` から返すものはすべて、コンポーネントがレンダリングしなくてもクライアントに公開されます。`loader` は、パブリック API エンドポイントと同じように慎重に取り扱ってください。
</docs-error>

## 型安全

`useLoaderData<typeof loader>` を使用すると、`loader` とコンポーネント間のネットワークに対する型安全を得ることができます。

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

- `data.name` は文字列であることがわかります
- `data.date` も、[`json`][json] に日付オブジェクトを渡したにもかかわらず、文字列であることがわかります。クライアント遷移のためにデータがフェッチされると、値は [`JSON.stringify`][json-stringify] を使用してネットワーク経由でシリアル化され、型はそのことを認識しています。

## `params`

ルートパラメータは、ルートファイル名によって定義されます。セグメントが `$` で始まる場合（例: `$invoiceId`）、そのセグメントの URL からの値が `loader` に渡されます。

```tsx filename=app/routes/invoices.$invoiceId.tsx nocopy
// ユーザーが /invoices/123 を訪問した場合
export async function loader({
  params,
}: LoaderFunctionArgs) {
  params.invoiceId; // "123"
}
```

パラメータは、主に ID でレコードを検索する場合に役立ちます。

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

これは [Fetch Request][request] インスタンスです。MDN ドキュメントを参照して、すべてのプロパティを確認できます。

`loader` で最も一般的なユースケースは、[ヘッダー][request-headers]（クッキーなど）とリクエストからの URL [`URLSearchParams`][url-search-params] を読み取ることです。

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // クッキーを読み取る
  const cookie = request.headers.get("Cookie");

  // `?q=` の検索パラメータを解析する
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
}
```

## `context`

これは、サーバーアダプターの `getLoadContext()` 関数に渡されるコンテキストです。アダプターのリクエスト/レスポンス API と Remix アプリの間のギャップを埋める方法です。

<docs-info>この API はエスケープハッチです。必要になることはほとんどありません</docs-info>

express アダプターを例として使用します。

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

## レスポンスインスタンスを返す

`loader` から [Fetch レスポンス][response] を返す必要があります。

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

[`json ヘルパー`][json] を使用すると、自分で作成する必要がないため、この処理が簡素化されますが、これらの 2 つの例は事実上同じです！

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  const users = await fakeDb.users.findMany();
  return json(users);
};
```

`json` がどのようにわずかな作業を行って `loader` をよりクリーンにしているかを見ることができます。`json` ヘルパーを使用して、レスポンスにヘッダーまたはステータスコードを追加することもできます。

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

関連項目:

- [`ヘッダー`][headers]
- [MDN Response ドキュメント][response]

## ローダーでのレスポンスの投げ捨て

レスポンスを返すだけでなく、`loader` から `Response` オブジェクトをスローすることもできます。これにより、コールスタックを突き破って、次のいずれかの処理を実行できます。

- 別の URL にリダイレクトする
- `ErrorBoundary` を介して、コンテキストデータを含む代替 UI を表示する

以下は、レスポンスをスローしてローダー内のコード実行を停止し、代替 UI を表示する方法を示す完全な例です。

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
    // `redirect` や `json` などのヘルパーをスローできます。これらのヘルパーは
    // `Response` オブジェクトを返します。`redirect` レスポンスは、別の URL に
    // リダイレクトされますが、その他のレスポンスは、`ErrorBoundary`
    // にレンダリングされた UI をトリガーします。
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
              アクセスするには、{error.data.invoiceOwnerEmail} に連絡してください。
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


