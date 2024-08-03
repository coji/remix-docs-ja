---
title: Tailwind
---

# Tailwind

<docs-warning>このドキュメントは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連します。[Remix Vite][remix-vite] を使用している場合は、[Vite の組み込み PostCSS サポート][vite-postcss] を使用して Tailwind を統合できます。</docs-warning>

コミュニティにおいて、Remix アプリケーションをスタイリングする最も一般的な方法はおそらく、[Tailwind CSS][tailwind] を使用することでしょう。

Remix は、`tailwind.config.js` がプロジェクトのルートに存在する場合、自動的に Tailwind をサポートします。[Remix 設定][remix_config] で無効にすることができます。

Tailwind は、開発者の利便性のためにインラインスタイルの配置という利点を持ち、Remix がインポートする CSS ファイルを生成できます。生成された CSS ファイルは、大規模なアプリケーションであっても、通常は妥当なサイズに収まります。そのファイルを `app/root.tsx` のリンクにロードして、完了です。

CSS の好みがなければ、これは素晴らしいアプローチです。

Tailwind を使用するには、まず開発依存関係としてインストールします。

```shellscript nonumber
npm install -D tailwindcss
```

次に、設定ファイルを初期化します。

```shellscript nonumber
npx tailwindcss init --ts
```

これで、どのファイルをクラスの生成元にするかを伝えることができます。

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
import type { LinksFunction } from "@remix-run/node"; // または cloudflare/deno

// ...

import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];
```

この設定が整っていれば、[Tailwind の関数とディレクティブ][tailwind-functions-and-directives] を CSS のどこでも使用できます。Tailwind は、以前に Tailwind を使用したことがない場合、ソースファイルでユーティリティクラスが検出されなかったことを警告します。

Tailwind はデフォルトで古いブラウザ用の CSS をコンパイルしないため、[Autoprefixer][autoprefixer] などの PostCSS ベースのツールを使用してこれを実現したい場合は、Remix の [組み込み PostCSS サポート][built-in-post-css-support] を活用する必要があります。PostCSS と Tailwind の両方を使用する場合、Tailwind プラグインは不足している場合に自動的に含まれますが、必要に応じて PostCSS 設定に Tailwind プラグインを手動で含めることもできます。

VS Code を使用している場合は、最高の開発者エクスペリエンスを得るために、[Tailwind IntelliSense 拡張機能][tailwind-intelli-sense-extension] をインストールすることをお勧めします。

## Tailwind の `@import` 構文の回避

Tailwind の `@import` 構文（例：`@import 'tailwindcss/base'`) は、Tailwind ディレクティブ（例：`@tailwind base`）を使用することをお勧めします。

Tailwind はインポートステートメントをインライン CSS に置き換えますが、これによりスタイルとインポートステートメントが入り乱れる可能性があります。これは、すべてのインポートステートメントがファイルの先頭に存在しなければならないという制限と矛盾します。

代わりに、[PostCSS][built-in-post-css-support] と [postcss-import] プラグインを使用して、esbuild に渡す前にインポートを処理できます。

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



