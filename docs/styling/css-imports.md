---
title: CSS インポート
---

# CSS 副作用インポート

<docs-warning>このドキュメントは、[Remix Vite][remix-vite] を使用する場合には、もはや関連していません。CSS 副作用インポートは、Vite では標準で動作します。</docs-warning>

一部の NPM パッケージは、プレーンな CSS ファイルの副作用インポート（例: `import "./styles.css"`）を使用して、JavaScript ファイルの CSS 依存関係を宣言しています。これらのパッケージのいずれかを使用したい場合は、まずアプリケーションに [CSS バンドル][css-bundling] を設定していることを確認してください。

たとえば、モジュールは次のようソースコードを持つ場合があります。

```tsx
import "./menu-button.css";

export function MenuButton() {
  return <button data-menu-button>{/* ... */}</button>;
}
```

JavaScript ランタイムは、このように CSS をインポートすることをサポートしていないため、`remix.config.js` ファイルの [`serverDependenciesToBundle`][server-dependencies-to-bundle] オプションに、関連するパッケージを追加する必要があります。これにより、サーバーで実行する前に、すべての CSS インポートがコードからコンパイルされます。たとえば、React Spectrum を使用するには:

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: [
    /^@adobe\/react-spectrum/,
    /^@react-spectrum/,
    /^@spectrum-icons/,
  ],
  // ...
};
```

[css-bundling]: ./bundling
[server-dependencies-to-bundle]: ../file-conventions/remix-config#serverdependenciestobundle
[remix-vite]: ../guides/vite


