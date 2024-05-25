---
title: CSS モジュール
---

# CSS モジュール

<docs-warning>このドキュメントは、[従来の Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連しています。[Remix Vite][remix-vite] を使用している場合は、[CSS モジュールは Vite に組み込まれています][vite-css-modules]。</docs-warning>

組み込みの CSS モジュールサポートを使用するには、最初にアプリケーションに [CSS バンドル][css-bundling] を設定していることを確認してください。

その後、`.module.css` ファイル名の規則を使用して [CSS モジュール][css-modules] をオプトインできます。例：

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


