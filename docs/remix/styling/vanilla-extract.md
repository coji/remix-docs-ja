---
title: Vanilla Extract
---

# Vanilla Extract

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。[Remix Vite][remix-vite] を使用している場合は、[Vanilla Extract Vite プラグイン][vanilla-extract-vite] を使用して Vanilla Extract を統合できます。</docs-warning>

[Vanilla Extract][vanilla-extract] は、TypeScript を CSS プリプロセッサとして使用できる、ゼロランタイムの CSS-in-TypeScript (または JavaScript) ライブラリです。スタイルは個別の `*.css.ts` (または `*.css.js`) ファイルに記述され、その中のすべてのコードは、ユーザーのブラウザではなく、ビルドプロセス中に実行されます。CSS バンドルのサイズを最小限に抑えたい場合は、Vanilla Extract は [Sprinkles][sprinkles] という公式ライブラリも提供しており、カスタムのユーティリティクラスのセットと、実行時にそれらにアクセスするためのタイプセーフな関数を定義できます。

組み込みの Vanilla Extract サポートを使用するには、まずアプリケーションで [CSS バンドリング][css-bundling] を設定していることを確認してください。

次に、Vanilla Extract のコアスタイリングパッケージを開発依存関係としてインストールします。

```shellscript nonumber
npm install -D @vanilla-extract/css
```

その後、`.css.ts`/`.css.js` ファイル名の規則を使用して Vanilla Extract を選択できます。例：

```ts filename=app/components/button/styles.css.ts
import { style } from "@vanilla-extract/css";

export const root = style({
  border: "solid 1px",
  background: "white",
  color: "#454545",
});
```

```tsx filename=app/components/button/index.js lines=[1,9]
import * as styles from "./styles.css"; // ここでは `.ts` が省略されていることに注意してください

export const Button = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className={styles.root}
      />
    );
  }
);
Button.displayName = "Button";
```

[vanilla-extract]: https://vanilla-extract.style
[sprinkles]: https://vanilla-extract.style/documentation/packages/sprinkles
[css-bundling]: ./bundling
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vanilla-extract-vite]: https://vanilla-extract.style/documentation/integrations/vite

