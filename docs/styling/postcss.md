---
title: PostCSS
---

# PostCSS

<docs-warning>このドキュメントは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連します。[Remix Vite][remix-vite] を使用している場合は、[PostCSS は Vite に組み込まれています][vite-postcss]。</docs-warning>

[PostCSS][postcss] は、豊富なプラグインエコシステムを備えた人気のあるツールであり、古いブラウザ向けに CSS にプレフィックスを追加したり、将来の CSS 構文を変換したり、画像をインライン化したり、スタイルをリンティングしたりなど、さまざまな用途で使用されます。PostCSS の設定が検出されると、Remix はプロジェクト内のすべての CSS に対して PostCSS を自動的に実行します。

たとえば、[Autoprefixer][autoprefixer] を使用するには、最初に PostCSS プラグインをインストールします。

```shellscript nonumber
npm install -D autoprefixer
```

次に、プラグインを参照する Remix ルートに PostCSS 設定ファイルを追加します。

```js filename=postcss.config.cjs
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};
```

[Vanilla Extract][vanilla-extract] を使用している場合は、すでに CSS プリプロセッサの役割を果たしているため、他のスタイルとは異なる PostCSS プラグインのセットを適用したい場合があります。これをサポートするために、PostCSS 設定ファイルから、Remix が Vanilla Extract ファイルを処理しているかどうかを知らせるコンテキストオブジェクトが渡される関数をエクスポートできます。

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

<docs-info>`remix.config.js` の `postcss` オプションを `false` に設定することで、組み込みの PostCSS サポートを無効にすることができます。</docs-info>

## CSS プリプロセッサ

LESS や SASS などの CSS プリプロセッサを使用できます。これを行うには、これらのファイルを CSS ファイルに変換するための追加のビルドプロセスを実行する必要があります。これは、プリプロセッサによって提供されるコマンドラインツールまたは同等のツールを使用して実行できます。

プリプロセッサによって CSS に変換されると、生成された CSS ファイルは、[ルートモジュール `links` エクスポート][route-module-links] 関数を通じてコンポーネントにインポートするか、[CSS 束ね込み][css-bundling] を使用する場合、[副作用インポート][css-side-effect-imports] を介して、Remix の他の CSS ファイルと同様に含めることができます。

CSS プリプロセッサでの開発を容易にするために、SASS や LESS ファイルから CSS ファイルを生成する npm スクリプトを `package.json` に追加できます。これらのスクリプトは、Remix アプリケーションの開発のために実行する他の npm スクリプトと並行して実行できます。

SASS を使用した例を次に示します。

1. まず、プリプロセスで使用されるツールをインストールして CSS ファイルを生成する必要があります。

   ```shellscript nonumber
   npm add -D sass
   ```

2. `package.json` の `scripts` セクションに、インストールされたツールを使用して CSS ファイルを生成する npm スクリプトを追加します。

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

   上記の例では、SASS ファイルは `app` フォルダーのどこかに格納されると想定しています。

   上記に含まれている `--watch` フラグは、`sass` をアクティブなプロセスとして実行し、SASS ファイルの変更または新しい SASS ファイルを監視します。ソースファイルが変更されると、`sass` は CSS ファイルを自動的に再生成します。生成された CSS ファイルは、ソースファイルと同じ場所に格納されます。

3. npm スクリプトを実行します。

   ```shellscript nonumber
   npm run sass
   ```

   これにより、`sass` プロセスが開始されます。新しい SASS ファイル、または既存の SASS ファイルへの変更は、実行中のプロセスによって検出されます。

   2 つのターミナルタブで CSS ファイルを生成し、`remix dev` を実行する必要がないように、`concurrently` のようなものを使用したい場合があります。

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
