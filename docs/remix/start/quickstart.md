---
title: クイックスタート (5分)
order: 1
---

# クイックスタート

このガイドでは、できるだけ早くRemixアプリを実行するために必要な基本的な配管について説明します。さまざまなランタイム、デプロイターゲット、データベースを持つスターターテンプレートはたくさんありますが、ここではゼロからベアメタルのプロジェクトを作成します。

Remixプロジェクトを本格的に始める準備ができたら、コミュニティテンプレートから始めることを検討してください。テンプレートには、TypeScriptの設定、データベース、テストハーネス、認証などが含まれています。コミュニティテンプレートのリストは、[Remix Resources][templates]ページにあります。

## インストール

バッテリー込みのRemixプロジェクトを初期化したい場合は、[`create-remix` CLI][create-remix]を使用できます。

```shellscript nonumber
npx create-remix@latest
```

ただし、このガイドでは、CLIがプロジェクトをセットアップするために実行するすべての操作を説明します。CLIを使用する代わりに、次の手順に従うことができます。Remixを初めて使用する場合は、このガイドに従って、Remixアプリを構成するさまざまなパーツを理解することをお勧めします。

```shellscript nonumber
mkdir my-remix-app
cd my-remix-app
npm init -y

# ランタイム依存関係をインストール
npm i @remix-run/node @remix-run/react @remix-run/serve isbot@4 react react-dom

# 開発依存関係をインストール
npm i -D @remix-run/dev vite
```

## Vite設定

```shellscript nonumber
touch vite.config.js
```

Remixは[Vite]を使用するため、Remix Viteプラグインを含む[Vite設定][vite-config]を提供する必要があります。必要な基本的な設定を次に示します。

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

`app/root.jsx`は、私たちが「ルートルート」と呼ぶものです。これは、アプリ全体のルートレイアウトです。すべてのプロジェクトに必要な基本的な要素を次に示します。

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

最初に、アプリを本番環境用にビルドします。

```shellscript nonumber
npx remix vite:build
```

これで、`build`フォルダに、`server`フォルダ（アプリのサーバーバージョン）と`client`フォルダ（ブラウザバージョン）が作成され、そこにビルドアーティファクトが含まれます。（これはすべて[構成可能][vite_config]です。）

👉 **`remix-serve`でアプリを実行する**

最初に、`package.json`でタイプを`module`に指定する必要があります。そうすることで、`remix-serve`がアプリを実行できるようになります。

```jsonc filename=package.json lines=[2] nocopy
{
  "type": "module"
  // ...
}
```

これで、`remix-serve`でアプリを実行できます。

```shellscript nonumber
# ダッシュに注意！
npx remix-serve build/server/index.js
```

[http://localhost:3000][http-localhost-3000]を開くと、「hello world」ページが表示されます。

`node_modules`内の大量のコードを除けば、Remixアプリは単一のファイルのみです。

```
├── app/
│   └── root.jsx
└── package.json
└── vite.config.js
```

## 独自のサーバーを用意する

`remix vite:build`によって作成された`build/server`ディレクトリは、単なるモジュールです。これは、Express、Cloudflare Workers、Netlify、Vercel、Fastly、AWS、Deno、Azure、Fastify、Firebaseなど、サーバー内で実行します。...どこでも。

独自のサーバーをセットアップしたくない場合は、`remix-serve`を使用できます。これは、Remixチームが保守するシンプルなexpressベースのサーバーです。ただし、Remixは、どのJavaScript環境でも実行できるように設計されているため、スタックを所有できます。多くの場合、特に本番環境のアプリでは、独自のサーバーを持つことが期待されます。この点については、[Runtimes、Adapters、and Stacks][runtimes]で詳しく説明しています。

ちょっとした実験として、`remix-serve`の使用をやめて、代わりにexpressを使用してみましょう。

👉 **Express、Remix Expressアダプター、および本番モードで実行するための[cross-env]をインストールする**

```shellscript nonumber
npm i express @remix-run/express cross-env

# これ以上は使用しない
npm uninstall @remix-run/serve
```

👉 **Expressサーバーを作成する**

```shellscript nonumber
touch server.js
```

```js filename=server.js
import { createRequestHandler } from "@remix-run/express";
import express from "express";

// `remix vite:build`の結果は「単なるモジュール」であることに注意
import * as build from "./build/server/index.js";

const app = express();
app.use(express.static("build/client"));

// アプリも「単なるリクエストハンドラー」です
app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
```

👉 **expressでアプリを実行する**

```shellscript nonumber
node server.js
```

これでサーバーを所有したため、サーバーが備えているツールを使用してアプリをデバッグできます。たとえば、[Node.js inspectフラグ][inspect]を使用して、chrome devtoolsでアプリを検査できます。

```shellscript nonumber
node --inspect server.js
```

## 開発ワークフロー

サーバーを停止、再ビルド、起動を繰り返すのではなく、[Viteミドルウェアモード][vite-middleware]を使用してRemixを開発モードで実行できます。これにより、React Refresh（ホットモジュール置換）とRemix Hot Data Revalidationを使用して、アプリの変更に対する即時のフィードバックが可能になります。

まず、便宜上、`package.json`に`dev`と`start`コマンドを追加します。これらは、それぞれ開発モードと本番モードでサーバーを実行します。

👉 **`package.json`に「scripts」エントリを追加する**

```jsonc filename=package.json lines=[2-4] nocopy
{
  "scripts": {
    "dev": "node ./server.js",
    "start": "cross-env NODE_ENV=production node ./server.js"
  }
  // ...
}
```

👉 **サーバーにVite開発ミドルウェアを追加する**

`process.env.NODE_ENV`が`"production"`に設定されている場合は、Viteミドルウェアは適用されません。この場合は、前述のように、通常のビルド出力を実行し続けます。

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

これで、アプリをすぐにフィードバックを得ながら操作できます。試してみてください。`root.jsx`のテキストを変更して、変化を見てみましょう！

## サーバーとブラウザのエントリを制御する

Remixでは、ほとんどのアプリでは触る必要のない、デフォルトのマジックファイルを使用しています。しかし、Remixのサーバーとブラウザへのエントリポイントをカスタマイズしたい場合は、`remix reveal`を実行すると、これらのファイルがプロジェクトにダンプされます。

```shellscript nonumber
npx remix reveal
```

```
Entry file entry.client created at app/entry.client.tsx.
Entry file entry.server created at app/entry.server.tsx.
```

## まとめ

おめでとうございます。Remixを履歴書に追加できます！要約すると、次のようなことを学びました。

- Remixはアプリを2つのものに変換します。
  - 独自のJavaScriptサーバーに追加するリクエストハンドラー
  - ブラウザ用のパブリックディレクトリにある静的資産の山
- アダプターを使用して独自のサーバーを用意して、どこでもデプロイできます。
- HMRが組み込まれた開発ワークフローをセットアップできます。

一般的に、Remixは少し「ガッツ」があります。少しのボイラープレートを記述するだけで、スタックを所有できます。

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



