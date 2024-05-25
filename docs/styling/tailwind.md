---
title: Tailwind
---

# Tailwind

<docs-warning>このドキュメントは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用している場合にのみ関連します。 [Remix Vite][remix-vite] を使用している場合は、 [Vite の組み込み PostCSS サポート][vite-postcss] を使用して Tailwind を統合できます。</docs-warning>

おそらく、コミュニティで Remix アプリケーションをスタイリングするための最も一般的な方法は、[Tailwind CSS][tailwind] を使用することです。

Remix は、`tailwind.config.js` がプロジェクトのルートにある場合、自動的に Tailwind をサポートします。 [Remix Config][remix_config] で無効にすることができます。

Tailwind は、開発者のエルゴノミクスのためのインラインスタイルの共存の利点があり、Remix がインポートする CSS ファイルを生成できます。生成された CSS ファイルは、通常、大規模なアプリケーションであっても、妥当なサイズに抑えられます。そのファイルを `app/root.tsx` のリンクにロードして、それだけです。

CSS について何も意見がない場合は、これは素晴らしいアプローチです。

Tailwind を使用するには、まず開発依存関係としてインストールします。

```shellscript nonumber
npm install -D tailwindcss
```

次に、構成ファイルを初期化します。

```shellscript nonumber
npx tailwindcss init --ts
```

これで、どのファイルからクラスを生成するかを伝えることができます。

```ts filename=tailwind.config.ts lines=[4]
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
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

この設定が整っていれば、 [Tailwind の関数とディレクティブ][tailwind-functions-and-directives] を CSS のどこにでも使用できます。Tailwind は、これまで使用したことがない場合、ソースファイルにユーティリティクラスが検出されなかったことを警告します。

Tailwind はデフォルトで古いブラウザ用の CSS をコンパイルしないため、 [Autoprefixer][autoprefixer] などの PostCSS ベースのツールを使用してこれを実現したい場合は、Remix の [組み込み PostCSS サポート][built-in-post-css-support] を活用する必要があります。PostCSS と Tailwind の両方を使用する場合、Tailwind プラグインは存在しない場合に自動的に含まれますが、必要に応じて PostCSS 構成に Tailwind プラグインを手動で含めることもできます。

VS Code を使用している場合は、 [Tailwind IntelliSense 拡張機能][tailwind-intelli-sense-extension] をインストールして、最高の開発エクスペリエンスを実現することをお勧めします。

## Tailwind の `@import` 構文を避ける

Tailwind の `@import` 構文（例：`@import 'tailwindcss/base'`) は、Tailwind ディレクティブ（例：`@tailwind base`）を優先して避けることをお勧めします。

Tailwind は、インポートステートメントをインライン CSS で置き換えますが、これにより、スタイルとインポートステートメントが混在する可能性があります。これは、すべてのインポートステートメントをファイルの先頭に記述する必要があるという制限と矛盾します。

あるいは、 [PostCSS][built-in-post-css-support] と [postcss-import] プラグインを使用して、esbuild に渡す前にインポートを処理することができます。

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


