---
title: Tailwind
---

# Tailwind

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。[Remix Vite][remix-vite] を使用している場合は、[Vite の組み込み PostCSS サポート][vite-postcss] を使用して Tailwind を統合できます。</docs-warning>

コミュニティで Remix アプリケーションをスタイルする最も一般的な方法は、おそらく [Tailwind CSS][tailwind] を使用することでしょう。

Remix は、プロジェクトのルートに `tailwind.config.js` が存在する場合、自動的に Tailwind をサポートします。[Remix Config][remix_config] で無効にすることができます。

Tailwind には、開発者の人間工学のためのインラインスタイルの配置という利点があり、Remix がインポートするための CSS ファイルを生成できます。生成された CSS ファイルは、大規模なアプリケーションでも一般的に妥当なサイズに収まります。そのファイルを `app/root.tsx` のリンクにロードすれば完了です。

CSS について特に意見がない場合は、これが最適なアプローチです。

Tailwind を使用するには、まず開発依存関係としてインストールします。

```shellscript nonumber
npm install -D tailwindcss
```

次に、設定ファイルを初期化します。

```shellscript nonumber
npx tailwindcss init --ts
```

これで、クラスを生成するファイルを指定できます。

```ts filename=tailwind.config.ts lines=[4]
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

次に、CSS に `@tailwind` ディレクティブを含めます。たとえば、アプリのルートに `tailwind.css` ファイルを作成できます。

```css filename=app/tailwind.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

次に、ルートルートの `links` 関数に `tailwind.css` を追加します。

```tsx filename=app/root.tsx
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

// ...

import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];
```

この設定が完了すると、CSS のどこでも [Tailwind の関数とディレクティブ][tailwind-functions-and-directives] を使用できます。以前に使用したことがない場合、Tailwind はソースファイルでユーティリティクラスが検出されなかったという警告を表示することに注意してください。

Tailwind はデフォルトでは古いブラウザ用の CSS をコンパイルしないため、[Autoprefixer][autoprefixer] のような PostCSS ベースのツールを使用してこれを実現したい場合は、Remix の [組み込み PostCSS サポート][built-in-post-css-support] を活用する必要があります。PostCSS と Tailwind の両方を使用する場合、Tailwind プラグインが欠落している場合は自動的に含まれますが、必要に応じて PostCSS 設定に Tailwind プラグインを手動で含めることもできます。

VS Code を使用している場合は、最高の開発者エクスペリエンスのために [Tailwind IntelliSense 拡張機能][tailwind-intelli-sense-extension] をインストールすることをお勧めします。

## Tailwind の `@import` 構文の回避

Tailwind の `@import` 構文 (例: `@import 'tailwindcss/base'`) は、Tailwind ディレクティブ (例: `@tailwind base`) を優先して避けることをお勧めします。

Tailwind はインポートステートメントをインライン CSS に置き換えますが、これによりスタイルとインポートステートメントがインターリーブされる可能性があります。これは、すべてのインポートステートメントがファイルの先頭にある必要があるという制限と衝突します。

または、[PostCSS][built-in-post-css-support] を [postcss-import] プラグインとともに使用して、esbuild に渡す前にインポートを処理することもできます。

[tailwind]: https://tailwindcss.com
[remix_config]: ../file-conventions/remix-config#tailwind
[tailwind-functions-and-directives]: https://tailwindcss.com/docs/functions-and-directives
[autoprefixer]: https://github.com/postcss/autoprefixer
[built-in-post-css-support]: ./postcss
[tailwind-intelli-sense-extension]: https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss
[postcss-import]: https://github.com/postcss/postcss-import
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-postcss]: https://vitejs.dev/guide/features#postcss

