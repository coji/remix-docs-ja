---
title: LiveReload
toc: false
---

# `<LiveReload />`

このコンポーネントは、開発中にファイルが変更されたときに、アプリをRemixアセットサーバーに接続し、ページを自動的にリロードします。本番環境では`null`をレンダリングするため、ルートルートで常に安全にレンダリングできます。

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

## Props

### `origin`

Live Reloadプロトコルのカスタムオリジンを指定します。指定するURLは`http`プロトコルを使用する必要があります。これは内部で`ws`プロトコルにアップグレードされます。これは、Remix開発サーバーの前にリバースプロキシを使用する場合に役立ちます。デフォルト値は`REMIX_DEV_ORIGIN`環境変数、または`REMIX_DEV_ORIGIN`が設定されていない場合は`window.location.origin`です。

### `port`

Live Reloadプロトコルのカスタムポートを指定します。デフォルト値は`REMIX_DEV_ORIGIN`環境変数から派生したポート、または`REMIX_DEV_ORIGIN`が設定されていない場合は`8002`です。

### `timeoutMs`

`timeoutMs`プロパティを使用すると、Live Reloadプロトコルのカスタムタイムアウトをミリ秒単位で指定できます。これは、Web Socket接続が失われた場合に再接続を試みるまでの遅延です。デフォルト値は`1000`です。

