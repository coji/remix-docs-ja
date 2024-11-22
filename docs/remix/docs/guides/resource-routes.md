---
title: リソースルート
---

# リソースルート

リソースルートは、アプリケーションUIの一部ではありませんが、アプリケーションの一部です。あらゆる種類のレスポンスを送信できます。

RemixのほとんどのルートはUIルート、つまり実際にコンポーネントをレンダリングするルートです。しかし、ルートは常にコンポーネントをレンダリングする必要はありません。ルートをWebサイトへの汎用的なエンドポイントとして使用したいケースがいくつかあります。以下は例です。

- Remix UIとサーバーサイドコードを再利用するモバイルアプリ向けのJSON API
- 動的にPDFを生成する
- ブログ投稿やその他のページのソーシャル画像を動的に生成する
- StripeやGitHubなどの他のサービス向けのWebhook
- ユーザーの好みのテーマに合わせてカスタムプロパティを動的にレンダリングするCSSファイル

## リソースルートの作成

ルートがデフォルトのコンポーネントをエクスポートしていない場合、リソースルートとして使用できます。 `GET`で呼び出されると、ローダーのレスポンスが返され、親ルートのローダーはどちらも呼び出されません（UIには必要ですが、これはUIではありません）。 `POST`で呼び出されると、アクションのレスポンスが呼び出されます。

たとえば、レポートをレンダリングするUIルートを考えてみましょう。リンクに注目してください。

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
        View as PDF
      </Link>
      {/* ... */}
    </div>
  );
}
```

ページのPDFバージョンへのリンクがあります。これを機能させるには、その下にリソースルートを作成します。コンポーネントがないことに注目してください。これは、リソースルートであることを示しています。

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

ユーザーがUIルートからリンクをクリックすると、PDFに移動します。

## リソースルートへのリンク

<docs-error>リソースルートへのリンクには、<code>reloadDocument</code>を使用することが必須です。</docs-error>

リソースルートへのリンク時には、注意すべき微妙な点があります。 `<Link reloadDocument>`またはプレーンな`<a href>`を使用してリンクする必要があります。 `reloadDocument`なしで通常の`<Link to="pdf">`を使用してリンクすると、リソースルートがUIルートとして扱われます。Remixは`fetch`でデータを取得し、コンポーネントをレンダリングしようとします。あまり心配しないでください。この間違いをすると、役に立つエラーメッセージが表示されます。

## URLエスケープ

リソースルートにはファイル拡張子を追加する必要があるでしょう。これは、Remixのルートファイルの命名規則の1つに、`.`が`/`になるため、UIをネストせずにURLをネストできるという問題があるため、難しいことです。

ルートのパスに`.`を追加するには、`[]`エスケープ文字を使用します。PDFルートファイル名は、次のように変更されます。

```sh
# 元々
# /reports/123/pdf
app/routes/reports.$id.pdf.ts

# ファイル拡張子付き
# /reports/123.pdf
app/routes/reports.$id[.pdf].ts

# またはこのように、結果は同じURLです
app/routes/reports.$id[.]pdf.ts
```

## 異なるリクエストメソッドの処理

`GET`リクエストを処理するには、ローダー関数をエクスポートします。

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  // "GET"リクエストを処理

  return json({ success: true }, 200);
};
```

`POST`、`PUT`、`PATCH`、`DELETE`リクエストを処理するには、アクション関数をエクスポートします。

```tsx
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST": {
      /* "POST"を処理 */
    }
    case "PUT": {
      /* "PUT"を処理 */
    }
    case "PATCH": {
      /* "PATCH"を処理 */
    }
    case "DELETE": {
      /* "DELETE"を処理 */
    }
  }
};
```

## Webhook

リソースルートは、Webhookを処理するために使用できます。たとえば、新しいコミットがリポジトリにプッシュされたときにGitHubから通知を受け取るWebhookを作成できます。

```tsx
import crypto from "node:crypto";

import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }
  const payload = await request.json();

  /* Webhookを検証 */
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

  /* Webhookを処理する（例：バックグラウンドジョブをエンキューする） */

  return json({ success: true }, 200);
};
```



