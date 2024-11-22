---
title: Vite
---

# Vite

[Vite][vite] は、JavaScript プロジェクトのための強力で高性能で拡張性のある開発環境です。Remix のバンドリング機能を改善し拡張するために、私たちは今Viteをもう一つのコンパイラとしてサポートしています。近い将来、Viteがデフォルトのコンパイラになるでしょう。

## クラシックなRemixコンパイラvsRemixのVite

既存のRemixコンパイラは、`remix build`および`remix dev` CLIコマンドで利用でき、`remix.config.js`で設定されています。これは「クラシックなRemixコンパイラ」と呼ばれるようになりました。

Remix Viteプラグインと`remix vite:build`および`remix vite:dev`CLIコマンドを総称して「Remix Vite」と呼びます。

今後、特に記載がない限り、ドキュメントはRemix Viteの使用を前提とします。

## はじめに

様々なVite ベースのテンプレートをご用意しています。

```shellscript nonumber
# 最小構成:
npx create-remix@latest

# Express:
npx create-remix@latest --template remix-run/remix/templates/express

# Cloudflare: 
npx create-remix@latest --template remix-run/remix/templates/cloudflare

# Cloudflare Workers:
npx create-remix@latest --template remix-run/remix/templates/cloudflare-workers
```

これらのテンプレートには、Remix Viteプラグインが設定された`vite.config.ts`ファイルが含まれています。

## 設定

Remix Viteプラグインは、プロジェクトのルートにある`vite.config.ts`ファイルで設定されます。詳細は[Vite設定のドキュメント][vite-config]をご覧ください。

## Cloudflare

Cloudflareを使い始めるには、[`cloudflare`][template-cloudflare]テンプレートを使うと良いでしょう:

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/cloudflare
```

Viteでローカルで実行する2つの方法があります:

```shellscript nonumber
# Vite
remix vite:dev

# Wrangler
remix vite:build # アプリケーションを先にビルドしてから wrangler を実行
wrangler pages dev ./build/client
```

Viteはより良い開発体験を提供しますが、Wranglerはクラウドワーカーの`workerd`ランタイムで実行することで、Cloudflare環境をより忠実に模擬できます。

#### Cloudflareプロキシ

Viteでクラウドワーカー環境をシミュレーションするために、Wranglerは[ローカルの`workerd`バインディングへのNodeプロキシ][wrangler-getplatformproxy]を提供しています。
Remix のCloudflareプロキシプラグインはこれらのプロキシを設定してくれます:

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

これにより、`loader`や`action`関数内で`context.cloudflare`から使えるようになります:

```ts
export const loader = ({ context }: LoaderFunctionArgs) => {
  const { env, cf, ctx } = context.cloudflare;
  // ... more loader code here...
};
```

Cloudflare の`getPlatformProxy`ドキュメントで、これらのプロキシについてさらに詳しく確認できます。

#### バインディング

ローカル開発でのViteやWranglerの設定には[wrangler.toml][wrangler-toml-bindings]を、デプロイ時にはCloudflareダッシュボードの[Cloudflare Pages バインディング][cloudflare-pages-bindings]を使います。

`wrangler.toml`ファイルを変更したら、必ず`wrangler types`を実行してバインディングを再生成する必要があります。

その後、`context.cloudflare.env`からバインディングにアクセスできます。
例えば、[KVネームスペース][cloudflare-kv]が`MY_KV`としてバインドされている場合:

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

ロードコンテキストに追加のプロパティを追加したい場合は、共有モジュールから`getLoadContext`関数をエクスポートする必要があります。これにより、Vite、Wrangler、Cloudflare Pagesでロードコンテキストが一貫して拡張されます:

```ts filename=load-context.ts lines=[1,4-9,20-33]
import { type AppLoadContext } from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";

// `wrangler.toml`を使ってバインディングを設定する場合、
// `wrangler types`がそれらのバインディングの型を
// グローバルな`Env`インターフェイスに生成します。
// `wrangler.toml`が存在しない場合でもタイプチェックが通るよう、
// 空のインターフェイスを定義しています。
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

