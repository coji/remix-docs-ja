---
title: インストール
order: 1
---

# インストール

React Routerは、以前のバージョンと同様に独自のバンドルとデータローディングで最小限に使用する、または組み込みのViteプラグイン（Remixから来たフレームワーク機能を追加する）で最大限に使用する事ができます。

Viteプラグインを使用すると、すべての機能を最も簡単に使用できるため、スタートアップガイドではそちらに焦点を当てます。

React Routerを独自のバンドル、サーバーレンダリングなどで最小限に使用する場合は、[手動での使用方法][manual_usage]ガイドを参照してください。

## スターターテンプレート

ほとんどのプロジェクトはテンプレートから始まります。 `degit` を使用して、React Routerによって保守されている基本的なテンプレートを使用してみましょう。

```shellscript nonumber
npx degit remix-run/react-router/templates/basic#dev my-app
```

次に、新しいディレクトリに移動してアプリを起動します

```shellscript nonumber
cd my-app
npm i
npm run dev
```

これで、ブラウザで `http://localhost:5173` にアクセスできるようになりました。

TODO: コミュニティテンプレートの探し方と使い方を示す

## Viteプラグインなし

## Viteによる手動インストール

スターターテンプレートの代わりに、プロジェクトを最初から設定できます。

まず、新しいディレクトリを作成して依存関係をインストールします。

```shellscript nonumber
mkdir my-new-app
cd my-new-app
npm init -y
npm install react react-dom react-router@pre @react-router/node@pre @react-router/serve@pre
npm install -D vite @react-router/dev@pre
```

次に、次のファイルを作成します。

```shellscript nonumber
mkdir app
touch app/root.jsx
touch app/home.jsx
touch app/routes.js
touch vite.config.js
```

そして、それらを埋めます。

```tsx filename=app/root.jsx
import {
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

export function Layout() {
  return (
    <html lang="en">
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function Root() {
  return <h1>Hello, world!</h1>;
}

export function ErrorBoundary() {
  return <h1>Something went wrong</h1>;
}
```

```tsx filename=app/home.jsx
export default function Home() {
  return <h2>Home</h2>;
}
```

```ts filename=app/routes.js
import { index } from "@react-router/dev/routes";

export const routes = [index("./home.jsx")];
```

```tsx filename=vite.config.js
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
});
```

```json filename=package.json
{
  // add these two keys to your package.json
  "type": "module",
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js"
  }
}
```

最後に、アプリを実行します。

```shellscript nonumber
npm run dev
```

## 次のステップ

[ルーティング](./routing)

[manual_usage]: ../misc/manual-usage



