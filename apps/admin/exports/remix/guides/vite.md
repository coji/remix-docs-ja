---
title: Vite
---

# Vite

[Vite][vite] は、JavaScript プロジェクトのための強力で高性能、かつ拡張可能な開発環境です。Remix のバンドル機能を向上させ、拡張するために、代替コンパイラとして Vite をサポートするようになりました。将来的には、Vite が Remix のデフォルトコンパイラになります。

## クラシックRemixコンパイラ vs. Remix Vite

`remix build` と `remix dev` CLIコマンドでアクセスし、`remix.config.js` で設定される既存のRemixコンパイラは、現在「クラシックRemixコンパイラ」と呼ばれています。

Remix Viteプラグインと`remix vite:build` および `remix vite:dev` CLIコマンドは、まとめて「Remix Vite」と呼ばれます。

特に断りのない限り、今後のドキュメントではRemix Viteの使用を前提とします。

## はじめに

いくつかの異なるViteベースのテンプレートを用意して、すぐに始められるようにしました。

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

これらのテンプレートには、Remix Viteプラグインが設定されている`vite.config.ts`ファイルが含まれています。

## 設定

Remix Viteプラグインは、プロジェクトルートにある`vite.config.ts`ファイルで設定されます。詳細については、[Vite設定ドキュメント][vite-config]を参照してください。


[vite-config]:  (This needs a URL to be added here.  Replace with the actual link to the Vite config documentation.)

## Cloudflare

Cloudflareを使い始めるには、[`cloudflare`][template-cloudflare] テンプレートを使用できます。

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/cloudflare
```

Cloudflareアプリをローカルで実行するには、2つの方法があります。

```shellscript nonumber
# Vite
remix vite:dev

# Wrangler
remix vite:build # アプリをビルドしてからwranglerを実行します
wrangler pages dev ./build/client
```

Viteはより優れた開発エクスペリエンスを提供しますが、WranglerはNodeではなく[Cloudflareの`workerd`ランタイム][cloudflare-workerd]でサーバーコードを実行することで、Cloudflare環境により近いエミュレーションを提供します。


[template-cloudflare]: <a href="ここにtemplate-cloudflareへのリンクを挿入">template-cloudflareへのリンク</a>
[cloudflare-workerd]: <a href="ここにcloudflare-workerdへのリンクを挿入">cloudflare-workerdへのリンク</a>

#### Cloudflare プロキシ

Vite で Cloudflare 環境をシミュレートするために、Wrangler は [ローカル `workerd` バインディングへの Node プロキシを提供します][wrangler-getplatformproxy]。
Remix の Cloudflare プロキシプラグインは、これらのプロキシを自動的に設定します。

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

その後、これらのプロキシは `loader` 関数または `action` 関数内の `context.cloudflare` で利用できます。

```ts
export const loader = ({ context }: LoaderFunctionArgs) => {
  const { env, cf, ctx } = context.cloudflare;
  // ... さらに loader コードをここに記述します...
};
```

これらのプロキシの詳細については、[Cloudflare の `getPlatformProxy` ドキュメント][wrangler-getplatformproxy-return] を参照してください。


[wrangler-getplatformproxy]: <リンクをここに挿入>
[wrangler-getplatformproxy-return]: <リンクをここに挿入>

#### バインディング

Cloudflare リソースのバインディングを構成するには：

* Vite または Wrangler を使用したローカル開発には、[wrangler.toml][wrangler-toml-bindings] を使用します。
* デプロイには、[Cloudflare ダッシュボード][cloudflare-pages-bindings] を使用します。

`wrangler.toml` ファイルを変更するたびに、バインディングを再生成するために `wrangler types` を実行する必要があります。

その後、`context.cloudflare.env` を介してバインディングにアクセスできます。
たとえば、`MY_KV` としてバインドされた[KV 名前空間][cloudflare-kv] の場合：

```ts filename=app/routes/_index.tsx
export async function loader({
  context,
}: LoaderFunctionArgs) {
  const { MY_KV } = context.cloudflare.env;
  const value = await MY_KV.get("my-key");
  return json({ value });
}
```


[wrangler-toml-bindings]: <wrangler.tomlへのリンク>
[cloudflare-pages-bindings]: <Cloudflareダッシュボードへのリンク>
[cloudflare-kv]: <Cloudflare KVへのリンク>

#### ロードコンテキストの拡張

ロードコンテキストに追加のプロパティを追加したい場合は、共有モジュールから`getLoadContext`関数をエクスポートします。これにより、**Vite、Wrangler、Cloudflare Pagesのロードコンテキストがすべて同じ方法で拡張されます**。

```ts filename=load-context.ts lines=[1,4-9,20-33]
import { type AppLoadContext } from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";

// `wrangler.toml`を使用してバインディングを構成する場合、
// `wrangler types`はこれらのバインディングの型をグローバルな`Env`インターフェースに生成します。
// `wrangler.toml`が存在しない場合でも、型チェックがパスするように、この空のインターフェースが必要です。
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

