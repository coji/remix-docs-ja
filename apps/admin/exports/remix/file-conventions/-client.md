---
title: ".client モジュール"
toc: false
---

# `.client` モジュール

一般的ではありませんが、ブラウザでモジュールの副作用を使用するファイルや依存関係がある場合があります。ファイル名に `*.client.ts` を使用するか、`.client` ディレクトリ内にファイルをネストすることで、それらをサーバーバンドルから強制的に除外できます。

```ts filename=feature-check.client.ts
// これはサーバーを壊すでしょう
export const supportsVibrationAPI =
  "vibrate" in window.navigator;
```

このモジュールからエクスポートされた値はすべてサーバー上では `undefined` になることに注意してください。したがって、それらを使用できる場所は [`useEffect`][use_effect] やクリックハンドラーなどのユーザーイベントのみです。

```ts
import { supportsVibrationAPI } from "./feature-check.client.ts";

console.log(supportsVibrationAPI);
// サーバー: undefined
// クライアント: true | false
```

<docs-warning>`.client` ディレクトリは、[Remix Vite][remix-vite] を使用している場合にのみサポートされます。[Classic Remix Compiler][classic-remix-compiler] は `.client` ファイルのみをサポートします。</docs-warning>

詳細については、サイドバーのルートモジュールのセクションを参照してください。

[use_effect]: https://react.dev/reference/react/useEffect
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ../guides/vite

