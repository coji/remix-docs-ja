---
title: クイックスタート (5分)
order: 1
---

# クイックスタート

このガイドでは、Remix アプリをできるだけ早く実行するために必要な基本的な配管について説明します。さまざまなランタイム、デプロイターゲット、データベースを持つスターターテンプレートはたくさんありますが、ここではゼロからベアボーンのプロジェクトを作成します。

Remix プロジェクトを本格的に始める準備ができたら、コミュニティテンプレートから始めることを検討してください。これらには、TypeScript セットアップ、データベース、テストハーネス、認証などが含まれています。コミュニティテンプレートのリストは、[Remix リソース][templates]ページにあります。

## インストール

バッテリー込みの Remix プロジェクトを初期化する場合は、[`create-remix` CLI][create-remix] を使用できます。

```shellscript nonumber
npx create-remix@latest
```

ただし、このガイドでは、CLI がプロジェクトをセットアップするために実行するすべてのことを説明し、CLI を使用せずにこれらの手順を実行します。Remix を初めて使用する場合は、このガイドに従って、Remix アプリを構成するさまざまな要素を理解することをお勧めします。

```shellscript nonumber
mkdir my-remix-app
cd my-remix-app
npm init -y

# ランタイム依存関係をインストールする
npm i @remix-run/node @remix-run/react @remix-run/serve isbot@4 react react-dom

# 開発依存関係をインストールする
npm i -D @remix-run/dev vite
```

## Vite 設定

```shellscript nonumber
touch vite.config.js
```

Remix は [Vite] を使用するため、Remix Vite プラグインを使用して [Vite 設定][vite-config] を提供する必要があります。以下は、必要な基本的な設定です。

```js filename=vite.config.js
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

## ルートルート

```shellscript nonumber
mkdir app
touch app/root.jsx
```

`app/root.jsx` は、「ルートルート」と呼ばれるものです。これは、アプリ全体のルートレイアウトです。以下は、あらゆるプロジェクトに必要な基本的な要素のセットです。

```jsx filename=app/root.jsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "@remix-run/react";

export default function App() {
  return (
    <html>
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Hello world!</h1>
        <Outlet />

        <Scripts />
      </body>
    </html>
  );
}
```

## ビルドと実行

まず、アプリを本番環境用にビルドします。

```shellscript nonumber
npx remix vite:build
```

これで、`build` フォルダーが表示され、その中に `server` フォルダー（アプリのサーバーバージョン）と `client` フォルダー（ブラウザバージョン）があり、いくつかのビルドアーティファクトが含まれています。（これはすべて [構成可能][remix_config] です。）

👉 **`remix-serve` でアプリを実行する**

まず、`package.json` のタイプをモジュールとして指定する必要があります。これにより、`remix-serve` はアプリを実行できます。

```jsonc filename=package.json lines=[2] nocopy
{
  "type": "module"
  // ...
}
```

これで、`remix-serve` を使用してアプリを実行できます。

```shellscript nonumber
# ダッシュに注意してください！
npx remix-serve build/server/index.js
```

[http://localhost:3000][http-localhost-3000] を開いて、「hello world」ページが表示されるはずです。

`node_modules` の大量のコードを除けば、Remix アプリは 1 つのファイルだけです。

```
├── app/
│   └── root.jsx
└── package.json
└── vite.config.js
```

## 独自サーバーの利用

`remix vite:build` によって作成された `build/server` ディレクトリは、Express、Cloudflare Workers、Netlify、Vercel、Fastly、AWS、Deno、Azure、Fastify、Firebase などのサーバー内で実行するモジュールにすぎません。

独自のサーバーをセットアップしたくない場合は、`remix-serve` を使用できます。これは、Remix チームが保守しているシンプルな express ベースのサーバーです。ただし、Remix は、スタックを所有できるように、_あらゆる_ JavaScript 環境で実行するように特別に設計されています。多くの（ほとんどではないにしても）本番アプリは、独自のサーバーを持つことが予想されます。この詳細については、[ランタイム、アダプター、スタック][runtimes] を参照してください。

単に面白がって、`remix-serve` の使用をやめて、代わりに express を使用してみましょう。

👉 **Express、Remix Express アダプター、[cross-env]（本番モードで実行するため）をインストールする**

```shellscript nonumber
npm i express @remix-run/express cross-env

