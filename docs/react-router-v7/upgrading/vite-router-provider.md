---
title: Vite (RouterProvider) の採用
hidden: true
---

# Vite (RouterProvider) の採用

`<RouterProvider>` を使用していない場合は、代わりに[コンポーネントルートからのルートモジュール採用](./vite-component-routes)を参照してください。

React Router vite プラグインは、React Router にフレームワーク機能を追加します。このドキュメントは、このプラグインをアプリに採用する場合に役立ちます。

## 機能

Vite プラグインは、以下を追加します。

- ルートローダー、アクション、自動データ再検証
- タイプセーフなルートモジュール
- アプリ全体でタイプセーフなルートパス
- 自動ルートコード分割
- ナビゲーション全体での自動スクロール復元
- オプションの静的事前レンダリング
- オプションのサーバーレンダリング
- オプションの React サーバーコンポーネント

最初のセットアップは少し面倒ですが、完了すれば、新しい機能の採用は段階的になり、一度に 1 つのルートずつ実行できます。

## 1. Vite のインストール

最初に、React Router vite プラグインをインストールします。

```shellscript nonumber
npm install -D @react-router/dev
```

次に、React プラグインを React Router に交換します。

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

典型的な Vite アプリでは、`index.html` ファイルはバンドルのエントリポイントです。React Router Vite プラグインは `root.tsx` を使用します。これにより、静的な HTML の代わりに React を使用してシェルをレンダリングできます。

現在の `index.html` が以下のようになっている場合。

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

## 3. クライアントエントリモジュールの追加

典型的な Vite アプリのセットアップでは、`index.html` ファイルは `src/main.tsx` をクライアントエントリポイントとして指定します。React Router は `src/entry.client.tsx` という名前のファイルを使用します。

現在の `src/main.tsx` が以下のようになっている場合。

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

これを `entry.client.tsx` に名前を変更し、以下のように変更します。

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

- `createRoot` の代わりに `hydrateRoot` を使用する
- `<RouterProvider>` の代わりに `<HydratedRouter>` を使用する
- `<HydratedRouter>` にルートを渡す

## 4. シャッフル

`root.tsx` と `entry.client.tsx` の間で、いくつかのものをシャッフルする必要があるかもしれません。

一般的に、

- `root.tsx` には、コンテキストプロバイダー、レイアウト、スタイルなどのレンダリング関連のものが含まれます。
- `entry.client.tsx` は、可能な限り最小限にする必要があります。

`root.tsx` ファイルは静的に生成され、アプリのエントリポイントとして配信されるため、そのモジュールだけがサーバーレンダリングと互換性がある必要があります。これが、ほとんどのトラブルが発生する場所です。

## 5. アプリの起動

この時点で、アプリを起動できるはずです。

```shellscript
npm react-router vite:dev
```

問題が発生した場合

- `<HydratedRouter>` への `routes` プロパティをコメントアウトして、新しいエントリポイントに問題を限定する
- [アップグレードに関する議論](#TODO) カテゴリを検索する
- [Twitter](https://x.com/remix_run) または [Discord](https://rmx.as/discord) で助けを求める

この時点でアプリを起動できることを確認してから、先に進みます。

## 6. ルートをルートモジュールに移行する

これで、ルートをルートモジュールに段階的に移行できます。最初に、ルートをエクスポートする `routes.ts` ファイルを作成します。

以下のような既存のルートがあるとします。

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

この定義を `routes.ts` ファイルに移動できます。

```tsx filename=src/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";

export const routes: RouteConfig = [
  {
    path: "/pages/:id",
    file: "./containers/page.tsx",
  },
];
```

そして、ルートモジュールを編集して、ルートモジュールAPIを使用します。

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

これで、パラメータ、ローダーデータなどについて、型推論による型安全性を得られます。

最初に移行するルートは、フックやコンテキストとは少し異なる方法で同じ抽象化にアクセスする必要があるため、最も難しい部分になります。しかし、最も厄介な部分が処理されれば、段階的に進めることができます。

## SSR または事前レンダリングを有効にする

サーバーレンダリングと静的事前レンダリングを有効にするには、バンドラープラグインの `ssr` オプションと `prerender` オプションを使用します。SSR を使用するには、サーバービルドもサーバーにデプロイする必要があります。詳細については、[デプロイ](../start/deploying)を参照してください。

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



