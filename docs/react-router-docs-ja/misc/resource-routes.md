---
title: リソースルート
---

<docs-info>[React Router Vite Plugin][vite-plugin] を使用する場合にのみ使用できます。</docs-info>

# リソースルート

リソースルートはアプリケーション UI の一部ではありませんが、アプリケーションの一部です。あらゆる種類のレスポンスを送信できます。

React Router のほとんどのルートは UI ルート、つまりコンポーネントを実際にレンダリングするルートです。しかし、ルートは常にコンポーネントをレンダリングする必要はありません。ルートを Web サイトへの汎用的なエンドポイントとして使用したいケースがいくつかあります。例をいくつか示します。

- React Router UI でサーバー側コードを再利用するモバイルアプリの JSON API
- PDF の動的な生成
- ブログ記事や他のページのソーシャル画像の動的な生成
- Stripe や GitHub などの他のサービスの Webhook
- ユーザーの好みのテーマに合わせてカスタムプロパティを動的にレンダリングする CSS ファイル

## リソースルートの作成

ルートがデフォルトのコンポーネントをエクスポートしない場合、リソースルートとして使用できます。`GET` で呼び出されると、ローダーのレスポンスが返され、親ルートローダーも呼び出されません（これらは UI に必要ですが、これは UI ではありません）。`POST` で呼び出されると、アクションのレスポンスが返されます。

たとえば、レポートをレンダリングする UI ルートを考えてみてください。リンクに注目してください。

```tsx filename=app/routes/reports.$id.tsx lines=[12-14]
export async function loader({
  params,
}: LoaderFunctionArgs) {
  let report = await getReport(params.id);
  return report;
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

このページの PDF バージョンへのリンクです。これを機能させるには、その下にリソースルートを作成できます。デフォルトのエクスポートコンポーネントがないことに注意してください。これがリソースルートになります。

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

<docs-info>ファイル名は [エスケープパターン][escaping] を使用して、URL に拡張子を組み込んでいます。</docs-info>

ユーザーが UI ルートからリンクをクリックすると、PDF に移動します。

## リソースルートへのリンク

<docs-error>リソースルートへのリンクでは、必ず `reloadDocument` を使用するようにしてください。</docs-error>

リソースルートへのリンクには、注意すべき微妙な点があります。`<Link reloadDocument>` またはプレーンな `<a href>` を使用してリンクする必要があります。`reloadDocument` なしで通常の `<Link to="pdf">` を使用してリンクすると、リソースルートは UI ルートとして扱われます。React Router は `fetch` を使用してデータを取得し、コンポーネントをレンダリングしようとします。あまり心配する必要はありません。この間違いを犯すと、役に立つエラーメッセージが表示されます。

## さまざまなリクエストメソッドの処理

`GET` リクエストを処理するには、ローダー関数をエクスポートします。

```tsx
import type * as Route from "./+types.resource";

export const loader = async ({
  request,
}: Route.LoaderArgs) => {
  // "GET" リクエストを処理する

  return { success: true };
};
```

`POST`、`PUT`、`PATCH`、`DELETE` リクエストを処理するには、アクション関数をエクスポートします。

```tsx
import type * as Route from "./+types.resource";

export const action = async ({
  request,
}: Route.ActionArgs) => {
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

リソースルートは [非標準の HTTP メソッド][nonstandard-http-methods] をサポートしていません。これらは、React Router リクエストを提供する HTTP サーバーによって処理される必要があります。

## Turbo Stream

リソースルートからベアオブジェクトを返したり、[`data` ユーティリティ][data-util] を使用したりすると、レスポンスが [turbo-stream][turbo-stream] として自動的にエンコードされます。これにより、日付、Promise、その他のオブジェクトがネットワーク上で自動的にシリアル化されます。React Router は、`<Form>`、`useSubmit`、`useFetcher` などの React Router API からリソースルートを呼び出すと、turbo-stream データを自動的に逆シリアル化します。

Webhook などのサードパーティサービスは、リソースルートを呼び出す場合、turbo-stream データをデコードできない可能性があります。`Response.json` または `Content-Type` ヘッダーを含む `new Response()` を使用して、その他の種類のデータで応答するには、`Response` インスタンスを使用する必要があります。

```ts
export const action = async () => {
  return Response.json(
    { time: Date.now() },
    {
      status: 200,
    }
  );
};
```

<docs-warning>turbo-stream はリソースルートの実装の詳細であり、React Router API の外では依存すべきではありません。モバイルアプリの `fetch` 呼び出しなど、React Router の外部で turbo-stream レスポンスを手動でデコードする場合は、`turbo-stream` パッケージを直接使用してデータを手動でエンコードし、`new Response` を使用して返すと、クライアント側で `turbo-stream` を使用してレスポンスをデコードするのが最善です。</docs-warning>

## クライアントローダーとクライアントアクション

`<Form>`、`useSubmit`、フェッチャーを使用してリソースルートを呼び出すと、リソースルートで定義されたクライアントローダーとアクションがリクエストライフサイクルに関与します。

```ts
import type * as Route from "./+types.github";

export const action = async () => {
  return Response.json(
    { time: Date.now() },
    {
      status: 200,
    }
  );
};

export const clientAction = async ({
  serverAction,
}: Route.ClientActionArgs) => {
  return Promise.race([
    serverAction,
    new Promise((resolve, reject) =>
      setTimeout(reject, 5000)
    ),
  ]);
};
```

## Webhook

リソースルートは、Webhook を処理するために使用できます。たとえば、新しいコミットがリポジトリにプッシュされたときに GitHub から通知を受け取る Webhook を作成できます。

```tsx
import type * as Route from "./+types.github";

import crypto from "node:crypto";

export const action = async ({
  request,
}: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return Response.json(
      { message: "Method not allowed" },
      {
        status: 405,
      }
    );
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
    return Response.json(
      { message: "Signature mismatch" },
      {
        status: 401,
      }
    );
  }

  /* Webhook を処理する（例：バックグラウンドジョブをキューに入れる） */

  return Response.json({ success: true });
};
```

[vite-plugin]: ../start/rendering
[turbo-stream]: https://github.com/jacob-ebey/turbo-stream
[data-util]: ../../api/react-router/data
[nonstandard-http-methods]: https://github.com/remix-run/react-router/issues/11959
[escaping]: ../misc/file-route-conventions#escaping-special-characters



