---
title: Vite (RouterProvider) の採用
---

# Vite (RouterProvider) の採用

`<RouterProvider>` を使用していない場合は、代わりに [コンポーネントルートからのルートモジュールの採用](./vite-component-routes) を参照してください。

React Router の vite プラグインは、React Router にフレームワーク機能を追加します。このドキュメントは、アプリにプラグインを採用する際に役立ちます。

## 機能

Vite プラグインは、以下の機能を追加します。

- ルートローダー、アクション、自動データ再検証
- 型安全なルートモジュール
- アプリ全体で型安全なルートパス
- 自動ルートコード分割
- ナビゲーション間の自動スクロール復元
- オプションの静的プリレンダリング
- オプションのサーバーレンダリング
- オプションの React サーバーコンポーネント

初期設定は少し面倒かもしれませんが、完了すれば、新しい機能の採用は段階的に行うことができ、一度に 1 つのルートを処理できます。

## 1. Vite のインストール

最初に React Router の vite プラグインをインストールします。

```shellscript nonumber
npm install -D @react-router/dev
```

次に、React プラグインを React Router に置き換えます。 `react` キーは、React プラグインと同じオプションを受け付けます。

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

一般的な Vite アプリでは、 `index.html` ファイルがバンドルのエントリポイントになります。React Router の Vite プラグインは、 `root.tsx` を使用します。これにより、静的 HTML の代わりに React を使用してシェルをレンダリングできます。

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

このマークアップを `src/root.tsx` に移動し、 `index.html` を削除します。

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

一般的な Vite アプリのセットアップでは、 `index.html` ファイルは、クライアントエントリポイントとして `src/main.tsx` を指しています。React Router は、 `src/entry.client.tsx` という名前のファイルを使用します。

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

## 4. 並べ替え

`root.tsx` と `entry.client.tsx` の間で、いくつかの要素を並べ替える必要があるかもしれません。

一般的に、

- `root.tsx` には、コンテキストプロバイダー、レイアウト、スタイルなど、レンダリングに関連するものが含まれています。
- `entry.client.tsx` は、可能な限り最小限にする必要があります。

`root.tsx` ファイルは静的に生成され、アプリのエントリポイントとして提供されることに注意してください。そのため、このモジュールのみがサーバーレンダリングと互換性がある必要があります。これは、ほとんどのトラブルが発生する場所です。

## 5. アプリの起動

この時点で、アプリを起動できるはずです。

```shellscript
npm react-router vite:dev
```

問題が発生した場合:

- 問題を新しいエントリポイントに限定するために、 `<HydratedRouter>` に対する `routes` プロップをコメントアウトします。
- [アップグレードに関するディスカッション](#TODO) カテゴリを検索します。
- [Twitter](https://x.com/remix_run) または [Discord](https://rmx.as/discord) でヘルプを求めてください。

先に進む前に、アプリが起動できることを確認してください。

## 6. ルートをルートモジュールに移行する

これで、ルートをルートモジュールに段階的に移行できます。最初に、ルートをエクスポートする `routes.ts` ファイルを作成します。

以下の既存のルートがあるとします。

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

この定義を `routes.ts` ファイルに移行できます。

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

これで、パラメーター、ローダーデータなどに関して型安全な推論が可能になります。

最初に移行するルートは、以前と少し異なる方法で同じ抽象化にアクセスする必要があるため、最も難しい場合があります (たとえば、フックやコンテキストではなくローダー内)。しかし、最も難しい部分を処理してしまえば、後は段階的にスムーズに進みます。

## SSR と/またはプリレンダリングを有効にする

サーバーレンダリングと静的プリレンダリングを有効にするには、バンドラープラグインの `ssr` オプションと `prerender` オプションを使用します。SSR を使用するには、サーバービルドをサーバーにデプロイする必要もあります。詳細については、[デプロイ](./deploying) を参照してください。

```ts filename=vite.config.ts
import { plugin as app } from "@react-router/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    app({
      ssr: true,
      async prerender() {
        return ["/", "/pages/about"];
      },
    }),
  ],
});
```