// Vite、Wrangler、Cloudflare Pagesと互換性のある共有実装
export const getLoadContext: GetLoadContext = ({
  context,
}) => {
  return {
    ...context,
    extra: "stuff",
  };
};
```

<docs-warning>アプリの実行方法によっては、ロードコンテキストの拡張に一貫性がなくなってしまうため、`getLoadContext`を**両方**のCloudflare Proxyプラグインと`functions/[[path]].ts`のリクエストハンドラーに渡す必要があります。</docs-warning>

まず、Viteを実行する際のロードコンテキストを拡張するために、Viteの設定でCloudflare Proxyプラグインに`getLoadContext`を渡します。

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

次に、Wranglerを実行する場合やCloudflare Pagesにデプロイする場合のロードコンテキストを拡張するために、`functions/[[path]].ts`ファイルのリクエストハンドラーに`getLoadContext`を渡します。

```ts filename=functions/[[path]].ts lines=[5,9]
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore - サーバービルドファイルは`remix vite:build`によって生成されます
import * as build from "../build/server";
import { getLoadContext } from "../load-context";

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext,
});
```

## クライアントコードとサーバーコードの分割

Viteは、クライアントコードとサーバーコードの混合使用を、従来のRemixコンパイラとは異なる方法で処理します。詳細については、[クライアントコードとサーバーコードの分割に関するドキュメント][splitting-up-client-and-server-code]を参照してください。


[splitting-up-client-and-server-code]:  (ここにリンクを挿入してください)

## 新しいビルド出力パス

Viteが`public`ディレクトリを管理する方法と既存のRemixコンパイラとの間には、注目すべき違いがあります。Viteは`public`ディレクトリからファイルをクライアントビルドディレクトリにコピーしますが、Remixコンパイラは`public`ディレクトリをそのままにして、サブディレクトリ(`public/build`)をクライアントビルドディレクトリとして使用していました。

Viteの動作に合わせてRemixプロジェクトのデフォルト構造を調整するため、ビルド出力パスが変更されました。個別の`assetsBuildDirectory`と`serverBuildDirectory`オプションに代わって、デフォルトで`"build"`となる単一の`buildDirectory`オプションが追加されました。これは、デフォルトではサーバーが`build/server`に、クライアントが`build/client`にコンパイルされることを意味します。

これにより、次の設定のデフォルト値も変更されました。

* [publicPath][public-path]は[Viteの"base"オプション][vite-base]に置き換えられ、デフォルトは`"/"`ではなく`"/"`になりました。
* [serverBuildPath][server-build-path]は`serverBuildFile`に置き換えられ、デフォルトは`"index.js"`になりました。このファイルは、設定された`buildDirectory`内のサーバーディレクトリに書き込まれます。

RemixがViteに移行する理由の1つは、Remixを採用する際に学習する内容を減らすためです。
つまり、使用したい追加のバンドル機能については、Remixのドキュメントではなく、[Viteのドキュメント][vite]と[Viteプラグインコミュニティ][vite-plugins]を参照する必要があります。

Viteには、既存のRemixコンパイラには組み込まれていない多くの[機能][vite-features]と[プラグイン][vite-plugins]があります。
このような機能を使用すると、既存のRemixコンパイラではアプリをコンパイルできなくなるため、Viteを今後専ら使用する予定の場合のみ使用してください。


[public-path]: (リンクをここに挿入)
[vite-base]: (リンクをここに挿入)
[server-build-path]: (リンクをここに挿入)
[vite]: (リンクをここに挿入)
[vite-plugins]: (リンクをここに挿入)
[vite-features]: (リンクをここに挿入)


## 移行

#### Viteの設定

👉 **開発依存関係としてViteをインストールする**

```shellscript nonumber
npm install -D vite
```

Remixは現在Viteプラグインなので、Viteに接続する必要があります。

👉 **Remixアプリのルートにある`remix.config.js`を`vite.config.ts`に置き換える**

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

[サポートされているRemixの設定オプション][vite-config] のサブセットは、プラグインに直接渡す必要があります。

```ts filename=vite.config.ts lines=[3-5]
export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
});
```

#### HMR & HDR

Viteは、HMRのような開発機能のための堅牢なクライアントサイドランタイムを提供するため、`<LiveReload />`コンポーネントは不要になりました。Remix Viteプラグインを開発で使用する場合、`<Scripts />`コンポーネントは自動的にViteのクライアントサイドランタイムとその他の開発時のみのスクリプトを含みます。

👉 **`<LiveReload/>`を削除し、`<Scripts />`を保持**

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

#### TypeScript統合

Viteは様々な種類のファイルのインポートを処理しますが、既存のRemixコンパイラとは異なる方法で処理することがあります。そのため、非推奨になった`@remix-run/dev`からの型ではなく、`vite/client`からViteの型を参照しましょう。

`vite/client`によって提供されるモジュール型は、`@remix-run/dev`に暗黙的に含まれるモジュール型と互換性がないため、TypeScriptの設定で`skipLibCheck`フラグを有効にする必要があります。Viteプラグインがデフォルトのコンパイラになれば、Remixはこのフラグを必要としなくなります。

👉 **`tsconfig.json`の更新**

`tsconfig.json`の`types`フィールドを更新し、`skipLibCheck`、`module`、`moduleResolution`が正しく設定されていることを確認してください。

```json filename=tsconfig.json lines=[3-6]
{
  "compilerOptions": {
    "types": ["@remix-run/node", "vite/client"],
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

👉 **`remix.env.d.ts`の更新/削除**

`remix.env.d.ts`内の以下の型宣言を削除してください。

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts`が空になった場合は、削除してください。

```shellscript nonumber
rm remix.env.d.ts
```

#### Remix App Serverからの移行

開発環境で`remix-serve`（または`-c`フラグなしの`remix dev`）を使用していた場合は、新しい最小限の開発サーバーに切り替える必要があります。
これはRemix Viteプラグインに組み込まれており、`remix vite:dev`を実行すると動作します。

Remix Viteプラグインは、[グローバルNodeポリフィル][global-node-polyfills]をインストールしないため、`remix-serve`に依存していた場合は、自分でインストールする必要があります。これを行う最も簡単な方法は、Vite設定の先頭で`installGlobals`を呼び出すことです。

Vite開発サーバーのデフォルトポートは`remix-serve`とは異なるため、同じポートを維持したい場合は、Viteの`server.port`オプションで設定する必要があります。

また、サーバーには`build/server`、クライアントアセットには`build/client`という新しいビルド出力パスに更新する必要があります。


👉 **`dev`、`build`、`start`スクリプトを更新する**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **Vite設定でグローバルNodeポリフィルをインストールする**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Vite開発サーバーポートを設定する（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

#### カスタムサーバーの移行

開発でカスタムサーバーを使用していた場合、Viteの`connect`ミドルウェアを使用するようにカスタムサーバーを編集する必要があります。これにより、開発中にアセットリクエストと最初のレンダリングリクエストがViteに委任され、カスタムサーバーを使用する場合でも、Viteの優れた開発者エクスペリエンスを活用できます。

その後、開発中に仮想モジュール`"virtual:remix/server-build"`をロードして、Viteベースのリクエストハンドラーを作成できます。

また、サーバーコードを更新して、新しいビルド出力パスを参照する必要があります。サーバービルドの場合は`build/server`、クライアントアセットの場合は`build/client`です。

たとえば、Expressを使用している場合、次のように実行できます。

👉 **`server.mjs`ファイルの更新**

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

// SSRリクエストの処理
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

👉 **`build`、`dev`、`start`スクリプトの更新**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "node ./server.mjs",
    "build": "remix vite:build",
    "start": "cross-env NODE_ENV=production node ./server.mjs"
  }
}
```

必要に応じて、TypeScriptでカスタムサーバーを作成することもできます。その後、[`tsx`][tsx]や[`tsm`][tsm]などのツールを使用してカスタムサーバーを実行できます。

```shellscript nonumber
tsx ./server.ts
node --loader tsm ./server.ts
```

ただし、これを行うと、サーバーの初回起動時に顕著な遅延が発生する可能性があることに注意してください。


[tsx]: <リンクをtsxのドキュメントに挿入>
[tsm]: <リンクをtsmのドキュメントに挿入>

#### Cloudflare Functions の移行

<docs-warning>

Remix Vite プラグインは、フルスタックアプリケーション向けに特別に設計された[Cloudflare Pages][cloudflare-pages]のみを正式にサポートしています。[Cloudflare Workers Sites][cloudflare-workers-sites]とは異なります。現在 Cloudflare Workers Sites を使用している場合は、[Cloudflare Pages 移行ガイド][cloudflare-pages-migration-guide]を参照してください。

</docs-warning>

👉 Vite開発サーバーのミドルウェアを正しく上書きするには、`remix`プラグインの**前**に`cloudflareDevProxyVitePlugin`を追加してください！

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

Cloudflare アプリケーションでは、[Remix 設定の `server` フィールド][remix-config-server]を設定して、キャッチオール Cloudflare Function を生成している可能性があります。
Vite では、この間接参照は不要になりました。
代わりに、Express やその他のカスタムサーバーと同様に、Cloudflare 用のキャッチオールルートを直接作成できます。

👉 **Remix のキャッチオールルートを作成する**

```ts filename=functions/[[page]].ts
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore - the server build file is generated by `remix vite:build`
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
});
```

👉 **`context.env` ではなく `context.cloudflare.env` を使用して、バインディングと環境変数にアクセスする**

開発中は主に Vite を使用しますが、Wrangler を使用してアプリのプレビューとデプロイを行うこともできます。

詳細については、このドキュメントの[*Cloudflare*][cloudflare-vite]セクションを参照してください。

👉 **`package.json` スクリプトを更新する**

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

#### ビルド出力パスの参照を移行する

既存のRemixコンパイラのデフォルトオプションを使用する場合、サーバーは`build`ディレクトリに、クライアントは`public/build`ディレクトリにコンパイルされていました。Viteが`public`ディレクトリを扱う方法と既存のRemixコンパイラとの違いにより、これらの出力パスが変更されました。

👉 **ビルド出力パスの参照を更新する**

* サーバーは、デフォルトで`build/server`ディレクトリにコンパイルされるようになりました。
* クライアントは、デフォルトで`build/client`ディレクトリにコンパイルされるようになりました。

例えば、[Blues Stack][blues-stack]のDockerfileを更新するには、以下のようにします。

```diff filename=Dockerfile
-COPY --from=build /myapp/build /myapp/build
-COPY --from=build /myapp/public /myapp/public
+COPY --from=build /myapp/build/server /myapp/build/server
+COPY --from=build /myapp/build/client /myapp/build/client
```


[blues-stack]:  (Blues Stackへのリンクをここに挿入)

#### パスエイリアスの設定

Remixコンパイラは、パスエイリアスの解決に`tsconfig.json`の`paths`オプションを利用します。Remixコミュニティでは一般的に、`~`を`app`ディレクトリのエイリアスとして定義するために使用されます。

Viteはデフォルトではパスエイリアスを提供しません。この機能に依存していた場合、[vite-tsconfig-paths][vite-tsconfig-paths]プラグインをインストールして、Remixコンパイラの動作に合わせて、`tsconfig.json`からのパスエイリアスをViteで自動的に解決することができます。

👉 **`vite-tsconfig-paths`のインストール**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite設定への`vite-tsconfig-paths`の追加**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

#### `@remix-run/css-bundle`の削除

Viteは、CSSの副作用インポート、PostCSS、CSS Modulesなどを含む、CSSバンドル機能を組み込みでサポートしています。Remix Viteプラグインは、バンドルされたCSSを関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr>パッケージは、Viteを使用する場合、その`cssBundleHref`エクスポートは常に`undefined`になるため、冗長です。

👉 **`@remix-run/css-bundle`をアンインストールする**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref`への参照を削除する**

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

ルートの`links`関数が`cssBundleHref`を接続するためだけに使用されている場合、完全に削除できます。

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

<docs-info>これは、[CSS バンドリング][css-bundling] の他の形式（例：CSS Modules、CSS サイドエフェクトインポート、Vanilla Extract など）には必要ありません。</docs-info>

[ `links` 関数で CSS を参照している場合][regular-css]、対応する CSS インポートを [Vite の明示的な `?url` インポート構文を使用するように更新する必要があります。][vite-url-imports]

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


[css-bundling]:  (CSS バンドリングへのリンク)
[regular-css]: (通常のCSS参照へのリンク)
[vite-url-imports]: (Viteの?urlインポートへのリンク)


#### PostCSS を介して Tailwind を有効化

プロジェクトで [Tailwind CSS][tailwind] を使用している場合、まず、Vite によって自動的に検出される [PostCSS][postcss] 設定ファイルがあることを確認する必要があります。
これは、Remix の `tailwind` オプションが有効になっている場合、Remix コンパイラでは PostCSS 設定ファイルが不要だったためです。

👉 **PostCSS 設定ファイルが存在しない場合は追加し、`tailwindcss` プラグインを含めます**

```js filename=postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {},
  },
};
```

プロジェクトに既に PostCSS 設定ファイルがある場合は、`tailwindcss` プラグインがまだ存在しない場合は追加する必要があります。
これは、Remix コンパイラが Remix の [`tailwind` 設定オプション][tailwind-config-option] が有効になっている場合、このプラグインを自動的に含めていたためです。

👉 **`tailwindcss` プラグインが不足している場合は、PostCSS 設定ファイルに追加します**

```js filename=postcss.config.mjs lines=[3]
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

