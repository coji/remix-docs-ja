---
title: レンダリング戦略
order: 4
---

# レンダリング戦略

React Router には 3 つのレンダリング戦略があります。

- クライアントサイドレンダリング
- サーバーサイドレンダリング
- 静的プリレンダリング

すべてのルートは、ユーザーがアプリ内を移動するときに常にクライアントサイドでレンダリングされます。ただし、Vite プラグインの `ssr` および `prerender` オプションを使用して、サーバーレンダリングと静的プリレンダリングを制御できます。

## サーバーサイドレンダリング

```ts filename=vite.config.ts
import { plugin as app } from "@react-router/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [
    app({
      // デフォルトは false
      ssr: true,
    }),
  ],
});
```

サーバーサイドレンダリングには、それをサポートするデプロイメントが必要です。これはグローバル設定ですが、個々のルートは静的にプリレンダリングすることも、`clientLoader` を使用してクライアントデータのロードを実行して、UI のその部分のサーバーレンダリング/フェッチを回避することもできます。

## 静的プリレンダリング

```ts filename=vite.config.ts
import { plugin as app } from "@react-router/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [
    app({
      // ビルド時にプリレンダリングする URL のリストを返します
      async prerender() {
        return ["/", "/about", "/contact"];
      },
    }),
  ],
});
```

プリレンダリングは、ビルド時の操作であり、URL のリストに対する静的 HTML とクライアントナビゲーションデータのペイロードを生成します。これは、特にサーバーレンダリングのないデプロイメントの場合、SEO とパフォーマンスに役立ちます。プリレンダリングを行う場合、`loader` メソッドはビルド時にデータを取得するために使用されます。

## React Server Components

ローダーとアクションから要素を返し、ブラウザバンドルから排除することができます。

```tsx
export default defineRoute$({
  async loader() {
    return {
      products: <Products />,
      reviews: <Reviews />,
    };
  },

  Component({ data }) {
    return (
      <div>
        {data.products}
        {data.reviews}
      </div>
    );
  },
});
```



