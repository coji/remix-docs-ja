---
title: インストール
order: 1
---

# インストール

## スターターテンプレート

ほとんどのプロジェクトはテンプレートから始まります。 `degit` を使用して、React Router によって維持されている基本的なテンプレートを使用しましょう。

```shellscript nonumber
npx degit @remix-run/templates/basic my-app
```

次に、新しいディレクトリに移動してアプリを起動します。

```shellscript nonumber
cd my-app
npm i
npm run dev
```

これで、ブラウザで `http://localhost:5173` を開くことができます。

TODO: コミュニティテンプレートの検索方法と使用方法を示す

## Vite を使用した手動インストール

最初に新しいディレクトリを作成し、依存関係をインストールします。

```shellscript nonumber
mkdir my-new-app
cd my-new-app
npm init -y
npm install react react-dom react-router
npm install -D vite @react-router/dev
```

次に、次のファイルを作成します。

```shellscript nonumber
mkdir app
touch app/root.tsx
touch app/home.tsx
touch app/routes.ts
touch vite.config.ts
```

そして、それらを埋めます。

```tsx filename=app/root.tsx
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

```tsx filename=app/home.tsx
export default function Home() {
  return <h2>Home</h2>;
}
```

```ts filename=app/routes.ts
import {
  type RouteConfig,
  index,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [index("./home.tsx")];
```

```tsx filename=vite.config.ts
import react from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
```

最後に、アプリを実行します。

```shellscript nonumber
npm run dev
```

## Vite プラグインなし

React Router の全機能セットは、React Router Vite プラグインを使用するのが最も簡単ですが、独自のバンドル、サーバーサイドレンダリングなどで、React Router を手動で使用することもできます。

詳細については、[手動での使用][manual_usage] を参照してください。

[manual_usage]: ../guides/manual-usage



