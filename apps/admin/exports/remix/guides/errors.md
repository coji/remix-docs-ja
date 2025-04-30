---
title: エラーハンドリング
---

# エラーハンドリング

Remix は、Web アプリケーションのエラーハンドリングにおいて、あなたが気に入るであろう新しい先例を打ち立てます。Remix は、コード内のほとんどのエラーを、サーバー側でもブラウザ側でも自動的にキャッチし、エラーが発生した場所に最も近い [`ErrorBoundary`][error-boundary] をレンダリングします。React の [`componentDidCatch`][component-did-catch] や [`getDerivedStateFromError`][get-derived-state-from-error] クラスコンポーネントのフックに慣れている方なら、それとよく似ていますが、サーバー側でのエラーに対する追加の処理がいくつかあります。

Remix は、以下の場合にスローされたエラーを自動的にキャッチし、最も近いエラー境界をレンダリングします。

- ブラウザでのレンダリング中
- サーバーでのレンダリング中
- 初期サーバーレンダリングドキュメントリクエスト中の `loader` 内
- 初期サーバーレンダリングドキュメントリクエスト中の `action` 内
- ブラウザでのクライアントサイドトランジション中の `loader` 内 (Remix はエラーをシリアライズし、ネットワーク経由でブラウザに送信します)
- ブラウザでのクライアントサイドトランジション中の `action` 内

## ルートエラー境界

デフォルトでは、Remix には組み込みのデフォルトの `ErrorBoundary` が付属していますが、独自のグローバルエラー境界に少しブランディングを追加したいと思うでしょう。これは、`app/root.tsx` から独自の [`ErrorBoundary`][error-boundary] をエクスポートすることで実現できます。これは、キャッチされないエラーがスローされたときにユーザーに表示されるものです。

```tsx
export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html>
      <head>
        <title>大変だ！</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* ユーザーに表示させたい UI を追加 */}
        <Scripts />
      </body>
    </html>
  );
}
```

[`Links`][links-component]、[`Meta`][meta-component]、[`Scripts`][scripts-component] コンポーネントは、ルートエラー境界がレンダリングされるときにドキュメント全体がマウントおよびアンマウントされるため、必ずレンダリングするようにしてください。

## ネストされたエラー境界

階層内の各ルートは、潜在的なエラー境界です。ネストされたルートがエラー境界をエクスポートする場合、その下のエラーはすべてキャッチされ、そこでレンダリングされます。これは、親ルートの残りの周囲の UI が _通常どおりレンダリングされ続ける_ ため、ユーザーは別のリンクをクリックでき、クライアント側の状態を失うことがないことを意味します。

たとえば、次のルートを考えてみましょう。

```text
app/
├── routes/
│   ├── sales.tsx
│   ├── sales.invoices.tsx
│   └── sales.invoices.$invoiceId.tsx
└── root.tsx
```

`app/routes/sales.invoices.$invoiceId.tsx` が [`ErrorBoundary`][error-boundary] をエクスポートし、そのコンポーネント、[`action`][action]、または [`loader`][loader] でエラーがスローされた場合、アプリの残りの部分は正常にレンダリングされ、ページの請求書セクションのみがエラーをレンダリングします。

![親ルートのナビゲーションが正常にレンダリングされるネストされたルートのエラー][error-in-a-nested-route-where-the-parent-route-s-navigation-renders-normally]

ルートにエラー境界がない場合、エラーは最も近いエラー境界まで「バブルアップ」し、ルートまで到達するため、すべてのルートにエラー境界を追加する必要はありません。UI に特別なタッチを追加したい場合にのみ追加します。

## エラーのサニタイズ

本番モードでは、サーバーで発生したエラーは、クライアントに機密性の高いサーバー情報（スタックトレースなど）が漏洩するのを防ぐために自動的にサニタイズされます。これは、[`useRouteError`][use-route-error] から受け取る `Error` インスタンスには、一般的なメッセージとスタックトレースがないことを意味します。

```tsx
export async function loader() {
  if (badConditionIsTrue()) {
    throw new Error("大変だ！何かがおかしい！");
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  // NODE_ENV=production の場合:
  // error.message = "予期しないサーバーエラー"
  // error.stack = undefined
}
```

これらのエラーをログに記録したり、[BugSnag][bugsnag] や [Sentry][sentry] などのサードパーティサービスに報告したりする必要がある場合は、[`app/entry.server.js`][entry-server] の [`handleError`][handle-error] エクスポートを通じてこれを行うことができます。このメソッドは、サーバー上でも実行されているため、サニタイズされていないバージョンのエラーを受け取ります。

エラー境界をトリガーし、ブラウザに特定メッセージまたはデータを表示したい場合は、代わりにそのデータを含む `action`/`loader` から `Response` をスローできます。

```tsx
export async function loader() {
  if (badConditionIsTrue()) {
    throw new Response("大変だ！何かがおかしい！", {
      status: 500,
    });
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    // error.status = 500
    // error.data = "大変だ！何かがおかしい！"
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

