---
title: CSSバンドル
---

# CSSバンドル

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler]を使用している場合にのみ関連します。[Remix Vite][remix-vite]を使用している場合は、代わりに[ViteのCSSドキュメント][vite-css]を参照する必要があります。</docs-warning>

Remixの一部のCSS機能では、スタイルを単一のファイルにバンドルし、アプリケーションに手動でロードします。これには以下が含まれます。

- [CSS副作用インポート][css-side-effect-imports]
- [CSSモジュール][css-modules]
- [Vanilla Extract][vanilla-extract]

[通常のスタイルシートインポート][regular-stylesheet-imports]は、個別のファイルとして残ることに注意してください。

## 使用方法

Remixは、ページ上のlinkタグを制御できるように、CSSバンドルをページに自動的に挿入しません。

CSSバンドルにアクセスするには、まず`@remix-run/css-bundle`パッケージをインストールします。

```shellscript nonumber
npm install @remix-run/css-bundle
```

次に、`cssBundleHref`をインポートし、link記述子に追加します。これは、アプリケーション全体に適用されるように、`app/root.tsx`で行うのが最も適切です。

```tsx filename=app/root.tsx
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

export const links: LinksFunction = () => [
  ...(cssBundleHref
    ? [{ rel: "stylesheet", href: cssBundleHref }]
    : []),
  // ...
];
```

このlinkタグがページに挿入されると、Remixに組み込まれているさまざまなCSSバンドル機能を使用する準備が整います。

## 制限事項

[`esbuild`のCSSツリーシェイキングに関する問題][esbuild-css-tree-shaking-issue]のため、`export *`の使用は避けてください。

[esbuild-css-tree-shaking-issue]: https://github.com/evanw/esbuild/issues/1370
[css-side-effect-imports]: ./css-imports
[css-modules]: ./css-modules
[vanilla-extract]: ./vanilla-extract
[regular-stylesheet-imports]: ./css
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-css]: https://vitejs.dev/guide/features#css

