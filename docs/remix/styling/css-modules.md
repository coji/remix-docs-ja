---
title: CSS Modules
---

# CSS Modules

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。[Remix Vite][remix-vite] を使用している場合は、[CSS Modules のサポートが Vite に組み込まれています][vite-css-modules]。</docs-warning>

組み込みの CSS Modules サポートを使用するには、まずアプリケーションで [CSS バンドル][css-bundling] を設定していることを確認してください。

次に、`.module.css` ファイル名の規約を使用して [CSS Modules][css-modules] を選択できます。例：

```css filename=app/components/button/styles.module.css
.root {
  border: solid 1px;
  background: white;
  color: #454545;
}
```

```tsx filename=app/components/button/index.js lines=[1,9]
import styles from "./styles.module.css";

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

[css-bundling]: ./bundling
[css-modules]: https://github.com/css-modules/css-modules
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
[vite-css-modules]: https://vitejs.dev/guide/features#css-modules

