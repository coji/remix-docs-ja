---
title: コンポーネントルートからのフレームワーク採用
---

# コンポーネントルートからのフレームワーク採用

`<RouterProvider>` を使用している場合は、代わりに[RouterProviderからのフレームワーク採用][upgrade-router-provider]を参照してください。

`<Routes>` を使用している場合は、ここが正しい場所です。

React Router Viteプラグインは、React Routerにフレームワーク機能を追加します。このガイドは、アプリでプラグインを採用するのに役立ちます。問題が発生した場合は、[Twitter](https://x.com/remix_run)または[Discord](https://rmx.as/discord)でお問い合わせください。

## 機能

Viteプラグインは以下を追加します。

- ルートローダー、アクション、および自動データ再検証
- タイプセーフなルートモジュール
- 自動ルートコード分割
- ナビゲーション間の自動スクロール復元
- オプションの静的プリレンダリング
- オプションのサーバーレンダリング

最初の設定には最も多くの作業が必要です。しかし、完了すると、一度に1つのルートずつ、新しい機能を段階的に採用できます。

## 前提条件

Viteプラグインを使用するには、プロジェクトに以下が必要です。

- Node.js 20+（Nodeをランタイムとして使用する場合）
- Vite 5+

## 1. Viteプラグインのインストール

**👉 React Router Viteプラグインをインストールする**

```shellscript nonumber
npm install -D @react-router/dev
```

**👉 ランタイムアダプターをインストールする**

Nodeをランタイムとして使用すると仮定します。

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

## 2. React Router設定の追加

**👉 `react-router.config.ts`ファイルを作成する**

プロジェクトのルートに追加します。この設定で、アプリディレクトリの場所や、今のところSSR（サーバーサイドレンダリング）を使用しないことをReact Routerに伝えることができます。

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

## 3. ルートエントリポイントの追加

一般的なViteアプリでは、`index.html`ファイルがバンドリングのエントリポイントです。React Router Viteプラグインはエントリポイントを`root.tsx`ファイルに移動するため、静的なHTMLではなくReactを使用してアプリのシェルをレンダリングし、必要に応じてサーバーレンダリングにアップグレードできます。

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

## 4. クライアントエントリモジュールの追加

一般的なViteアプリでは、`index.html`ファイルは`src/main.tsx`をクライアントエントリポイントとして指しています。React Routerは代わりに`src/entry.client.tsx`という名前のファイルを使用します。

**👉 `src/entry.client.tsx`をエントリポイントにする**

現在の`src/main.tsx`が次のようになっている場合。

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

`entry.client.tsx`に名前を変更し、次のように変更します。

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

- `createRoot`の代わりに`hydrateRoot`を使用する
- `<App/>`コンポーネントの代わりに`<HydratedRouter>`をレンダリングする
- 注：`<App/>`コンポーネントのレンダリングを停止しました。後で戻しますが、まず新しいエントリポイントでアプリを起動できるようにします。

## 5. 構成要素の入れ替え

`root.tsx`と`entry.client.tsx`の間で、いくつかの構成要素を入れ替える必要があるかもしれません。

一般的に：

- `root.tsx`には、コンテキストプロバイダー、レイアウト、スタイルなどのレンダリングに関するものが入っています。
- `entry.client.tsx`はできるだけ最小限にする必要があります
- 既存の`<App/>`コンポーネントはまだレンダリングしようとしないでください。後でそれを行います。

`root.tsx`ファイルは静的に生成され、アプリのエントリポイントとして提供されるため、そのモジュールだけがサーバーレンダリングと互換性を持つ必要があります。これが、ほとんどの問題が発生する場所です。

## 6. ルートの設定

React Router Viteプラグインは、`routes.ts`ファイルを使用してルートを設定します。とりあえず、アプリを起動するために簡単なキャッチオールルートを追加します。

**👉 `catchall.tsx`ルートを設定する**

```shellscript nonumber
touch src/routes.ts src/catchall.tsx
```

```ts filename=src/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  // * はすべてのURLに一致します。?はオプションなので、/にも一致します
  route("*?", "catchall.tsx"),
] satisfies RouteConfig;
```

**👉 プレースホルダールートをレンダリングする**

最終的にはこれを元の`App`コンポーネントに置き換えますが、今のところ、アプリを起動できることを確認するために、簡単なものをレンダリングします。

```tsx filename=src/catchall.tsx
export default function Component() {
  return <div>Hello, world!</div>;
}
```

`routes.ts`ファイルの詳細については、[ルートの設定に関するガイド][configuring-routes]を参照してください。

## 7. アプリの起動

この時点で、アプリを起動してルートレイアウトを表示できるはずです。

**👉 `dev`スクリプトを追加してアプリを実行する**

```json filename=package.json
"scripts": {
  "dev": "react-router dev"
}
```

次に、先に進む前に、この時点でアプリを起動できることを確認してください。

```shellscript
npm run dev
```

## 8. アプリのレンダリング

アプリのレンダリングを再開するために、前に設定したすべてのURLに一致する「キャッチオール」ルートを更新して、既存の`<Routes>`がレンダリングされるようにします。

**👉 アプリをレンダリングするようにキャッチオールルートを更新する**

```tsx filename=src/catchall.tsx
import App from "./App";

export default function Component() {
  return <App />;
}
```

アプリは画面に戻り、通常どおり動作するはずです！

## 9. ルートをルートモジュールに移行する

これで、ルートをルートモジュールに段階的に移行できます。

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

**👉 ルート定義を`routes.ts`に追加する**

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

[ルートモジュールAPI][route-modules]を使用してルートモジュールを編集します。

```tsx filename=src/pages/about.tsx
export async function clientLoader() {
  // ここでデータを取得できます
  return {
    title: "About page",
  };
}

export default function Component({ loaderData }) {
  return <h1>{loaderData.title}</h1>;
}
```

パラメーター、ローダーデータなどに対する自動生成されたタイプセーフティの設定については、[タイプセーフティ][type-safety]を参照してください。

最初のいくつかのルートの移行は最も困難です。なぜなら、以前とは少し異なる方法でさまざまな抽象化にアクセスする必要があるからです（フックやコンテキストではなく、ローダーなど）。しかし、最も難しい部分が処理されると、段階的な流れに入ります。

## SSRとプリレンダリングを有効にする

サーバーレンダリングと静的プリレンダリングを有効にするには、バンドラープラグインの`ssr`オプションと`prerender`オプションを使用できます。SSRの場合、サーバービルドをサーバーにデプロイする必要もあります。詳細については、[デプロイ][deploying]を参照してください。

```ts filename=vite.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  async prerender() {
    return ["/", "/about", "/contact"];
  },
} satisfies Config;
```

[upgrade-router-provider]: ./router-provider
[deploying]: ../start/deploying
[configuring-routes]: ../start/framework/routing
[route-modules]: ../start/framework/route-module
[type-safety]: ../how-to/route-module-type-safety


