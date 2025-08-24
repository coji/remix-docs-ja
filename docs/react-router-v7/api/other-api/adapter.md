---
title: "@react-router/{adapter}"
---

# サーバーアダプター

## 公式アダプター

イディオマティックなReact Routerアプリは、React Routerがサーバーのリクエスト/レスポンスを[Web Fetch API][web-fetch-api]に適応させるため、一般的にどこにでもデプロイできます。これはアダプターを介して行われます。私たちはいくつかのアダプターをメンテナンスしています。

- `@react-router/architect`
- `@react-router/cloudflare`
- `@react-router/express`

これらのアダプターはサーバーのエントリーにインポートされ、React Routerアプリ自体の中では使用されません。

組み込みの[React Router App Server][rr-serve] (`@react-router/serve`) 以外の方法で `npx create-react-router@latest` を使用してアプリを初期化した場合は、これらのアダプターのいずれかをインポートして使用する `server/index.js` ファイルがあることに気づくでしょう。

<docs-info>組み込みのReact Router App Serverを使用している場合、このAPIを操作することはありません。</docs-info>

各アダプターは同じAPIを持っています。将来的には、デプロイ先のプラットフォームに特化したヘルパーを提供する可能性があります。

## `@react-router/express`

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/modules/_react_router_express.html)

[Express][express]の例を以下に示します。

```ts lines=[1-3,11-22]
const {
  createRequestHandler,
} = require("@react-router/express");
const express = require("express");

const app = express();

// すべてのHTTP動詞 (GET, POSTなど) を処理する必要があります
app.all(
  "*",
  createRequestHandler({
    // `react-router build` および `react-router dev` はファイルをビルドディレクトリに出力します。
    // そのビルドをリクエストハンドラーに渡す必要があります。
    build: require("./build"),

    // ここで返されたものは何でも、loaderとactionで `context` として利用できます。
    // ここは、サーバーとReact Routerの間のギャップを埋める場所です。
    getLoadContext(req, res) {
      return {};
    },
  }),
);
```

### React Router App Serverからの移行

[React Router App Server][rr-serve]でアプリを開始したが、Expressサーバーを制御してカスタマイズしたい場合は、`@react-router/serve`からの移行はかなり簡単です。

[Expressテンプレート][express-template]を参照として利用できますが、以下に主要な変更点を示します。

**1. 依存関係の更新**

```shellscript nonumber
npm uninstall @react-router/serve
npm install @react-router/express compression express morgan cross-env
npm install --save-dev @types/express @types/express-serve-static-core @types/morgan
```

**2. サーバーの追加**

`server/app.ts`にReact Router Expressサーバーを作成します。

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

[`server.js`][express-template-server-js]をアプリにコピーします。これは、開発ビルドとプロダクションビルドの両方で同じサーバーコードを実行できるように推奨されるボイラープレートのセットアップです。ここでは2つの別々のファイルが使用されており、メインのExpressサーバーコードをTypeScript (`server/app.ts`) で記述し、React Routerによってサーバービルドにコンパイルされ、`node server.js`を介して実行できるようにしています。

**3. サーバーをコンパイルするための `vite.config.ts` の更新**

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

**4. `package.json` スクリプトの更新**

`dev` および `start` スクリプトを新しいExpressサーバーを使用するように更新します。

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/modules/_react_router_cloudflare.html)

Cloudflareの例を以下に示します。

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

上記のような直接的な「アダプター」ではありませんが、このパッケージにはNodeベースのアダプターを扱うためのユーティリティが含まれています。

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/modules/_react_router_node.html)

### Nodeバージョンのサポート

React Routerは、常に**Active**および**Maintenance**の[Node LTSバージョン][node-releases]を公式にサポートしています。End of LifeとなったNodeバージョンのサポート終了は、React Routerのマイナーリリースで行われます。

[express]: https://expressjs.com
[node-releases]: https://nodejs.org/en/about/previous-releases
[web-fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[rr-serve]: ./serve
[express-template]: https://github.com/remix-run/react-router-templates/tree/main/node-custom-server
[express-template-server-js]: https://github.com/remix-run/react-router-templates/blob/main/node-custom-server/server.js