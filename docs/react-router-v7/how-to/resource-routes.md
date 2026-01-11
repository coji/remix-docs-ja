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

## 戻り値の型

リソースルートは、戻り値の型に関して柔軟性があります。[`Response`][Response] インスタンスまたは [`data()`][data] オブジェクトを返せます。どちらの型を使用するかを決定する際の一般的な経験則は次のとおりです。

- 外部からの利用を意図したリソースルートを使用している場合は、`Response` インスタンスを返します。
  - React Router が内部で `data() -> Response` をどのように変換するかを疑問に思うのではなく、結果として得られるレスポンスのエンコーディングをコード内で明示的に保ちます。
- [fetcher][fetcher] または [`<Form>`][form] の送信からリソースルートにアクセスしている場合は、`data()` を返します。
  - UI ルートの loader/action との一貫性を保ちます。
  - `data()`/[`Await`][await] を介して Promise を UI にストリームできます。

## エラー処理

リソースルートから `Error` (または `Response`/`data()` 以外のもの) をスローすると、[`handleError`][handleError] がトリガーされ、500 HTTP レスポンスになります。

```tsx
export function action() {
  let db = await getDb();
  if (!db) {
    // Fatal error - return a 500 response and trigger `handleError`
    throw new Error("Could not connect to DB");
  }
  // ...
}
```

リソースルートが `Response` ( `new Response()` または `data()` 経由) を生成する場合、それは正常な実行と見なされ、API が HTTP リクエストに対して正常に `Response` を生成したため、[`handleError`][handleError] はトリガーされません。これは、4xx/5xx ステータスコードを持つスローされたレスポンスと、返されたレスポンスの両方に適用されます。この動作は、4xx/5xx レスポンスに対して拒否された Promise を返さない `fetch()` と一致します。

```tsx
export function action() {
  // Non-fatal error - don't trigger `handleError`:
  throw new Response(
    { error: "Unauthorized" },
    { status: 401 },
  );

  // These 3 are equivalent to the above
  return new Response(
    { error: "Unauthorized" },
    { status: 401 },
  );

  throw data({ error: "Unauthorized" }, { status: 401 });

  return data({ error: "Unauthorized" }, { status: 401 });
}
```

### エラーバウンダリ

[エラーバウンダリ][error-boundary] は、[fetcher][fetcher] の呼び出しや [`<Form>`][form] の送信など、UI からリソースルートにアクセスする場合にのみ適用されます。これらのケースでリソースルートから `throw` した場合、UI 内の最も近い `ErrorBoundary` にバブルアップします。

[handleError]: ../api/framework-conventions/entry.server.tsx#handleerror
[data]: ../api/utils/data
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[fetcher]: ../api/hooks/useFetcher
[form]: ../api/components/Form
[await]: ../api/components/Await
[error-boundary]: ../start/framework/route-module#errorboundary