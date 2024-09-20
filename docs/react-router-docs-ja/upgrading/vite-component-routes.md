---
title: Vite (Routes) の採用
---

# Vite (Routes) の採用

`<RouterProvider>` を使用している場合は、代わりに [RouterProvider からのルートモジュールの採用](./vite-router-provider) を参照してください。

`<Routes>` を使用している場合は、ここが正しい場所です。

React Router vite プラグインは、React Router にフレームワーク機能を追加します。このドキュメントは、アプリでプラグインを採用したい場合に役立ちます。

## 機能

Vite プラグインは以下を追加します。

- ルートローダー、アクション、自動データ再検証
- タイプセーフなルートモジュール
- アプリ全体でのタイプセーフなルートパス
- 自動ルートコード分割
- ナビゲーション間の自動スクロール復元
- オプションの静的事前レンダリング
- オプションのサーバーレンダリング
- オプションの React サーバーコンポーネント

初期設定は少し面倒ですが、完了すれば新しい機能の採用は段階的に行うことができ、一度に1つのルートずつ行うことができます。

## 1. Vite のインストール

最初に React Router vite プラグインをインストールします。

```shellscript nonumber
npm install -D @react-router/dev
```

次に、React プラグインを React Router に交換します。`react` キーは、React プラグインと同じオプションを受け入れます。

```diff filename=vite.config.ts
-import react from '@vitejs/plugin-react'
+import { plugin as app } from "@react-router/vite";
import { defineConfig } from "vite";


export default defineConfig({
  plugins: [
-    react(reactOptions)
+    app({ react: reactOptions })
  ],
});
```

## 2. ルートエントリポイントの追加

一般的な Vite アプリでは、`index.html` ファイルはバンドルのためのエントリポイントです。React Router Vite プラグインは、エントリポイントを `root.tsx` ファイルに移します。これにより、静的な HTML ではなく React を使用してアプリのシェルをレンダリングでき、最終的にはサーバーレンダリングにアップグレードすることができます。

たとえば、現在の `index.html` が次のようになっているとします。

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

一般的な Vite アプリのセットアップでは、`index.html` ファイルは `src/main.tsx` をクライアントエントリポイントとして指定します。React Router は、代わりに `src/entry.client.tsx` という名前のファイルを使用します。

現在の `src/main.tsx` が次のようになっているとします。

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

名前を `entry.client.tsx` に変更し、次のようにします。

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

- `createRoot` の代わりに `hydrateRoot` を使用します
- `<App/>` コンポーネントの代わりに `<HydratedRouter>` をレンダリングします
- `<App/>` コンポーネントのレンダリングを停止したことに注意してください。これは後のステップで復活します。今のところ、新しいエントリポイントを使用してアプリを起動するだけです。

## 4. ものをシャッフルする

`root.tsx` と `entry.client.tsx` の間では、いくつかのものをシャッフルする必要があるかもしれません。

一般的には、

- `root.tsx` には、コンテキストプロバイダー、レイアウト、スタイルなどのレンダリングに関するすべてのものが含まれています。
- `entry.client.tsx` はできるだけ最小限にしておく必要があります。
- 既存の `<App/>` コンポーネントをレンダリングしないようにして、手順を分離してください。

`root.tsx` ファイルは静的に生成され、アプリのエントリポイントとして提供されるため、そのモジュールのみがサーバーレンダリングと互換性がある必要があります。これが、ほとんどの問題が発生する場所です。

## 5. アプリの起動

この時点で、アプリを起動してルートレイアウトを表示できるはずです。

```shellscript
npm react-router vite:dev
```

- [アップグレードに関するディスカッション](#TODO) カテゴリを検索します。
- [Twitter](https://x.com/remix_run) または [Discord](https://rmx.as/discord) でヘルプを依頼します。

この時点でアプリを起動できることを確認してから、先に進んでください。

## 6. Catchall ルートの構成

アプリのレンダリングに戻るには、すべての URL と一致する「catchall」ルートを構成して、既存の `<Routes>` がレンダリングされるようにします。

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

次に、catchall ルートモジュールを作成し、既存のルートAppコンポーネントをその中にレンダリングします。

```tsx filename=src/catchall.tsx
import { defineRoute } from "react-router";
import App from "./App";

export default function Component() {
  return <App />;
}
```

これで、アプリは画面に戻り、通常どおり動作するはずです！

## 6. ルートをルートモジュールに移行する

これで、ルートを段階的にルートモジュールに移行することができます。

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

定義を `routes.ts` ファイルに移動することができます。

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

次に、ルートモジュールを編集してルートモジュールAPIを使用します。

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

これで、パラメータ、ローダーデータなど、推論されたタイプセーフティが得られます。

最初のいくつかのルートの移行は、最も難しいものです。なぜなら、以前とは少し異なる方法でさまざまな抽象化にアクセスする必要があることが多いからです（フックやコンテキストからではなく、ローダーで）。しかし、最も難しい部分が処理されれば、段階的な作業に移行できます。

## SSR と事前レンダリングを有効にする

サーバーレンダリングと静的事前レンダリングを有効にするには、バンドラープラグインの `ssr` と `prerender` オプションを使用します。

```ts filename=vite.config.ts
import { plugin as app } from "@react-router/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    app({
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



