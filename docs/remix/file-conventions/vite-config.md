---
title: vite.config.ts
---

# vite.config.ts

<docs-warning>もしあなたのプロジェクトがまだ[従来のRemixコンパイラ][classic-remix-compiler]を使用している場合は、代わりに[remix.config.jsのドキュメント][remix-config]を参照する必要があります。</docs-warning>

Remixはアプリケーションをコンパイルするために[Vite]を使用します。Remix Viteプラグインを含むVite設定ファイルを提供する必要があります。以下は、必要な最小限の設定です。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

<docs-info>Viteは設定に`.js`ファイルを使用することをサポートしていますが、設定が有効であることを確認するためにTypeScriptを使用することをお勧めします。</docs-info>

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
        /* 有効にする将来のフラグ */
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

プロジェクトルートからの相対パスで、`app`ディレクトリへのパスです。デフォルトは`"app"`です。

#### future

`future`設定では、[将来のフラグ][future-flags]を介して将来の破壊的な変更をオプトインできます。

#### ignoredRouteFiles

これは、Remixが`app/routes`ディレクトリを読み込む際にファイルと照合するグロブ（[minimatch][minimatch]経由）の配列です。ファイルが一致した場合、ルートモジュールとして扱われるのではなく、無視されます。これは、同じ場所に配置したいCSS/テストファイルを無視するのに役立ちます。

#### routes

`app/routes`のファイルシステム規約を使用してすでに定義されているルートに加えて、カスタムルートを定義するための関数です。両方のルートセットがマージされます。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      routes: async (defineRoutes) => {
        // 非同期処理が必要な場合は、`defineRoutes`を呼び出す前に実行してください。
        // ネストを設定するために内部で`route`のコールスタックを使用します。

        return defineRoutes((route) => {
          // これの一般的な用途はキャッチオールルートです。
          // - 最初の引数は、照合するReact Routerパスです
          // - 2番目は、ルートハンドラーの相対ファイル名です
          route("/some/path/*", "catchall.tsx");

          // ルートをネストしたい場合は、オプションのコールバック引数を使用します
          route("some/:path", "some/route/file.js", () => {
            // - パスは親パスからの相対パスです
            // - ファイル名は依然としてappディレクトリからの相対パスです
            route("relative/path", "some/other/file");
          });
        });
      },
    }),
  ],
});
```

#### serverModuleFormat

サーバービルドの出力形式で、`"cjs"`または`"esm"`のいずれかになります。デフォルトは`"esm"`です。

#### buildDirectory

プロジェクトルートからの相対パスで、ビルドディレクトリへのパスです。デフォルトは`"build"`です。

#### basename

ルートパスのオプションのベース名で、[React Routerの"basename"オプション][rr-basename]に渡されます。これは、_アセット_パスとは異なることに注意してください。アセットの[ベースパブリックパス][vite-public-base-path]は、[Viteの"base"オプション][vite-base]を介して設定できます。

#### buildEnd

Remixのフルビルドが完了した後に呼び出される関数です。

#### manifest

`.remix/manifest.json`ファイルをビルドディレクトリに書き込むかどうか。デフォルトは`false`です。

#### presets

他のツールやホスティングプロバイダーとの統合を容易にするための[プリセット]の配列です。

#### serverBuildFile

サーバービルドディレクトリに生成されるサーバーファイルの名前です。デフォルトは`"index.js"`です。

#### serverBundles

[サーバーバンドル][server-bundles]にアドレス可能なルートを割り当てるための関数です。

また、サーバーバンドルが有効になっている場合、ルートとサーバーバンドル間のマッピングが含まれるため、`manifest`オプションを有効にすることもできます。

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
