---
title: Not Found の処理
---

# Not Found (404) の処理

ドキュメントが Web サーバーで見つからない場合、[404 ステータスコード][404-status-code] を送信する必要があります。これにより、マシンはドキュメントが存在しないことを認識します。検索エンジンはインデックスを作成せず、CDN はキャッシュしません。今日のほとんどの SPA は、ページが存在するかどうかを問わず 200 としてすべてを提供しますが、今日はそれらを止めましょう！

Remix サイトで 404 を送信する必要がある主なケースは 2 つあります。

- URL がアプリのルートと一致しない
- ローダーがデータを見つけられなかった

最初のケースはすでに Remix によって処理されているため、自分でレスポンスをスローする必要はありません。Remix はルートを知っているので、一致しないものがあればわかります (_このケースを処理するために [Splat ルート][splat-route] を使用する_)。2 番目のケースはあなた次第ですが、とても簡単です。

## 404 を送信する方法

ユーザーが探しているものが見つからないとわかるとすぐに、_レスポンスをスロー_ する必要があります。

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

Remix はレスポンスをキャッチして、アプリを [エラー境界][error-boundary] パスに沿って送信します。これは実際には Remix の自動的な [エラー処理][errors] とまったく同じですが、`useRouteError()` から `Error` を受け取る代わりに、レスポンスの `status`、`statusText`、および抽出された `data` を持つオブジェクトを受け取ります。

レスポンスをスローすることの利点は、ローダー内のコードが_実行を停止する_ことです。コードの残りは、ページが定義されているかどうかという可能性に対処する必要はありません（これは特に TypeScript では便利です）。

スローすることで、ローダーが成功しなかった場合、ルートコンポーネントはレンダリングされなくなります。ルートコンポーネントは、「ハッピーパス」のみを考慮する必要があります。ペディング状態、エラー状態、またはこのケースでは、見つからない状態を考慮する必要はありません。

## ルートエラー境界

おそらく、アプリのルートにすでに 1 つあるでしょう。これは、ネストされたルートで処理されなかったスローされたすべてのレスポンスを処理します。以下はサンプルです。

```tsx
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
            ? error.message
            : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}
```

[error-boundary]: ../route/error-boundary
[errors]: ./errors
[404-status-code]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
[splat-route]: ../file-conventions/routes#splat-routes
