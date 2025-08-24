---
title: PostCSS
---

# PostCSS

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。[Remix Vite][remix-vite] を使用している場合、[PostCSS のサポートは Vite に組み込まれています][vite-postcss]。</docs-warning>

[PostCSS][postcss] は、古いブラウザ向けの CSS のプレフィックス、将来の CSS 構文のトランスパイル、画像のインライン化、スタイルのリントなどに一般的に使用される、豊富なプラグインエコシステムを備えた人気のあるツールです。PostCSS の設定が検出されると、Remix はプロジェクト内のすべての CSS に対して自動的に PostCSS を実行します。

たとえば、[Autoprefixer][autoprefixer] を使用するには、まず PostCSS プラグインをインストールします。

```shellscript nonumber
npm install -D autoprefixer
```

次に、プラグインを参照する PostCSS 設定ファイルを Remix のルートに追加します。

```js filename=postcss.config.cjs
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};
```

[Vanilla Extract][vanilla-extract] を使用している場合、すでに CSS プリプロセッサの役割を果たしているため、他のスタイルとは異なる PostCSS プラグインのセットを適用したい場合があります。これをサポートするために、PostCSS 設定ファイルから関数をエクスポートできます。この関数には、Remix が Vanilla Extract ファイルを処理しているかどうかを知らせるコンテキストオブジェクトが渡されます。

```js filename=postcss.config.cjs
module.exports = (ctx) => {
  return ctx.remix?.vanillaExtract
    ? {
        // Vanilla Extract スタイル用の PostCSS プラグイン...
      }
    : {
        // その他のスタイル用の PostCSS プラグイン...
      };
};
```

<docs-info>組み込みの PostCSS サポートは、`remix.config.js` で `postcss` オプションを `false` に設定することで無効にできます。</docs-info>

## CSS プリプロセッサ

LESS や SASS などの CSS プリプロセッサを使用できます。これを行うには、これらのファイルを CSS ファイルに変換するための追加のビルドプロセスを実行する必要があります。これは、プリプロセッサによって提供されるコマンドラインツールまたは同等のツールを使用して実行できます。

プリプロセッサによって CSS に変換されると、生成された CSS ファイルは、[ルートモジュールの `links` エクスポート][route-module-links] 関数を介してコンポーネントにインポートしたり、[CSS バンドル][css-bundling] を使用している場合は [副作用インポート][css-side-effect-imports] を介して含めることができます。これは、Remix の他の CSS ファイルと同様です。

CSS プリプロセッサを使用した開発を容易にするために、SASS または LESS ファイルから CSS ファイルを生成する npm スクリプトを `package.json` に追加できます。これらのスクリプトは、Remix アプリケーションを開発するために実行する他の npm スクリプトと並行して実行できます。

SASS を使用した例を次に示します。

1. まず、プリプロセッサが CSS ファイルを生成するために使用するツールをインストールする必要があります。

   ```shellscript nonumber
   npm add -D sass
   ```

2. インストールしたツールを使用して CSS ファイルを生成する npm スクリプトを `package.json` の `scripts` セクションに追加します。

   ```jsonc filename=package.json
   {
     // ...
     "scripts": {
       // ...
       "sass": "sass --watch app/:app/"
     }
     // ...
   }
   ```

   上記の例では、SASS ファイルが `app` フォルダのどこかに保存されることを前提としています。

   上記に含まれる `--watch` フラグは、`sass` をアクティブなプロセスとして実行し続け、変更または新しい SASS ファイルをリッスンします。ソースファイルが変更されると、`sass` は CSS ファイルを自動的に再生成します。生成された CSS ファイルは、ソースファイルと同じ場所に保存されます。

3. npm スクリプトを実行します。

   ```shellscript nonumber
   npm run sass
   ```

   これにより、`sass` プロセスが開始されます。新しい SASS ファイル、または既存の SASS ファイルへの変更は、実行中のプロセスによって検出されます。

   CSS ファイルを生成し、`remix dev` も実行するために、2 つのターミナルタブを必要としないように、`concurrently` のようなものを使用するとよいでしょう。

   ```shellscript nonumber
   npm add -D concurrently
   ```

   ```json filename=package.json
   {
     "scripts": {
       "dev": "concurrently \"npm run sass\" \"remix dev\""
     }
   }
   ```

   `npm run dev` を実行すると、指定されたコマンドが単一のターミナルウィンドウで並行して実行されます。

[postcss]: https://postcss.org
[autoprefixer]: https://github.com/postcss/autoprefixer
[vanilla-extract]: ./vanilla-extract
[route-module-links]: ../route/links
[css-side-effect-imports]: ./css-imports
[css-bundling]: ./bundling
[postcss-preset-env]: https://preset-env.cssdb.org
[esbuild-css-tree-shaking-issue]: https://github.com/evanw/esbuild/issues/1370
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-postcss]: https://vitejs.dev/guide/features#postcss
