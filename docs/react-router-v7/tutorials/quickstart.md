---
title: クイックスタート
order: 1
---

# クイックスタート

[MODES: framework]

<br />
<br />

このガイドでは、React Router アプリをできるだけ早く実行するために必要な基本的な仕組みについて説明します。さまざまなランタイム、デプロイターゲット、データベースを持つ多くのスターターテンプレートがありますが、ここではゼロから最小限のプロジェクトを作成します。

## インストール

必要なものがすべて含まれた React Router プロジェクトを初期化したい場合は、`create-react-router` CLI を使用して、任意の [テンプレート][templates] を使って開始できます。

```shellscript nonumber
npx create-react-router@latest
```

しかし、このガイドでは、CLI がプロジェクトをセットアップするために行うすべてのことを説明します。CLI を使用する代わりに、以下の手順に従うことができます。React Router を使い始めたばかりの場合は、React Router アプリを構成するすべての異なる要素を理解するために、このガイドに従うことをお勧めします。

```shellscript nonumber
mkdir my-react-router-app
cd my-react-router-app
npm init -y

# runtime dependencies をインストールする
npm i react-router @react-router/node @react-router/serve isbot react react-dom

# dev dependencies をインストールする
npm i -D @react-router/dev vite
```

## Vite の設定

```shellscript nonumber
touch vite.config.js
```

React Router は [Vite] を使用しているため、React Router Vite plugin を含む [Vite config][vite-config] を提供する必要があります。以下に、必要な基本的な設定を示します。

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

`app/root.jsx` は、私たちが「ルートルート」と呼ぶものです。これは、アプリ全体のルートレイアウトです。以下に、すべてのプロジェクトで必要となる基本的な要素のセットを示します。

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

`app/routes.js` は、ルートを定義する場所です。このガイドは、React Router アプリを起動して実行するための最小限のセットアップに焦点を当てているため、ここではルートを定義する必要はなく、空の配列をエクスポートするだけで構いません。

```js filename=app/routes.js
export default [];
```

React Router アプリをビルドするには `routes.js` の存在が必要です。React Router を使用している場合、最終的には何らかのルーティングを行いたいと想定しています。[ルーティング][routing] ガイドで、ルートの定義について詳しく読むことができます。

## ビルドと実行

まず、`react-router` および将来の Vite のバージョンにおける ES module の要件を満たすために、`package.json` で `type` を `module` として指定する必要があります。

```shellscript nonumber
npm pkg set type="module"
```

次に、本番用にアプリをビルドします。

```shellscript nonumber
npx react-router build
```

これで、`server` フォルダ（アプリのサーバーバージョン）と `client` フォルダ（ブラウザバージョン）を含む `build` フォルダが表示され、その中にいくつかのビルド成果物が含まれているはずです。(これらはすべて [設定可能][react-router-config] です。)

👉 **`react-router-serve` を使ってアプリを実行する**

これで、`react-router-serve` を使ってアプリを実行できます。

```shellscript nonumber
npx react-router-serve build/server/index.js
```