👉 **Tailwind CSS のインポートを移行します**

[ `links` 関数で Tailwind CSS ファイルを参照している場合][regular-css]、[Tailwind CSS のインポート文を移行する必要があります。][fix-up-css-imports-referenced-in-links]


[tailwind]: (Tailwind CSSへのリンク)
[postcss]: (PostCSSへのリンク)
[tailwind-config-option]: (Remixのtailwind設定オプションへのリンク)
[regular-css]: (通常のCSS参照方法へのリンク)
[fix-up-css-imports-referenced-in-links]: (CSSインポート文の修正方法へのリンク)

#### Vanilla Extract プラグインの追加

[Vanilla Extract][vanilla-extract] を使用している場合は、Viteプラグインを設定する必要があります。

👉 **公式の [Vanilla Extract Viteプラグイン][vanilla-extract-vite-plugin] をインストールします**

```shellscript nonumber
npm install -D @vanilla-extract/vite-plugin
```

👉 **Vite設定にVanilla Extractプラグインを追加します**

```ts filename=vite.config.ts lines=[2,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix(), vanillaExtractPlugin()],
});
```


[vanilla-extract]: <Vanilla Extractへのリンクをここに挿入>
[vanilla-extract-vite-plugin]: <Vanilla Extract Viteプラグインへのリンクをここに挿入>

