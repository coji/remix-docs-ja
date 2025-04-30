---
title: Not Found Handling
---

# Not Found (404) の処理

ウェブサーバー上でドキュメントが見つからない場合、[404 ステータスコード][404-status-code]を送信する必要があります。これは、ドキュメントが存在しないことをマシンに示します。検索エンジンはインデックスを作成せず、CDN はキャッシュしません。今日のほとんどの SPA は、ページが存在するかどうかにかかわらず、すべてを 200 として提供していますが、今日でそれは終わりです！

Remix サイトが 404 を送信する必要がある主なケースは 2 つあります。

- URL がアプリ内のどのルートにも一致しない場合
- ローダーがデータを見つけられなかった場合

最初のケースは Remix によってすでに処理されており、自分でレスポンスをスローする必要はありません。Remix はルートを認識しているため、何も一致しなかったかどうかを把握しています（このケースを処理するには、[スプラットルート][splat-route]の使用を検討してください）。2 番目のケースはあなた次第ですが、非常に簡単です。

## 404 を送信する方法

ユーザーが探しているものがないとわかったらすぐに、_レスポンスをスロー_する必要があります。

```tsx filename=app/routes/page.$slug.tsx
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const page = await db.page.findOne({
    where: { slug: params.slug },
  });

  if (!page) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json(page);
}
```

Remix はレスポンスをキャッチし、アプリを[エラー境界][error-boundary]パスに送ります。実際には、Remix の自動[エラー処理][errors]とまったく同じですが、`useRouteError()` から `Error` を受け取る代わりに、レスポンスの `status`、`statusText`、および抽出された `data` を持つオブジェクトを受け取ります。

レスポンスをスローすることの良い点は、ローダー内のコードの_実行が停止する_ことです。残りのコードは、ページが定義されているかどうかを処理する必要がありません（これは特に TypeScript で便利です）。

スローすることで、ローダーが成功しなかった場合にルートコンポーネントがレンダリングされないことも保証されます。ルートコンポーネントは「ハッピーパス」のみを考慮する必要があります。保留状態、エラー状態、またはこのケースでは、見つからない状態を考慮する必要はありません。

## ルートエラー境界

おそらく、アプリのルートにすでに 1 つあるでしょう。これは、ネストされたルートで処理されなかったすべてのスローされたレスポンスを処理します。以下にサンプルを示します。

```tsx
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>おっと！</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
            ? error.message
            : "不明なエラー"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}
```

[error-boundary]: ../route/error-boundary
[errors]: ./errors
[404-status-code]: https://developer.mozilla.org/ja/docs/Web/HTTP/Status/404
[splat-route]: ../file-conventions/routes#splat-routes

