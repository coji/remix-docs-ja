---
title: RouterProvider からのフレームワーク採用
order: 5
---

# RouterProvider からのフレームワーク採用

`<RouterProvider>` を使用していない場合は、代わりに [コンポーネントルートからのフレームワーク採用][upgrade-component-routes] を参照してください。

React Router Vite プラグインは、React Router にフレームワーク機能を追加します。このガイドは、アプリでプラグインを採用するのに役立ちます。問題が発生した場合は、[Twitter](https://x.com/remix_run) または [Discord](https://rmx.as/discord) でお問い合わせください。

## 機能

Vite プラグインは以下を追加します。

- ルートローダー、アクション、および自動データ再検証
- タイプセーフなルートモジュール
- 自動ルートコード分割
- ナビゲーション間の自動スクロール復元
- オプションの静的プリレンダリング
- オプションのサーバーレンダリング

初期設定には最も多くの作業が必要です。ただし、完了すると、新しい機能を段階的に採用できます。

## 前提条件

Vite プラグインを使用するには、プロジェクトに以下が必要です。

- Node.js 20+ (Node をランタイムとして使用する場合)
- Vite 5+

## 1. ルート定義をルートモジュールに移動する

React Router Vite プラグインは独自の `RouterProvider` をレンダリングするため、その中で既存の `RouterProvider` をレンダリングすることはできません。代わりに、すべてのルート定義を [ルートモジュール API][route-modules] に一致するようにフォーマットする必要があります。

このステップには最も時間がかかりますが、React Router Vite プラグインを採用するかどうかに関係なく、これを行うことにはいくつかの利点があります。

- ルートモジュールは遅延ロードされ、アプリの初期バンドルサイズが縮小されます
- ルート定義は均一になり、アプリのアーキテクチャが簡素化されます
- ルートモジュールへの移行は段階的であり、一度に 1 つのルートを移行できます

**👉 ルート定義をルートモジュールに移動する**

[ルートモジュール API][route-modules] に従って、ルート定義の各部分を個別の名前付きエクスポートとしてエクスポートします。

```tsx filename=src/routes/about.tsx
export async function clientLoader() {
  return {
    title: "About",
  };
}

export default function About() {
  let data = useLoaderData();
  return <div>{data.title}</div>;
}

// clientAction, ErrorBoundary など
```

**👉 変換関数を作成する**

ルートモジュール定義をデータルーターが期待する形式に変換するヘルパー関数を作成します。

```tsx filename=src/main.tsx
function convert(m: any) {
  let {
    clientLoader,
    clientAction,
    default: Component,
    ...rest
  } = m;
  return {
    ...rest,
    loader: clientLoader,
    action: clientAction,
    Component,
  };
}
```

**👉 ルートモジュールを遅延ロードして変換する**

ルートモジュールを直接インポートする代わりに、遅延ロードしてデータルーターが期待する形式に変換します。

ルート定義がルートモジュール API に準拠するだけでなく、ルートのコード分割の利点も得られます。

```diff filename=src/main.tsx
let router = createBrowserRouter([
  // ... その他のルート
  {
    path: "about",
-   loader: aboutLoader,
-   Component: About,
+   lazy: () => import("./routes/about").then(convert),
  },
  // ... その他のルート
]);
```

アプリの各ルートに対してこのプロセスを繰り返します。

## 2. Vite プラグインをインストールする

すべてのルート定義がルートモジュールに変換されたら、React Router Vite プラグインを採用できます。

**👉 React Router Vite プラグインをインストールする**

```shellscript nonumber
npm install -D @react-router/dev
```

**👉 ランタイムアダプターをインストールする**

Node をランタイムとして使用していると仮定します。

```shellscript nonumber
npm install @react-router/node
```

**👉 React プラグインを React Router に置き換える**

```diff filename=vite.config.ts
-import react from '@vitejs/plugin-react'
+import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";


export default defineConfig({
  plugins: [
-    react()
+    reactRouter()
  ],
});
```

## 3. React Router 設定を追加する

**👉 `react-router.config.ts` ファイルを作成する**

プロジェクトのルートに以下を追加します。この設定では、アプリディレクトリの場所や、今のところ SSR (サーバーサイドレンダリング) を使用しないなど、React Router にプロジェクトについて伝えることができます。

```shellscript nonumber
touch react-router.config.ts
```

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  ssr: false,
} satisfies Config;
```

## 4. ルートエントリポイントを追加する

一般的な Vite アプリでは、`index.html` ファイルがバンドルのエントリポイントです。React Router Vite プラグインは、エントリポイントを `root.tsx` ファイルに移動するため、静的な HTML の代わりに React を使用してアプリのシェルをレンダリングし、必要に応じて最終的にサーバーレンダリングにアップグレードできます。

**👉 既存の `index.html` を `root.tsx` に移動する**

たとえば、現在の `index.html` が次のようになっている場合:

```html filename=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

そのマークアップを `src/root.tsx` に移動し、`index.html` を削除します。

```shellscript nonumber
touch src/root.tsx
```

```tsx filename=src/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

export function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>My App</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
```

**👉 `RouterProvider` より上のすべてを `root.tsx` に移動する**

グローバルスタイル、コンテキストプロバイダーなどはすべて、すべてのルートで共有できるように `root.tsx` に移動する必要があります。

