---
title: Vite
---

# Vite

[Vite][vite] は、JavaScript プロジェクト向けの強力で高性能かつ拡張可能な開発環境です。Remix のバンドル機能を改善・拡張するために、Vite を代替コンパイラとしてサポートしました。将来的には、Vite が Remix のデフォルトコンパイラになります。

## クラシック Remix コンパイラ vs. Remix Vite

`remix build` および `remix dev` CLI コマンドでアクセスし、`remix.config.js` で設定された既存の Remix コンパイラは、現在「クラシック Remix コンパイラ」と呼ばれています。

Remix Vite プラグインと `remix vite:build` および `remix vite:dev` CLI コマンドは、まとめて「Remix Vite」と呼ばれます。

今後は、特に明記されていない限り、ドキュメントでは Remix Vite の使用を前提とします。

## はじめに

Vite ベースのテンプレートがいくつか用意されており、これらを使用して開発を始められます。

```shellscript nonumber
# 最小限のサーバー:
npx create-remix@latest

# Express:
npx create-remix@latest --template remix-run/remix/templates/express

# Cloudflare:
npx create-remix@latest --template remix-run/remix/templates/cloudflare

# Cloudflare Workers:
npx create-remix@latest --template remix-run/remix/templates/cloudflare-workers
```

これらのテンプレートには、Remix Vite プラグインが設定されている `vite.config.ts` ファイルが含まれています。

## 設定

Remix Vite プラグインは、プロジェクトルートの `vite.config.ts` ファイルで設定されます。詳細については、[Vite 設定ドキュメント][vite-config] を参照してください。

## Cloudflare

Cloudflare で開発を開始するには、[`cloudflare`][template-cloudflare] テンプレートを使用できます。

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/cloudflare
```

Cloudflare アプリをローカルで実行するには、次の 2 つの方法があります。

```shellscript nonumber
# Vite
remix vite:dev

# Wrangler
remix vite:build # アプリをビルドしてから Wrangler を実行
wrangler pages dev ./build/client
```

Vite は開発エクスペリエンスを向上させますが、Wrangler はサーバーコードを [Cloudflare の `workerd` ランタイム][cloudflare-workerd] で実行することで、Cloudflare 環境をより忠実にエミュレートします。

#### Cloudflare プロキシ

Vite で Cloudflare 環境をシミュレートするために、Wrangler は [ローカル `workerd` バインディングへの Node プロキシ][wrangler-getplatformproxy] を提供します。Remix の Cloudflare プロキシプラグインは、これらのプロキシを自動的に設定します。

```ts filename=vite.config.ts lines=[3,8]
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remixCloudflareDevProxy(), remix()],
});
```

次に、`loader` または `action` 関数の `context.cloudflare` 内でプロキシを使用できます。

```ts
export const loader = ({ context }: LoaderFunctionArgs) => {
  const { env, cf, ctx } = context.cloudflare;
  // ... loader コードをここに記述 ...
};
```

各プロキシの詳細については、[Cloudflare の `getPlatformProxy` ドキュメント][wrangler-getplatformproxy-return] を参照してください。

#### バインディング

Cloudflare リソースのバインディングを設定するには、次の手順に従います。

- Vite または Wrangler を使用したローカル開発では、[wrangler.toml][wrangler-toml-bindings] を使用します。
- デプロイメントでは、[Cloudflare ダッシュボード][cloudflare-pages-bindings] を使用します。

`wrangler.toml` ファイルを変更するたびに、`wrangler types` を実行してバインディングを再生成する必要があります。

次に、`context.cloudflare.env` を介してバインディングにアクセスできます。
たとえば、`MY_KV` としてバインドされた [KV ネームスペース][cloudflare-kv] の場合：

```ts filename=app/routes/_index.tsx
export async function loader({
  context,
}: LoaderFunctionArgs) {
  const { MY_KV } = context.cloudflare.env;
  const value = await MY_KV.get("my-key");
  return json({ value });
}
```

#### ロードコンテキストの拡張

ロードコンテキストにプロパティを追加したい場合は、共有モジュールから `getLoadContext` 関数をエクスポートする必要があります。これにより、**Vite、Wrangler、Cloudflare Pages のロードコンテキストがすべて同じ方法で拡張されます**。

```ts filename=load-context.ts lines=[1,4-9,20-33]
import { type AppLoadContext } from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";

