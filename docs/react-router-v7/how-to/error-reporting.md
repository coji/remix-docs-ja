---
title: エラー報告
---

# エラー報告

React Router は、ルートモジュールで発生したエラーをキャッチし、エラーが発生した際に空白ページが表示されるのを防ぐために、[エラー境界](./error-boundary)に送信します。ただし、ErrorBoundary はエラーのログ記録や報告には十分ではありません。キャッチされたこれらのエラーにアクセスするには、サーバーエントリモジュールの `handleError` エクスポートを使用します。

## 1. サーバーエントリを明らかにする

アプリディレクトリに `entry.server.tsx` が見当たらない場合は、デフォルトのエントリを使用しています。次の CLI コマンドでそれを明らかにします。

```shellscript nonumber
react-router reveal
```

## 2. エラーハンドラーをエクスポートする

この関数は、React Router がサーバー上のアプリケーションでエラーをキャッチするたびに呼び出されます。

```tsx filename=entry.server.tsx
import { type HandleErrorFunction } from "react-router";

export const handleError: HandleErrorFunction = (
  error,
  { request }
) => {
  // React Router は中断されたリクエストを中止する可能性があるため、それらはログに記録しない
  if (!request.signal.aborted) {
    myReportError(error);

    // エラーを確認できるように、必ずエラーをログに記録する
    console.error(error);
  }
};
```