// Vite、Wrangler、Cloudflare Pagesで互換性のある共有実装
export const getLoadContext: GetLoadContext = ({
  context,
}) => {
  return {
    ...context,
    extra: "stuff",
  };
};
```

<docs-warning>Cloudflareプロキシプラグインとリクエストハンドラ`functions/[[path]].ts`の両方で`getLoadContext`を渡す必要があります。そうしないと、アプリの実行方法によってロードコンテキストの拡張が一貫していません。</docs-warning>

まず、Vite設定でCloudflareプロキシプラグインに`getLoadContext`を渡して、Viteの実行時にロードコンテキストを拡張します:

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

次に、Wranglerや Cloudflare Pagesへのデプロイ時にロードコンテキストを拡張するため、`functions/[[path]].ts`のリクエストハンドラに`getLoadContext`を渡します:

```ts filename=functions/[[path]].ts lines=[5,9]
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore - the server build file is generated by `remix vite:build`
import * as build from "../build/server";
import { getLoadContext } from "../load-context";

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext,
});
```

## クライアントとサーバーコードの分離

Viteは、クラシックなRemixコンパイラとは異なる方法でクライアントとサーバーコードを扱います。詳細は[クライアントとサーバーコードの分離][splitting-up-client-and-server-code]のドキュメントをご覧ください。

## 新しいビルド出力パス

Viteが`public`ディレクトリを扱う方法と、既存のRemixコンパイラとは大きな違いがあります。Viteは`public`ディレクトリからファイルをクライアントビルドディレクトリにコピーしますが、Remixコンパイラは`public`ディレクトリを変更せず、別のサブディレクトリ(`public/build`)をクライアントビルドディレクトリとして使っていました。

Remix のデフォルトプロジェクト構造をViteの動作に合わせるため、ビルド出力パスが変更されました。`assetsBuildDirectory`と`serverBuildDirectory`のオプションが廃止され、単一の`buildDirectory`オプションに統一されました。デフォルトでは、サーバーは`build/server`に、クライアントは`build/client`にビルドされます。

これに伴い、以下のデフォルト設定も変更されています:

- [publicPath][public-path]は[Viteの"base"オプション][vite-base]に置き換えられ、デフォルトは`"/"`になりました (以前は`"/build/"`でした)。
- [serverBuildPath][server-build-path]は`serverBuildFile`に置き換えられ、デフォルトは`"index.js"`になりました。このファイルは、設定した`buildDirectory`内のサーバーディレクトリに書き込まれます。

RemixがViteに移行する理由の1つは、Remixを採用する際の学習コストを下げることです。
つまり、追加の bundling 機能を使う場合は、Remix のドキュメントではなく [Viteのドキュメント][vite]と[Viteプラグインコミュニティ][vite-plugins]を参照してください。

Viteには、既存のRemixコンパイラには含まれていない多くの [機能][vite-features]と[プラグイン][vite-plugins]があります。
これらの機能を使う場合は、以降Viteのみを使うことを意図している必要があります。そうでない場合、既存のRemixコンパイラではアプリをコンパイルできなくなります。

## 移行

#### Viteのセットアップ

👉 **Viteを開発依存関係としてインストール**

```shellscript nonumber
npm install -D vite
```

Remixはもはやスタンドアロンのコンパイラではなく、Viteプラグインに過ぎないので、Viteにフックアップする必要があります。

👉 **Remix アプリのルートに `vite.config.ts` を作成し、`remix.config.js` を削除**

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

[サポートされているRemix設定オプション][vite-config]のサブセットは、プラグインに直接渡す必要があります:

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

Viteは HMR やその他の開発機能のためのロバストなクライアントサイドランタイムを提供するので、`<LiveReload />`コンポーネントは不要になりました。Remix Viteプラグインを使って開発する際は、`<Scripts />`コンポーネントがViteのクライアントサイドランタイムやその他の開発用スクリプトを自動的に含むようになります。

👉 **`<LiveReload/>`を削除し、`<Scripts />`を残す**

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

Viteは様々なファイルタイプのインポートを扱いますが、既存のRemixコンパイラとは異なる方法で行う場合があるので、`@remix-run/dev`の古い型ではなく、`vite/client`の型を参照する必要があります。

`vite/client`が提供する型は`@remix-run/dev`に暗黙的に含まれる型と互換性がないため、TypeScript設定で`skipLibCheck`フラグを有効にする必要があります。将来的にViteプラグインがデフォルトのコンパイラになれば、Remixはこのフラグを必要としなくなるでしょう。

👉 **`tsconfig.json`を更新**

`tsconfig.json`の`types`フィールドを更新し、`skipLibCheck`、`module`、`moduleResolution`が適切に設定されていることを確認してください。

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

`remix.env.d.ts`から以下の型宣言を削除します

```shellscript nonumber
rm remix.env.d.ts
```

#### Remix App Serverからの移行

開発時に`remix-serve`を使っていた場合 (または`remix dev`に`-c`フラグをつけていなかった場合)、新しいミニマルなdevサーバーに切り替える必要があります。
これは Remix Viteプラグインに組み込まれており、`remix vite:dev`を実行すると自動的に起動します。

Remix Viteプラグインは[グローバルなNode polyfill][global-node-polyfills]をインストールしないので、`remix-serve`に依存していた場合は自分でインストールする必要があります。これは、Vite設定の冒頭で`installGlobals`を呼び出すのが一番簡単です。

Viteのdevサーバーのデフォルトポートは`remix-serve`とは異なるので、同じポートを維持したい場合は、Viteの`server.port`オプションで設定する必要があります。

また、新しいビルド出力パスに合わせて更新する必要があります。サーバーは`build/server`に、クライアントアセットは`build/client`にビルドされます。

👉 **`dev`、`build`、`start`スクリプトを更新**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **グローバルなNode polyfillをVite設定に追加**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Viteのdevサーバーポートを設定(オプション)**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

#### カスタムサーバーの移行

カスタムサーバーを開発時に使っていた場合、カスタムサーバーを編集して Viteの`connect`ミドルウェアを使う必要があります。
これにより、開発中にアセットリクエストと初期レンダリングリクエストをViteにデリゲートできるので、Viteの優れたDXを活用できます。

その上で、開発時に`"virtual:remix/server-build"`という仮想モジュールをロードして、Viteベースのリクエストハンドラを作成できます。

また、サーバーコードを更新して新しいビルド出力パスを参照する必要がああります。サーバービルドは`build/server`に、クライアントアセットは`build/client`にビルドされます。

Expressを使っていた場合の例は以下の通りです。

👉 **`server.mjs`ファイルを更新**

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

// アセットリクエストを処理
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

// SSRリクエストを処理
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

👉 **`build`、`dev`、`start`スクリプトを更新**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "node ./server.mjs",
    "build": "remix vite:build",
    "start": "cross-env NODE_ENV=production node ./server.mjs"
  }
}
```