// `wrangler.toml` を使用してバインディングを設定する場合、
// `wrangler types` は、これらのバインディングのタイプを
// グローバル `Env` インターフェースに生成します。
// `wrangler.toml` が存在しない場合でも、
// 型チェックが通過するように、この空のインターフェースが必要です。
interface Env {}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    extra: string; // 拡張
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: { cloudflare: Cloudflare }; // 拡張前のロードコンテキスト
}) => AppLoadContext;

// Vite、Wrangler、Cloudflare Pages と互換性のある共有実装
export const getLoadContext: GetLoadContext = ({
  context,
}) => {
  return {
    ...context,
    extra: "stuff",
  };
};
```

<docs-warning>
`getLoadContext` は、**Cloudflare プロキシプラグインと `functions/[[path]].ts` のリクエストハンドラーの両方** に渡す必要があります。そうしないと、アプリの実行方法に応じて、ロードコンテキストの拡張が不整合になる可能性があります。
</docs-warning>

まず、Vite でロードコンテキストを拡張するために、Vite 設定の Cloudflare プロキシプラグインに `getLoadContext` を渡します。

```ts filename=vite.config.ts lines=[8,12]
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { getLoadContext } from "./load-context";

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy({ getLoadContext }),
    remix(),
  ],
});
```

次に、Wrangler を実行する場合や Cloudflare Pages にデプロイする場合に、ロードコンテキストを拡張するために、`functions/[[path]].ts` ファイルのリクエストハンドラーに `getLoadContext` を渡します。

```ts filename=functions/[[path]].ts lines=[5,9]
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore - サーバービルドファイルは `remix vite:build` で生成されます
import * as build from "../build/server";
import { getLoadContext } from "../load-context";

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext,
});
```

## クライアントコードとサーバーコードの分離

Vite は、クライアントコードとサーバーコードの混在を、従来の Remix コンパイラとは異なる方法で処理します。詳細については、[クライアントコードとサーバーコードの分離][splitting-up-client-and-server-code] に関するドキュメントを参照してください。

## ビルド出力パスの変更

Vite は、従来の Remix コンパイラと比較して、`public` ディレクトリを管理する方法が異なります。Vite は、`public` ディレクトリからファイルをクライアントビルドディレクトリにコピーしますが、Remix コンパイラは `public` ディレクトリをそのままにして、サブディレクトリ (`public/build`) をクライアントビルドディレクトリとして使用していました。

Remix プロジェクトのデフォルト構造を Vite の動作に合わせられるように、ビルド出力パスを変更しました。現在、`buildDirectory` オプションは 1 つだけあり、デフォルトでは `"build"` に設定されています。これにより、`assetsBuildDirectory` と `serverBuildDirectory` の個別のオプションが置き換えられました。つまり、デフォルトでは、サーバーは `build/server` にコンパイルされ、クライアントは `build/client` にコンパイルされます。

これは、次の設定のデフォルト値も変更することを意味します。

- [publicPath][public-path] は、[Vite の "base" オプション][vite-base] に置き換えられました。このオプションのデフォルト値は `"/"` ではなく `"/build/"` です。
- [serverBuildPath][server-build-path] は、`serverBuildFile` に置き換えられました。このオプションのデフォルト値は `"index.js"` です。このファイルは、設定された `buildDirectory` 内のサーバーディレクトリに書き込まれます。

Remix が Vite に移行する理由の 1 つは、Remix を採用する際に学習する内容が少なくなるためです。
これは、追加のバンドル機能を使用する場合は、Remix ドキュメントではなく、[Vite ドキュメント][vite] および [Vite プラグインコミュニティ][vite-plugins] を参照する必要があることを意味します。

Vite には、既存の Remix コンパイラに組み込まれていない、多くの [機能][vite-features] と [プラグイン][vite-plugins] があります。
これらの機能を使用すると、既存の Remix コンパイラではアプリをコンパイルできなくなるため、Vite を排他的に使用することを意図している場合にのみ使用してください。

## 移行

#### Vite の設定

👉 **Vite を開発依存関係としてインストール**

```shellscript nonumber
npm install -D vite
```

Remix は単なる Vite プラグインになったため、Vite に接続する必要があります。

👉 **Remix アプリのルートにある `remix.config.js` を `vite.config.ts` に置き換える**

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

[サポートされている Remix 設定オプション][supported-remix-config-options] のサブセットは、プラグインに直接渡す必要があります。

```ts filename=vite.config.ts lines=[3-5]
export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
});
```

#### HMR および HDR

Vite は、HMR などの開発機能のために、堅牢なクライアントサイドランタイムを提供します。これにより、`<LiveReload />` コンポーネントは不要になります。開発中に Remix Vite プラグインを使用する場合、`<Scripts />` コンポーネントは、Vite のクライアントサイドランタイムやその他の開発専用のスクリプトを自動的に含みます。

👉 **`<LiveReload/>` を削除し、`<Scripts />` を保持**

```diff
  import {
-   LiveReload,
    Outlet,
    Scripts,
  }

  export default function App() {
    return (
      <html>
        <head>
        </head>
        <body>
          <Outlet />
-         <LiveReload />
          <Scripts />
        </body>
      </html>
    )
  }
