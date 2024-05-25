---
title: vite.config.ts
---

# vite.config.ts

<docs-warning>[従来のRemixコンパイラ][classic-remix-compiler]をプロジェクトで使用している場合は、代わりに[remix.config.jsのドキュメント][remix-config]を参照してください。</docs-warning>

Remixは[Vite]を使用してアプリケーションをコンパイルします。Remix Viteプラグインを含むVite設定ファイルを提供する必要があります。以下は、必要な最小限の設定です。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

<docs-info>Viteは設定に`.js`ファイルの使用をサポートしていますが、TypeScriptを使用することをお勧めします。これにより、設定の有効性を確認できます。</docs-info>

## Remix Viteプラグインの設定

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

プロジェクトルートを基準とした`app`ディレクトリのパス。デフォルトは `"app"` です。

#### future

`future`設定を使用すると、[将来のフラグ][future-flags]を使用して将来の破壊的な変更をオプトインできます。すべての利用可能な将来のフラグのリストについては、[現在の将来のフラグ][current-future-flags]セクションを参照してください。

#### ignoredRouteFiles

これは、Remixが`app/routes`ディレクトリを読み取るときにファイルを一致させるための、[minimatch][minimatch]を使用したグロブの配列です。ファイルが一致した場合、ルートモジュールとして扱われるのではなく、無視されます。これは、共存させたいCSS/テストファイルを無視する場合に便利です。

#### routes

`app/routes`内のファイルシステム規則を使用して既に定義されているものに加えて、カスタムルートを定義するための関数です。両方のルートセットがマージされます。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      routes: async (defineRoutes) => {
        // 非同期作業を実行する必要がある場合は、`defineRoutes`を呼び出す前に実行します。
        // 内部の`route`のコールスタックを使用して、ネストを設定します。

        return defineRoutes((route) => {
          // これは、キャッチオールルートの一般的な使用例です。
          // - 最初の引数は、一致させるReact Routerのパスです。
          // - 2番目は、ルートハンドラの相対的なファイル名です。
          route("/some/path/*", "catchall.tsx");

          // ルートをネストする場合は、オプションのコールバック引数を使用します。
          route("some/:path", "some/route/file.js", () => {
            // - pathは親パスに対する相対パスです。
            // - ファイル名は、appディレクトリに対する相対パスです。
            route("relative/path", "some/other/file");
          });
        });
      },
    }),
  ],
});
```

#### serverModuleFormat

サーバービルドの出力形式。`"cjs"`または`"esm"`のいずれかになります。デフォルトは `"esm"` です。

#### buildDirectory

プロジェクトルートを基準としたビルドディレクトリのパス。デフォルトは `"build"` です。

#### basename

ルートパスのオプションのベース名。[React Routerの"basename"オプション][rr-basename]に渡されます。これは、_アセット_パスのとは異なります。[Viteの"base"オプション][vite-base]を使用して、[ベースパブリックパス][vite-public-base-path]をアセットに設定できます。

#### buildEnd

完全なRemixビルドが完了した後に呼び出される関数です。

#### manifest

`.remix/manifest.json`ファイルをビルドディレクトリに書き込むかどうか。デフォルトは `false` です。

#### presets

他のツールやホスティングプロバイダーとの統合を容易にするための[プリセット]の配列です。

#### serverBuildFile

サーバービルドディレクトリに生成されるサーバーファイルの名前。デフォルトは `"index.js"` です。

#### serverBundles

[サーバーバンドル][server-bundles]にアドレス可能なルートを割り当てるための関数です。

サーバーバンドルが有効になっている場合は、`manifest`オプションも有効にする必要があります。これには、ルートとサーバーバンドル間のマッピングが含まれます。

[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-config]: ./remix-config
[vite]: https://vitejs.dev
[future-flags]: ../start/future-flags
[minimatch]: https://npm.im/minimatch
[presets]: ../guides/presets
[server-bundles]: ../guides/server-bundles
[rr-basename]: https://reactrouter.com/routers/create-browser-router#basename
[vite-public-base-path]: https://vitejs.dev/config/shared-options.html#base
[vite-base]: https://vitejs.dev/config/shared-options.html#base
[current-future-flags]: ../start/future-flags#current-future-flags