たとえば、`App.tsx` が次のようになっている場合:

```tsx filename=src/App.tsx
import "./index.css";

export default function App() {
  return (
    <OtherProviders>
      <AppLayout>
        <RouterProvider router={router} />
      </AppLayout>
    </OtherProviders>
  );
}
```

`RouterProvider` より上のすべてを `root.tsx` に移動します。

```diff filename=src/root.tsx
+import "./index.css";

// ... その他のインポートとレイアウト

export default function Root() {
  return (
+   <OtherProviders>
+     <AppLayout>
        <Outlet />
+     </AppLayout>
+   </OtherProviders>
  );
}
```

## 5. クライアントエントリモジュールを追加する (オプション)

一般的な Vite アプリでは、`index.html` ファイルはクライアントエントリポイントとして `src/main.tsx` を指します。React Router は代わりに `src/entry.client.tsx` という名前のファイルを使用します。

`entry.client.tsx` が存在しない場合、React Router Vite プラグインはデフォルトの非表示のファイルを使用します。

**👉 `src/entry.client.tsx` をエントリポイントにする**

現在の `src/main.tsx` が次のようになっている場合:

```tsx filename=src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";

const router = createBrowserRouter([
  // ... ルート定義
]);

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <RouterProvider router={router} />;
  </React.StrictMode>
);
```

それを `entry.client.tsx` に名前変更し、次のように変更します。

```tsx filename=src/entry.client.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);
```

- `createRoot` の代わりに `hydrateRoot` を使用します
- `<App/>` コンポーネントの代わりに `<HydratedRouter>` をレンダリングします
- 注: ルートを作成して `<RouterProvider />` に手動で渡すことはなくなりました。次のステップでルート定義を移行します。

## 6. ルートを移行する

React Router Vite プラグインは、ルートを構成するために `routes.ts` ファイルを使用します。形式は、データルーターの定義と非常によく似ています。

**👉 定義を `routes.ts` ファイルに移動する**

```shellscript nonumber
touch src/routes.ts src/catchall.tsx
```

ルート定義を `routes.ts` に移動します。スキーマは完全に一致しないため、型エラーが発生することに注意してください。これは次に修正します。

```diff filename=src/routes.ts
+import type { RouteConfig } from "@react-router/dev/routes";

-const router = createBrowserRouter([
+export default [
  {
    path: "/",
    lazy: () => import("./routes/layout").then(convert),
    children: [
      {
        index: true,
        lazy: () => import("./routes/home").then(convert),
      },
      {
        path: "about",
        lazy: () => import("./routes/about").then(convert),
      },
      {
        path: "todos",
        lazy: () => import("./routes/todos").then(convert),
        children: [
          {
            path: ":id",
            lazy: () =>
              import("./routes/todo").then(convert),
          },
        ],
      },
    ],
  },
-]);
+] satisfies RouteConfig;
```

**👉 `lazy` ローダーを `file` ローダーに置き換える**

```diff filename=src/routes.ts
export default [
  {
    path: "/",
-   lazy: () => import("./routes/layout").then(convert),
+   file: "./routes/layout.tsx",
    children: [
      {
        index: true,
-       lazy: () => import("./routes/home").then(convert),
+       file: "./routes/home.tsx",
      },
      {
        path: "about",
-       lazy: () => import("./routes/about").then(convert),
+       file: "./routes/about.tsx",
      },
      {
        path: "todos",
-       lazy: () => import("./routes/todos").then(convert),
+       file: "./routes/todos.tsx",
        children: [
          {
            path: ":id",
-           lazy: () => import("./routes/todo").then(convert),
+           file: "./routes/todo.tsx",
          },
        ],
      },
    ],
  },
] satisfies RouteConfig;
```

[ルートの構成に関するガイド][configuring-routes] を参照して、`routes.ts` ファイルと、ルート定義をさらに簡素化するためのヘルパー関数について詳しく学んでください。

## 7. アプリを起動する

この時点で、React Router Vite プラグインに完全に移行する必要があります。`dev` スクリプトを更新し、アプリを実行してすべてが機能していることを確認してください。

**👉 `dev` スクリプトを追加してアプリを実行する**

```json filename=package.json
"scripts": {
  "dev": "react-router dev"
}
```

次に、先に進む前に、この時点でアプリを起動できることを確認してください。

```shellscript
npm run dev
```

リポジトリで不要なファイルを追跡しないように、`.react-router/` を `.gitignore` ファイルに追加することをお勧めします。

```txt
.react-router/
```

[型安全性][type-safety] をチェックアウトして、パラメーター、ローダーデータなどの自動生成された型安全性を完全に設定して使用する方法を学んでください。

## SSR および/またはプリレンダリングを有効にする

サーバーレンダリングと静的プリレンダリングを有効にする場合は、バンドラープラグインの `ssr` および `prerender` オプションを使用して有効にできます。SSR の場合は、サーバービルドをサーバーにデプロイする必要もあります。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  async prerender() {
    return ["/", "/about", "/contact"];
  },
} satisfies Config;
```

[upgrade-component-routes]: ./component-routes
[configuring-routes]: ../start/framework/routing
[route-modules]: ../start/framework/route-module
[type-safety]: ../how-to/route-module-type-safety
