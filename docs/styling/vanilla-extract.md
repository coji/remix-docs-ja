---
title: バニラエキス
---

# バニラエキス

<docs-warning>このドキュメントは、[クラシックRemixコンパイラ][classic-remix-compiler]を使用する場合にのみ関連します。[Remix Vite][remix-vite]を使用している場合は、[Vanilla Extract Viteプラグイン][vanilla-extract-vite]を使用してVanilla Extractを統合できます。</docs-warning>

[Vanilla Extract][vanilla-extract]は、TypeScript（またはJavaScript）でCSSを記述できる、ゼロランタイムのCSS-in-TypeScript（またはJavaScript）ライブラリです。スタイルは別の`*.css.ts`（または`*.css.js`）ファイルに記述され、その中のすべてのコードはユーザーのブラウザではなく、ビルドプロセス中に実行されます。CSSバンドルのサイズを最小限に抑えたい場合は、Vanilla Extractは[Sprinkles][sprinkles]と呼ばれる公式ライブラリも提供しており、これにより、カスタムのユーティリティクラスセットと、それらにランタイムでアクセスするための型安全な関数を定義できます。

組み込みのVanilla Extractサポートを使用するには、まずアプリケーションに[CSSバンドル][css-bundling]をセットアップする必要があります。

次に、Vanilla Extractのコアスタイリングパッケージを開発依存関係としてインストールします。

```shellscript nonumber
npm install -D @vanilla-extract/css
```

次に、`.css.ts`/`.css.js`ファイル名規約を使用して、Vanilla Extractをオプトインできます。たとえば、以下のようにします。

```ts filename=app/components/button/styles.css.ts
import { style } from "@vanilla-extract/css";

export const root = style({
  border: "solid 1px",
  background: "white",
  color: "#454545",
});
```

```tsx filename=app/components/button/index.js lines=[1,9]
import * as styles from "./styles.css"; // ここでは`.ts`は省略されています

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


