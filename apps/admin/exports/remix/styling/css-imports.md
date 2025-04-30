---
title: CSS インポート
---

# CSS 副作用インポート

<docs-warning>[Remix Vite][remix-vite] を使用している場合、このドキュメントはもはや関連性がありません。CSS 副作用インポートは Vite でそのまま動作します。</docs-warning>

一部の NPM パッケージは、プレーンな CSS ファイルの副作用インポート（例：`import "./styles.css"`）を使用して、JavaScript ファイルの CSS 依存関係を宣言します。これらのパッケージのいずれかを使用する場合は、まずアプリケーションで [CSS バンドル][css-bundling]を設定していることを確認してください。

たとえば、モジュールには次のようなソースコードがある場合があります。

```tsx
import "./menu-button.css";

export function MenuButton() {
  return <button data-menu-button>{/* ... */}</button>;
}
```

JavaScript ランタイムはこの方法での CSS のインポートをサポートしていないため、関連するパッケージを `remix.config.js` ファイルの [`serverDependenciesToBundle`][server-dependencies-to-bundle] オプションに追加する必要があります。これにより、サーバーで実行する前に、CSS インポートがコードからコンパイルされるようになります。たとえば、React Spectrum を使用するには、次のようにします。

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

