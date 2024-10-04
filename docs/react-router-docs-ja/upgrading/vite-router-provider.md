---
title: Vite (RouterProvider) の採用
hidden: true
---

# Vite (RouterProvider) の採用

`<RouterProvider>` を使用していない場合は、代わりに [コンポーネントルートからのルートモジュールの採用](./vite-component-routes) を参照してください。

React Router vite プラグインは、React Router にフレームワーク機能を追加します。このドキュメントは、プラグインをアプリに採用する際に役立ちます。

## 機能

Vite プラグインは以下を追加します。

- ルートローダー、アクション、自動データ再検証
- タイプセーフなルートモジュール
- アプリ全体のタイプセーフなルートパス
- 自動ルートコード分割
- ナビゲーション間の自動スクロール復元
- オプションの静的プリレンダリング
- オプションのサーバーレンダリング
- オプションの React Server Components

初期設定は少し面倒かもしれませんが、完了すれば、新しい機能の採用は段階的に行うことができ、一度に 1 つのルートずつ行うことができます。

## 1. Vite のインストール

最初に、React Router vite プラグインをインストールします。

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

## 2. ルートエントリーポイントの追加

一般的な Vite アプリでは、`index.html` ファイルはバンドルのためのエントリーポイントです。React Router Vite プラグインは `root.tsx` を使用します。これにより、静的な HTML ではなく React を使用してシェルをレンダリングすることができます。

現在の `index.html` が以下のようになっている場合:

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

## 3. クライアントエントリーモジュールの追加

一般的な Vite アプリのセットアップでは、`index.html` ファイルは `src/main.tsx` をクライアントエントリーポイントとして指し示します。React Router は `src/entry.client.tsx` という名前のファイルを使用します。

現在の `src/main.tsx` が以下のようになっている場合:

```tsx filename=src/main.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter(YOUR_ROUTES);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
```

`entry.client.tsx` に名前を変更し、以下のように変更します。

```tsx filename=src/entry.client.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import { HydratedRouter } from "react-router-dom";

ReactDOM.hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter routes={YOUR_ROUTES} />
  </StrictMode>
);
```

- `createRoot` の代わりに `hydrateRoot` を使用します。
- `<RouterProvider>` の代わりに `<HydratedRouter>` を使用します。
- ルートを `<HydratedRouter>` に渡します。

## 4. ファイルの整理

`root.tsx` と `entry.client.tsx` の間では、いくつかのファイルを整理する必要があるかもしれません。

一般的には:

- `root.tsx` には、コンテキストプロバイダー、レイアウト、スタイルなど、レンダリングに関するものが含まれています。
- `entry.client.tsx` はできるだけシンプルにする必要があります。

`root.tsx` ファイルは静的に生成され、アプリのエントリーポイントとして配信されるため、そのモジュールだけがサーバーレンダリングと互換性がある必要があります。これが、ほとんどの問題が発生する場所です。

## 5. アプリの起動

この時点で、アプリを起動できるはずです。

```shellscript
npm react-router vite:dev
```

問題が発生した場合:

- `<HydratedRouter>` の `routes` プロパティをコメントアウトして、新しいエントリーポイントを分離します。
- [アップグレードに関するディスカッション](#TODO) カテゴリを検索します。
- [Twitter](https://x.com/remix_run) または [Discord](https://rmx.as/discord) で助けを求めてください。

先に進む前に、アプリが起動することを確認してください。

## 6. ルートをルートモジュールに移行する

これで、ルートをルートモジュールに段階的に移行することができます。最初に、ルートをエクスポートする `routes.ts` ファイルを作成します。

既存のルートが以下のようになっているとします。

```tsx filename=src/entry.client.tsx
// ...
import Page from "./containers/page";

ReactDOM.hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter
      routes={[
        // ...
        {
          path: "/pages/:id",
          element: <Page />,
        },
      ]}
    />
  </StrictMode>
);
```

`routes.ts` ファイルに定義を移動することができます。

```tsx filename=src/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";

export const routes: RouteConfig = [
  {
    path: "/pages/:id",
    file: "./containers/page.tsx",
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

これで、パラメータ、ローダーデータなどを含む型推論による型安全性を実現できます。

最初に移行するルートは、多くの場合、以前とは少し異なる方法で同じ抽象化にアクセスする必要があるため、最も困難です（フックやコンテキストからではなく、ローダー内のように）。しかし、最も難しい部分を乗り越えれば、段階的に進むことができます。

## SSR やプリレンダリングを有効にする

サーバーレンダリングと静的プリレンダリングを有効にするには、バンドラープラグインの `ssr` オプションと `prerender` オプションを使用できます。SSR を使用するには、サーバービルドもサーバーにデプロイする必要があります。詳細については、[デプロイ](./deploying) を参照してください。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      ssr: true,
      async prerender() {
        return ["/", "/pages/about"];
      },
    }),
  ],
});
```
