---
title: エラー報告
---

# エラー報告

[MODES: framework,data]

<br/>
<br/>

React Router は、ルートモジュールで発生したエラーをキャッチし、エラーが発生した際に空白ページが表示されるのを防ぐために、[エラー境界](./error-boundary)に送信します。ただし、`ErrorBoundary` はエラーのログ記録や報告には十分ではありません。

## サーバーエラー

[modes: framework]

サーバー上でキャッチされたこれらのエラーにアクセスするには、サーバーエントリモジュールの `handleError` エクスポートを使用します。

### 1. サーバーエントリを明らかにする

アプリディレクトリに [`entry.server.tsx`][entryserver] が見当たらない場合は、デフォルトのエントリを使用しています。次の CLI コマンドでそれを明らかにします。

```shellscript nonumber
react-router reveal entry.server
```

### 2. エラーハンドラーをエクスポートする

この関数は、React Router がサーバー上のアプリケーションでエラーをキャッチするたびに呼び出されます。

```tsx filename=entry.server.tsx
import { type HandleErrorFunction } from "react-router";

export const handleError: HandleErrorFunction = (
  error,
  { request },
) => {
  // React Router は中断されたリクエストを中止する可能性があるため、それらはログに記録しない
  if (!request.signal.aborted) {
    myReportError(error);

    // エラーを確認できるように、必ずエラーをログに記録する
    console.error(error);
  }
};
```

こちらも参照してください:

- [`handleError`][handleError]

## クライアントエラー

クライアントでキャッチされたこれらのエラーにアクセスするには、[`HydratedRouter`][hydratedrouter] または [`RouterProvider`][routerprovider] コンポーネントの `onError` prop を使用します。

### フレームワークモード

[modes: framework]

#### 1. クライアントエントリを明らかにする

アプリディレクトリに [`entry.client.tsx`][entryclient] が見当たらない場合は、デフォルトのエントリを使用しています。次の CLI コマンドでそれを明らかにします。

```shellscript nonumber
react-router reveal entry.client
```

#### 2. エラーハンドラーを追加する

この関数は、React Router がクライアント上のアプリケーションでエラーをキャッチするたびに呼び出されます。

```tsx filename=entry.client.tsx
import { type ClientOnErrorFunction } from "react-router";

const onError: ClientOnErrorFunction = (
  error,
  { location, params, unstable_pattern, errorInfo },
) => {
  myReportError(error, location, errorInfo);

  // エラーを確認できるように、必ずエラーをログに記録する
  console.error(error, errorInfo);
};

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter onError={onError} />
    </StrictMode>,
  );
});
```

こちらも参照してください:

- [`<HydratedRouter onError>`][hydratedrouter-onerror]

### データモード

[modes: data]

この関数は、React Router がクライアント上のアプリケーションでエラーをキャッチするたびに呼び出されます。

```tsx
import { type ClientOnErrorFunction } from "react-router";

const onError: ClientOnErrorFunction = (
  error,
  { location, params, unstable_pattern, errorInfo },
) => {
  myReportError(error, location, errorInfo);

  // エラーを確認できるように、必ずエラーをログに記録する
  console.error(error, errorInfo);
};

function App() {
  return <RouterProvider onError={onError} />;
}
```

こちらも参照してください:

- [`<RouterProvider onError>`][routerprovider-onerror]

[entryserver]: ../api/framework-conventions/entry.server.tsx
[handleError]: ../api/framework-conventions/entry.server.tsx#handleerror
[entryclient]: ../api/framework-conventions/entry.client.tsx
[hydratedrouter]: ../api/framework-routers/HydratedRouter
[routerprovider]: ../api/data-routers/RouterProvider
[hydratedrouter-onerror]: ../api/framework-routers/HydratedRouter#onError
[routerprovider-onerror]: ../api/data-routers/RouterProvider#onError