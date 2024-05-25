---
title: ".client モジュール"
toc: false
---

# `.client` モジュール

あまり一般的ではありませんが、ブラウザでモジュール副作用を使用するファイルや依存関係がある場合があります。ファイル名に `*.client.ts` を使用したり、`.client` ディレクトリ内にファイルをネストしたりして、サーバーバンドルから強制的に除外することができます。

```ts filename=feature-check.client.ts
// これはサーバーを壊します
export const supportsVibrationAPI =
  "vibrate" in window.navigator;
```

このモジュールからエクスポートされる値はすべてサーバーでは `undefined` になるので、これらを使用できるのは [`useEffect`][use_effect] とクリックハンドラなどのユーザーイベントの中だけです。

```ts
import { supportsVibrationAPI } from "./feature-check.client.ts";

console.log(supportsVibrationAPI);
// サーバー: undefined
// クライアント: true | false
```

<docs-warning>`.client` ディレクトリは、[Remix Vite][remix-vite] を使用する場合のみサポートされています。[クラシックRemixコンパイラ][classic-remix-compiler] は `.client` ファイルのみサポートしています。</docs-warning>

サイドバーのルートモジュールセクションを参照してください。

[use_effect]: https://react.dev/reference/react/useEffect
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite
