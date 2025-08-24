---
title: アセットのインポート
toc: false
---

# アセット URL のインポート

`app` フォルダ内のファイルは、モジュールにインポートできます。Remix は次の処理を行います。

1. ファイルをブラウザのビルドディレクトリにコピーします。
2. 長期キャッシュのためにファイルのフィンガープリントを作成します。
3. レンダリング中に使用されるパブリック URL をモジュールに返します。

これはスタイルシートで最も一般的ですが、[定義されたローダー][remix-loaders]を持つ任意のファイルタイプで使用できます。

```tsx
import type { LinksFunction } from "@remix-run/node"; // または cloudflare/deno

import banner from "./images/banner.jpg";
import styles from "./styles/app.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export default function Page() {
  return (
    <div>
      <h1>Some Page</h1>
      <img src={banner} />
    </div>
  );
}
```

[remix-loaders]: https://github.com/remix-run/remix/blob/main/packages/remix-dev/compiler/utils/loaders.ts
