---
title: vite.config.ts
---

# vite.config.ts

<docs-warning>[従来のRemixコンパイラ][classic-remix-compiler] をまだ使用している場合は、代わりに[remix.config.jsドキュメント][remix-config] を参照してください。</docs-warning>

Remixは、アプリケーションをコンパイルするために[Vite]を使用します。 Remix Viteプラグインを使用して、Vite構成ファイルを提供する必要があります。 必要な最小限の構成を以下に示します。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

<docs-info>Viteは、構成ファイルに`.js`ファイルを使用することをサポートしていますが、構成の有効性を確保するためにTypeScriptを使用することをお勧めします。</docs-info>

## Remix Viteプラグイン構成

```js filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      basename: "/",
      buildDirectory: "build",
      future: {
        /* 有効な将来のフラグ */
      },
      ignoredRouteFiles: ["**/*.css"],
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/somewhere/cool/*", "catchall.tsx");
        });
      },
      serverBuildFile: "index.js",
    }),
  ],
});
```

#### appDirectory

プロジェクトルートに対する`app`ディレクトリのパス。デフォルトは`"app"`です。

#### future

`future`構成を使用すると、[将来のフラグ][future-flags]を介して将来の破壊的な変更をオプトインできます。

#### ignoredRouteFiles

これは、Remixが`app/routes`ディレクトリを読み取るときにファイルに一致させる、[minimatch][minimatch]を介したグロブの配列です。 ファイルが一致した場合、ルートモジュールとして処理されるのではなく、無視されます。 これは、共存させるCSS/テストファイルなどを無視する場合に役立ちます。

#### routes

`app/routes`のファイルシステム規約を使用して定義されているものに加えて、カスタムルートを定義するための関数。両方のルートセットがマージされます。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      routes: async (defineRoutes) => {
        // 非同期処理が必要な場合は、`defineRoutes`を呼び出す前に実行します。ネストを設定するために`route`内の呼び出しスタックを使用します。

        return defineRoutes((route) => {
          // これは、catchallルートの一般的な用途です。
          // - 最初の引数は、React Routerのパスで、照合されます。
          // - 2番目は、ルートハンドラの相対ファイル名です。
          route("/some/path/*", "catchall.tsx");

          // ルートをネストする場合は、オプションのコールバック引数を使用します。
          route("some/:path", "some/route/file.js", () => {
            // - パスは親パスに対する相対パスです
            // - ファイル名は、引き続きappディレクトリに対する相対パスです。
            route("relative/path", "some/other/file");
          });
        });
      },
    }),
  ],
});
```

#### serverModuleFormat

サーバービルドの出力形式。`"cjs"`または`"esm"`のいずれかになります。 デフォルトは`"esm"`です。

#### buildDirectory

プロジェクトルートに対するビルドディレクトリのパス。デフォルトは`"build"`です。

#### basename

ルートパスのオプションのベースネーム。[React Routerの "basename"オプション][rr-basename]に渡されます。 これは、_アセット_パスのとは異なります。 アセットの[ベースパブリックパス][vite-public-base-path]は、[Viteの "base"オプション][vite-base]を使用して構成できます。

#### buildEnd

完全なRemixビルドが完了した後に呼び出される関数。

#### manifest

`.remix/manifest.json`ファイルをビルドディレクトリに書き込むかどうか。デフォルトは`false`です。

#### presets

他のツールやホスティングプロバイダーとの統合を容易にするための[プリセット]の配列。

#### serverBuildFile

サーバービルドディレクトリに生成されるサーバーファイルの名前。デフォルトは`"index.js"`です。

#### serverBundles

[サーバーバンドル][server-bundles]にアドレス可能なルートを割り当てるための関数。

サーバーバンドルが有効になっている場合は、[サーバーバンドル][server-bundles]のマッピングが含まれているため、`manifest`オプションを有効にする必要がある場合もあります。

[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-config]: ./remix-config
[vite]: https://vitejs.dev
[future-flags]: ../start/future-flags
[minimatch]: https://npm.im/minimatch
[presets]: ../guides/presets
[server-bundles]: ../guides/server-bundles
[rr-basename]: https://reactrouter.com/v6/routers/create-browser-router#basename
[vite-public-base-path]: https://vitejs.dev/config/shared-options.html#base
[vite-base]: https://vitejs.dev/config/shared-options.html#base


