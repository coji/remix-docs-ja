---
title: リソースルート
---

# リソースルート

サーバーサイドレンダリングにおいて、ルートはコンポーネントをレンダリングする代わりに、「リソース」を提供できます。例えば、画像、PDF、JSON ペイロード、Webhook などです。

## リソースルートの定義

モジュールがデフォルトコンポーネントをエクスポートせず、ローダーまたはアクションをエクスポートする場合、慣例によりルートはリソースルートになります。

UIではなくPDFを提供するルートを考えてみましょう。

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

デフォルトエクスポートがないことに注意してください。これにより、このルートはリソースルートになります。

## リソースルートへのリンク

リソースルートへのリンクを作成する際は、`<a>` または `<Link reloadDocument>` を使用してください。それ以外の方法では、React Router はクライアントサイドルーティングを試み、ペイロードのフェッチを試みます（間違えると、役立つエラーメッセージが表示されます）。

```tsx
<Link reloadDocument to="/reports/pdf/123">
  PDFで表示
</Link>
```

## 異なるリクエストメソッドの処理

GETリクエストは`loader`で処理され、POST、PUT、PATCH、DELETEは`action`で処理されます。

```tsx
import type { Route } from "./+types/resource";

export function loader(_: Route.LoaderArgs) {
  return Response.json({ message: "I handle GET" });
}

export function action(_: Route.ActionArgs) {
  return Response.json({
    message: "I handle everything else",
  });
}
```