# これ以上使用しない
npm uninstall @remix-run/serve
```

👉 **Express サーバーを作成する**

```shellscript nonumber
touch server.js
```

```js filename=server.js
import { createRequestHandler } from "@remix-run/express";
import express from "express";

// `remix vite:build` の結果は「単なるモジュール」であることに注意してください
import * as build from "./build/server/index.js";

const app = express();
app.use(express.static("build/client"));

// アプリは「単なるリクエストハンドラー」です
app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
```

👉 **express でアプリを実行する**

```shellscript nonumber
node server.js
```

これで、サーバーを所有したので、サーバーが持つツールを使用してアプリをデバッグできます。たとえば、[Node.js inspect フラグ][inspect] を使用して、chrome devtools でアプリを検査できます。

```shellscript nonumber
node --inspect server.js
```

## 開発ワークフロー

サーバーを常に停止、再構築、再起動する代わりに、[ミドルウェアモードの Vite][vite-middleware] を使用して、Remix を開発環境で実行できます。これにより、React Refresh（ホットモジュール置換）と Remix ホットデータ再検証を使用して、アプリへの変更にすぐにフィードバックできます。

まず、便宜上、`package.json` に `dev` と `start` コマンドを追加します。これにより、サーバーを開発モードと本番モードでそれぞれ実行できます。

👉 **`package.json` に「scripts」エントリを追加する**

```jsonc filename=package.json lines=[2-4] nocopy
{
  "scripts": {
    "dev": "node ./server.js",
    "start": "cross-env NODE_ENV=production node ./server.js"
  }
  // ...
}
```

👉 **Vite 開発ミドルウェアをサーバーに追加する**

`process.env.NODE_ENV` が `"production"` に設定されている場合、Vite ミドルウェアは適用されません。その場合、以前と同様に、通常のビルド出力が実行されます。

```js filename=server.js lines=[4-11,14-18,20-25]
import { createRequestHandler } from "@remix-run/express";
import express from "express";

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();
app.use(
  viteDevServer
    ? viteDevServer.middlewares
    : express.static("build/client")
);

const build = viteDevServer
  ? () =>
      viteDevServer.ssrLoadModule(
        "virtual:remix/server-build"
      )
  : await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
```

👉 **開発サーバーを起動する**

```shellscript nonumber
npm run dev
```

これで、すぐにフィードバックを受けながらアプリに取り組むことができます。試してみてください。`root.jsx` のテキストを変更して、動作を確認してください！

## サーバーエントリとブラウザエントリの制御

Remix は、ほとんどのアプリでは変更する必要のないデフォルトのマジックファイルを使用していますが、サーバーとブラウザへの Remix のエントリポイントをカスタマイズする必要がある場合は、`remix reveal` を実行すると、プロジェクトにダンプされます。

```shellscript nonumber
npx remix reveal
```

```
エントリファイル entry.client が app/entry.client.tsx に作成されました。
エントリファイル entry.server が app/entry.server.tsx に作成されました。
```

## まとめ

おめでとうございます。履歴書に Remix を追加できます！要約すると、次のことを学びました。

- Remix はアプリを 2 つの要素にコンパイルします。
  - 独自 JavaScript サーバーに追加するリクエストハンドラー
  - ブラウザの公開ディレクトリにある一連の静的資産
- アダプターを使用して、独自のサーバーをどこでもデプロイできます
- HMR が組み込まれた開発ワークフローをセットアップできます

一般的に、Remix は少し「むき出し」です。少しだけボイラープレートを追加すれば、スタックを所有できます。

次は？

- [チュートリアル][tutorial]

[create-remix]: ../other-api/create-remix
[runtimes]: ../discussion/runtimes
[inspect]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[tutorial]: ./tutorial
[remix_config]: ../file-conventions/remix-config
[templates]: /resources?category=templates
[http-localhost-3000]: http://localhost:3000
[es-modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[vite]: https://vitejs.dev
[vite-config]: https://vitejs.dev/config
[vite-middleware]: https://vitejs.dev/guide/ssr#setting-up-the-dev-server
[cross-env]: https://www.npmjs.com/package/cross-env