#### MDXプラグインの追加

[MDX][mdx]を使用している場合、ViteのプラグインAPIは[Rollup][rollup]プラグインAPIの拡張であるため、公式の[MDX Rollupプラグイン][mdx-rollup-plugin]を使用する必要があります。

👉 **MDX Rollupプラグインのインストール**

```shellscript nonumber
npm install -D @mdx-js/rollup
```

<docs-info>

RemixプラグインはJavaScriptまたはTypeScriptファイルを処理することを想定しているため、MDXなどの他の言語からのトランスパイルは先に実行する必要があります。
この場合、MDXプラグインをRemixプラグインの*前に*配置する必要があります。

</docs-info>

👉 **Vite設定へのMDX Rollupプラグインの追加**

```ts filename=vite.config.ts lines=[1,6]
import mdx from "@mdx-js/rollup";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [mdx(), remix()],
});
```


[mdx]: <a href="https://mdxjs.com/">https://mdxjs.com/</a>
[rollup]: <a href="https://rollupjs.org/">https://rollupjs.org/</a>
[mdx-rollup-plugin]: <a href="https://github.com/mdx-js/mdx/tree/main/packages/rollup">https://github.com/mdx-js/mdx/tree/main/packages/rollup</a>

##### MDXフロントマターサポートの追加

