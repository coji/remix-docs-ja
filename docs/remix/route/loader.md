---
title: loader
---

# `loader`

<docs-success>
<a href="https://www.youtube.com/playlist?list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">📼 Remix Single</a>: <a href="https://www.youtube.com/watch?v=NXqEP_PsPNc&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6">コンポーネントへのデータのロード</a>をご覧ください
</docs-success>

各ルートは、レンダリング時にルートにデータを提供する `loader` 関数を定義できます。

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  return json({ ok: true });
};
```

この関数はサーバーでのみ実行されます。最初のサーバーレンダリングでは、HTMLドキュメントにデータを提供します。ブラウザでのナビゲーションでは、Remixはブラウザから[`fetch`][fetch]を介して関数を呼び出します。

つまり、データベースと直接通信したり、サーバー専用のAPIシークレットを使用したりできます。UIのレンダリングに使用されないコードは、ブラウザバンドルから削除されます。

データベースORMの[Prisma][prisma]を例として使用します。

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

`prisma`は`loader`でのみ使用されるため、強調表示された行が示すように、コンパイラによってブラウザバンドルから削除されます。

<docs-error>
`loader`から返すものは、コンポーネントがレンダリングしなくてもクライアントに公開されることに注意してください。`loader`は、パブリックAPIエンドポイントと同じように注意して扱ってください。
</docs-error>

## 型安全性

`loader` とコンポーネントに対して、ネットワーク越しに型安全性を実現するには、`useLoaderData<typeof loader>` を使用します。

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

* `data.name` は文字列であることがわかります。
* `data.date` は、[`json`][json] に日付オブジェクトを渡したにもかかわらず、文字列であることがわかります。クライアント遷移のためにデータがフェッチされる際、値は [`JSON.stringify`][json-stringify] を使用してネットワーク越しにシリアライズされ、型はそのことを認識しています。

## `params`

ルートパラメータは、ルートファイル名によって定義されます。セグメントが `$invoiceId` のように `$` で始まる場合、そのセグメントの URL からの値が `loader` に渡されます。

```tsx filename=app/routes/invoices.$invoiceId.tsx nocopy
// ユーザーが /invoices/123 にアクセスした場合
export async function loader({
  params,
}: LoaderFunctionArgs) {
  params.invoiceId; // "123"
}
```

パラメータは主に、ID でレコードを検索するのに役立ちます。

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

これは[Fetch Request][request]インスタンスです。そのすべてのプロパティについては、MDNドキュメントを参照してください。

`loader`での最も一般的なユースケースは、[ヘッダー][request-headers]（クッキーなど）と、リクエストからのURL [`URLSearchParams`][url-search-params]を読み取ることです。

```tsx
export async function loader({
  request,
}: LoaderFunctionArgs) {
  // クッキーを読み取る
  const cookie = request.headers.get("Cookie");

  // `?q=`の検索パラメータを解析する
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
}
```

## `context`

これは、サーバーアダプターの `getLoadContext()` 関数に渡されるコンテキストです。アダプターのリクエスト/レスポンス API と Remix アプリの間のギャップを埋めるための方法です。

<docs-info>この API はエスケープハッチであり、必要になることはまれです</docs-info>

express アダプターを例に挙げると：

```ts filename=server.ts
const {
  createRequestHandler,
} = require("@remix-run/express");

app.all(
  "*",
  createRequestHandler({
    getLoadContext(req, res) {
      // これがローダーコンテキストになります
      return { expressUser: req.user };
    },
  })
);
```

そして、`loader` がそれにアクセスできます。

```tsx filename=app/routes/some-route.tsx
export async function loader({
  context,
}: LoaderFunctionArgs) {
  const { expressUser } = context;
  // ...
}
```

## レスポンスインスタンスを返す

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

[`json` ヘルパー][json] を使用すると、これを簡略化できるため、自分で構築する必要はありません。ただし、これらの2つの例は実質的に同じです。

```tsx
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async () => {
  const users = await fakeDb.users.findMany();
  return json(users);
};
```

`json` が `loader` をよりクリーンにするために少しだけ作業をしていることがわかります。また、`json` ヘルパーを使用して、レスポンスにヘッダーやステータスコードを追加することもできます。

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

こちらも参照してください。

* [`headers`][headers]
* [MDN Response ドキュメント][response]

## ローダーでのレスポンスのスロー

レスポンスを返すだけでなく、`loader` から `Response` オブジェクトをスローすることもできます。これにより、コールスタックを中断し、次の2つのいずれかを行うことができます。

* 別のURLにリダイレクトする
* `ErrorBoundary` を介してコンテキストデータとともに代替UIを表示する

以下は、ローダーでのコード実行を停止し、代替UIを表示するためにレスポンスをスローするユーティリティ関数を作成する方法を示す完全な例です。

```ts filename=app/db.ts
import { json } from "@remix-run/node"; // または cloudflare/deno

export function getInvoice(id) {
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
    // `redirect` や `json` のようなヘルパーは `Response` オブジェクトを返すため、
    // これらをスローできます。`redirect` レスポンスは別のURLにリダイレクトし、
    // 他のレスポンスは `ErrorBoundary` でレンダリングされるUIをトリガーします。
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
              アクセス権を得るには {error.data.invoiceOwnerEmail} に
              連絡してください
            </p>
          </div>
        );
      case 404:
        return <div>請求書が見つかりません！</div>;
    }

    return (
      <div>
        問題が発生しました: {error.status}{" "}
        {error.statusText}
      </div>
    );
  }

  return (
    <div>
      問題が発生しました:{" "}
      {error?.message || "不明なエラー"}
    </div>
  );
}
```

[fetch]: https://developer.mozilla.org/ja/docs/Web/API/Fetch_API

[prisma]: https://www.prisma.io

[json]: ../utils/json

[json-stringify]: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

[request]: https://developer.mozilla.org/ja/docs/Web/API/Request

[request-headers]: https://developer.mozilla.org/ja/docs/Web/API/Response/headers

[url-search-params]: https://developer.mozilla.org/ja/docs/Web/API/URLSearchParams

[response]: https://developer.mozilla.org/ja/docs/Web/API/Response

[headers]: ../route/headers
