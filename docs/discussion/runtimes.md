---
title: ランタイム、アダプター、テンプレート、およびデプロイメント
order: 2
---

# ランタイム、アダプター、テンプレート、およびデプロイメント

Remix アプリケーションのデプロイには、次の4つのレイヤーがあります。

1. Node.js のような JavaScript ランタイム
2. Express.js のような JavaScript ウェブサーバー
3. `@remix-run/express` のようなサーバーアダプター
4. ウェブホストまたはプラットフォーム

ウェブホストによっては、レイヤーが少なくなる場合があります。たとえば、Cloudflare Pages にデプロイすると、2、3、4 がすべて一度に処理されます。Express アプリケーション内に Remix をデプロイすると、すべて4つ揃います。また、「Remix App Server」を使用すると、2と3が統合されます！

これらのレイヤーをすべて自分で設定することも、Remix テンプレートから始めることもできます。

各部分の機能について説明します。

## JavaScript ランタイム

Remix は、Node.js、Shopify Oxygen、Cloudflare Workers/Pages、Fastly Compute、Deno、Bun などのあらゆる JavaScript ランタイムにデプロイできます。

各ランタイムは、Remix の基盤となっている標準的な Web API に対して、異なるレベルのサポートを提供します。そのため、ランタイムの欠落している機能をポリフィルするために、Remix ランタイムパッケージが必要です。これらのポリフィルには、Request、Response、crypto などの Web 標準 API が含まれています。これにより、サーバー側とブラウザ側で同じ API を使用できます。

次のランタイムパッケージが利用できます。

- [`@remix-run/cloudflare-pages`][remix_run_cloudflare_pages]
- [`@remix-run/cloudflare-workers`][remix_run_cloudflare_workers]
- [`@remix-run/deno`][remix_run_deno]
- [`@remix-run/node`][remix_run_node]

アプリケーションで対話する API のほとんどは、これらのパッケージから直接インポートされるわけではないため、コードはランタイム間でかなり移植可能です。ただし、標準の Web API ではない特定の機能のために、これらのパッケージから何かをインポートすることが時々あります。

たとえば、クッキーをファイルシステムや Cloudflare KV ストレージに保存したい場合などです。これらは、他のランタイムと共有されていないランタイム固有の機能です。

```tsx
// Cloudflare KV ストレージにセッションを保存する
import { createWorkersKVSessionStorage } from "@remix-run/cloudflare";

// Node.js でファイルシステムにセッションを保存する
import { createFileSessionStorage } from "@remix-run/node";
```

しかし、セッションをクッキー自体に保存する場合、これはすべてのランタイムでサポートされています。

```tsx
import { createCookieSessionStorage } from "@remix-run/node"; // または cloudflare/deno
```

## アダプター

Remix は HTTP サーバーではなく、既存の HTTP サーバー内のハンドラーです。アダプターを使用すると、Remix ハンドラーを HTTP サーバー内で実行できます。一部の JavaScript ランタイム、特に Node.js は、HTTP サーバーを作成する複数の方法を提供しています。たとえば、Node.js では、Express.js、fastify、または生の `http.createServer` を使用できます。

これらのサーバーはそれぞれ、独自の Request/Response API を持っています。アダプターの役割は、受信したリクエストを Web Fetch Request に変換し、Remix ハンドラーを実行した後、Web Fetch Response をホストサーバーのレスポンス API に適合させることです。

以下は、フローを示す疑似コードです。

```tsx
// `remix build` によって作成されたアプリケーションビルドをインポートする
import build from "./build/index.js";

// Express HTTP サーバー
const app = express();

// そして、Remix アプリケーションは「単なるリクエストハンドラー」です
app.all("*", createRequestHandler({ build }));

// これは疑似コードですが、アダプターの機能を示しています。
export function createRequestHandler({ build }) {
  // サーバービルドから Fetch API リクエストハンドラーを作成する
  const handleRequest = createRemixRequestHandler(build);

  // Express サーバー用の Express.js 固有のハンドラーを返す
  return async (req, res) => {
    // Express.req を Fetch API リクエストに適合させる
    const request = createRemixRequest(req);

    // アプリケーションハンドラーを呼び出して、Fetch API レスポンスを受け取る
    const response = await handleRequest(request);

    // Fetch API レスポンスを Express.res に適合させる
    sendRemixResponse(res, response);
  };
}
```

### Remix App Server

Remix App Server は、新しいプロジェクト、試行、または Express のようなサーバーから特定のニーズがなく、Node.js 環境にデプロイされるプロジェクト用に設計された、基本的な Express サーバーです。

[`@remix-run/serve`][serve] を参照してください。

## テンプレート

Remix は、UI をバックエンドに接続するために必要なだけの意見を持ちながら、非常に柔軟性がありながらも、使用するデータベース、データのキャッシュ方法、アプリケーションのデプロイ場所や方法に関する意見は持ち合わせていません。

Remix テンプレートは、コミュニティによって作成され、これらの追加の意見をすべて組み込んだ、アプリケーション開発の出発点です。

GitHub 上のリポジトリを指す `--template` フラグを Remix CLI で使用して、テンプレートを使用できます。

```
npx create-remix@latest --template <org>/<repo>
```

テンプレートの詳細については、[テンプレートガイド][templates_guide] を参照してください。

テンプレートを選択するか、[最初からアプリケーションを設定する][quickstart] と、アプリケーションの構築を開始できます！

[templates]: https://remix.guide/templates
[serve]: ../other-api/serve
[quickstart]: ../start/quickstart
[templates_guide]: ../guides/templates
[remix_run_cloudflare_pages]: https://npm.im/@remix-run/cloudflare-pages
[remix_run_cloudflare_workers]: https://npm.im/@remix-run/cloudflare-workers
[remix_run_deno]: https://npm.im/@remix-run/deno
[remix_run_node]: https://npm.im/@remix-run/node