Remixコンパイラでは、[MDXのフロントマター][mdx-frontmatter]を定義できました。この機能を使用していた場合、Viteでは[remark-mdx-frontmatter]を使用して実現できます。

👉 **必要な[Remark][remark]フロントマタープラグインをインストールする**

```shellscript nonumber
npm install -D remark-frontmatter remark-mdx-frontmatter
```

👉 **RemarkフロントマタープラグインをMDX Rollupプラグインに渡す**

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

Remixコンパイラでは、フロントマターのエクスポート名は`attributes`でした。これは、フロントマタープラグインのデフォルトのエクスポート名`frontmatter`とは異なります。フロントマターのエクスポート名を構成することもできますが、代わりにデフォルトのエクスポート名を使用するようにアプリコードを更新することをお勧めします。

👉 **MDXファイル内でMDXの`attributes`エクスポート名を`frontmatter`に名前変更する**

```diff filename=app/posts/first-post.mdx
  ---
  title: Hello, World!
  ---

- # {attributes.title}
+ # {frontmatter.title}
```

👉 **コンシューマー向けにMDXの`attributes`エクスポート名を`frontmatter`に名前変更する**

```diff filename=app/routes/posts/first-post.tsx
  import Component, {
-   attributes,
+   frontmatter,
  } from "./posts/first-post.mdx";
```

[mdx-frontmatter]: <必要なURLをここに挿入>
[remark]: <必要なURLをここに挿入>

###### MDXファイルの型定義

👉 **`env.d.ts`に`*.mdx`ファイルの型を追加する**

```ts filename=env.d.ts lines=[4-8]
/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export const frontmatter: any;
  export default MDXComponent;
}
```

###### Map MDX frontmatter to route exports

Remixコンパイラでは、frontmatterに`headers`、`meta`、`handle`ルートエクスポートを定義することができました。このRemix固有の機能は、`remark-mdx-frontmatter`プラグインでは明らかにサポートされていません。この機能を使用していた場合は、frontmatterをルートエクスポートに手動でマッピングする必要があります。

👉 **MDXルートのfrontmatterをルートエクスポートにマッピングする**

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

MDXルートエクスポートを明示的にマッピングしているので、好きなfrontmatter構造を使用できます。

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

###### MDX ファイル名の使用方法の更新

Remix コンパイラは、すべての MDX ファイルから `filename` エクスポートも提供していました。これは主に、MDX ルートのコレクションへのリンクを有効にするために設計されていました。この機能を使用していた場合は、[glob インポート][glob-imports] を介して Vite で実現できます。これにより、ファイル名とモジュールをマッピングする便利なデータ構造が得られます。これにより、各ファイルを個別にインポートする必要がなくなるため、MDX ファイルのリストを維持することがはるかに容易になります。

たとえば、`posts` ディレクトリ内のすべての MDX ファイルをインポートするには、次のようにします。

```ts
const posts = import.meta.glob("./posts/*.mdx");
```

これは、手動で次のように記述することと同じです。

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

[glob-imports]:  (glob インポートへのリンクをここに挿入してください)

## デバッグ

[`NODE_OPTIONS` 環境変数][node-options] を使用してデバッグセッションを開始できます。

```shellscript nonumber
NODE_OPTIONS="--inspect-brk" npm run dev
```

その後、ブラウザからデバッガを接続できます。
たとえば、Chromeでは`chrome://inspect`を開くか、開発ツールのNodeJSアイコンをクリックしてデバッガを接続できます。


[node-options]:  (This needs a URL to be added if available.  For example:  [https://nodejs.org/api/cli.html#cli_node_options](https://nodejs.org/api/cli.html#cli_node_options))

#### vite-plugin-inspect

[`vite-plugin-inspect`][vite-plugin-inspect] は、各Viteプラグインがどのようにコードを変換し、各プラグインにかかる時間を表示します。

## パフォーマンス

Remixには、パフォーマンスプロファイリングのための`--profile`フラグが含まれています。

```shellscript nonumber
remix vite:build --profile
```

`--profile`を付けて実行すると、`.cpuprofile`ファイルが生成されます。これは共有したり、speedscope.appにアップロードして分析したりできます。

開発中にプロファイリングを行うには、開発サーバーの実行中に`p + enter`を押して、新しいプロファイリングセッションを開始するか、現在のセッションを停止することもできます。
開発サーバーの起動をプロファイリングする必要がある場合は、`--profile`フラグを使用して起動時にプロファイリングセッションを初期化することもできます。

```shellscript nonumber
remix vite:dev --profile
```

[Vite パフォーマンスドキュメント][vite-perf]でさらにヒントを確認することもできます！


[vite-perf]:  (Vite パフォーマンスドキュメントへのリンクをここに挿入してください)

#### バンドル分析

バンドルを視覚化および分析するには、[rollup-plugin-visualizer][rollup-plugin-visualizer] プラグインを使用できます。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    remix(),
    // `emitFile` は、Remix が複数のバンドルをビルドするため必要です！
    visualizer({ emitFile: true }),
  ],
});
```

その後、`remix vite:build` を実行すると、各バンドルに `stats.html` ファイルが生成されます。

```
build
├── client
│   ├── assets/
│   ├── favicon.ico
│   └── stats.html 👈
└── server
    ├── index.js
    └── stats.html 👈
