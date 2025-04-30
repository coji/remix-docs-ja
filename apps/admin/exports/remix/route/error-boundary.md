---
title: ErrorBoundary
---

# `ErrorBoundary`

Remix の `ErrorBoundary` コンポーネントは、通常の React の[エラー境界][error-boundaries]とほぼ同じように動作しますが、いくつかの追加機能があります。ルートコンポーネントでエラーが発生した場合、`ErrorBoundary` はその代わりに、親ルート内にネストされてレンダリングされます。`ErrorBoundary` コンポーネントは、ルートの `loader` または `action` 関数でエラーが発生した場合にもレンダリングされるため、そのルートのすべてのエラーを 1 か所で処理できます。

最も一般的なユースケースは次のとおりです。

- 意図的に 4xx `Response` をスローしてエラー UI をトリガーする場合があります。
  - 不正なユーザー入力で 400 をスローする
  - アクセスが許可されていない場合に 401 をスローする
  - 要求されたデータが見つからない場合に 404 をスローする
- レンダリング中にランタイムエラーが発生した場合、React が意図せずに `Error` をスローする場合があります。

スローされたオブジェクトを取得するには、[`useRouteError`][use-route-error] フックを使用できます。`Response` がスローされると、`state` / `statusText` / `data` フィールドを持つ `ErrorResponse` インスタンスに自動的にアンラップされるため、コンポーネントで `await response.json()` を使用する必要はありません。スローされた `Response` をスローされた `Error` と区別するには、[`isRouteErrorResponse`][is-route-error-response] ユーティリティを使用できます。

```tsx
import {
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
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

[error-boundaries]: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
[use-route-error]: ../hooks/use-route-error
[is-route-error-response]: ../utils/is-route-error-response