TypeScriptでカスタムサーバーを書きたい場合は、[`tsx`][tsx]や[`tsm`][tsm]などのツールを使ってサーバーを実行できます:

```shellscript nonumber
tsx ./server.ts
node --loader tsm ./server.ts
```

ただし、サーバー起動時の初期遅延が若干目立つ可能性があります。

#### Cloudflareファンクションの移行

<docs-warning>

Remix Viteプラグインは、フルスタックアプリケーション向けに設計された[Cloudflare Pages][cloudflare-pages]のみをサポートしています。[Cloudflare Workers Sites][cloudflare-workers-sites]をご利用の場合は、[Cloudflare Pagesへの移行ガイド][cloudflare-pages-migration-guide]をご覧ください。

</docs-warning>

👉 `remix`プラグインの前に`cloudflareDevProxyVitePlugin`を追加して、Viteのdevサーバーのミドルウェアを適切に上書きする!

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

アプリケーションでは、[Remix設定の`server`フィールド][remix-config-server]を使ってCatchallのCloudflareファンクションを生成していた可能性があります。
Viteでは、このような間接的な方法は不要になりました。
代わりに、Express用やその他のカスタムサーバー用と同じように、Cloudflare用の Catchall ルートを直接記述できます。

👉 **Remixの Catchall ルートを作成**

```ts filename=functions/[[page]].ts
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore - the server build file is generated by `remix vite:build`
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
});
```

👉 **バインディングと環境変数は`context.cloudflare.env`から、`context.env`ではなく**

主に開発時にはViteを使いますが、Wranglerでプレビューやデプロイすることもできます。

詳細は、このドキュメントの[_Cloudflare_][cloudflare-vite]セクションをご覧ください。

👉 **`package.json`のスクリプトを更新**

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

#### ビルド出力パスの参照の更新

