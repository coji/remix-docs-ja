---
title: レンダリング戦略
order: 4
---

# レンダリング戦略

React Routerには3つのレンダリング戦略があります。

- クライアントサイドレンダリング
- サーバーサイドレンダリング
- 静的プリレンダリング

すべてのルートは、ユーザーがアプリ内を移動するときに常にクライアントサイドでレンダリングされます。ただし、Viteプラグインの `ssr` オプションと `prerender` オプションを使用して、サーバーレンダリングと静的プリレンダリングを制御できます。

## サーバーサイドレンダリング

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      // デフォルトはfalse
      ssr: true,
    }),
  ],
});
```

サーバーサイドレンダリングには、それをサポートするデプロイメントが必要です。これはグローバル設定ですが、個々のルートは静的にプリレンダリングされたり、 `clientLoader` を使用してクライアントデータのロードを行うことで、サーバーレンダリング/フェッチを回避したりできます。

## 静的プリレンダリング

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      // ビルド時にプリレンダリングするURLのリストを返します
      async prerender() {
        return ["/", "/about", "/contact"];
      },
    }),
  ],
});
```

プリレンダリングは、ビルド時の操作であり、URLのリストに対して静的HTMLとクライアントナビゲーションデータのペイロードを生成します。これは、特にサーバーレンダリングを行わないデプロイメントの場合、SEOとパフォーマンスに役立ちます。プリレンダリングの場合、ルートモジュールローダーを使用して、ビルド時にデータをフェッチします。

## React Server Components

<docs-warning>RSCは開発中です</docs-warning>

将来、ローダーとアクションから要素を返して、ブラウザバンドルから除外できるようになります。

```tsx
export async function loader() {
  return {
    products: <Products />,
    reviews: <Reviews />,
  };
}

export default function App({ data }) {
  return (
    <div>
      {data.products}
      {data.reviews}
    </div>
  );
}
```



