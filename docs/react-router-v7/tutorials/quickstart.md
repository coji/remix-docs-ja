---
title: クイックスタート
order: 1
---

# クイックスタート

[MODES: framework]

<br />
<br />

このガイドでは、React Routerアプリを可能な限り迅速に実行するために必要な基本的な設定について説明します。さまざまなランタイム、デプロイターゲット、データベースを持つ多くのスターターテンプレートがありますが、ここではゼロから必要最低限のプロジェクトを作成します。

## インストール

もし、必要なものがすべて含まれたReact Routerプロジェクトを初期化したい場合は、`create-react-router` CLIを使用して、私たちの[テンプレート][templates]のいずれかから始めることができます。

```shellscript nonumber
npx create-react-router@latest
```

しかし、このガイドでは、CLIがプロジェクトをセットアップするために行うすべてのことを説明します。CLIを使用する代わりに、以下の手順に従うことができます。React Routerを始めたばかりの場合は、React Routerアプリを構成するすべての異なる要素を理解するために、このガイドに従うことをお勧めします。

```shellscript nonumber
mkdir my-react-router-app
cd my-react-router-app
npm init -y

# install runtime dependencies
npm i react-router @react-router/node @react-router/serve isbot react react-dom

# install dev dependencies
npm i -D @react-router/dev vite
```

## Viteの設定

```shellscript nonumber
touch vite.config.js
```

React Routerは[Vite]を使用しているため、React Router Viteプラグインを含む[Viteの設定][vite-config]を提供する必要があります。以下は、必要な基本的な設定です。

```js filename=vite.config.js
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
});
```

## ルートルート

```shellscript nonumber
mkdir app
touch app/root.jsx
```

`app/root.jsx`は、私たちが「ルートルート」と呼ぶものです。これはアプリ全体のルートレイアウトです。どのプロジェクトでも必要となる基本的な要素のセットは以下の通りです。

```jsx filename=app/root.jsx
import { Outlet, Scripts } from "react-router";

export default function App() {
  return (
    <html>
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
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

## 追加のルート

```shellscript nonumber
touch app/routes.js
```

`app/routes.js`は、ルートを定義する場所です。このガイドは、React Routerアプリを起動して実行するための最小限のセットアップに焦点を当てているため、ルートを定義する必要はなく、空の配列をエクスポートするだけで済みます。

```js filename=app/routes.js
export default [];
```

`routes.js`の存在は、React Routerアプリを構築するために必要です。React Routerを使用している場合、最終的にはルーティングを行いたいと想定しています。ルートの定義については、[ルーティング][routing]ガイドで詳しく読むことができます。

## ビルドと実行

まず、`react-router`および将来のViteバージョンのESモジュール要件を満たすために、`package.json`でタイプを`module`として指定する必要があります。

```shellscript nonumber
npm pkg set type="module"
```

次に、本番用にアプリをビルドします。

```shellscript nonumber
npx react-router build
```

これで、`build`フォルダーが表示され、その中に`server`フォルダー（アプリのサーバーバージョン）と`client`フォルダー（ブラウザバージョン）があり、いくつかのビルド成果物が含まれています。（これらはすべて[設定可能][react-router-config]です。）

👉 **`react-router-serve`でアプリを実行する**

これで、`react-router-serve`でアプリを実行できます。

```shellscript nonumber
npx react-router-serve build/server/index.js
```

[http://localhost:3000][http-localhost-3000]を開くと、「Hello world」ページが表示されるはずです。

`node_modules`にある大量のコードを除けば、私たちのReact Routerアプリはたった4つのファイルで構成されています。

```
├── app/
│   ├── root.jsx
│   └── routes.js
├── package.json
└── vite.config.js
```

## 独自のサーバーを使用する

`react-router build`によって作成される`build/server`ディレクトリは、Express、Cloudflare Workers、Netlify、Vercel、Fastly、AWS、Deno、Azure、Fastify、Firebaseなど、あらゆるサーバー内で実行するモジュールにすぎません。

<docs-info>

React Routerをサーバーなしのシングルページアプリケーションとして使用することもできます。詳細については、[シングルページアプリ][spa]に関するガイドを参照してください。

</docs-info>

独自のサーバーをセットアップすることに興味がない場合は、`react-router-serve`を使用できます。これは、React Routerのメンテナーによって維持されているシンプルな`express`ベースのサーバーです。しかし、React Routerは_あらゆる_JavaScript環境で実行できるように特別に設計されており、これによりスタックを自由に制御できます。多くの、いやほとんどのプロダクションアプリは独自のサーバーを持つことが予想されます。

試しに、`react-router-serve`の使用をやめて、代わりに`express`を使用してみましょう。

👉 **Express、React Router Expressアダプター、および本番モードで実行するための[cross-env]をインストールする**

```shellscript nonumber
npm i express @react-router/express cross-env