既存のRemixコンパイラのデフォルトオプションを使っていた場合、サーバーは`build`に、クライアントは`public/build`にビルドされていました。Viteが`public`ディレクトリを扱う方法と、既存のRemixコンパイラとは異なるため、これらの出力パスが変更されました。

👉 **ビルド出力パスの参照を更新**

- サーバーは現在、デフォルトで`build/server`にビルドされます。
- クライアントは現在、デフォルトで`build/client`にビルドされます。

例えば、[Blues Stack][blues-stack]のDockerfileを更新する場合:

```diff filename=Dockerfile
-COPY --from=build /myapp/build /myapp/build
-COPY --from=build /myapp/public /myapp/public
+COPY --from=build /myapp/build/server /myapp/build/server
+COPY --from=build /myapp/build/client /myapp/build/client
```

#### パスエイリアスの設定

Remixコンパイラは、`tsconfig.json`の`paths`オプションを活用してパスエイリアスを解決していました。Remixコミュニティでは、`app`ディレクトリに`~`というエイリアスを定義するのが一般的でした。

Viteはデフォルトではパスエイリアスを提供していません。この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths]プラグインを使ってRemixコンパイラと同様の動作を実現できます:

👉 **`vite-tsconfig-paths`をインストール**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite設定に`vite-tsconfig-paths`を追加**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

#### `@remix-run/css-bundle`の削除

Viteには、CSS Side Effect インポート、PostCSS、CSS Modules など、CSS バンドリングの機能が組み込まれています。Remix Viteプラグインは、自動的にバンドルされたCSSをリレバントなルートに適用します。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr>パッケージは、Viteを使う場合は不要になります。なぜなら、その`cssBundleHref`エクスポートは常に`undefined`になるからです。

👉 **`@remix-run/css-bundle`をアンインストール**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref`の参照を削除**

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

ルートの`links`関数が`cssBundleHref`を設定するためだけに使われている場合は、完全に削除できます。

```diff filename=app/root.tsx
- import { cssBundleHref } from "@remix-run/css-bundle";
- import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

- export const links: LinksFunction = () => [
-   ...(cssBundleHref
-     ? [{ rel: "stylesheet", href: cssBundleHref }]
-     : []),
- ];
```

#### `links`で参照されるCSSインポートを修正

<docs-info>これは、[CSSバンドリングの他の形式][css-bundling]、例えばCSSモジュール、CSS Side Effect インポート、Vanilla Extract などでは必要ありません。</docs-info>

[`links`関数でCSSを参照している][regular-css]場合、対応するCSSインポートを[Viteの明示的な`?url`インポート構文][vite-url-imports]に更新する必要があります。

👉 **`links`で使われているCSSインポートに`?url`を追加**

<docs-warning>`.css?url`インポートには、Vite v5.1以降が必要です</docs-warning>

```diff
-import styles from "~/styles/dashboard.css";
+import styles from "~/styles/dashboard.css?url";

export const links = () => {
  return [
    { rel: "stylesheet", href: styles }
  ];
}
```

#### TailwindにPostCSSを使って有効化

プロジェクトが [Tailwind CSS][tailwind] を使っている場合、Remix コンパイラでは `tailwind` オプションを有効にするだけで設定が不要でした。
しかし、Viteの場合は明示的にPostCSSの設定ファイルが必要です。

👉 **PostCSSの設定ファイルがない場合は追加し、`tailwindcss`プラグインを含める**

```js filename=postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {},
  },
};
```

プロジェクトにすでにPostCSSの設定ファイルがある場合は、`tailwindcss`プラグインが含まれていない可能性があります。
これは、Remixコンパイラの [`tailwind` 設定オプション][tailwind-config-option]が有効だった場合、自動的に含まれていたためです。

👉 **PostCSSの設定にTailwindプラグインが含まれていない場合は追加**

```js filename=postcss.config.mjs lines=[3]
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

👉 **Tailwind CSS インポートの移行**

[`links`関数でTailwind CSSファイルを参照している][regular-css]場合、[Tailwind CSSインポートステートメントを移行する必要があります][fix-up-css-imports-referenced-in-links]。

#### Vanilla Extractプラグインの追加

[Vanilla Extract][vanilla-extract]を使っている場合は、Viteプラグインを設定する必要があります。

