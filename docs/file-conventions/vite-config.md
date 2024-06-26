---
title: vite.config.ts
---

# vite.config.ts

<docs-warning>[従来のRemixコンパイラ][classic-remix-compiler] をまだ使用している場合は、代わりに[remix.config.jsドキュメント][remix-config] を参照してください。</docs-warning>

Remixは[Vite]を使用してアプリケーションをコンパイルします。 Remix Viteプラグインを使用して、Vite設定ファイルを提供する必要があります。 以下は、必要な最小限の設定です。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

<docs-info>Viteは、設定ファイルに `.js` ファイルを使用することをサポートしていますが、TypeScriptを使用することをお勧めします。 これにより、設定の妥当性を確認できます。</docs-info>

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
        /* any enabled future flags */
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

プロジェクトルートを基準とした、`app`ディレクトリへのパス。 デフォルトは`"app"`です。

#### future

`future` 設定を使用すると、[将来の機能フラグ][future-flags] を介して、将来の破壊的な変更をオプトインできます。

#### ignoredRouteFiles

これは、Remixが `app/routes` ディレクトリを読み取るときに、ファイルに一致させるためのグロブ（[minimatch][minimatch]を使用）の配列です。 ファイルが一致した場合、ルートモジュールとして扱われるのではなく、無視されます。 これは、共存させたいCSS/テストファイルを無視する場合に役立ちます。

#### routes

`app/routes` にあるファイルシステムの規約を使用して定義されたルートに加えて、カスタムルートを定義するための関数。 両方のルートセットがマージされます。

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      routes: async (defineRoutes) => {
        // 非同期処理が必要な場合は、`defineRoutes` を呼び出す前に実行します。
        // 内部で `route` のコールスタックを使用してネストを設定します。

        return defineRoutes((route) => {
          // これは、catchallルートの一般的な使用方法です。
          // - 最初の引数は、一致させるReact Routerのパスです。
          // - 2番目は、ルートハンドラの相対的なファイル名です。
          route("/some/path/*", "catchall.tsx");

          // ルートをネストしたい場合は、オプションのコールバック引数を使用します。
          route("some/:path", "some/route/file.js", () => {
            // - pathは、親パスに対する相対パスです。
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

サーバービルドの出力形式。 `"cjs"` または `"esm"` のいずれかです。 デフォルトは `"esm"` です。

#### buildDirectory

プロジェクトルートを基準とした、ビルドディレクトリへのパス。 デフォルトは `"build"` です。

#### basename

ルートパスのオプションのベース名。 [React Routerの"basename"オプション][rr-basename] に渡されます。 これは、_アセット_ パスのベース名とは異なります。 [Viteの"base"オプション][vite-base] を介して、[ベースパブリックパス][vite-public-base-path] を使用して、アセットのパスを設定できます。

#### buildEnd

完全なRemixビルドが完了した後に呼び出される関数。

#### manifest

`.remix/manifest.json` ファイルをビルドディレクトリに書き込むかどうか。 デフォルトは `false` です。

#### presets

他のツールやホスティングプロバイダーとの統合を容易にするための [プリセット] の配列。

#### serverBuildFile

サーバービルドディレクトリに生成されるサーバーファイルの名前。 デフォルトは `"index.js"` です。

#### serverBundles

アドレス可能なルートを[サーバーバンドル][server-bundles] に割り当てるための関数。

サーバーバンドルが有効になっている場合、`manifest` オプションを有効にすることも検討してください。 これは、ルートとサーバーバンドルのマッピングが含まれているためです。

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


