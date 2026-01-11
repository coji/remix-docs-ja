---
title: "@react-router/{adapter}"
---

# サーバーアダプター

## 公式アダプター

React Router アプリは、React Router がサーバーのリクエスト/レスポンスを [Web Fetch API][web-fetch-api] に適合させるため、一般的にどこにでもデプロイできます。これはアダプターを通じて行われます。私たちはいくつかのアダプターをメンテナンスしています。

- `@react-router/architect`
- `@react-router/cloudflare`
- `@react-router/express`

これらのアダプターはサーバーのエントリーにインポートされ、React Router アプリ自体の中では使用されません。

ビルトインの [React Router App Server][rr-serve] (`@react-router/serve`) 以外の方法で `npx create-react-router@latest` を使ってアプリを初期化した場合、これらのアダプターのいずれかをインポートして使用する `server/index.js` ファイルがあることに気付くでしょう。

<docs-info>ビルトインの React Router App Server を使用している場合、この API を直接操作することはありません。</docs-info>

各アダプターは同じ API を持ちます。将来的に、デプロイ先のプラットフォームに特化した helper が提供される可能性があります。

## `@react-router/express`

[参照ドキュメント ↗](https://api.reactrouter.com/v7/modules/_react_router_express.html)

[Express][express] を使用した例です。

```ts lines=[1-3,11-22]
const {
  createRequestHandler,
} = require("@react-router/express");
const express = require("express");

const app = express();

// すべての verb (GET, POST など) を処理する必要があります
app.all(
  "*",
  createRequestHandler({
    // `react-router build` と `react-router dev` はビルドディレクトリにファイルを出力します。
    // そのビルドをリクエストハンドラーに渡す必要があります。
    build: require("./build"),

    // ここで返されたものは何でも、loader と action の `context` として利用できます。
    // これは、サーバーと React Router の間のギャップを埋める場所です。
    getLoadContext(req, res) {
      return {};
    },
  }),
);
```

### React Router App Server からの移行

[React Router App Server][rr-serve] でアプリを開始したものの、Express サーバーを制御してカスタマイズしたい場合は、`@react-router/serve` からの移行はかなり簡単に行えるはずです。

[Express テンプレート][express-template] を参考にできますが、主な変更点は以下のとおりです。

**1. 依存関係の更新**

```shellscript nonumber
npm uninstall @react-router/serve
npm install @react-router/express compression express morgan cross-env
npm install --save-dev @types/express @types/express-serve-static-core @types/morgan
```

**2. サーバーの追加**

`server/app.ts` に React Router Express サーバーを作成します。

```ts filename=server/app.ts
import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";

export const app = express();

app.use(
  createRequestHandler({
    build: () =>
      import("virtual:react-router/server-build"),
  }),
);
```

[`server.js`][express-template-server-js] をアプリにコピーします。これは、開発ビルドとプロダクションビルドの両方で同じサーバーコードを実行できるように、私たちが推奨するボイラープレート設定です。ここでは2つの別々のファイルが使用されており、これによりメインの Express サーバーコードを TypeScript (`server/app.ts`) で記述し、React Router によってサーバービルドにコンパイルされ、`node server.js` 経由で実行できるようになります。

**3. サーバーをコンパイルするように `vite.config.ts` を更新**

```tsx filename=vite.config.ts lines=[6-10]
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? { input: "./server/app.ts" }
      : undefined,
  },
  plugins: [reactRouter(), tsconfigPaths()],
}));
```

**4. `package.json` のスクリプトを更新**

`dev` と `start` スクリプトを新しい Express サーバーを使用するように更新します。

```json filename=package.json
{
  // ...
  "scripts": {
    "dev": "cross-env NODE_ENV=development node server.js",
    "start": "node server.js"
    // ...
  }
  // ...
}
```

## `@react-router/cloudflare`

[参照ドキュメント ↗](https://api.reactrouter.com/v7/modules/_react_router_cloudflare.html)

Cloudflare を使用した例です。

```ts
import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
```

## `@react-router/node`

上記のような直接的な「アダプター」ではありませんが、このパッケージには Node ベースのアダプターを扱うためのユーティリティが含まれています。

[参照ドキュメント ↗](https://api.reactrouter.com/v7/modules/_react_router_node.html)

### Node のバージョンサポート

React Router は、常に**アクティブ**および**メンテナンス中**の [Node LTS バージョン][node-releases]を公式にサポートしています。EOL (End of Life) の Node バージョンのサポート終了は、React Router のマイナーリリースで行われます。

[express]: https://expressjs.com
[node-releases]: https://nodejs.org/en/about/previous-releases
[web-fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[rr-serve]: ./serve
[express-template]: https://github.com/remix-run/react-router-templates/tree/main/node-custom-server
[express-template-server-js]: https://github.com/remix-run/react-router-templates/blob/main/node-custom-server/server.js