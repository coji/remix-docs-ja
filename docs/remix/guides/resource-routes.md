---
title: リソースルート
---

# リソースルート

リソースルートはアプリケーションの UI の一部ではありませんが、アプリケーションの一部ではあります。あらゆる種類のレスポンスを送信できます。

Remix のほとんどのルートは UI ルート、つまり実際にコンポーネントをレンダリングするルートです。しかし、ルートは必ずしもコンポーネントをレンダリングする必要はありません。ルートをウェブサイトへの汎用エンドポイントとして使用したい場合がいくつかあります。以下にいくつかの例を示します。

- Remix UI でサーバーサイドコードを再利用するモバイルアプリ用の JSON API
- PDF の動的な生成
- ブログ記事やその他のページ用のソーシャル画像の動的な生成
- Stripe や GitHub などの他のサービス用の Webhook
- ユーザーの好みのテーマに合わせてカスタムプロパティを動的にレンダリングする CSS ファイル

## リソースルートの作成

ルートがデフォルトのコンポーネントをエクスポートしない場合、リソースルートとして使用できます。`GET` で呼び出された場合、ローダーのレスポンスが返され、親ルートのローダーも呼び出されません（これらは UI に必要ですが、これは UI ではないため）。`POST` で呼び出された場合、アクションのレスポンスが呼び出されます。

たとえば、レポートをレンダリングする UI ルートを考えてみましょう。リンクに注目してください。

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
        PDF として表示
      </Link>
      {/* ... */}
    </div>
  );
}
```

これはページの PDF バージョンへのリンクです。これを機能させるために、その下にリソースルートを作成できます。コンポーネントがないことに注意してください。これにより、リソースルートになります。

```tsx filename=app/routes/reports.$id[.pdf].tsx
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

<docs-error>リソースルートへのリンクには、必ず <code>reloadDocument</code> を使用してください</docs-error>

リソースルートにリンクする際に注意すべき微妙な点があります。`<Link reloadDocument>` またはプレーンな `<a href>` でリンクする必要があります。`reloadDocument` なしで通常の `<Link to="pdf">` でリンクすると、リソースルートは UI ルートとして扱われます。Remix は `fetch` でデータを取得し、コンポーネントをレンダリングしようとします。あまり心配しないでください。この間違いを犯すと、役立つエラーメッセージが表示されます。

## URL エスケープ

リソースルートにファイル拡張子を追加したい場合があるでしょう。Remix のルートファイル命名規則の 1 つに、`\` が `/` になるため、UI をネストせずに URL をネストできるというものがあるため、これはトリッキーです。

ルートのパスに `.` を追加するには、`[]` エスケープ文字を使用します。PDF ルートのファイル名は次のように変更されます。

```sh
# オリジナル
# /reports/123/pdf
app/routes/reports.$id.pdf.ts

# ファイル拡張子付き
# /reports/123.pdf
app/routes/reports.$id[.pdf].ts

# またはこのように、結果の URL は同じ
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
  // "GET" リクエストを処理

  return json({ success: true }, 200);
};
```

`POST`、`PUT`、`PATCH`、または `DELETE` リクエストを処理するには、アクション関数をエクスポートします。

```tsx
import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      /* "POST" を処理 */
    }
    case "PUT": {
      /* "PUT" を処理 */
    }
    case "PATCH": {
      /* "PATCH" を処理 */
    }
    case "DELETE": {
      /* "DELETE" を処理 */
    }
  }
};
```

## Webhook

リソースルートは、Webhook を処理するために使用できます。たとえば、新しいコミットがリポジトリにプッシュされたときに GitHub から通知を受信する Webhook を作成できます。

```tsx
import crypto from "node:crypto";

import type { ActionFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ message: "許可されていないメソッド" }, 405);
  }
  const payload = await request.json();

  /* Webhook を検証 */
  const signature = request.headers.get(
    "X-Hub-Signature-256"
  );
  const generatedSignature = `sha256=${crypto
    .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex")}`;
  if (signature !== generatedSignature) {
    return json({ message: "署名が一致しません" }, 401);
  }

  /* Webhook を処理 (例: バックグラウンドジョブをキューに入れる) */

  return json({ success: true }, 200);
};
```