```

#### TypeScript の統合

Vite は、さまざまな種類のファイルのインポートを処理しますが、従来の Remix コンパイラとは異なる方法で処理する場合があります。そのため、`@remix-run/dev` からではなく、`vite/client` から Vite の型を参照する必要があります。

`vite/client` で提供されるモジュール型は、`@remix-run/dev` に暗黙的に含まれているモジュール型と互換性がないため、TypeScript 設定で `skipLibCheck` フラグを有効にする必要もあります。Remix Vite プラグインがデフォルトコンパイラになったら、このフラグは不要になります。

👉 **`remix.env.d.ts` を `env.d.ts` に名前を変更**

```diff nonumber
-/remix.env.d.ts
+/env.d.ts
```

👉 **`env.d.ts` で `@remix-run/dev` 型を `vite/client` に置き換える**

```diff filename=env.d.ts
-/// <reference types="@remix-run/dev" />
+/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />
```

👉 **`tsconfig.json` で `remix.env.d.ts` への参照を `env.d.ts` に置き換える**

```diff filename=tsconfig.json
- "include": ["remix.env.d.ts", "**/*.ts", "**/*.tsx"],
+ "include": ["env.d.ts", "**/*.ts", "**/*.tsx"],
```

👉 **`tsconfig.json` で `skipLibCheck` が有効になっていることを確認する**

```json filename=tsconfig.json
"skipLibCheck": true,
```

👉 **`tsconfig.json` で `module` と `moduleResolution` フィールドが正しく設定されていることを確認する**

```json filename=tsconfig.json
"module": "ESNext",
"moduleResolution": "Bundler",
```

#### Remix アプリサーバーからの移行

開発で `remix-serve` を使用していた場合 (または `-c` フラグなしで `remix dev` を使用していた場合)、新しい最小限の開発サーバーに切り替える必要があります。
このサーバーは Remix Vite プラグインに組み込まれており、`remix vite:dev` を実行すると、このサーバーが動作を開始します。

Remix Vite プラグインは、[グローバル Node ポリフィル][global-node-polyfills] をインストールしないため、`remix-serve` に依存してポリフィルを提供していた場合は、自分でインストールする必要があります。これを行う最も簡単な方法は、Vite 設定の先頭に `installGlobals` を呼び出すことです。

Vite 開発サーバーのデフォルトポートは、`remix-serve` とは異なるため、同じポートを使用したい場合は、Vite の `server.port` オプションでポートを設定する必要があります。

また、新しいビルド出力パス (`build/server` はサーバー、`build/client` はクライアントアセット) に更新する必要があります。

👉 **`dev`、`build`、`start` スクリプトを更新する**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **Vite 設定にグローバル Node ポリフィルをインストールする**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Vite 開発サーバーのポートを設定する (オプション)**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

#### カスタムサーバーからの移行

開発でカスタムサーバーを使用していた場合は、カスタムサーバーを編集して、Vite の `connect` ミドルウェアを使用する必要があります。
これにより、開発中にアセットリクエストと初期レンダリングリクエストが Vite に委譲され、カスタムサーバーを使用した場合でも、Vite の優れた DX の恩恵を受けることができます。

次に、開発中に `virtual:remix/server-build` という名前の仮想モジュールをロードして、Vite ベースのリクエストハンドラーを作成できます。

また、サーバーコードを更新して、新しいビルド出力パス (`build/server` はサーバービルド、`build/client` はクライアントアセット) を参照する必要があります。

たとえば、Express を使用していた場合は、次の手順で実行できます。

👉 **`server.mjs` ファイルを更新する**

```ts filename=server.mjs lines=[7-14,18-21,29,36-41]
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import express from "express";

installGlobals();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();

// アセットリクエストの処理
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", {
      immutable: true,
      maxAge: "1y",
    })
  );
}
app.use(express.static("build/client", { maxAge: "1h" }));

