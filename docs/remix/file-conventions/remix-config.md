---
title: remix.config.js
hidden: true
---

# remix.config.js

<docs-warning>`remix.config.js` は、[Classic Remix Compiler][classic-remix-compiler] を使用する場合にのみ関連します。[Remix Vite][remix-vite] を使用する場合、このファイルはプロジェクトに存在すべきではありません。代わりに、Remix の設定は、[Vite 設定][vite-config] の Remix プラグインに提供する必要があります。</docs-warning>

このファイルには、いくつかのビルドおよび開発設定オプションがありますが、実際にはサーバー上で実行されません。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  future: {
    /* 有効な future フラグ */
  },
  ignoredRouteFiles: ["**/*.css"],
  publicPath: "/build/",
  routes(defineRoutes) {
    return defineRoutes((route) => {
      route("/somewhere/cool/*", "catchall.tsx");
    });
  },
  serverBuildPath: "build/index.js",
};
```

## appDirectory

`remix.config.js` を基準とした `app` ディレクトリへのパス。デフォルトは `"app"` です。

```js filename=remix.config.js
// デフォルト
exports.appDirectory = "./app";

// カスタム
exports.appDirectory = "./elsewhere";
```

## assetsBuildDirectory

`remix.config.js` を基準としたブラウザビルドへのパス。デフォルトは "public/build" です。静的ホスティングにデプロイする必要があります。

## browserNodeBuiltinsPolyfill

ブラウザビルドに含める Node.js のポリフィル。ポリフィルは [JSPM][jspm] によって提供され、[esbuild-plugins-node-modules-polyfill] を介して設定されます。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  browserNodeBuiltinsPolyfill: {
    modules: {
      buffer: true, // JSPM ポリフィルを提供
      fs: "empty", // 空のポリフィルを提供
    },
    globals: {
      Buffer: true,
    },
  },
};
```

このオプションを使用し、Node.js 以外のサーバープラットフォームをターゲットにする場合は、[`serverNodeBuiltinsPolyfill`][server-node-builtins-polyfill] を介してサーバー用の Node.js ポリフィルを設定することもできます。

## cacheDirectory

開発中に Remix がキャッシュに使用できるディレクトリへのパス。`remix.config.js` を基準とします。デフォルトは `".cache"` です。

## future

`future` 設定を使用すると、[Future Flags][future-flags] を介して将来の破壊的な変更をオプトインできます。利用可能なすべての Future Flags のリストについては、[現在の Future Flags][current-future-flags] セクションを参照してください。

## ignoredRouteFiles

これは、Remix が `app/routes` ディレクトリを読み込む際にファイルと一致させるグロブ（[minimatch][minimatch] を介して）の配列です。ファイルが一致した場合、ルートモジュールとして扱われるのではなく、無視されます。これは、同じ場所に配置したい CSS/テストファイルを無視するのに役立ちます。

## publicPath

末尾にスラッシュが付いたブラウザビルドの URL プレフィックス。デフォルトは `"/build/"` です。これは、ブラウザがアセットを見つけるために使用するパスです。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  publicPath: "/assets/",
};
```

別のドメインから静的アセットを提供したい場合は、絶対パスを指定することもできます。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  publicPath: "https://static.example.com/assets/",
};
```

## postcss

