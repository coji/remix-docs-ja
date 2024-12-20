---
title: "@remix-run/{adapter}"
order: 3
---

# サーバーアダプター

## 公式アダプター

イディオム的な Remix アプリは、一般的にどこでもデプロイできます。なぜなら、Remix はサーバーのリクエスト/レスポンスを [Web Fetch API][web-fetch-api] に適応させるからです。これは、アダプターを通じて行われます。私たちはいくつかのアダプターを維持しています。

- `@remix-run/architect`
- `@remix-run/cloudflare-pages`
- `@remix-run/cloudflare-workers`
- `@remix-run/express`

これらのアダプターは、サーバーのエントリポイントにインポートされ、Remix アプリ自体では使用されません。

`npx create-remix@latest` で Remix App Server 以外の何かでアプリを初期化した場合は、`server/index.js` ファイルにこれらのアダプターのいずれかをインポートして使用していることに注意してください。

<docs-info>Remix App Server を組み込みで使用している場合は、この API とはやり取りしません。</docs-info>

各アダプターは同じ API を持っています。将来的には、デプロイしているプラットフォームに固有のヘルパーを用意するかもしれません。

## コミュニティアダプター

- [`@fastly/remix-server-adapter`][fastly-remix-server-adapter] - [Fastly Compute][fastly-compute] 用。
- [`@mcansh/remix-fastify`][remix-fastify] - [Fastify][fastify] 用。
- [`@mcansh/remix-raw-http`][remix-raw-http] - 古き良き素朴な Node サーバー用。
- [`@netlify/remix-adapter`][netlify-remix-adapter] - [Netlify][netlify] 用。
- [`@netlify/remix-edge-adapter`][netlify-remix-edge-adapter] - [Netlify][netlify] Edge 用。
- [`@vercel/remix`][vercel-remix] - [Vercel][vercel] 用。
- [`remix-google-cloud-functions`][remix-google-cloud-functions] - [Google Cloud][google-cloud-functions] と [Firebase][firebase-functions] 関数用。
- [`partymix`][partymix] - [PartyKit][partykit] 用。
- [`@scandinavianairlines/remix-azure-functions`][remix-azure-functions]: [Azure Functions][azure-functions] と [Azure Static Web Apps][azure-static-web-apps] 用。

## アダプターの作成

### `createRequestHandler`

サーバーがアプリを提供するために、リクエストハンドラーを作成します。これは、Remix アプリケーションの究極のエントリポイントです。

```ts
const {
  createRequestHandler,
} = require("@remix-run/{adapter}");
createRequestHandler({ build, getLoadContext });
```

以下は、express を使った完全な例です。

```ts lines=[1-3,11-22]
const {
  createRequestHandler,
} = require("@remix-run/express");
const express = require("express");

const app = express();

// 全ての動詞（GET、POST など）を処理する必要があります
app.all(
  "*",
  createRequestHandler({
    // `remix build` と `remix dev` はビルドディレクトリにファイルを書き出します。
    // そのビルドをリクエストハンドラーに渡す必要があります
    build: require("./build"),

    // ローダーとアクションで `context` として利用できるように、ここで何かを返します。
    // これは、Remix とサーバーの橋渡しをする場所です
    getLoadContext(req, res) {
      return {};
    },
  })
);
```

以下は、Architect（AWS）を使った例です。

```ts
const {
  createRequestHandler,
} = require("@remix-run/architect");
exports.handler = createRequestHandler({
  build: require("./build"),
});
```

以下は、簡略化された Cloudflare Workers API を使った例です。

```ts
import { createEventHandler } from "@remix-run/cloudflare-workers";

import * as build from "../build";

addEventListener("fetch", createEventHandler({ build }));
```

以下は、より低レベルな Cloudflare Workers API を使った例です。

```ts
import {
  createRequestHandler,
  handleAsset,
} from "@remix-run/cloudflare-workers";

import * as build from "../build";

const handleRequest = createRequestHandler({ build });

const handleEvent = async (event: FetchEvent) => {
  let response = await handleAsset(event, build);

  if (!response) {
    response = await handleRequest(event);
  }

  return response;
};

addEventListener("fetch", (event) => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e: any) {
    if (process.env.NODE_ENV === "development") {
      event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        })
      );
    }

    event.respondWith(
      new Response("Internal Error", { status: 500 })
    );
  }
});
```

[web-fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[fastly-remix-server-adapter]: https://github.com/fastly/remix-compute-js/tree/main/packages/remix-server-adapter
[fastly-compute]: https://developer.fastly.com/learning/compute/
[remix-google-cloud-functions]: https://github.com/penx/remix-google-cloud-functions
[google-cloud-functions]: https://cloud.google.com/functions
[firebase-functions]: https://firebase.google.com/docs/functions
[remix-fastify]: https://github.com/mcansh/remix-fastify
[fastify]: https://www.fastify.io
[remix-raw-http]: https://github.com/mcansh/remix-node-http-server
[netlify-remix-adapter]: https://github.com/netlify/remix-compute/tree/main/packages/remix-adapter
[netlify-remix-edge-adapter]: https://github.com/netlify/remix-compute/tree/main/packages/remix-edge-adapter
[netlify]: https://netlify.com
[vercel-remix]: https://github.com/vercel/remix/blob/main/packages/vercel-remix
[vercel]: https://vercel.com
[partykit]: https://partykit.io
[partymix]: https://github.com/partykit/partykit/tree/main/packages/partymix
[remix-azure-functions]: https://github.com/scandinavianairlines/remix-azure-functions
[azure-functions]: https://azure.microsoft.com/en-us/products/functions/
[azure-static-web-apps]: https://azure.microsoft.com/en-us/products/app-service/static

