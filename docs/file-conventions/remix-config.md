---
title: remix.config.js
hidden: true
---

# remix.config.js

<docs-warning>`remix.config.js` は、[クラシック Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連します。[Remix Vite][remix-vite] を使用する場合、このファイルはプロジェクトに存在してはなりません。代わりに、Remix の設定は [Vite の設定][vite-config] 内の Remix プラグインに提供する必要があります。</docs-warning>

このファイルには、いくつかのビルドと開発の設定オプションがありますが、実際にサーバー上で実行されることはありません。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  future: {
    /* any enabled future flags */
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

`remix.config.js` に対する相対パスである `app` ディレクトリのパスです。デフォルトは `"app"` です。

```js filename=remix.config.js
// デフォルト
exports.appDirectory = "./app";

// カスタム
exports.appDirectory = "./elsewhere";
```

## assetsBuildDirectory

`remix.config.js` に対する相対パスである、ブラウザビルドのパスです。デフォルトは "public/build" です。静的ホスティングにデプロイする必要があります。

## browserNodeBuiltinsPolyfill

ブラウザビルドに含める Node.js ポリフィルです。ポリフィルは [JSPM][jspm] によって提供され、[esbuild-plugins-node-modules-polyfill] を介して設定されます。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  browserNodeBuiltinsPolyfill: {
    modules: {
      buffer: true, // JSPM ポリフィルを提供する
      fs: "empty", // 空のポリフィルを提供する
    },
    globals: {
      Buffer: true,
    },
  },
};
```

このオプションを使用し、Node.js 以外のサーバープラットフォームをターゲットとする場合、[`serverNodeBuiltinsPolyfill`][server-node-builtins-polyfill] を使用して、サーバーの Node.js ポリフィルも設定する必要がある場合があります。

## cacheDirectory

`remix.config.js` に対する相対パスである、Remix が開発中のキャッシュに使用できるディレクトリのパスです。デフォルトは `".cache"` です。

## future

`future` 設定を使用すると、[将来のフラグ][future-flags] を使用して、将来の破壊的な変更にオプトインできます。利用可能な将来のフラグのリストについては、[現在の将来のフラグ][current-future-flags] セクションをご覧ください。

## ignoredRouteFiles

これは、`app/routes` ディレクトリを読み取るときに、Remix が一致させるグロブ（[minimatch][minimatch] を使用）の配列です。ファイルが一致すると、ルートモジュールとして扱われるのではなく、無視されます。これは、共存させたい CSS/テストファイルを無視する場合に便利です。

## publicPath

末尾にスラッシュが付いた、ブラウザビルドの URL プレフィックスです。デフォルトは `"/build/"` です。これは、ブラウザがアセットを見つけるために使用するパスです。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  publicPath: "/assets/",
};
```

別ドメインから静的アセットを提供する場合、絶対パスを指定することもできます。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  publicPath: "https://static.example.com/assets/",
};
```

## postcss

PostCSS 設定ファイルが存在する場合、[PostCSS][postcss] を使用して CSS を処理するかどうかです。デフォルトは `true` です。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  postcss: false,
};
```

## routes

`app/routes` 内のファイルシステムの慣例を使用してすでに定義されているルートに加えて、カスタムルートを定義するための関数です。両方のルートセットはマージされます。

```js filename=remix.config.js
exports.routes = async (defineRoutes) => {
  // 非同期作業を行う必要がある場合は、`defineRoutes` を呼び出す前に実行してください。ネストを設定するために、`route` 内の呼び出しスタックを使用します。

  return defineRoutes((route) => {
    // これはキャッチオールルートに共通して使用されます。
    // - 最初の引数は、一致させる React Router パスです
    // - 2 番目は、ルートハンドラの相対ファイル名です
    route("/some/path/*", "catchall.tsx");

    // ルートをネストしたい場合は、オプションのコールバック引数を使用します。
    route("some/:path", "some/route/file.js", () => {
      // - パスは親パスに対する相対パスです
      // - ファイル名は、app ディレクトリに対する相対パスです。
      route("relative/path", "some/other/file");
    });
  });
};
```

