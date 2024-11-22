---
title: リソースルート
---

# リソースルート

サーバーサイドレンダリングでは、ルートはコンポーネントではなく、「リソース」(画像、PDF、JSON ペイロード、Webhook など) を提供できます。

## リソースルートの定義

モジュールがデフォルトのコンポーネントをエクスポートせず、ローダーまたはアクションをエクスポートする場合、慣例によりルートはリソースルートになります。

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

リソースルートへのリンクを作成する際は、`<a>` または `<Link reloadDocument>` を使用してください。それ以外の場合は、React Router がクライアントサイドルーティングを試み、ペイロードの取得を試行します（この間違いを犯すと、役に立つエラーメッセージが表示されます）。

```tsx
<Link reloadDocument to="/reports/pdf/123">
  PDFで表示
</Link>
```

## 異なるリクエストメソッドの処理

GET リクエストは `loader` によって処理され、POST、PUT、PATCH、DELETE は `action` によって処理されます。

```tsx
import type { Route } from "./+types/resource";

export function loader(_: Route.LoaderArgs) {
  return new Response.json({ message: "GETを処理します" });
}

export function action(_: Route.LoaderArgs) {
  return new Response.json({
    message: "その他のすべてを処理します",
  });
}
```