[http://localhost:3000][http-localhost-3000] を開いて、「hello world」ページが表示されるはずです。

`node_modules` 内の膨大な量のコードを除けば、React Router アプリはたった4つのファイルで構成されています。

```
├── app/
│   ├── root.jsx
│   └── routes.js
├── package.json
└── vite.config.js
```

## 独自のサーバーを使用する

`react-router build` によって作成される `build/server` ディレクトリは、Express、Cloudflare Workers、Netlify、Vercel、Fastly、AWS、Deno、Azure、Fastify、Firebase など、あらゆるサーバー内で実行する単なる module です。

<docs-info>

React Router は、サーバーなしの Single Page Application としても使用できます。詳細については、[Single Page Apps][spa] のガイドを参照してください。

</docs-info>

独自のサーバーを設定する必要がない場合は、`react-router-serve` を使用できます。これは、React Router メンテナーによって管理されているシンプルな `express` ベースのサーバーです。ただし、React Router は _あらゆる_ JavaScript 環境で実行できるように特別に設計されており、これによりスタックを自由に制御できます。多くの本番アプリ（ほとんどの場合も含む）は独自のサーバーを持つことが想定されています。

試しに、`react-router-serve` の使用をやめて `express` を使用してみましょう。

👉 **Express、React Router Express アダプター、および本番モードで実行するための [cross-env] をインストールする**

```shellscript nonumber
npm i express @react-router/express cross-env

# もうこれを使わない
npm uninstall @react-router/serve
```

👉 **Express サーバーを作成する**

```shellscript nonumber
touch server.js
```

```js filename=server.js
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();
app.use(express.static("build/client"));

// アプリが「単なるリクエストハンドラー」であることに注目してください
app.use(
  createRequestHandler({
    // そして `react-router build` の結果が「単なるモジュール」であることに注目してください
    build: await import("./build/server/index.js"),
  }),
);

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
```

👉 **`express` を使ってアプリを実行する**

```shellscript nonumber
node server.js
```

これで独自のサーバーを所有しているので、サーバーが持つあらゆるツールを使ってアプリをデバッグできます。たとえば、[Node.js inspect flag][inspect] を使用して Chrome DevTools でアプリを検査できます。

```shellscript nonumber
node --inspect server.js
```

## 開発ワークフロー

サーバーを常に停止、再ビルド、起動する代わりに、[Vite の middleware mode][vite-middleware] を使用して開発中に React Router を実行できます。これにより、React Refresh (Hot Module Replacement) と React Router Hot Data Revalidation により、アプリの変更に対して即座にフィードバックが得られます。

まず、便宜上、`package.json` に `dev` と `start` コマンドを追加し、それぞれ開発モードと本番モードでサーバーを実行するようにします。

👉 **`package.json` に "scripts" エントリを追加する**

```jsonc filename=package.json lines=[2-4] nocopy
{
  "scripts": {
    "dev": "node ./server.js",
    "start": "cross-env NODE_ENV=production node ./server.js",
  },
  // ...
}
```

👉 **サーバーに Vite 開発ミドルウェアを追加する**

`process.env.NODE_ENV` が `"production"` に設定されている場合、Vite middleware は適用されず、以前と同様に通常のビルド出力が実行されます。

```js filename=server.js lines=[6,13-28]
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build/client"));
  app.use(
    createRequestHandler({
      build: await import("./build/server/index.js"),
    }),
  );
} else {
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(
    createRequestHandler({
      build: () =>
        viteDevServer.ssrLoadModule(
          "virtual:react-router/server-build",
        ),
    }),
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

これで、即座のフィードバックを得ながらアプリを開発できます。`root.jsx` のテキストを変更して、変更がすぐに反映されるか試してみてください！

## サーバーとブラウザのエントリの制御

React Router が使用するデフォルトのマジックファイルがいくつかありますが、ほとんどのアプリではこれらを変更する必要はありません。ただし、React Router のサーバーとブラウザへのエントリポイントをカスタマイズしたい場合は、`react-router reveal` を実行すると、それらがプロジェクトにダンプされます。

```shellscript nonumber
npx react-router reveal
```

```
Entry file entry.client created at app/entry.client.tsx.
Entry file entry.server created at app/entry.server.tsx.
```

## まとめ

おめでとうございます、React Router を履歴書に追加できます！まとめると、以下のことを学びました。

- React Router framework mode は、アプリを次の2つのものにコンパイルします。
  - 独自の JavaScript サーバーに追加するリクエストハンドラー
  - ブラウザ用のパブリックディレクトリにある静的アセットの集まり
- アダプターを使って独自のサーバーをどこにでもデプロイできます
- HMR が組み込まれた開発ワークフローをセットアップできます

一般的に、React Router は少し「 guts out 」（内部構造が剥き出し）です。いくつかの定型的なコードが必要ですが、これでスタックを自由に制御できます。

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