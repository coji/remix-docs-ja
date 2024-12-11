---
title: エラー境界
---

# エラー境界

ユーザーに空のページが表示されるのを防ぐため、ルートモジュールはコード内のエラーを自動的にキャッチし、最も近い`ErrorBoundary` をレンダリングします。

エラー境界は、エラーレポートやフォーム検証エラーのレンダリングを目的としたものではありません。代わりに、[フォーム検証](./form-validation) と [エラーレポート](./error-reporting) を参照してください。

## 1. ルートエラー境界の追加

すべてのアプリケーションでは、最低限、ルートエラー境界をエクスポートする必要があります。これは、次の3つの主要なケースを処理します。

- ステータスコードとテキストを含むスローされた`data`
- スタックトレースを含むエラーのインスタンス
- ランダムにスローされた値

```tsx filename=root.tsx
import { Route } from "./+types/root";

export function ErrorBoundary({
  error,
}: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
```

## 2. バグの記述

エラー境界を制御フローの手段としてレンダリングさせるために、意図的にエラーをスローすることは推奨されません。エラー境界は主に、コード内の意図しないエラーをキャッチするためのものであるからです。

```tsx
export async function loader() {
  return undefined();
}
```

これにより、ステップ1のUIの`instanceof Error`ブランチがレンダリングされます。

これはローダーだけでなく、すべてのルートモジュールAPI（ローダー、アクション、コンポーネント、ヘッダー、リンク、メタ）に適用されます。


## 3. ローダー/アクションでデータのスロー

#2のルールには例外があり、特に404エラーの場合です。ローダーが必要なものをレンダリングできない場合、最も近いエラー境界に意図的に`throw data()`（適切なステータスコード付き）をスローできます。404をスローして先に進みます。

```tsx
import { data } from "react-router";

export async function loader({ params }) {
  let record = await fakeDb.getRecord(params.id);
  if (!record) {
    throw data("Record Not Found", { status: 404 });
  }
  return record;
}
```

これにより、ステップ1のUIの`isRouteErrorResponse`ブランチがレンダリングされます。

## 4. ネストされたエラー境界

エラーがスローされると、「最も近いエラー境界」がレンダリングされます。これらのネストされたルートを考えてみましょう。

```tsx filename="routes.ts"
// ✅ エラー境界を持つ
route("/app", "app.tsx", [
  // ❌ エラー境界を持たない
  route("invoices", "invoices.tsx", [
    // ✅ エラー境界を持つ
    route("invoices/:id", "invoice-page.tsx", [
      // ❌ エラー境界を持たない
      route("payments", "payments.tsx"),
    ]),
  ]),
]);
```

次の表は、エラーの発生元に応じてどのエラー境界がレンダリングされるかを示しています。

| エラーの発生元     | レンダリングされる境界 |
| ---------------- | ----------------- |
| app.tsx          | app.tsx           |
| invoices.tsx     | app.tsx           |
| invoice-page.tsx | invoice-page.tsx  |
| payments.tsx     | invoice-page.tsx  |

## エラーのサニタイズ

本番モードでは、サーバーで発生するエラーは、ブラウザに送信される前に自動的にサニタイズされ、機密性の高いサーバー情報（スタックトレースなど）の漏洩を防ぎます。

これは、スローされた`Error`は、ブラウザでの本番環境では一般的なメッセージとスタックトレースを持たないことを意味します。元のエラーはサーバーでは変更されません。

また、`throw data(yourData)`で送信されたデータはサニタイズされないことに注意してください。これは、そのデータがレンダリングされることを意図しているためです。