👉 **[Vanilla Extractの公式Viteプラグイン][vanilla-extract-vite-plugin]をインストール**

```shellscript nonumber
npm install -D @vanilla-extract/vite-plugin
```

👉 **Vite設定にVanilla Extractプラグインを追加**

```ts filename=vite.config.ts lines=[2,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix(), vanillaExtractPlugin()],
});
```

#### MDXプラグインの追加

[MDX][mdx]を使っている場合、ViteのプラグインAPI はRollupのプラグインAPI の拡張なので、公式の[MDX Rollupプラグイン][mdx-rollup-plugin]を使うべきです:

👉 **MDX Rollupプラグインをインストール**

```shellscript nonumber
npm install -D @mdx-js/rollup
```

<docs-info>

RemixプラグインはJavaScriptやTypeScriptファイルを処理することを期待しているので、他の言語 (MDXなど) からの変換は先に行う必要があります。
この場合、MDXプラグインをRemixプラグインの前に配置する必要があります。

</docs-info>

👉 **Vite設定にMDX Rollupプラグインを追加**

```ts filename=vite.config.ts lines=[1,6]
import mdx from "@mdx-js/rollup";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [mdx(), remix()],
});
```

##### MDXフロントマターのサポート

Remixコンパイラでは、[MDXでフロントマターを定義][mdx-frontmatter]できました。この機能を使っていた場合、Viteでは[remark-mdx-frontmatter]を使って実現できます。

👉 **必要な[Remark][remark]フロントマタープラグインをインストール**

```shellscript nonumber
npm install -D remark-frontmatter remark-mdx-frontmatter
```

👉 **MDX RollupプラグインにRemarkフロントマタープラグインを渡す**

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

Remixコンパイラでは、フロントマターのエクスポート名は`attributes`でしたが、フロントマタープラグインのデフォルトのエクスポート名は`frontmatter`です。エクスポート名を設定することは可能ですが、代わりにアプリコードを更新して、デフォルトのエクスポート名を使うことをお勧めします。

👉 **MDXファイル内のMDX `attributes` エクスポートを`frontmatter`に変更**

```diff filename=app/posts/first-post.mdx
  ---
  title: Hello, World!
  ---

- # {attributes.title}
+ # {frontmatter.title}
```

👉 **MDX `attributes`エクスポートを`frontmatter`に変更(consumer側)**

```diff filename=app/routes/posts/first-post.tsx
  import Component, {
-   attributes,
+   frontmatter,
  } from "./posts/first-post.mdx";
```

###### MDXファイルの型定義

👉 **`env.d.ts`にMDX用の型を追加**

```ts filename=env.d.ts lines=[4-8]
/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare module "*.mdx" {
  let MDXComponent: (props: any) => JSX.Element;
  export const frontmatter: any;
  export default MDXComponent;
}
```

###### MDXのフロントマターをルートエクスポートにマッピング

Remixコンパイラでは、フロントマターから`headers`、`meta`、`handle`ルートエクスポートを定義できました。
この Remix 固有の機能は、`remark-mdx-frontmatter`プラグインではサポートされていません。
この機能を使っていた場合は、手動でフロントマターをルートエクスポートにマッピングする必要があります:

👉 **MDXルートでフロントマターをルートエクスポートにマッピング**

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

注意点として、MDXのルートエクスポートを明示的にマッピングすることで、好きな形式のフロントマターを使うことができるようになります。

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

###### MDXファイル名の使用の更新

Remixコンパイラでは、すべてのMDXファイルから`filename`エクスポートが提供されていました。
これは主に、MDXルートのコレクションにリンクする際に使われていました。
この機能を使っていた場合、Viteでは[グローブインポート][glob-imports]を使うと、ファイル名をモジュールにマッピングする便利なデータ構造が得られます。
これにより、個々のMDXファイルをすべて手動でインポートする必要がなくなります。

例えば、`posts`ディレクトリ内のすべてのMDXファイルをインポートするには:

```ts
const posts = import.meta.glob("./posts/*.mdx");
```

これは、以下のように個々にインポートするのと同等です:

```ts
const posts = {
  "./posts/a.mdx": () => import("./posts/a.mdx"),
  "./posts/b.mdx": () => import("./posts/b.mdx"),
  "./posts/c.mdx": () => import("./posts/c.mdx"),
  // etc.
};
```

