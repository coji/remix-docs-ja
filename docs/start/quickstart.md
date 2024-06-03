---
title: クイックスタート (5分)
order: 1
---

# クイックスタート

このガイドでは、できるだけ早く Remix アプリを実行するために必要な基本的な配管について説明します。異なるランタイム、デプロイターゲット、データベースを持つスターターテンプレートはたくさんありますが、今回はゼロから素のプロジェクトを作成します。

Remix プロジェクトを本格的に始める準備ができたら、コミュニティテンプレートから始めることを検討してください。これらのテンプレートには、TypeScript セットアップ、データベース、テストハーネス、認証など、さまざまな機能が含まれています。コミュニティテンプレートのリストは、[Remix リソース][templates]ページにあります。

## インストール

バッテリー込みの Remix プロジェクトを初期化する場合は、[`create-remix` CLI][create-remix]を使用できます。

```shellscript nonumber
npx create-remix@latest
```

ただし、このガイドでは、CLI がプロジェクトを設定するために実行するすべての処理を説明します。CLI を使用せずに、次の手順に従うことができます。Remix を初めて使用する場合は、このガイドに従って、Remix アプリを構成するさまざまなパーツを理解することをお勧めします。

```shellscript nonumber
mkdir my-remix-app
cd my-remix-app
npm init -y

# ランタイム依存関係をインストール
npm i @remix-run/node @remix-run/react @remix-run/serve isbot@4 react react-dom

# 開発依存関係をインストール
npm i -D @remix-run/dev vite
```

## Vite 構成

```shellscript nonumber
touch vite.config.js
```

Remix は [Vite] を使用するため、Remix Vite プラグインを含む [Vite 構成][vite-config] を提供する必要があります。以下は、必要な基本的な構成です。

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

`app/root.jsx` は、「ルートルート」と呼ばれるものです。これは、アプリ全体のルートレイアウトです。どのプロジェクトにも必要な基本的な要素セットを以下に示します。

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

まず、アプリを本番環境向けにビルドします。

```shellscript nonumber
npx remix vite:build
```

これで、`build` フォルダーが表示されるはずです。このフォルダーには、`server` フォルダー（アプリのサーバーバージョン）と `client` フォルダー（ブラウザバージョン）が含まれており、それらにはいくつかのビルドアーティファクトが含まれています。（これはすべて [構成可能][remix_config]です。）

👉 **`remix-serve` でアプリを実行する**

最初に、`package.json` でタイプを `module` に指定する必要があります。これにより、`remix-serve` がアプリを実行できるようになります。

```jsonc filename=package.json lines=[2] nocopy
{
  "type": "module"
  // ...
}
```

これで、`remix-serve` を使用してアプリを実行できます。

```shellscript nonumber
# ダッシュに注意！
npx remix-serve build/server/index.js
```

[http://localhost:3000][http-localhost-3000] を開くと、「hello world」ページが表示されるはずです。

`node_modules` 内の膨大なコードを除けば、Remix アプリは単一のファイルで構成されています。

```
├── app/
│   └── root.jsx
└── package.json
└── vite.config.js
```

## 独自のサーバーを用意する

`remix vite:build` によって作成された `build/server` ディレクトリは、単なるモジュールです。これは、Express、Cloudflare Workers、Netlify、Vercel、Fastly、AWS、Deno、Azure、Fastify、Firebase などのサーバー内で実行されます。

独自のサーバーを設定したくない場合は、`remix-serve` を使用できます。これは、Remix チームがメンテナンスしている、シンプルな Express ベースのサーバーです。ただし、Remix は、スタックを所有できるように、_あらゆる_ JavaScript 環境で実行されるように設計されています。多くの場合、ほとんどの運用アプリは独自のサーバーを持つと予想されます。これについては、[ランタイム、アダプター、スタック][runtimes]で詳しく説明されています。

気分転換に、`remix-serve` を使用しないようにして、代わりに Express を使用してみましょう。

👉 **Express、Remix Express アダプター、および [cross-env] をインストールして、本番モードで実行する**

```shellscript nonumber
npm i express @remix-run/express cross-env

# もう使用しません
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

// アプリも「単なるリクエストハンドラー」です
app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
```

👉 **Express を使用してアプリを実行する**

```shellscript nonumber
node server.js
```

これで、独自のサーバーを所有したので、サーバーが提供するツールを使用してアプリをデバッグできます。たとえば、[Node.js inspect フラグ][inspect]を使用して、Chrome デバッグツールでアプリを検査できます。

```shellscript nonumber
node --inspect server.js
```

## 開発ワークフロー

サーバーを常に停止、再構築、開始するのではなく、[Vite のミドルウェアモード][vite-middleware]を使用して、開発時に Remix を実行できます。これにより、React Refresh（Hot Module Replacement）と Remix Hot Data Revalidation を使用して、アプリの変更に対する即時のフィードバックを得ることができます。

まず、便宜上、`package.json` に `dev` コマンドと `start` コマンドを追加します。これらのコマンドは、それぞれ開発モードと本番モードでサーバーを実行します。

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

`process.env.NODE_ENV` が `"production"` に設定されている場合、Vite ミドルウェアは適用されません。この場合、これまでと同様に、通常のビルド出力を実行します。

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

これで、アプリを操作して、すぐにフィードバックを得ることができます。試してみてください。`root.jsx` のテキストを変更して、変更を確認してください。

## サーバーとブラウザのエントリの制御

Remix は、ほとんどのアプリでは操作する必要のない、デフォルトのマジックファイルを使用しています。ただし、サーバーとブラウザへの Remix のエントリポイントをカスタマイズする場合は、`remix reveal` を実行すると、これらのファイルがプロジェクトにダンプされます。

```shellscript nonumber
npx remix reveal
```

```
Entry file entry.client created at app/entry.client.tsx.
Entry file entry.server created at app/entry.server.tsx.
```

## まとめ

おめでとうございます。これで、履歴書に Remix を追加できます！要約すると、次のようなことを学びました。

- Remix は、アプリを 2 つのものにコンパイルします。
  - 独自 JavaScript サーバーに追加するリクエストハンドラー
  - ブラウザ向けの公開ディレクトリにある一連の静的アセット
- アダプターを使用して、独自のサーバーをどこでもデプロイできます。
- HMR が組み込まれた開発ワークフローを設定できます。

一般的に、Remix は少し「ガッツのある」アプローチです。少しのボイラープレートを書けば、すぐにスタックを所有できます。

次は何ですか？

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