// SSR リクエストの処理
app.all(
  "*",
  createRequestHandler({
    build: viteDevServer
      ? () =>
          viteDevServer.ssrLoadModule(
            "virtual:remix/server-build"
          )
      : await import("./build/server/index.js"),
  })
);

const port = 3000;
app.listen(port, () =>
  console.log("http://localhost:" + port)
);
```

👉 **`build`、`dev`、`start` スクリプトを更新する**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "node ./server.mjs",
    "build": "remix vite:build",
    "start": "cross-env NODE_ENV=production node ./server.mjs"
  }
}
```

必要に応じて、カスタムサーバーを TypeScript で作成することもできます。
その後、[`tsx`][tsx] や [`tsm`][tsm] などのツールを使用して、カスタムサーバーを実行できます。

```shellscript nonumber
tsx ./server.ts
node --loader tsm ./server.ts
```

ただし、この方法では、サーバーの最初の起動時に著しい遅延が発生する可能性があります。

#### Cloudflare Functions からの移行

<docs-warning>
Remix Vite プラグインは、[Cloudflare Pages][cloudflare-pages] のみを正式にサポートしています。Cloudflare Pages は、[Cloudflare Workers Sites][cloudflare-workers-sites] とは異なり、フルスタックアプリケーション向けに特別に設計されています。現在 Cloudflare Workers Sites を使用している場合は、[Cloudflare Pages 移行ガイド][cloudflare-pages-migration-guide] を参照してください。
</docs-warning>

👉 `remix` プラグインの **前** に `cloudflareDevProxyVitePlugin` を追加して、vite 開発サーバーのミドルウェアを正しくオーバーライドします。

```ts filename=vite.config.ts lines=[3,9]
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin,
} from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [cloudflareDevProxyVitePlugin(), remix()],
});
```

Cloudflare アプリは、[Remix 設定の `server` フィールド][remix-config-server] を設定して、catch-all Cloudflare Function を生成している場合があります。
Vite では、この間接参照は不要になりました。
代わりに、Express やその他のカスタムサーバーの場合と同様に、Cloudflare 用の catch-all ルートを直接作成できます。

👉 **Remix の catch-all ルートを作成する**

```ts filename=functions/[[page]].ts
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore - サーバービルドファイルは `remix vite:build` で生成されます
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
});
```

👉 **`context.env` ではなく、`context.cloudflare.env` を介してバインディングと環境変数にアクセスする**

開発では主に Vite を使用しますが、Wrangler を使用して、アプリのプレビューとデプロイを行うこともできます。

詳細については、このドキュメントの [_Cloudflare_][cloudflare-vite] セクションを参照してください。

👉 **`package.json` のスクリプトを更新する**

```json filename=package.json lines=[3-6]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "preview": "wrangler pages dev ./build/client",
    "deploy": "wrangler pages deploy ./build/client"
  }
}
```

#### ビルド出力パスへの参照の移行

既存の Remix コンパイラのデフォルトオプションを使用する場合、サーバーは `build` にコンパイルされ、クライアントは `public/build` にコンパイルされていました。Vite の `public` ディレクトリに対する処理方法は、従来の Remix コンパイラとは異なるため、これらの出力パスが変更されました。

👉 **ビルド出力パスへの参照を更新する**

- サーバーは、デフォルトでは `build/server` にコンパイルされます。
- クライアントは、デフォルトでは `build/client` にコンパイルされます。

たとえば、[Blues Stack][blues-stack] の Dockerfile を更新するには、次の手順を実行します。

```diff filename=Dockerfile
-COPY --from=build /myapp/build /myapp/build
-COPY --from=build /myapp/public /myapp/public
+COPY --from=build /myapp/build/server /myapp/build/server
+COPY --from=build /myapp/build/client /myapp/build/client
```

#### パスエイリアスの設定

Remix コンパイラは、`tsconfig.json` の `paths` オプションを使用して、パスエイリアスを解決します。これは、Remix コミュニティで広く使用されており、`~` を `app` ディレクトリのエイリアスとして定義するために使用されます。

Vite は、デフォルトではパスエイリアスを提供しません。この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths] プラグインをインストールできます。このプラグインを使用すると、Vite で `tsconfig.json` からパスエイリアスが自動的に解決され、Remix コンパイラの動作と一致します。

👉 **`vite-tsconfig-paths` をインストールする**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **`vite-tsconfig-paths` を Vite 設定に追加する**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

#### `@remix-run/css-bundle` の削除

