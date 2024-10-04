---
title: インストール
order: 1
---

# インストール

React Router は、独自のバンドルとデータ読み込み（以前のバージョンと同じ）を使用して最小限に、または組み込みの Vite プラグイン（Remix から来たフレームワーク機能を追加する）を使用して最大限に使用できます。

すべての機能セットは Vite プラグインで最も簡単に使用できるため、入門ガイドではそこに焦点を当てます。

独自のバンドル、サーバーサイドレンダリングなどで React Router を最小限に使用する場合は、[マニュアル使用][manual_usage] ガイドを参照してください。

## スターターテンプレート

ほとんどのプロジェクトはテンプレートから始まります。 `degit` を使用して React Router によって維持されている基本テンプレートを使用してみましょう。

```shellscript nonumber
npx degit remix-run/react-router/templates/basic#dev my-app
```

次に、新しいディレクトリに移動してアプリを起動します。

```shellscript nonumber
cd my-app
npm i
npm run dev
```

これで、ブラウザで `http://localhost:5173` を開くことができます。

TODO: コミュニティテンプレートの検索と使用方法を示す

## Vite プラグインなし

## Vite による手動インストール

スターターテンプレートの代わりに、最初からプロジェクトをセットアップできます。

最初に、新しいディレクトリを作成して依存関係をインストールします。

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

export const routes = [index("./home.tsx")];
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
  // package.json にこれらの 2 つのキーを追加します。
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