すぐにMDXファイルをインポートしたい場合は、以下のようにできます:

```ts
const posts = import.meta.glob("./posts/*.mdx", {
  eager: true,
});
```

## デバッグ

`NODE_OPTIONS`環境変数を使ってデバッグセッションを開始できます:

```shellscript nonumber
NODE_OPTIONS="--inspect-brk" npm run dev
```

次に、ブラウザからデバッガーを接続できます。
例えば、Chromeでは `chrome://inspect` を開いたり、開発者ツールのNodeJSアイコンをクリックするとデバッガーに接続できます。

#### vite-plugin-inspect

[`vite-plugin-inspect`][vite-plugin-inspect]は、各Viteプラグインがコードをどのように変換しているか、およびプラグインごとの所要時間を表示してくれます。

## パフォーマンス

Remixには`--profile`フラグがあり、パフォーマンスプロファイリングが可能です。

```shellscript nonumber
remix vite:build --profile
```

`--profile`モードで実行すると、`.cpuprofile`ファイルが生成されます。これをspeedscope.appにアップロードして分析できます。

開発中も、`p + enter`を押してプロファイリングセッションを開始/停止できます。
開発サーバーの起動時にプロファイリングを行いたい場合は、`--profile`フラグを使います:

```shellscript nonumber
remix vite:dev --profile
```

[Viteのパフォーマンスドキュメント][vite-perf]も参考にしてください!

#### バンドル分析

バンドルを視覚化、分析するには、[rollup-plugin-visualizer][rollup-plugin-visualizer]プラグインを使えます:

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    remix(),
    // `emitFile`は Remix が複数のバンドルを構築するため必要
    visualizer({ emitFile: true }),
  ],
});
```

`remix vite:build`を実行すると、各バンドルに`stats.html`ファイルが生成されます:

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

`stats.html`をブラウザで開いて、バンドルの分析ができます。

## トラブルシューティング

[デバッグ][debugging]と[パフォーマンス][performance]のセクションで、一般的なトラブルシューティングのヒントを確認してください。
また、[githubのRemix Viteプラグインの既知の問題][issues-vite]で、同様の問題が報告されていないかチェックしてください。

#### HMR

ホットアップデートを期待しているのにフルページリロードが発生する場合は、[ホットモジュール置換に関する議論][hmr]を確認し、一般的な問題への対処方法を学んでください。

#### ESM / CJS

ViteはESMとCJSの両方のディペンデンシーをサポートしますが、時々ESM/CJSの相互運用性の問題に遭遇することがあります。
通常、これはディペンデンシーがESMをうまくサポートしていないためです。
そしてそれは非常に難しい問題なので、私たちも彼らを非難するつもりはありません[ESMとCJSの両立は本当に難しい][modernizing-packages-to-esm]。

例の不具合を修正する方法の詳細については、[🎥 How to Fix CJS/ESM Bugs in Remix][how-fix-cjs-esm]をご覧ください。

ディペンデンシーが正しく設定されていないかどうかを診断するには、[publint][publint]や[_Are The Types Wrong_][arethetypeswrong]を使ってください。
さらに、[Viteの`ssr.noExternal`オプション][ssr-no-external]を使って、Remixコンパイラの [`serverDependenciesToBundle`][server-dependencies-to-bundle]と同様の動作をEmulateするこ
ともできます。

#### 開発中にブラウザにサーバーコードのエラーが表示される

開発中にブラウザのコンソールにサーバーコードに関するエラーが表示される場合は、[明示的にサーバー専用コードを分離][explicitly-isolate-server-only-code]する必要があります。
例えば、以下のようなエラーが表示された場合:

```shellscript
Uncaught ReferenceError: process is not defined
```

`process`などのサーバー専用のグローバル変数を使っているモジュールを特定し、[別の`.server`モジュールや`vite-env-only`を使って隔離][explicitly-isolate-server-only-code]する必要があります。
Viteはロールアップを使ってコードをツリーシェイクするので、これらのエラーは開発中にのみ発生します。

#### 他のViteベースのツールでのプラグインの使用 (Vitest、Storybookなど)

Remix Viteプラグインは、アプリケーションの開発サーバーと本番ビルドでのみ使用することを意図しています。
一方、Vitest やStorybookなどの他のViteベースのツールもVite設定ファイルを使用しますが、Remix Viteプラグインはこれらのツールと連携するように設計されていません。
現時点では、他のViteベースのツールと併用する際は、プラグインを除外することをお勧めします。

Vitest の場合:

```ts filename=vite.config.ts lines=[5]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";

