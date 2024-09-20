---
title: リソースルート
---

# リソースルート

リソースルートは、アプリケーションの UI の一部ではありませんが、アプリケーションの一部です。あらゆる種類のレスポンスを送信できます。

Remix のほとんどのルートは UI ルート、つまり実際にコンポーネントをレンダリングするルートです。しかし、ルートは必ずしもコンポーネントをレンダリングする必要はありません。ルートを Web サイトへの汎用的なエンドポイントとして使用したいケースがいくつかあります。以下に例をいくつか示します。

- Remix UI とサーバー側コードを再利用するモバイルアプリ用の JSON API
- PDF の動的生成
- ブログ投稿やその他のページのソーシャル画像の動的生成
- Stripe や GitHub などの他のサービスの Webhook
- ユーザーが選択したテーマのカスタムプロパティを動的にレンダリングする CSS ファイル

## リソースルートの作成

ルートがデフォルトのコンポーネントをエクスポートしない場合、リソースルートとして使用できます。`GET` で呼び出されると、ローダーのレスポンスが返され、親ルートローダーも呼び出されません（これらは UI に必要ですが、これは UI ではありません）。`POST` で呼び出されると、アクションのレスポンスが呼び出されます。

たとえば、レポートをレンダリングする UI ルートを考え、リンクに注目してください。

```tsx filename=app/routes/reports.$id.tsx lines=[12-14]
export async function loader({
  params,
}: LoaderFunctionArgs) {
  return json(await getReport(params.id));
}

export default function Report() {
  const report = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>{report.name}</h1>
      <Link to="pdf" reloadDocument>
        PDF で表示
      </Link>
      {/* ... */}
    </div>
  );
}
```

これは、ページの PDF バージョンへのリンクです。この機能を実現するために、その下にリソースルートを作成できます。コンポーネントを持たないことに注目してください。これがリソースルートになります。

```tsx filename=app/routes/reports.$id.pdf.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const report = await getReport(params.id);
  const pdf = await generateReportPDF(report);
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
```

ユーザーが UI ルートからリンクをクリックすると、PDF に移動します。

## リソースルートへのリンク

<docs-error>リソースルートへのリンクでは、<code>reloadDocument</code> を使用する必要があります</docs-error>

リソースルートへのリンクを行う際に注意すべき微妙な点があります。`<Link reloadDocument>` またはプレーンな `<a href>` でリンクする必要があります。`reloadDocument` なしで通常の `<Link to="pdf">` でリンクすると、リソースルートは UI ルートとして扱われます。Remix は `fetch` でデータを取得してコンポーネントをレンダリングしようとします。あまり気にしないでください。この間違いをすると、役に立つエラーメッセージが表示されます。

## URL エスケープ

リソースルートには、ファイル拡張子を付けたいと思うでしょう。これは、Remix のルートファイル命名規則の 1 つが `.` を `/` に変換することであるため、UI をネストすることなく URL をネストできるため、厄介です。

ルートのパスに `.` を追加するには、`[]` エスケープ文字を使用します。PDF ルートファイル名は、次のようになります。

```sh
# 元のファイル
# /reports/123/pdf
app/routes/reports.$id.pdf.ts

# ファイル拡張子あり
# /reports/123.pdf
app/routes/reports.$id[.pdf].ts

# または、このようにもできます。結果の URL は同じです
app/routes/reports.$id[.]pdf.ts
```

## さまざまなリクエストメソッドの処理

`GET` リクエストを処理するには、ローダー関数をエクスポートします。

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  // "GET" リクエストを処理する

  return json({ success: true }, 200);
};
```

`POST`, `PUT`, `PATCH` または `DELETE` リクエストを処理するには、アクション関数をエクスポートします。

```tsx
import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      /* "POST" を処理する */
    }
    case "PUT": {
      /* "PUT" を処理する */
    }
    case "PATCH": {
      /* "PATCH" を処理する */
    }
    case "DELETE": {
      /* "DELETE" を処理する */
    }
  }
};
```

## Webhook

リソースルートは、Webhook の処理に使用できます。たとえば、新しいコミットがリポジトリにプッシュされたときに GitHub から通知を受け取る Webhook を作成できます。

```tsx
import crypto from "node:crypto";

import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }
  const payload = await request.json();

  /* Webhook を検証する */
  const signature = request.headers.get(
    "X-Hub-Signature-256"
  );
  const generatedSignature = `sha256=${crypto
    .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex")}`;
  if (signature !== generatedSignature) {
    return json({ message: "Signature mismatch" }, 401);
  }

  /* Webhook を処理する（例：バックグラウンドジョブをキューに入れる） */

  return json({ success: true }, 200);
};
```