PostCSS 設定ファイルが存在する場合、[PostCSS][postcss] を使用して CSS を処理するかどうか。デフォルトは `true` です。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  postcss: false,
};
```

## routes

`app/routes` のファイルシステム規約を使用してすでに定義されているルートに加えて、カスタムルートを定義するための関数。両方のルートセットがマージされます。

```js filename=remix.config.js
exports.routes = async (defineRoutes) => {
  // 非同期処理が必要な場合は、`defineRoutes` を呼び出す前に実行してください。
  // ネストを設定するために内部で `route` のコールスタックを使用します。

  return defineRoutes((route) => {
    // これの一般的な用途は、キャッチオールルートです。
    // - 最初の引数は、一致させる React Router パスです
    // - 2 番目の引数は、ルートハンドラーの相対ファイル名です
    route("/some/path/*", "catchall.tsx");

    // ルートをネストする場合は、オプションのコールバック引数を使用します
    route("some/:path", "some/route/file.js", () => {
      // - パスは親パスに対する相対パスです
      // - ファイル名は引き続き app ディレクトリに対する相対パスです
      route("relative/path", "some/other/file");
    });
  });
};
```

## server

サーバーのエントリーポイント。ルートディレクトリに対する相対パスで、サーバーのメインモジュールになります。指定した場合、Remix はこのファイルをアプリケーションとともに単一のファイルにコンパイルし、サーバーにデプロイします。このファイルには、`.js` または `.ts` ファイル拡張子を使用できます。

## serverBuildPath

`remix.config.js` を基準としたサーバービルドファイルへのパス。このファイルは `.js` 拡張子で終わり、サーバーにデプロイする必要があります。デフォルトは `"build/index.js"` です。

## serverConditions

サーバー依存関係の `package.json` の `exports` フィールドを解決する際に使用する条件の順序。

## serverDependenciesToBundle

モジュールがトランスパイルされ、サーバーバンドルに含まれるかどうかを決定する正規表現パターンのリスト。これは、CJS ビルドで ESM のみのパッケージを使用する場合、または [CSS サイドエフェクトインポート][css_side_effect_imports] を持つパッケージを使用する場合に役立ちます。

たとえば、`unified` エコシステムはすべて ESM のみです。また、`@sindresorhus/slugify` も ESM のみを使用しているとしましょう。動的インポートを使用せずに、CJS アプリでこれらのパッケージを使用する方法を次に示します。

```js filename=remix.config.js lines=[8-13]
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildPath: "build/index.js",
  ignoredRouteFiles: ["**/*.css"],
  serverDependenciesToBundle: [
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    "@sindresorhus/slugify",
  ],
};
```

すべてのサーバー依存関係をバンドルする場合は、`serverDependenciesToBundle` を `"all"` に設定できます。

## serverMainFields

サーバー依存関係を解決する際に使用するメインフィールドの順序。`serverModuleFormat` が `"cjs"` に設定されている場合は、デフォルトで `["main", "module"]` になります。`serverModuleFormat` が `"esm"` に設定されている場合は、デフォルトで `["module", "main"]` になります。

## serverMinify

本番環境でサーバービルドを縮小するかどうか。デフォルトは `false` です。

## serverModuleFormat

サーバービルドの出力形式。`"cjs"` または `"esm"` のいずれかになります。デフォルトは `"esm"` です。

## serverNodeBuiltinsPolyfill

Node.js 以外のサーバープラットフォームをターゲットにする場合に、サーバービルドに含める Node.js のポリフィル。ポリフィルは [JSPM][jspm] によって提供され、[esbuild-plugins-node-modules-polyfill] を介して設定されます。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverNodeBuiltinsPolyfill: {
    modules: {
      buffer: true, // JSPM ポリフィルを提供
      fs: "empty", // 空のポリフィルを提供
    },
    globals: {
      Buffer: true,
    },
  },
};
```

このオプションを使用する場合は、[`browserNodeBuiltinsPolyfill`][browser-node-builtins-polyfill] を介してブラウザ用の Node.js ポリフィルを設定することもできます。

## serverPlatform

サーバービルドがターゲットとするプラットフォーム。`"neutral"` または `"node"` のいずれかになります。デフォルトは `"node"` です。

## tailwind

`tailwindcss` がインストールされている場合、CSS ファイルで [Tailwind 関数とディレクティブ][tailwind_functions_and_directives] をサポートするかどうか。デフォルトは `true` です。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  tailwind: false,
};
```

## watchPaths

[remix dev][remix_dev] の実行中に監視する、プロジェクトルートに対する相対パスのカスタムディレクトリを定義する配列、文字列、または非同期関数。これらのディレクトリは、[`appDirectory`][app_directory] に加えて監視されます。

```js filename=remix.config.js
exports.watchPaths = async () => {
  return ["./some/path/*"];
};

// これも有効
exports.watchPaths = ["./some/path/*"];
```

## ファイル名の規約

Remix が使用するいくつかの規約を認識しておく必要があります。

<docs-info>[Dilum Sanjaya][dilum_sanjaya] が、ファイルシステムのルートがアプリの URL にどのようにマッピングされるかを示す [素晴らしい視覚化][an_awesome_visualization] を作成しました。これらの規約を理解するのに役立つかもしれません。</docs-info>

[minimatch]: https://npm.im/minimatch
[dilum_sanjaya]: https://twitter.com/DilumSanjaya
[an_awesome_visualization]: https://interactive-remix-routing-v2.netlify.app
[remix_dev]: ../other-api/dev#remix-dev
[app_directory]: #appdirectory
[css_side_effect_imports]: ../styling/css-imports
[postcss]: https://postcss.org
[tailwind_functions_and_directives]: https://tailwindcss.com/docs/functions-and-directives
[jspm]: https://github.com/jspm/jspm-core
[esbuild-plugins-node-modules-polyfill]: https://npm.im/esbuild-plugins-node-modules-polyfill
[browser-node-builtins-polyfill]: #browsernodebuiltinspolyfill
[server-node-builtins-polyfill]: #servernodebuiltinspolyfill
[future-flags]: ../start/future-flags
[current-future-flags]: ../start/future-flags#current-future-flags
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-config]: ./vite-config
