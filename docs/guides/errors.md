---
title: エラー処理
---

# エラー処理

Remix は、Web アプリケーションのエラー処理に新しい基準を設け、あなたもきっと気に入るでしょう。Remix は、サーバーまたはブラウザ内のコードの大部分のエラーを自動的にキャッチし、エラーが発生した場所に近い [`ErrorBoundary`][error-boundary] をレンダリングします。React の [`componentDidCatch`][component-did-catch] および [`getDerivedStateFromError`][get-derived-state-from-error] クラスコンポーネントフックに慣れているなら、サーバーでのエラー処理が追加されているだけで、それと同じようなものです。

Remix は、次の場合にエラーを自動的にキャッチし、最も近いエラーバウンダリをレンダリングします。

- ブラウザでのレンダリング中
- サーバーでのレンダリング中
- 初期サーバーレンダリングされたドキュメント要求中の `loader` 内
- 初期サーバーレンダリングされたドキュメント要求中の `action` 内
- ブラウザでのクライアントサイド遷移中の `loader` 内（Remix はエラーをシリアル化し、ネットワークを介してブラウザに送信します）
- ブラウザでのクライアントサイド遷移中の `action` 内

## ルートエラーバウンダリ

デフォルトで、Remix にはデフォルトの `ErrorBoundary` が組み込まれていますが、独自のグローバルエラーバウンダリに少しブランディングを追加したいと思うでしょう。これは、`app/root.tsx` から独自の [`ErrorBoundary`][error-boundary] をエクスポートすることで行うことができます。これは、キャッチされていないエラーが発生したときにユーザーが目にします。

```tsx
export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* ユーザーに見せたい UI を追加 */}
        <Scripts />
      </body>
    </html>
  );
}
```

ルートエラーバウンダリがレンダリングされると、ドキュメント全体がマウントおよびアンマウントされるため、[`Links`][links-component]、[`Meta`][meta-component]、および [`Scripts`][scripts-component] コンポーネントをレンダリングし続けるようにしてください。

## ネストされたエラーバウンダリ

階層内の各ルートは、潜在的なエラーバウンダリです。ネストされたルートがエラーバウンダリをエクスポートすると、その下のエラーはそこでキャッチされ、レンダリングされます。これは、親ルートの周りの UI の残りの部分は _通常通りレンダリングされ続ける_ことを意味するため、ユーザーは別のリンクをクリックしても、保持している可能性のあるクライアント側の状態を失うことはありません。

たとえば、次のルートを考えてみましょう。

```text
app/
├── routes/
│   ├── sales.tsx
│   ├── sales.invoices.tsx
│   └── sales.invoices.$invoiceId.tsx
└── root.tsx
```

`app/routes/sales.invoices.$invoiceId.tsx` が [`ErrorBoundary`][error-boundary] をエクスポートし、そのコンポーネント、[`action`][action]、または [`loader`][loader] でエラーがスローされた場合、アプリの残りは正常にレンダリングされ、ページのインボイスセクションのみエラーがレンダリングされます。

![親ルートのナビゲーションが正常にレンダリングされるネストされたルートでのエラー][error-in-a-nested-route-where-the-parent-route-s-navigation-renders-normally]

ルートにエラーバウンダリがない場合、エラーはルートエラーバウンダリまで、ルートエラーバウンダリまで「バブルアップ」するため、すべてのルートにエラーバウンダリを追加する必要はありません。UI に特別なタッチを追加したい場合のみです。

## エラーの無害化

プロダクションモードでは、サーバーで発生したエラーはすべて自動的に無害化され、機密性の高いサーバー情報（スタックトレースなど）をクライアントに漏らすのを防ぎます。これは、[`useRouteError`][use-route-error] から受け取る `Error` インスタンスに、一般的なメッセージとスタックトレースが含まれないことを意味します。

```tsx
export async function loader() {
  if (badConditionIsTrue()) {
    throw new Error("Oh no! Something went wrong!");
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  // NODE_ENV=production の場合:
  // error.message = "Unexpected Server Error"
  // error.stack = undefined
}
```

これらのエラーをログに記録したり、[BugSnag][bugsnag] や [Sentry][sentry] などのサードパーティサービスに報告したりする必要がある場合は、[`app/entry.server.js`][entry-server] の [`handleError`][handle-error] エクスポートを通じて行うことができます。このメソッドは、サーバーでも実行されているため、エラーの無害化されていないバージョンを受け取ります。

エラーバウンダリをトリガーし、ブラウザに特定のメッセージまたはデータを表示する場合は、`action`/`loader` からそのデータを含む `Response` をスローできます。

```tsx
export async function loader() {
  if (badConditionIsTrue()) {
    throw new Response("Oh no! Something went wrong!", {
      status: 500,
    });
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    // error.status = 500
    // error.data = "Oh no! Something went wrong!"
  }
}
```

[component-did-catch]: https://react.dev/reference/react/Component#componentdidcatch
[get-derived-state-from-error]: https://react.dev/reference/react/Component#static-getderivedstatefromerror
[error-boundary]: ../route/error-boundary
[links-component]: ../components/links
[meta-component]: ../components/meta
[scripts-component]: ../components/scripts
[error-in-a-nested-route-where-the-parent-route-s-navigation-renders-normally]: /docs-images/error-boundary.png
[action]: ../route/action
[loader]: ../route/loader
[use-route-error]: ../hooks/use-route-error
[bugsnag]: https://www.bugsnag.com/
[sentry]: https://sentry.io/
[handle-error]: ../file-conventions/entry.server#handleerror
[entry-server]: ../file-conventions/entry.server


