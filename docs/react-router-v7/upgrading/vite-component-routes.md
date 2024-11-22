---
title: Vite の採用（Routes）
hidden: true
---

# Vite の採用（Routes）

`<RouterProvider>` を使用している場合は、代わりに [RouterProvider からルートモジュールを採用する](./vite-router-provider) を参照してください。

`<Routes>` を使用している場合は、ここが正しい場所です。

React Router vite プラグインは、React Router にフレームワーク機能を追加します。このドキュメントは、必要に応じてアプリにプラグインを採用するのに役立ちます。

## 機能

Vite プラグインは次のものを追加します。

- ルートローダー、アクション、自動データ再検証
- 型安全なルートモジュール
- アプリ全体での型安全なルートパス
- 自動ルートコード分割
- ナビゲーション全体での自動スクロール復元
- オプションの静的プリレンダリング
- オプションのサーバーレンダリング
- オプションの React サーバーコンポーネント

初期設定は少し面倒かもしれませんが、完了したら、新しい機能の採用は段階的になり、一度に 1 つのルートを実行できます。

## 1. Vite のインストール

まず、React Router vite プラグインをインストールします。

```shellscript nonumber
npm install -D @react-router/dev
```

次に、React プラグインを React Router に置き換えます。

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

## 2. ルートエントリポイントの追加

典型的な Vite アプリでは、`index.html` ファイルはバンドルのためのエントリポイントです。React Router Vite プラグインは、エントリポイントを `root.tsx` ファイルに移動するため、静的 HTML の代わりに React を使用してアプリのシェルをレンダリングし、最終的には必要に応じてサーバーレンダリングにアップグレードできます。

たとえば、現在の `index.html` が次のようになっている場合：

```html filename="index.html"
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

このマークアップを `src/root.tsx` に移動し、`index.html` を削除します。

```tsx filename=src/root.tsx
import {
  Scripts,
  Outlet,
  ScrollRestoration,
} from "react-router";

export default function Root() {
  return (
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
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

## 3. クライアントエントリモジュールの追加

典型的な Vite アプリのセットアップでは、`index.html` ファイルは `src/main.tsx` をクライアントエントリポイントとして指しています。React Router は代わりに `src/entry.client.tsx` という名前のファイルを使用します。

現在の `src/main.tsx` が次のようになっている場合：

```tsx filename=src/main.tsx
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`entry.client.tsx` に名前を変更し、次のようになります。

```tsx filename=src/entry.client.tsx
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

ReactDOM.hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
);
```

- `createRoot` ではなく `hydrateRoot` を使用してください。
- `<App/>` コンポーネントではなく、`<HydratedRouter>` をレンダリングします。
- `<App/>` コンポーネントのレンダリングを停止したことに注意してください。これは後続の手順で戻ってきます。現時点では、新しいエントリポイントを使用してアプリを起動するだけです。

## 4. シャッフル

`root.tsx` と `entry.client.tsx` の間では、いくつかをシャッフルする必要があるかもしれません。

一般的に、

- `root.tsx` には、コンテキストプロバイダー、レイアウト、スタイルなど、レンダリングに関するものが含まれます。
- `entry.client.tsx` はできるだけ最小限にする必要があります
- 既存の `<App/>` コンポーネントをレンダリングしようとしないように、手順を分離してください。

`root.tsx` ファイルは静的に生成され、アプリのエントリポイントとして提供されることに注意してください。そのため、そのモジュールのみがサーバーレンダリングと互換性を持つ必要があります。これがほとんどのトラブルの原因となります。

## 5. アプリの起動

この時点で、アプリを起動してルートレイアウトを表示できるはずです。

```shellscript
npm react-router vite:dev
```

- [アップグレードに関する議論](#TODO) カテゴリを検索します。
- [Twitter](https://x.com/remix_run) または [Discord](https://rmx.as/discord) でヘルプを求めてください。

先に進む前に、アプリを起動できることを確認してください。

## 6. キャッチオールルートの設定

アプリのレンダリングに戻すために、既存の `<Routes>` がレンダリングされるように、すべての URL に一致する「キャッチオール」ルートを設定します。

`src/routes.ts` にファイルを作成し、以下を追加します。

```ts filename=src/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";

export const routes: RouteConfig = [
  {
    path: "*",
    file: "src/catchall.tsx",
  },
];
```

次に、キャッチオールルートモジュールを作成し、既存のルートAppコンポーネントをその中でレンダリングします。

```tsx filename=src/catchall.tsx
import App from "./App";

export default function Component() {
  return <App />;
}
```

アプリは画面に戻り、通常どおりに動作するはずです！

## 6. ルートをルートモジュールに移行する

これで、ルートをルートモジュールに段階的に移行できます。

次の既存のルートがあるとします。

```tsx filename=src/App.tsx
// ...
import Page from "./containers/page";

export default function App() {
  return (
    <Routes>
      <Route path="/pages/:id" element={<Page />} />
    </Routes>
  );
}
```

`routes.ts` ファイルに定義を移動できます。

```tsx filename=src/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";

export const routes: RouteConfig = [
  {
    path: "/pages/:id",
    file: "./containers/page.tsx",
  },
  {
    path: "*",
    file: "src/catchall.tsx",
  },
];
```

次に、ルートモジュールを編集して、ルートモジュールAPIを使用します。

```tsx filename=src/pages/about.tsx
import { useLoaderData } from "react-router";

export async function clientLoader({ params }) {
  let page = await getPage(params.id);
  return page;
}

export default function Component() {
  let data = useLoaderData();
  return <h1>{data.title}</h1>;
}
```

これで、パラメーター、ローダーデータなど、型推論された型安全性を得ることができます。

最初に移行するルートは、多くの場合、フックやコンテキストではなく、ローダーなどでさまざまな抽象化にアクセスする必要があるため、最も難しいものです。しかし、最も難しい部分を処理したら、段階的に進めることができます。

## SSR とプリレンダリングを有効にする

サーバーレンダリングと静的プリレンダリングを有効にするには、バンドラープラグインの `ssr` オプションと `prerender` オプションを使用できます。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      ssr: true,
      async prerender() {
        return ["/", "/about", "/contact"];
      },
    }),
  ],
});
```

サーバーのデプロイの詳細については、[デプロイ][deploying] を参照してください。

[deploying]: ../start/deploying