```

ブラウザで `stats.html` を開いて、バンドルを分析してください。

## トラブルシューティング

一般的なトラブルシューティングのヒントについては、[デバッグ][debugging] セクションと[パフォーマンス][performance] セクションを確認してください。
また、[GitHub の remix vite プラグインの既知の問題][issues-vite] を調べて、他に同じ問題を抱えている人がいないか確認してください。


[debugging]:  (デバッグセクションへのリンクをここに挿入)
[performance]: (パフォーマンスセクションへのリンクをここに挿入)
[issues-vite]: (GitHub の issues ページへのリンクをここに挿入)

#### HMR

ホットアップデートを期待しているのに、ページ全体が再読み込みされる場合は、[ホットモジュール置換に関する議論][hmr] を参照して、React Fast Refreshの制限と一般的な問題の回避策について詳しく学んでください。


[hmr]: [hmrのリンクをここに挿入]

#### ESM / CJS

ViteはESMとCJSの両方の依存関係をサポートしていますが、ESM/CJSの相互運用で問題が発生することがあります。
通常、これは依存関係がESMを適切にサポートするように構成されていないことが原因です。
そして、彼らを責めるわけではありません。[ESMとCJSの両方を適切にサポートするのは非常に難しいです][modernizing-packages-to-esm]。

例のバグを修正する手順については、[🎥 How to Fix CJS/ESM Bugs in Remix][how-fix-cjs-esm]をご覧ください。

依存関係のいずれかが誤って構成されているかどうかを診断するには、[publint][publint]または[*Are The Types Wrong*][arethetypeswrong]を確認してください。
さらに、[vite-plugin-cjs-interopプラグイン][vite-plugin-cjs-interop]を使用して、外部CJS依存関係の`default`エクスポートに関する問題を解決できます。

最後に、[Viteの`ssr.noExternal`オプション][ssr-no-external]を使用して、サーバーバンドルにバンドルする依存関係を明示的に構成し、Remixコンパイラの[`serverDependenciesToBundle`][server-dependencies-to-bundle]（Remix Viteプラグインを使用）をエミュレートすることもできます。


[modernizing-packages-to-esm]: <a href="ここにリンクを挿入">ここにリンクを挿入</a>
[how-fix-cjs-esm]: <a href="ここにリンクを挿入">ここにリンクを挿入</a>
[publint]: <a href="ここにリンクを挿入">ここにリンクを挿入</a>
[arethetypeswrong]: <a href="ここにリンクを挿入">ここにリンクを挿入</a>
[vite-plugin-cjs-interop]: <a href="ここにリンクを挿入">ここにリンクを挿入</a>
[ssr-no-external]: <a href="ここにリンクを挿入">ここにリンクを挿入</a>
[server-dependencies-to-bundle]: <a href="ここにリンクを挿入">ここにリンクを挿入</a>

#### 開発中のブラウザにおけるサーバーコードエラー

開発中にブラウザコンソールにサーバーコードを指し示すエラーが表示される場合、[サーバー専用コードを明示的に分離する][explicitly-isolate-server-only-code]必要がある可能性があります。

例えば、次のようなものが見られる場合：

```shellscript
Uncaught ReferenceError: process is not defined
```

`process`のようなサーバー専用グローバル変数を期待する依存関係を取り込んでいるモジュールを突き止め、[別の`.server`モジュール内、または`vite-env-only`を使用して][explicitly-isolate-server-only-code]コードを分離する必要があります。Viteは本番環境でコードをツリーシェイクするためにRollupを使用するため、これらのエラーは開発時のみ発生します。


[explicitly-isolate-server-only-code]:  (この部分はリンク先URLに置き換えてください)

#### その他のViteベースツール（例：Vitest、Storybook）でのプラグインの使用

Remix Viteプラグインは、アプリケーションの開発サーバーと本番ビルドでの使用のみを目的としています。VitestやStorybookなど、Viteの設定ファイルを使用する他のViteベースのツールもありますが、Remix Viteプラグインはこれらのツールでの使用を想定して設計されていません。現在、他のViteベースのツールで使用する場合には、プラグインを除外することをお勧めします。

Vitestの場合：

```ts filename=vite.config.ts lines=[5]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";

export default defineConfig({
  plugins: [!process.env.VITEST && remix()],
  test: {
    environment: "happy-dom",
    // さらに、これはvitest実行中に".env.test"を読み込むためです
    env: loadEnv("test", process.cwd(), ""),
  },
});
```

Storybookの場合：

```ts filename=vite.config.ts lines=[7]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

const isStorybook = process.argv[1]?.includes("storybook");

