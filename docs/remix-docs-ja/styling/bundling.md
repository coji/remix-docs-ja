---
title: CSS バンドル
---

# CSS バンドル

<docs-warning>このドキュメントは、[クラシック Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連します。[Remix Vite][remix-vite] を使用している場合は、代わりに [Vite の CSS ドキュメント][vite-css] を参照してください。</docs-warning>

Remix の一部の CSS 機能は、スタイルを単一のファイルにバンドルし、アプリケーションに手動でロードします。これには、以下が含まれます。

- [CSS サイドエフェクトインポート][css-side-effect-imports]
- [CSS モジュール][css-modules]
- [Vanilla Extract][vanilla-extract]

[通常のスタイルシートインポート][regular-stylesheet-imports] は、引き続き個別のファイルとして保持されることに注意してください。

## 使用方法

Remix は、ページに CSS バンドルを自動的に挿入しません。そのため、ページ上のリンクタグを自由に制御できます。

CSS バンドルにアクセスするには、まず `@remix-run/css-bundle` パッケージをインストールします。

```shellscript nonumber
npm install @remix-run/css-bundle
```

次に、`cssBundleHref` をインポートし、リンク記述子に追加します。これは、ほとんどの場合、アプリケーション全体に適用されるように `app/root.tsx` 内で行います。

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

このリンクタグがページに挿入されると、Remix に組み込まれたさまざまな CSS バンドル機能を使用できるようになります。

## 制限事項

[esbuild の CSS ツリーシェイクの問題][esbuild-css-tree-shaking-issue] により、`export *` の使用は避けてください。

[esbuild-css-tree-shaking-issue]: https://github.com/evanw/esbuild/issues/1370
[css-side-effect-imports]: ./css-imports
[css-modules]: ./css-modules
[vanilla-extract]: ./vanilla-extract
[regular-stylesheet-imports]: ./css
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-css]: https://vitejs.dev/guide/features#css