# not going to use this anymore
npm uninstall @react-router/serve
```

👉 **Expressサーバーを作成する**

```shellscript nonumber
touch server.js
```

```js filename=server.js
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();
app.use(express.static("build/client"));

// notice that your app is "just a request handler"
app.use(
  createRequestHandler({
    // and the result of `react-router build` is "just a module"
    build: await import("./build/server/index.js"),
  })
);

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
```

👉 **`express`でアプリを実行する**

```shellscript nonumber
node server.js
```

これでサーバーを自由に制御できるようになったので、サーバーが持つツールを使用してアプリをデバッグできます。たとえば、[Node.js inspectフラグ][inspect]を使用してChrome DevToolsでアプリを検査できます。

```shellscript nonumber
node --inspect server.js
```

## 開発ワークフロー

サーバーを常に停止、再構築、起動する代わりに、[ミドルウェアモードのVite][vite-middleware]を使用して開発中にReact Routerを実行できます。これにより、React Refresh（ホットモジュールリプレースメント）とReact Routerホットデータ再検証により、アプリの変更に即座にフィードバックが得られます。

まず、便宜上、`package.json`に`dev`と`start`コマンドを追加します。これらはそれぞれ開発モードと本番モードでサーバーを実行します。

👉 **`package.json`に"scripts"エントリを追加する**

```jsonc filename=package.json lines=[2-4] nocopy
{
  "scripts": {
    "dev": "node ./server.js",
    "start": "cross-env NODE_ENV=production node ./server.js"
  }
  // ...
}
```

👉 **Vite開発ミドルウェアをサーバーに追加する**

`process.env.NODE_ENV`が`"production"`に設定されている場合、Viteミドルウェアは適用されません。その場合、以前と同様に通常のビルド出力が実行されます。

```js filename=server.js lines=[6,13-28]
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build/client"));
  app.use(
    createRequestHandler({
      build: await import("./build/server/index.js"),
    })
  );
} else {
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(
    createRequestHandler({
      build: () =>
        viteDevServer.ssrLoadModule(
          "virtual:react-router/server-build"
        ),
    })
  );
}

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
```

👉 **開発サーバーを起動する**

```shellscript nonumber
npm run dev
```

これで、即座にフィードバックを得ながらアプリを開発できます。`root.jsx`のテキストを変更して、変更が即座に表示されることを試してみてください！

## サーバーとブラウザのエントリの制御

React Routerが使用しているデフォルトの「魔法のファイル」は、ほとんどのアプリでいじる必要はありませんが、サーバーとブラウザへのReact Routerのエントリポイントをカスタマイズしたい場合は、`react-router reveal`を実行すると、それらがプロジェクトにダンプされます。

```shellscript nonumber
npx react-router reveal
```

```
Entry file entry.client created at app/entry.client.tsx.
Entry file entry.server created at app/entry.server.tsx.
```

## まとめ

おめでとうございます、React Routerを履歴書に追加できます！まとめると、以下のことを学びました。

- React Routerフレームワークモードは、アプリを2つのものにコンパイルします。
  - 独自のJavaScriptサーバーに追加するリクエストハンドラー
  - ブラウザ用のパブリックディレクトリ内の静的アセットの山
- アダプターを使用して独自のサーバーを持ち込み、どこにでもデプロイできます
- HMRが組み込まれた開発ワークフローをセットアップできます

一般的に、React Routerは少し「内部が露出している」感じです。いくつかのボイラープレートが必要ですが、これでスタックを自由に制御できます。

次は何をしますか？

- [アドレス帳チュートリアル][address-book-tutorial]

[templates]: ../start/framework/deploying#templates
[spa]: ../how-to/spa
[inspect]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[vite-config]: https://vite.dev/config
[routing]: ../start/framework/routing
[http-localhost-3000]: http://localhost:3000
[vite]: https://vitejs.dev
[react-router-config]: https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html
[vite-middleware]: https://vitejs.dev/guide/ssr#setting-up-the-dev-server
[cross-env]: https://www.npmjs.com/package/cross-env
[address-book-tutorial]: ./address-book