Vite には、CSS サイドエフェクトインポート、PostCSS、CSS モジュールなどの CSS バンドル機能が組み込まれています。Remix Vite プラグインは、バンドルされた CSS を関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr> パッケージは、Vite を使用する場合には冗長です。これは、`cssBundleHref` エクスポートは常に `undefined` になるためです。

👉 **`@remix-run/css-bundle` をアンインストールする**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref` への参照を削除する**

```diff filename=app/root.tsx
- import { cssBundleHref } from "@remix-run/css-bundle";
  import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

  export const links: LinksFunction = () => [
-   ...(cssBundleHref
-     ? [{ rel: "stylesheet", href: cssBundleHref }]
-     : []),
    // ...
  ];
```

ルートの `links` 関数が `cssBundleHref` を接続するためだけに使用されている場合は、その関数を完全に削除できます。

```diff filename=app/root.tsx
- import { cssBundleHref } from "@remix-run/css-bundle";
- import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

- export const links: LinksFunction = () => [
-   ...(cssBundleHref
-     ? [{ rel: "stylesheet", href: cssBundleHref }]
-     : []),
- ];
```

#### `links` で参照されている CSS インポートを修正する

<docs-info>
これは、[CSS バンドル][css-bundling] の他の形式 (CSS モジュール、CSS サイドエフェクトインポート、Vanilla Extract など) には必要ありません。
</docs-info>

[`links` 関数で CSS を参照している場合][regular-css]、対応する CSS インポートを更新して、[Vite の明示的な `?url` インポート構文を使用する必要がありま][vite-url-imports]。

👉 **`links` で使用されている CSS インポートに `?url` を追加する**

<docs-warning>`.css?url` インポートには、Vite v5.1 以降が必要です。</docs-warning>

```diff
-import styles from "~/styles/dashboard.css";
+import styles from "~/styles/dashboard.css?url";

export const links = () => {
  return [
    { rel: "stylesheet", href: styles }
  ];
}
```

#### PostCSS を介して Tailwind を有効にする

プロジェクトで [Tailwind CSS][tailwind] を使用している場合は、まず、[PostCSS][postcss] 設定ファイルがあることを確認する必要があります。このファイルは、Vite によって自動的に取得されます。
これは、Remix の `tailwind` オプションが有効になっている場合、Remix コンパイラでは PostCSS 設定ファイルが不要だったためです。

👉 **PostCSS 設定ファイルが存在しない場合は追加し、`tailwindcss` プラグインを含める**

```js filename=postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {},
  },
};
```

プロジェクトにすでに PostCSS 設定ファイルがある場合は、`tailwindcss` プラグインが存在しない場合に追加する必要があります。
これは、Remix の [`tailwind` 設定オプション][tailwind-config-option] が有効になっている場合、Remix コンパイラによってこのプラグインが自動的に含まれていたためです。

👉 **`tailwindcss` プラグインが PostCSS 設定ファイルに存在しない場合は追加する**

```js filename=postcss.config.mjs lines=[3]
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

👉 **Tailwind CSS インポートを移行する**

[Tailwind CSS ファイルを `links` 関数で参照している場合][regular-css] は、[Tailwind CSS インポートステートメントを移行する必要があります。][fix-up-css-imports-referenced-in-links]

#### Vanilla Extract プラグインを追加する

[Vanilla Extract][vanilla-extract] を使用している場合は、Vite プラグインを設定する必要があります。

👉 **Vite 用の公式 [Vanilla Extract プラグイン][vanilla-extract-vite-plugin] をインストールする**

```shellscript nonumber
npm install -D @vanilla-extract/vite-plugin
```

👉 **Vanilla Extract プラグインを Vite 設定に追加する**

```ts filename=vite.config.ts lines=[2,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix(), vanillaExtractPlugin()],
});
```

#### MDX プラグインを追加する

[MDX][mdx] を使用している場合は、Vite のプラグイン API は [Rollup][rollup] のプラグイン API の拡張なので、公式の [MDX Rollup プラグイン][mdx-rollup-plugin] を使用する必要があります。

👉 **MDX Rollup プラグインをインストールする**

```shellscript nonumber
npm install -D @mdx-js/rollup
```

<docs-info>
Remix プラグインは、JavaScript または TypeScript ファイルを処理することを想定しているため、MDX などの他の言語からの変換は最初に実行する必要があります。
この場合、MDX プラグインを Remix プラグインの _前_ に配置することを意味します。
</docs-info>

👉 **MDX Rollup プラグインを Vite 設定に追加する**

```ts filename=vite.config.ts lines=[1,6]
import mdx from "@mdx-js/rollup";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [mdx(), remix()],
});
```