export default defineConfig({
  plugins: [!isStorybook && remix()],
});
```

あるいは、各ツールに個別のVite設定ファイルを使用することもできます。たとえば、Remixに特化したVite設定を使用するには：

```shellscript nonumber
remix vite:dev --config vite.config.remix.ts
```

Remix Viteプラグインを提供しない場合、設定で[Vite Plugin React][vite-plugin-react]を提供する必要がある場合もあります。たとえば、Vitestを使用する場合：

```ts filename=vite.config.ts lines=[2,6]
import { vitePlugin as remix } from "@remix-run/dev";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig({
  plugins: [!process.env.VITEST ? remix() : react()],
  test: {
    environment: "happy-dom",
    // さらに、これはvitest実行中に".env.test"を読み込むためです
    env: loadEnv("test", process.cwd(), ""),
  },
});
```

#### 開発中にドキュメントが再マウントされるとスタイルが消える

Reactがドキュメント全体をレンダリングする場合（Remixが行うように）、`head`要素に動的に要素が挿入されると問題が発生する可能性があります。ドキュメントが再マウントされると、既存の`head`要素は削除され、完全に新しい要素に置き換えられ、Viteが開発中に挿入した`style`要素が削除されます。

これは既知のReactの問題であり、[カナリアリリースチャンネル][react-canaries]で修正されています。リスクを理解している場合は、アプリを特定の[Reactバージョン][react-versions]に固定し、[パッケージオーバーライド][package-overrides]を使用して、プロジェクト全体でこれが唯一のReactバージョンであることを確認できます。例：

```json filename=package.json
{
  "dependencies": {
    "react": "18.3.0-canary-...",
    "react-dom": "18.3.0-canary-..."
  },
  "overrides": {
    "react": "18.3.0-canary-...",
    "react-dom": "18.3.0-canary-..."
  }
}
```

<docs-info>参考までに、これはNext.jsが内部的にReactのバージョン管理を処理する方法です。そのため、Remixがデフォルトで提供していないにもかかわらず、このアプローチは予想以上に広く使用されています。</docs-info>

Viteによって挿入されたスタイルに関するこの問題は、開発中のみ発生することに注意することが重要です。**本番ビルドでは、静的CSSファイルが生成されるため、この問題は発生しません**。

Remixでは、この問題は、[ルートルートのデフォルトコンポーネントエクスポート][route-component]とその[ErrorBoundary][error-boundary]および/または[HydrateFallback][hydrate-fallback]エクスポート間でレンダリングが切り替わる場合に発生する可能性があります。これは、新しいドキュメントレベルのコンポーネントがマウントされるためです。

ハイドレーションエラーが原因で発生することもあります。これは、Reactがページ全体を最初から再レンダリングするためです。ハイドレーションエラーはアプリコードによって発生する可能性がありますが、ドキュメントを操作するブラウザ拡張機能によって発生する可能性もあります。

これはViteにとって重要です。なぜなら、開発中はViteがCSSインポートをJSファイルに変換し、副作用としてドキュメントにスタイルを挿入するためです。Viteは、静的CSSファイルの遅延読み込みとHMRをサポートするためにこれを行います。

たとえば、アプリに次のCSSファイルがあるとします。

<!-- prettier-ignore -->

```css filename=app/styles.css
* { margin: 0 }
```

開発中は、このCSSファイルは、副作用としてインポートされると、次のJavaScriptコードに変換されます。

<!-- prettier-ignore-start -->

<!-- eslint-skip -->

```js
import {createHotContext as __vite__createHotContext} from "/@vite/client";
import.meta.hot = __vite__createHotContext("/app/styles.css");
import {updateStyle as __vite__updateStyle, removeStyle as __vite__removeStyle} from "/@vite/client";
const __vite__id = "/path/to/app/styles.css";
const __vite__css = "*{margin:0}"
__vite__updateStyle(__vite__id, __vite__css);
import.meta.hot.accept();
import.meta.hot.prune(()=>__vite__removeStyle(__vite__id));
```

<!-- prettier-ignore-end -->

この変換は本番コードには適用されないため、このスタイルの問題は開発のみに影響します。


[react-canaries]: (Reactカナリアリリースチャンネルへのリンクをここに挿入)
[react-versions]: (Reactバージョンのリストへのリンクをここに挿入)
[package-overrides]: (パッケージオーバーライドに関するドキュメントへのリンクをここに挿入)
[route-component]: (ルートルートのデフォルトコンポーネントエクスポートに関するドキュメントへのリンクをここに挿入)
[error-boundary]: (ErrorBoundaryに関するドキュメントへのリンクをここに挿入)
[hydrate-fallback]: (HydrateFallbackに関するドキュメントへのリンクをここに挿入)


#### 開発中のWranglerエラー

Cloudflare Pagesを使用している場合、`wrangler pages dev`から次のエラーが発生することがあります。

```txt nonumber
ERROR: Your worker called response.clone(), but did not read the body of both clones.
This is wasteful, as it forces the system to buffer the entire response body
in memory, rather than streaming it through. This may cause your worker to be
unexpectedly terminated for going over the memory limit. If you only meant to
copy the response headers and metadata (e.g. in order to be able to modify
them), use `new Response(response.body, response)` instead.
```

これは[Wranglerの既知の問題][cloudflare-request-clone-errors]です。

</docs-info>

##謝辞

Viteは素晴らしいプロジェクトであり、Viteチームの尽力に感謝しています。
Viteチームの[Matias Capeletto、Arnaud Barré、Bjorn Lu][vite-team]には特に感謝しています。

RemixコミュニティはViteサポートの調査を迅速に進めてくれ、その貢献に感謝しています。

* [ディスカッション: Viteの使用を検討する][consider-using-vite]
* [remix-kit][remix-kit]
* [remix-vite][remix-vite]
* [vite-plugin-remix][vite-plugin-remix]

最後に、他のフレームワークがViteサポートを実装した方法からインスピレーションを受けました。

* [Astro][astro]
* [SolidStart][solidstart]
* [SvelteKit][sveltekit]

[vite]: https://vitejs.dev

[template-cloudflare]: https://github.com/remix-run/remix/tree/main/templates/cloudflare

[public-path]: ../file-conventions/remix-config#publicpath

[server-build-path]: ../file-conventions/remix-config#serverbuildpath

[vite-config]: ../file-conventions/vite-config

[vite-plugins]: https://vitejs.dev/plugins

[vite-features]: https://vitejs.dev/guide/features

[tsx]: https://github.com/esbuild-kit/tsx

[tsm]: https://github.com/lukeed/tsm

[vite-tsconfig-paths]: https://github.com/aleclarson/vite-tsconfig-paths

[css-bundling]: ../styling/bundling

[regular-css]: ../styling/css

[vite-url-imports]: https://vitejs.dev/guide/assets.html#explicit-url-imports

[tailwind]: https://tailwindcss.com

[postcss]: https://postcss.org

[tailwind-config-option]: ../file-conventions/remix-config#tailwind

[vanilla-extract]: https://vanilla-extract.style

[vanilla-extract-vite-plugin]: https://vanilla-extract.style/documentation/integrations/vite

[mdx]: https://mdxjs.com

[rollup]: https://rollupjs.org

[mdx-rollup-plugin]: https://mdxjs.com/packages/rollup

[mdx-frontmatter]: https://mdxjs.com/guides/frontmatter

[remark-mdx-frontmatter]: https://github.com/remcohaszing/remark-mdx-frontmatter

[remark]: https://remark.js.org

[glob-imports]: https://vitejs.dev/guide/features.html#glob-import

[issues-vite]: https://github.com/remix-run/remix/labels/vite

[hmr]: ../discussion/hot-module-replacement

[vite-team]: https://vitejs.dev/team

[consider-using-vite]: https://github.com/remix-run/remix/discussions/2427

[remix-kit]: https://github.com/jrestall/remix-kit

[remix-vite]: https://github.com/sudomf/remix-vite

[vite-plugin-remix]: https://github.com/yracnet/vite-plugin-remix

[astro]: https://astro.build/

[solidstart]: https://start.solidjs.com/getting-started/what-is-solidstart

[sveltekit]: https://kit.svelte.dev/

[modernizing-packages-to-esm]: https://blog.isquaredsoftware.com/2023/08/esm-modernization-lessons/

[arethetypeswrong]: https://arethetypeswrong.github.io/

[publint]: https://publint.dev/

[vite-plugin-cjs-interop]: https://github.com/cyco130/vite-plugin-cjs-interop

[ssr-no-external]: https://vitejs.dev/config/ssr-options.html#ssr-noexternal

[server-dependencies-to-bundle]: https://remix.run/docs/en/main/file-conventions/remix-config#serverdependenciestobundle

[blues-stack]: https://github.com/remix-run/blues-stack

[global-node-polyfills]: ../other-api/node#polyfills

[vite-plugin-inspect]: https://github.com/antfu/vite-plugin-inspect

[vite-perf]: https://vitejs.dev/guide/performance.html

[node-options]: https://nodejs.org/api/cli.html#node_optionsoptions

[rollup-plugin-visualizer]: https://github.com/btd/rollup-plugin-visualizer

[debugging]: #debugging

[performance]: #performance

[explicitly-isolate-server-only-code]: #splitting-up-client-and-server-code

[route-component]: ../route/component

[error-boundary]: ../route/error-boundary

[hydrate-fallback]: ../route/hydrate-fallback

[react-canaries]: https://react.dev/blog/2023/05/03/react-canaries

[react-versions]: https://www.npmjs.com/package/react?activeTab=versions

[package-overrides]: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides

[wrangler-toml-bindings]: https://developers.cloudflare.com/workers/wrangler/configuration/#bindings

[cloudflare-pages]: https://pages.cloudflare.com

[cloudflare-workers-sites]: https://developers.cloudflare.com/workers/configuration/sites

[cloudflare-pages-migration-guide]: https://developers.cloudflare.com/pages/migrations/migrating-from-workers

[cloudflare-request-clone-errors]: https://github.com/cloudflare/workers-sdk/issues/3259

[cloudflare-pages-bindings]: https://developers.cloudflare.com/pages/functions/bindings/

[cloudflare-kv]: https://developers.cloudflare.com/pages/functions/bindings/#kv-namespaces

[cloudflare-workerd]: https://blog.cloudflare.com/workerd-open-source-workers-runtime

[wrangler-getplatformproxy]: https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy

[wrangler-getplatformproxy-return]: https://developers.cloudflare.com/workers/wrangler/api/#return-type-1

[remix-config-server]: https://remix.run/docs/en/main/file-conventions/remix-config#server

[cloudflare-vite]: #cloudflare

[vite-base]: https://vitejs.dev/config/shared-options.html#base

[how-fix-cjs-esm]: https://www.youtube.com/watch?v=jmNuEEtwkD4

[fix-up-css-imports-referenced-in-links]: #fix-up-css-imports-referenced-in-links

[vite-plugin-react]: https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react

[splitting-up-client-and-server-code]: ../discussion/server-vs-client