export default defineConfig({
  plugins: [!process.env.VITEST && remix()],
  test: {
    environment: "happy-dom",
    // 加えて、vitest実行時に ".env.test" を読み込む
    env: loadEnv("test", process.cwd(), ""),
  },
});
```

Storybookの場合:

```ts filename=vite.config.ts lines=[7]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

const isStorybook = process.argv[1]?.includes("storybook");

export default defineConfig({
  plugins: [!isStorybook && remix()],
});
```

または、ツールごとに別のVite設定ファイルを使うこともできます。
Remixに特化したVite設定ファイルを使う例:

```shellscript nonumber
remix vite:dev --config vite.config.remix.ts
```

Remix Viteプラグインを提供しない場合は、[Vite Plugin React][vite-plugin-react]を自分で提供する必要がある


#### ドキュメントがリマウントされるときにスタイルが消える問題

Remix では、ドキュメント全体をReactで描画しています。この際、`head`要素に動的に要素が挿入されると問題が発生する可能性があります。ドキュメントが再マウントされると、既存の`head`要素が削除され新しいものに置き換わるため、Viteが開発中に注入した`style`要素が削除されてしまうのです。

これは Reactの既知の問題で、[canary版][react-canaries]で修正されています。リスクを理解した上で、特定の[Reactバージョン][react-versions]にピンポイントでアプリを固定し、[パッケージのオーバーライド][package-overrides]を使ってプロジェクト全体で同じバージョンのReactを使うことができます。例:

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

<docs-info>参考までに、Next.jsはこの方法を内部的に採用しているので、一般的によく使われる手法です。Remixではデフォルトで提供されていませんが、これを使う選択肢はあります。</docs-info>

この Viteによって開発中に注入されたスタイルの問題は、本番ビルドでは発生しません。なぜなら、静的なCSSファイルが生成されるからです。

Remixでは、[ルートコンポーネントのデフォルトエクスポート][route-component]と、そのErrorBoundaryやHydrateFallbackエクスポートの間で描画が切り替わると、新しいドキュメントレベルのコンポーネントがマウントされるため、この問題が表面化する可能性があります。

hydrationエラーも同様の問題を引き起こす可能性があります。hydrationエラーはアプリのコードが原因である場合もありますし、ブラウザ拡張機能によってドキュメントが書き換えられることが原因になることもあります。

これがViteに関連するのは、開発時にViteがCSSインポートをJSファイルに変換し、それらを副作用としてドキュメントにインジェクションしているためです。これにより、遅延読み込みやCSSファイルのHMRをサポートしています。

例えば、アプリに以下のようなCSSファイルがあるとします:

<!-- prettier-ignore -->
```css filename=app/styles.css
* { margin: 0 }
```

開発時、このCSSファイルは以下のようなJavaScriptコードに変換されます:

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

この変換は本番コードには適用されないため、この問題は開発時にのみ発生します。

#### 開発時のWranglerエラー

Cloudflare Pagesを使っている場合、`wrangler pages dev`から以下のようなエラーが発生することがあります:

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

## 謝辞

Viteは素晴らしいプロジェクトで、Viteチームの皆様に感謝しています。
特に、[Matias Capeletto、Arnaud Barré、Bjorn Luのようなメンバー][vite-team]からの指導に感謝します。

RemixコミュニティもすぐにViteサポートを探求してくれ、その貢献に感謝しています:

- [Discussion: Consider using Vite][consider-using-vite]
- [remix-kit][remix-kit]
- [remix-vite][remix-vite]
- [vite-plugin-remix][vite-plugin-remix]

最後に、他のフレームワークがViteサポートをどのように実装したかにも触発されました:

- [Astro][astro]
- [SolidStart][solidstart]
- [SvelteKit][sveltekit]

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
[debugging]: #デバッグ
[performance]: #パフォーマンス
[explicitly-isolate-server-only-code]: #クライアントとサーバーコードの分離
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