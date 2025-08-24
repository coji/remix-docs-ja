---
title: ランタイム、アダプター、テンプレート、デプロイ
order: 2
---

# ランタイム、アダプター、テンプレート、デプロイ

Remixアプリケーションのデプロイには、4つのレイヤーがあります。

1. Node.jsのようなJavaScriptランタイム
2. Express.jsのようなJavaScriptウェブサーバー
3. `@remix-run/express`のようなサーバーアダプター
4. ウェブホストまたはプラットフォーム

ウェブホストによっては、レイヤーが少なくなる場合があります。たとえば、Cloudflare Pagesへのデプロイでは、2、3、4がすべて一度に処理されます。Expressアプリ内でRemixをデプロイする場合は、4つすべてが必要になり、「Remix App Server」を使用すると2と3が結合されます。

これらすべてを自分で接続することも、Remixテンプレートから始めることもできます。

各部分が何をするかについて説明しましょう。

## JavaScriptランタイム

Remixは、Node.js、Shopify Oxygen、Cloudflare Workers/Pages、Fastly Compute、Deno、Bunなどの任意のJavaScriptランタイムにデプロイできます。

各ランタイムは、Remixが構築されている標準のWeb APIのサポートが異なるため、ランタイムの不足している機能をポリフィルするためにRemixランタイムパッケージが必要です。これらのポリフィルには、Request、Response、cryptoなどのWeb標準APIが含まれます。これにより、サーバーとブラウザーで同じAPIを使用できます。

次のランタイムパッケージが利用可能です。

- [`@remix-run/cloudflare-pages`][remix_run_cloudflare_pages]
- [`@remix-run/cloudflare-workers`][remix_run_cloudflare_workers]
- [`@remix-run/deno`][remix_run_deno]
- [`@remix-run/node`][remix_run_node]

アプリで操作するAPIの大部分は、これらのパッケージから直接インポートされないため、コードはランタイム間でかなり移植可能です。ただし、標準のWeb APIではない特定の機能のために、これらのパッケージから何かをインポートすることがあります。

たとえば、ファイルをシステムに、またはCloudflare KVストレージにCookieを保存したい場合があります。これらは、他のランタイムと共有されないランタイムの特定の機能です。

```tsx
// cloudflare KVストレージにセッションを保存
import { createWorkersKVSessionStorage } from "@remix-run/cloudflare";

// nodeでファイルシステムにセッションを保存
import { createFileSessionStorage } from "@remix-run/node";
```

ただし、Cookie自体にセッションを保存する場合は、すべてのランタイムでサポートされています。

```tsx
import { createCookieSessionStorage } from "@remix-run/node"; // または cloudflare/deno
```

## アダプター

RemixはHTTPサーバーではなく、既存のHTTPサーバー内のハンドラーです。アダプターを使用すると、RemixハンドラーをHTTPサーバー内で実行できます。一部のJavaScriptランタイム、特にNode.jsには、HTTPサーバーを作成する複数の方法があります。たとえば、Node.jsでは、Express.js、fastify、または生の`http.createServer`を使用できます。

これらの各サーバーには、独自のRequest/Response APIがあります。アダプターの役割は、受信リクエストをWeb Fetch Requestに変換し、Remixハンドラーを実行し、Web Fetch ResponseをホストサーバーのレスポンスAPIに戻すことです。

フローを示す擬似コードを次に示します。

```tsx
// `remix build`で作成されたアプリビルドをインポート
import build from "./build/index.js";

// express httpサーバー
const app = express();

// ここでRemixアプリは「単なるリクエストハンドラー」です
app.all("*", createRequestHandler({ build }));

// これは擬似コードですが、アダプターの役割を示しています。
export function createRequestHandler({ build }) {
  // サーバービルドからFetch APIリクエストハンドラーを作成します
  const handleRequest = createRemixRequestHandler(build);

  // express.jsサーバー用のexpress.js固有のハンドラーを返します
  return async (req, res) => {
    // express.reqをFetch APIリクエストに適合させます
    const request = createRemixRequest(req);

    // アプリハンドラーを呼び出し、Fetch APIレスポンスを受け取ります
    const response = await handleRequest(request);

    // Fetch APIレスポンスをexpress.resに適合させます
    sendRemixResponse(res, response);
  };
}
```

### Remix App Server

便宜上、Remix App Serverは、新しいプロジェクト、試行錯誤、またはExpressのようなサーバーからの特定のニーズがなく、Node.js環境にデプロイされるプロジェクト向けの基本的なExpressサーバーです。

[`@remix-run/serve`][serve]を参照してください。

## テンプレート

Remixは、UIをバックエンドに接続するための十分な意見を持ちながら、非常に柔軟になるように設計されていますが、使用するデータベース、データのキャッシュ方法、アプリのデプロイ場所と方法に関する意見は持ち合わせていません。

Remixテンプレートは、コミュニティによって作成された、これらの追加の意見が組み込まれたアプリ開発の出発点です。

Remix CLIで`--template`フラグを使用して、GitHubのリポジトリを指すテンプレートを使用できます。

```
npx create-remix@latest --template <org>/<repo>
```

テンプレートの詳細については、[テンプレートガイド][templates_guide]を参照してください。

テンプレートを選択するか、[アプリをゼロからセットアップ][quickstart]したら、アプリの構築を開始する準備が整いました。

[templates]: https://remix.guide/templates
[serve]: ../other-api/serve
[quickstart]: ../start/quickstart
[templates_guide]: ../guides/templates
[remix_run_cloudflare_pages]: https://npm.im/@remix-run/cloudflare-pages
[remix_run_cloudflare_workers]: https://npm.im/@remix-run/cloudflare-workers
[remix_run_deno]: https://npm.im/@remix-run/deno
[remix_run_node]: https://npm.im/@remix-run/node
