---
title: アセットインポート
toc: false
---

# アセットURLインポート

`app`フォルダ内のファイルは、モジュールにインポートできます。Remixは次の処理を行います。

1. ファイルをブラウザビルドディレクトリにコピーします
2. ファイルのフィンガープリントを生成して長期キャッシュを実現します
3. モジュールにパブリックURLを返し、レンダリング時に使用します

これはスタイルシートでよく使われますが、[定義済みのローダー][remix-loaders]があれば、どんなファイルタイプでも使用できます。

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