##### MDX フロントマターサポートを追加する

Remix コンパイラでは、[MDX にフロントマターを定義できます][mdx-frontmatter]。この機能を使用していた場合は、[remark-mdx-frontmatter] を使用して、Vite で実現できます。

👉 **必要な [Remark][remark] フロントマタープラグインをインストールする**

```shellscript nonumber
npm install -D remark-frontmatter remark-mdx-frontmatter
```

👉 **Remark フロントマタープラグインを MDX Rollup プラグインに渡す**

```ts filename=vite.config.ts lines=[3-4,9-14]
import mdx from "@mdx-js/rollup";
import { vitePlugin as remix } from "@remix-run/dev";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
      ],
    }),
    remix(),
  ],
});
```

Remix コンパイラでは、フロントマターエクスポートの名前は `attributes` でした。これは、フロントマタープラグインのデフォルトのエクスポート名である `frontmatter` とは異なります。フロントマターエクスポート名を設定することは可能ですが、アプリコードを更新して、デフォルトのエクスポート名を使用することをお勧めします。

👉 **MDX ファイル内の MDX `attributes` エクスポートを `frontmatter` に名前を変更する**

```diff filename=app/posts/first-post.mdx
  ---
  title: Hello, World!
  ---

- # {attributes.title}
+ # {frontmatter.title}
```

👉 **MDX `attributes` エクスポートを `frontmatter` に名前を変更する (消費者向け)**

```diff filename=app/routes/posts/first-post.tsx
  import Component, {
-   attributes,
+   frontmatter,
  } from "./posts/first-post.mdx";
```

###### MDX ファイル用の型を定義する

👉 **`env.d.ts` に `*.mdx` ファイル用の型を追加する**

```ts filename=env.d.ts lines=[4-8]
/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export const frontmatter: any;
  export default MDXComponent;
}
```

###### MDX フロントマターをルートエクスポートにマッピングする

Remix コンパイラでは、フロントマターに `headers`、`meta`、`handle` のルートエクスポートを定義できました。この Remix 固有の機能は、`remark-mdx-frontmatter` プラグインではサポートされていません。この機能を使用していた場合は、フロントマターをルートエクスポートに手動でマッピングする必要があります。

👉 **フロントマターを MDX ルートのルートエクスポートにマッピングする**

```mdx lines=[10-11]
---
meta:
  - title: My First Post
  - name: description
    content: Isn't this awesome?
headers:
  Cache-Control: no-cache
---

export const meta = frontmatter.meta;
export const headers = frontmatter.headers;

# Hello World
```

MDX ルートエクスポートを明示的にマッピングしているため、フロントマターの構造は自由に設定できます。

```mdx
---
title: My First Post
description: Isn't this awesome?
---

export const meta = () => {
  return [
    { title: frontmatter.title },
    {
      name: "description",
      content: frontmatter.description,
    },
  ];
};

# Hello World
```

###### MDX ファイル名の使用を更新する

Remix コンパイラでは、すべての MDX ファイルから `filename` エクスポートも提供していました。これは、主に、MDX ルートのコレクションへのリンクを有効にするために設計されていました。この機能を使用していた場合は、[glob インポート][glob-imports] を使用して、Vite で実現できます。glob インポートを使用すると、ファイル名とモジュールをマッピングする便利なデータ構造が提供されます。これにより、各ファイルを手動でインポートする必要がなくなるため、MDX ファイルのリストを維持する作業が大幅に簡素化されます。

たとえば、`posts` ディレクトリにあるすべての MDX ファイルをインポートするには、次の手順を実行します。

```ts
const posts = import.meta.glob("./posts/*.mdx");
```

これは、次のコードを手動で記述するのと同じです。

```ts
const posts = {
  "./posts/a.mdx": () => import("./posts/a.mdx"),
  "./posts/b.mdx": () => import("./posts/b.mdx"),
  "./posts/c.mdx": () => import("./posts/c.mdx"),
  // etc.
};
```

必要に応じて、すべての MDX ファイルを事前にインポートすることもできます。

```ts
const posts = import.meta.glob("./posts/*.mdx", {
  eager: true,
});
```

## デバッグ

[`NODE_OPTIONS` 環境変数][node-options] を使用して、デバッグセッションを開始できます。

```shellscript nonumber
NODE_OPTIONS="--inspect-brk" npm run dev
```

次に、ブラウザからデバッガーをアタッチできます。
たとえば、Chrome では、`chrome://