## server

ルートディレクトリに対する相対パスである、サーバーのエントリポイントで、サーバーのメインモジュールになります。指定した場合、Remix はこのファイルをアプリケーションとともに単一のファイルにコンパイルして、サーバーにデプロイします。このファイルは、`.js` または `.ts` ファイル拡張子を使用できます。

## serverBuildPath

`remix.config.js` に対する相対パスである、サーバービルドファイルのパスです。このファイルは `.js` 拡張子で終わる必要があり、サーバーにデプロイする必要があります。デフォルトは `"build/index.js"` です。

## serverConditions

`package.json` の `exports` フィールドを解決するときに使用する条件の順序です。

## serverDependenciesToBundle

モジュールがトランスパイルされてサーバーバンドルに含まれるかどうかを決定する正規表現パターンのリストです。これは、CJS ビルドで ESM 専用のパッケージを使用する場合、または[CSS サイドエフェクトインポート][css_side_effect_imports] を使用するパッケージを使用する場合に便利です。

たとえば、`unified` エコシステムはすべて ESM 専用です。また、ESM 専用の `@sindresorhus/slugify` も使用しているとしましょう。次に、動的インポートを使用せずに、CJS アプリでこれらのパッケージを使用する方法を示します。

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

サーバー依存関係を解決するときに使用するメインフィールドの順序です。`serverModuleFormat` が `"cjs"` に設定されている場合、デフォルトは `["main", "module"]` です。`serverModuleFormat` が `"esm"` に設定されている場合、デフォルトは `["module", "main"]` です。

## serverMinify

本番環境でサーバービルドを縮小するかどうかです。デフォルトは `false` です。

## serverModuleFormat

サーバービルドの出力形式で、`"cjs"` または `"esm"` のいずれかになります。デフォルトは `"esm"` です。

## serverNodeBuiltinsPolyfill

Node.js 以外のサーバープラットフォームをターゲットとする場合、サーバービルドに含める Node.js ポリフィルです。ポリフィルは [JSPM][jspm] によって提供され、[esbuild-plugins-node-modules-polyfill] を介して設定されます。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverNodeBuiltinsPolyfill: {
    modules: {
      buffer: true, // JSPM ポリフィルを提供する
      fs: "empty", // 空のポリフィルを提供する
    },
    globals: {
      Buffer: true,
    },
  },
};
```

このオプションを使用する場合、[`browserNodeBuiltinsPolyfill`][browser-node-builtins-polyfill] を使用して、ブラウザの Node.js ポリフィルも設定する必要がある場合があります。

## serverPlatform

サーバービルドがターゲットとするプラットフォームで、`"neutral"` または `"node"` のいずれかになります。デフォルトは `"node"` です。

## tailwind

`tailwindcss` がインストールされている場合、CSS ファイルで [Tailwind の関数とディレクティブ][tailwind_functions_and_directives] をサポートするかどうかです。デフォルトは `true` です。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  tailwind: false,
};
```

## watchPaths

[remix dev][remix_dev] を実行しているときに監視するカスタムディレクトリを、プロジェクトルートに対する相対パスで定義する配列、文字列、または非同期関数です。これらのディレクトリは、[`appDirectory`][app_directory] に加えてのものになります。

```js filename=remix.config.js
exports.watchPaths = async () => {
  return ["./some/path/*"];
};

// 有効です
exports.watchPaths = ["./some/path/*"];
```

## ファイル名規則

Remix が使用するいくつかの規則があり、認識しておく必要があります。

<docs-info>[Dilum Sanjaya][dilum_sanjaya] は、ファイルシステム内のルートをアプリの URL にどのようにマッピングするかについての [素晴らしい可視化][an_awesome_visualization] を作成しており、これらの規則を理解するのに役立つ可能性があります。</docs-info>

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

