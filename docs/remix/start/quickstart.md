---
title: クイックスタート (5分)
order: 1
---

# クイックスタート

<docs-warning>Remix を始めたばかりですか？Remix の最新バージョンは [React Router v7][remix-now-react-router] です。最新機能を使用したい場合は、[React Router のドキュメント][react-router-get-started] を参照して開始してください。</docs-warning>

このガイドでは、Remix アプリをできるだけ早く実行するために必要な基本的な仕組みについて説明します。さまざまなランタイム、デプロイターゲット、データベースを備えた多くのスターターテンプレートがありますが、ここでは、ゼロから必要最低限のプロジェクトを作成します。

Remix プロジェクトに本格的に取り組む準備ができたら、コミュニティテンプレートから始めることを検討するとよいでしょう。これらには、TypeScript の設定、データベース、テストハーネス、認証などが含まれています。コミュニティテンプレートのリストは、[Remix リソース][templates]ページで確認できます。

## インストール

すぐに使える Remix プロジェクトを初期化したい場合は、[`create-remix` CLI][create-remix] を使用できます。

```shellscript nonumber
npx create-remix@latest
```

ただし、このガイドでは、CLI がプロジェクトをセットアップするために行うすべてのことを説明します。CLI を使用する代わりに、以下の手順に従うことができます。Remix を使い始めたばかりの場合は、Remix アプリを構成するさまざまな要素を理解するために、このガイドに従うことをお勧めします。

```shellscript nonumber
mkdir my-remix-app
cd my-remix-app
npm init -y

# ランタイム依存関係をインストール
npm i @remix-run/node @remix-run/react @remix-run/serve isbot@4 react@18 react-dom@18

# 開発依存関係をインストール
npm i -D @remix-run/dev vite
```

## Vite 設定

```shellscript nonumber
touch vite.config.js
```

Remix は [Vite] を使用するため、Remix Vite プラグインを含む [Vite 設定][vite-config] を提供する必要があります。以下は、必要な基本的な設定です。

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

`app/root.jsx` は、いわゆる「ルートルート」です。これは、アプリ全体のルートレイアウトです。以下は、すべてのプロジェクトに必要な基本的な要素のセットです。

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

まず、`package.json` で `type` を `module` として指定し、`remix-run` および将来のバージョンの `vite` の esmodule 要件を満たす必要があります。

```jsonc filename=package.json lines=[2] nocopy
{
  "type": "module"
  // ...
}
```

次に、本番環境用にアプリをビルドします。

```shellscript nonumber
npx remix vite:build
```

これで、`build` フォルダーに、`server` フォルダー（アプリのサーバーバージョン）と、いくつかのビルド成果物を含む `client` フォルダー（ブラウザーバージョン）が表示されるはずです。（これはすべて[設定可能][vite_config]です。）

👉 **`remix-serve` でアプリを実行する**

これで、`remix-serve` でアプリを実行できます。

```shellscript nonumber
# ダッシュに注意！
npx remix-serve build/server/index.js
```

[http://localhost:3000][http-localhost-3000] を開いて、「hello world」ページが表示されるはずです。

`node_modules` にある膨大な量のコードを除けば、Remix アプリは次の3つのファイルだけです。

```
├── app/
│   └── root.jsx
├── package.json
└── vite.config.js
```

## 独自のサーバーを持ち込む

`remix vite:build` によって作成された `build/server` ディレクトリは、Express、Cloudflare Workers、Netlify、Vercel、Fastly、AWS、Deno、Azure、Fastify、Firebase などのサーバー内で実行するモジュールにすぎません。

独自のサーバーをセットアップしたくない場合は、`remix-serve` を使用できます。これは、Remix チームが管理するシンプルな Express ベースのサーバーです。ただし、Remix は、スタックを所有できるように、_あらゆる_ JavaScript 環境で実行するように特別に設計されています。多くの（ほとんどではないにしても）本番アプリには独自のサーバーがあることが予想されます。これについては、[ランタイム、アダプター、スタック][runtimes]で詳しく読むことができます。

試しに、`remix-serve` の使用を停止して、代わりに Express を使用してみましょう。

👉 **Express、Remix Express アダプター、および本番モードで実行するための [cross-env] をインストールする**

```shellscript nonumber
npm i express@4 @remix-run/express cross-env

# これはもう使用しない
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

// そして、アプリは「単なるリクエストハンドラー」です
app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
```

👉 **Express でアプリを実行する**

```shellscript nonumber
node server.js
```

これでサーバーを所有したので、サーバーが持つツールを使用してアプリをデバッグできます。たとえば、[Node.js inspect フラグ][inspect]を使用して、Chrome DevTools でアプリを検査できます。

```shellscript nonumber
node --inspect server.js
```

## 開発ワークフロー

サーバーを常に停止、再構築、起動する代わりに、[ミドルウェアモードの Vite][vite-middleware]を使用して、開発中に Remix を実行できます。これにより、React Refresh（ホットモジュールリプレースメント）と Remix ホットデータ再検証を使用して、アプリの変更に即座にフィードバックできます。

まず、便宜上、`package.json` に `dev` コマンドと `start` コマンドを追加します。これにより、それぞれ開発モードと本番モードでサーバーが実行されます。

👉 **`package.json` に "scripts" エントリを追加する**

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

`process.env.NODE_ENV` が `"production"` に設定されている場合、Vite ミドルウェアは適用されません。この場合、以前と同様に通常のビルド出力が実行されます。

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

これで、アプリをすぐにフィードバックを得ながら作業できます。試してみて、`root.jsx` のテキストを変更して見てください。

## サーバーとブラウザーのエントリの制御

Remix が使用しているデフォルトのマジックファイルがあり、ほとんどのアプリでは変更する必要はありませんが、サーバーとブラウザーへの Remix のエントリポイントをカスタマイズしたい場合は、`remix reveal` を実行すると、それらがプロジェクトにダンプされます。

```shellscript nonumber
npx remix reveal
```

```
エントリファイル entry.client が app/entry.client.tsx に作成されました。
エントリファイル entry.server が app/entry.server.tsx に作成されました。
```

## まとめ

おめでとうございます。Remix を履歴書に追加できます。まとめると、次のことを学びました。

- Remix はアプリを次の 2 つにコンパイルします。
  - 独自の JavaScript サーバーに追加するリクエストハンドラー
  - ブラウザー用のパブリックディレクトリにある静的アセットの山
- アダプターを使用して独自のサーバーを持ち込み、どこにでもデプロイできます
- HMR が組み込まれた開発ワークフローをセットアップできます

一般的に、Remix は少し「内臓がむき出し」です。数分のボイラープレートですが、これでスタックを所有できます。

次は？

- [チュートリアル][tutorial]

[create-remix]: ../other-api/create-remix
[runtimes]: ../discussion/runtimes
[inspect]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[tutorial]: ./tutorial
[vite_config]: ../file-conventions/vite-config
[templates]: /resources?category=templates
[http-localhost-3000]: http://localhost:3000
[es-modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[vite]: https://vitejs.dev
[vite-config]: https://vitejs.dev/config
[vite-middleware]: https://vitejs.dev/guide/ssr#setting-up-the-dev-server
[cross-env]: https://www.npmjs.com/package/cross-env
[remix-now-react-router]: https://remix.run/blog/incremental-path-to-react-19
[react-router-get-started]: https://reactrouter.com/start/framework/installation
