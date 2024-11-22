---
title: LiveReload
toc: false
---

# `<LiveReload />`

このコンポーネントは、アプリを Remix アセットサーバーに接続し、開発中にファイルが変更されると自動的にページをリロードします。本番環境では `null` をレンダリングするため、ルートルートで常に安全にレンダリングできます。

```tsx filename=app/root.tsx lines=[8]
import { LiveReload } from "@remix-run/react";

export default function Root() {
  return (
    <html>
      <head />
      <body>
        <LiveReload />
      </body>
    </html>
  );
}
```

## プロパティ

### `origin`

Live Reload プロトコル用のカスタムオリジンを指定します。提供されるURLは`http`プロトコルを使用する必要があります。これは内部的に`ws`プロトコルにアップグレードされます。これは、Remix開発サーバーの前にリバースプロキシを使用する場合に役立ちます。デフォルト値は`REMIX_DEV_ORIGIN`環境変数、または`REMIX_DEV_ORIGIN`が設定されていない場合のみ`window.location.origin`です。

### `port`

Live Reload プロトコル用のカスタムポートを指定します。デフォルト値は、`REMIX_DEV_ORIGIN`環境変数から取得されたポート、または`REMIX_DEV_ORIGIN`が設定されていない場合のみ`8002`です。

### `timeoutMs`

`timeoutMs`プロパティを使用すると、Live Reloadプロトコル用のカスタムタイムアウトをミリ秒単位で指定できます。これは、Web Socket接続が失われた場合に再接続を試みるまでの遅延です。デフォルト値は`1000`です。


