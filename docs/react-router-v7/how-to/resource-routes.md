---
title: リソースルート
---

# リソースルート

[MODES: framework, data]

<br/>
<br/>

サーバーレンダリング時、ルートはコンポーネントをレンダリングする代わりに、画像、PDF、JSONペイロード、Webhookなどの「リソース」を提供できます。

## リソースルートの定義

ルートがリソースルートになるのは、そのモジュールがローダーまたはアクションをエクスポートするが、デフォルトのコンポーネントをエクスポートしない場合という規約によるものです。

UIの代わりにPDFを提供するルートを考えてみましょう。

```ts
route("/reports/pdf/:id", "pdf-report.ts");
```

```tsx filename=pdf-report.ts
import type { Route } from "./+types/pdf-report";

export async function loader({ params }: Route.LoaderArgs) {
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

デフォルトのエクスポートがないことに注意してください。これにより、このルートはリソースルートになります。

## リソースルートへのリンク

リソースルートにリンクする場合は、`<a>`または`<Link reloadDocument>`を使用してください。そうしないと、React Routerがクライアント側のルーティングとペイロードのフェッチを試みます（この間違いを犯すと、役立つエラーメッセージが表示されます）。

```tsx
<Link reloadDocument to="/reports/pdf/123">
  PDFとして表示
</Link>
```

## さまざまなリクエストメソッドの処理

GETリクエストは`loader`によって処理され、POST、PUT、PATCH、およびDELETEは`action`によって処理されます。

```tsx
import type { Route } from "./+types/resource";

export function loader(_: Route.LoaderArgs) {
  return Response.json({ message: "私はGETを処理します" });
}

export function action(_: Route.ActionArgs) {
  return Response.json({
    message: "私はその他すべてを処理します",
  });
}
```