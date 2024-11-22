---
title: RouterProviderからのフレームワーク採用
---

# RouterProviderからのフレームワーク採用

`<RouterProvider>`を使用していない場合は、代わりに[コンポーネントルートからのフレームワーク採用][upgrade-component-routes]を参照してください。

React Router Viteプラグインは、React Routerにフレームワーク機能を追加します。このガイドは、アプリでプラグインを採用するのに役立ちます。問題が発生した場合は、[Twitter](https://x.com/remix_run)または[Discord](https://rmx.as/discord)でお問い合わせください。

## 機能

Viteプラグインは以下を追加します。

- ルートローダー、アクション、および自動データ再検証
- 型安全なルートモジュール
- 自動ルートコード分割
- ナビゲーション間の自動スクロール復元
- オプションの静的プリレンダリング
- オプションのサーバーレンダリング

初期設定には最も多くの作業が必要ですが、完了したら、新しい機能を段階的に採用できます。

## 前提条件

Viteプラグインを使用するには、プロジェクトに以下が必要です。

- Node.js 20+（Nodeをランタイムとして使用する場合）
- Vite 5+

## 1. ルート定義をルートモジュールに移動する

React Router Viteプラグインは独自の`RouterProvider`をレンダリングするため、既存の`RouterProvider`をその中にレンダリングすることはできません。代わりに、すべてのルート定義を[ルートモジュールAPI][route-modules]に一致するようにフォーマットする必要があります。

この手順には最も時間がかかりますが、React Router Viteプラグインを採用するかどうかとは関係なく、これを行うことでいくつかの利点があります。

- ルートモジュールは遅延読み込みされるため、アプリの初期バンドルサイズが小さくなります
- ルート定義が統一されるため、アプリのアーキテクチャが簡素化されます
- ルートモジュールへの移行は段階的であり、一度に1つのルートを移行できます

**👉 ルート定義をルートモジュールに移動する**

[ルートモジュールAPI][route-modules]に従って、ルート定義の各部分を個別の名前付きエクスポートとしてエクスポートします。

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

// clientAction, ErrorBoundaryなど
```

**👉 変換関数を作成する**

ルートモジュール定義をデータルーターで期待される形式に変換するヘルパー関数を作成します。

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

**👉 ルートモジュールを遅延読み込みして変換する**

ルートモジュールを直接インポートする代わりに、遅延読み込みしてデータルーターで期待される形式に変換します。

ルート定義はルートモジュールAPIに準拠するだけでなく、ルートのコード分割の利点も得られます。

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

アプリの各ルートについてこの手順を繰り返します。

## 2. Viteプラグインをインストールする

すべてのルート定義をルートモジュールに変換したら、React Router Viteプラグインを採用できます。

**👉 React Router Viteプラグインをインストールする**

```shellscript nonumber
npm install -D @react-router/dev
```

**👉 ランタイムアダプターをインストールする**

Nodeをランタイムとして使用していると仮定します。

```shellscript nonumber
npm install @react-router/node
```

**👉 ReactプラグインをReact Routerと交換する**

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

## 3. React Router設定を追加する

**👉 `react-router.config.ts`ファイルを作成する**

プロジェクトのルートに追加します。この設定では、アプリディレクトリの場所や、現時点ではSSR（サーバーサイドレンダリング）を使用しないことなど、プロジェクトに関する情報をReact Routerに伝えることができます。

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

一般的なViteアプリでは、`index.html`ファイルがバンドルのエントリポイントです。React Router Viteプラグインは、エントリポイントを`root.tsx`ファイルに移動するため、静的HTMLではなくReactを使用してアプリのシェルをレンダリングし、必要に応じてサーバーレンダリングにアップグレードできます。

**👉 既存の`index.html`を`root.tsx`に移動する**

たとえば、現在の`index.html`が次のようになっている場合。

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

そのマークアップを`src/root.tsx`に移動し、`index.html`を削除します。

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

**👉 `RouterProvider`より上のすべてを`root.tsx`に移動する**

グローバルスタイル、コンテキストプロバイダーなどは、すべてのルートで共有できるように`root.tsx`に移動する必要があります。

たとえば、`App.tsx`が次のようになっている場合。

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

`RouterProvider`より上のすべてを`root.tsx`に移動します。

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

## 5. クライアントエントリモジュールを追加する（オプション）

一般的なViteアプリでは、`index.html`ファイルはクライアントエントリポイントとして`src/main.tsx`を指しています。React Routerは代わりに`src/entry.client.tsx`という名前のファイルを使用します。

`entry.client.tsx`が存在しない場合、React Router Viteプラグインはデフォルトの非表示のものを使用します。

**👉 `src/entry.client.tsx`をエントリポイントにする**

現在の`src/main.tsx`が次のようになっている場合。

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

`entry.client.tsx`に名前を変更し、次のように変更します。

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

- `createRoot`の代わりに`hydrateRoot`を使用する
- `<App/>`コンポーネントの代わりに`<HydratedRouter>`をレンダリングする
- 注：ルートを作成して`<RouterProvider />`に手動で渡すことはなくなりました。次の手順でルート定義を移行します。

## 6. ルートを移行する

React Router Viteプラグインは、`routes.ts`ファイルを使用してルートを構成します。形式はデータルーターの定義と非常によく似ています。

**👉 定義を`routes.ts`ファイルに移動する**

```shellscript nonumber
touch src/routes.ts src/catchall.tsx
```

ルート定義を`routes.ts`に移動します。スキーマは完全に一致しないため、型エラーが発生します。これは次に修正します。

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

**👉 `lazy`ローダーを`file`ローダーに置き換える**

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

[ルートの構成に関するガイド][configuring-routes]を参照して、`routes.ts`ファイルと、ルート定義をさらに簡素化するヘルパー関数について詳細を確認してください。

## 7. アプリを起動する

この時点で、React Router Viteプラグインに完全に移行する必要があります。`dev`スクリプトを更新してアプリを実行し、すべてが機能していることを確認してください。

**👉 `dev`スクリプトを追加してアプリを実行する**

```json filename=package.json
"scripts": {
  "dev": "react-router dev"
}
```

次に、先に進む前に、この時点でアプリを起動できることを確認します。

```shellscript
npm run dev
```

## SSRとプリレンダリングを有効にする

サーバーレンダリングと静的プリレンダリングを有効にするには、バンドラープラグインの`ssr`オプションと`prerender`オプションを使用できます。SSRの場合、サーバービルドをサーバーにデプロイする必要もあります。詳細については、[デプロイ][deploying]を参照してください。

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
[deploying]: ../start/deploying
[configuring-routes]: ../start/framework/routing
[route-modules]: ../start/framework/route-module
[type-safety]: ../how-to/route-module-type-safety


