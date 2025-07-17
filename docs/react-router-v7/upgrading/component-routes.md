---
title: コンポーネントルートからのフレームワーク採用
---

# コンポーネントルートからのフレームワーク採用

`<RouterProvider>` を使用している場合は、代わりに [RouterProvider からのフレームワーク採用][upgrade-router-provider] を参照してください。

`<Routes>` を使用している場合は、ここが正しい場所です。

React Router Vite プラグインは、React Router にフレームワーク機能を追加します。このガイドは、アプリでプラグインを採用するのに役立ちます。問題が発生した場合は、[Twitter](https://x.com/remix_run) または [Discord](https://rmx.as/discord) でお問い合わせください。

## 機能

Vite プラグインは以下を追加します。

- ルートローダー、アクション、および自動データ再検証
- タイプセーフなルートモジュール
- 自動ルートコード分割
- ナビゲーション間の自動スクロール復元
- オプションの静的プリレンダリング
- オプションのサーバーレンダリング

最初のセットアップには最も多くの作業が必要です。ただし、完了すると、新しい機能を一度に 1 つのルートずつ段階的に採用できます。

## 前提条件

Vite プラグインを使用するには、プロジェクトに以下が必要です。

- Node.js 20+ (Node をランタイムとして使用する場合)
- Vite 5+

## 1. Vite プラグインをインストールする

**👉 React Router Vite プラグインをインストールする**

```shellscript nonumber
npm install -D @react-router/dev
```

**👉 ランタイムアダプターをインストールする**

ここでは、Node をランタイムとして使用していると仮定します。

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

## 2. React Router 設定を追加する

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

## 3. ルートエントリポイントを追加する

一般的な Vite アプリでは、`index.html` ファイルがバンドルのエントリポイントです。React Router Vite プラグインは、エントリポイントを `root.tsx` ファイルに移動するため、静的な HTML の代わりに React を使用してアプリのシェルをレンダリングし、必要に応じてサーバーレンダリングにアップグレードできます。

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

## 4. クライアントエントリモジュールを追加する

一般的な Vite アプリでは、`index.html` ファイルはクライアントエントリポイントとして `src/main.tsx` を指します。React Router は代わりに `src/entry.client.tsx` というファイルを使用します。

**👉 `src/entry.client.tsx` をエントリポイントにする**

現在の `src/main.tsx` が次のようになっている場合:

```tsx filename=src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

それを `entry.client.tsx` に名前変更し、次のように変更します。

```tsx filename=src/entry.client.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "./index.css";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);
```

- `createRoot` の代わりに `hydrateRoot` を使用する
- `<App/>` コンポーネントの代わりに `<HydratedRouter>` をレンダリングする
- 注: `<App/>` コンポーネントのレンダリングを停止しました。後のステップで元に戻しますが、まず新しいエントリポイントでアプリを起動できるようにします。

## 5. 色々なものをシャッフルする

`root.tsx` と `entry.client.tsx` の間で、それらの間でいくつかのものをシャッフルしたい場合があります。

一般的に:

- `root.tsx` には、コンテキストプロバイダー、レイアウト、スタイルなど、レンダリングに関するものが含まれています。
- `entry.client.tsx` はできるだけ最小限にする必要があります
- 既存の `<App/>` コンポーネントをまだレンダリングしようとしないでください。後のステップで行います

`root.tsx` ファイルは静的に生成され、アプリのエントリポイントとして提供されるため、そのモジュールだけがサーバーレンダリングと互換性がある必要があります。これがあなたのトラブルのほとんどが発生する場所です。

## 6. ルートを設定する

React Router Vite プラグインは、`routes.ts` ファイルを使用してルートを設定します。今のところ、物事を進めるために単純なキャッチオールルートを追加します。

**👉 `catchall.tsx` ルートを設定する**

```shellscript nonumber
touch src/routes.ts src/catchall.tsx
```

```ts filename=src/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  // * はすべての URL に一致し、? はオプションにするため、/ にも一致します
  route("*?", "catchall.tsx"),
] satisfies RouteConfig;
```

**👉 プレースホルダールートをレンダリングする**

最終的にはこれを元の `App` コンポーネントに置き換えますが、今のところアプリを起動できることを確認するために、何か簡単なものをレンダリングします。

```tsx filename=src/catchall.tsx
export default function Component() {
  return <div>Hello, world!</div>;
}
```

`routes.ts` ファイルの詳細については、[ルートの設定に関するガイド][configuring-routes] を参照してください。

## 7. アプリを起動する

この時点で、アプリを起動してルートレイアウトを表示できるはずです。

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

パラメーター、ローダーデータなどの自動生成されたタイプセーフを完全に設定して使用する方法については、[タイプセーフ][type-safety] を確認してください。

## 8. アプリをレンダリングする

アプリのレンダリングに戻るには、以前に設定したすべての URL に一致する「キャッチオール」ルートを更新して、既存の `<Routes>` がレンダリングされるようにします。

**👉 キャッチオールルートを更新してアプリをレンダリングする**

```tsx filename=src/catchall.tsx
import App from "./App";

export default function Component() {
  return <App />;
}
```

アプリが画面に戻り、通常どおりに動作するはずです。

## 9. ルートをルートモジュールに移行する

ルートをルートモジュールに段階的に移行できるようになりました。

次のような既存のルートがあるとします。

```tsx filename=src/App.tsx
// ...
import About from "./containers/About";

export default function App() {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```

**👉 ルート定義を `routes.ts` に追加する**

```tsx filename=src/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/about", "./pages/about.tsx"),
  route("*?", "catchall.tsx"),
] satisfies RouteConfig;
```

**👉 ルートモジュールを追加する**

[ルートモジュール API][route-modules] を使用するようにルートモジュールを編集します。

```tsx filename=src/pages/about.tsx
export async function clientLoader() {
  // ここでデータをフェッチできるようになりました
  return {
    title: "About page",
  };
}

export default function Component({ loaderData }) {
  return <h1>{loaderData.title}</h1>;
}
```

パラメーター、ローダーデータなどの自動生成されたタイプセーフを設定する方法については、[タイプセーフ][type-safety] を参照してください。

最初に移行するルートは、以前とは少し異なる方法でさまざまな抽象化 (フックやコンテキストからではなく、ローダーなど) にアクセスする必要があることが多いため、最も困難です。しかし、最もトリッキーな部分が処理されると、段階的な溝に入ります。

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

[upgrade-router-provider]: ./router-provider
[configuring-routes]: ../start/framework/routing
[route-modules]: ../start/framework/route-module
[type-safety]: ../how-to/route-module-type-safety