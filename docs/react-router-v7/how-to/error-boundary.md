---
title: エラー境界
---

# エラー境界

[MODES: framework, data]

ユーザーに空のページが表示されるのを避けるため、ルートモジュールはコード内のエラーを自動的にキャッチし、最も近い `ErrorBoundary` をレンダリングします。

エラー境界は、エラー報告やフォーム検証エラーのレンダリングを目的としたものではありません。代わりに、[フォーム検証](./form-validation) および [エラー報告](./error-reporting) を参照してください。

## 1. ルートエラー境界を追加する

すべてのアプリケーションは、少なくともルートエラー境界をエクスポートする必要があります。これは、次の3つの主なケースを処理します。

- ステータスコードとテキストを持つ `data` がスローされた場合
- スタックトレースを持つエラーのインスタンス
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
        <h1>エラー</h1>
        <p>{error.message}</p>
        <p>スタックトレースは次のとおりです:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>不明なエラー</h1>;
  }
}
```

## 2. バグを書く

制御フローの手段として、エラー境界を強制的にレンダリングするために意図的にエラーをスローすることは推奨されません。エラー境界は、主にコード内の意図しないエラーをキャッチするためのものです。

```tsx
export async function loader() {
  return undefined();
}
```

これにより、ステップ1のUIの `instanceof Error` ブランチがレンダリングされます。

これはローダーだけでなく、すべてのルートモジュールAPI（ローダー、アクション、コンポーネント、ヘッダー、リンク、メタ）にも当てはまります。

## 3. ローダー/アクションでデータをスローする

#2のルールには例外があり、特に404エラーの場合です。ローダーがページをレンダリングするために必要なものを見つけられない場合、最も近いエラー境界に意図的に `throw data()` (適切なステータスコード付き) をスローできます。404をスローして次に進みます。

```tsx
import { data } from "react-router";

export async function loader({ params }) {
  let record = await fakeDb.getRecord(params.id);
  if (!record) {
    throw data("レコードが見つかりません", { status: 404 });
  }
  return record;
}
```

これにより、ステップ1のUIの `isRouteErrorResponse` ブランチがレンダリングされます。

## 4. ネストされたエラー境界

エラーがスローされると、「最も近いエラー境界」がレンダリングされます。次のネストされたルートを考えてみましょう。

```tsx filename="routes.ts"
// ✅ エラー境界あり
route("/app", "app.tsx", [
  // ❌ エラー境界なし
  route("invoices", "invoices.tsx", [
    // ✅ エラー境界あり
    route("invoices/:id", "invoice-page.tsx", [
      // ❌ エラー境界なし
      route("payments", "payments.tsx"),
    ]),
  ]),
]);
```

次の表は、エラーの発生元に基づいて、どのエラー境界がレンダリングされるかを示しています。

| エラーの発生元     | レンダリングされる境界 |
| ---------------- | ----------------- |
| app.tsx          | app.tsx           |
| invoices.tsx     | app.tsx           |
| invoice-page.tsx | invoice-page.tsx  |
| payments.tsx     | invoice-page.tsx  |

## エラーのサニタイズ

本番モードでは、サーバーで発生したエラーは、機密性の高いサーバー情報（スタックトレースなど）が漏洩するのを防ぐために、ブラウザに送信される前に自動的にサニタイズされます。

つまり、スローされた `Error` は、本番環境のブラウザでは一般的なメッセージを持ち、スタックトレースは含まれません。元のエラーはサーバー上では変更されません。

また、`throw data(yourData)` で送信されたデータは、そこに表示されることを意図しているため、サニタイズされないことに注意してください。
