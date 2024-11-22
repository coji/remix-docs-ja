---
title: エラーレポート
---

# エラーレポート

React Router はルートモジュール内のエラーをキャッチし、それらを[エラーバウンダリ](./error-boundary) に送信して、エラー発生時の空白ページを防ぎます。ただし、ErrorBoundary はエラーのログ記録とレポートには不十分です。これらのキャッチされたエラーにアクセスするには、サーバーエントリモジュールの `handleError` エクスポートを使用します。

## 1. サーバーエントリの表示

アプリディレクトリに `entry.server.tsx` が表示されない場合は、デフォルトのエントリを使用しています。次のCLIコマンドで表示します。

```shellscript nonumber
react-router reveal
```

## 2. エラーハンドラのエクスポート

この関数は、React Router がサーバー上のアプリケーションでエラーをキャッチするたびに呼び出されます。

```tsx filename=entry.server.tsx
import { type HandleErrorFunction } from "react-router";

export const handleError: HandleErrorFunction = (
  error,
  { request }
) => {
  // React Router は中断されたリクエストの一部を中止することがあります。それらをログに記録しないでください
  if (!request.signal.aborted) {
    myReportError(error);

    // エラーが表示されるように、必ずエラーをログに記録してください
    console.error(error);
  }
};
```

