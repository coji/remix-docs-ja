---
title: 事前レンダリング
---

# 事前レンダリング

事前レンダリングを使用すると、サーバーではなくビルド時にページをレンダリングできるため、静的コンテンツのページロード速度が向上します。

## 設定

Vite プラグインに `prerender` オプションを追加します。3 つのシグネチャがあります。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      // すべての静的ルートパス
      // （"/post/:slug" などの動的セグメントは含まれません）
      prerender: true,

      // 任意の URL
      prerender: ["/", "/blog", "/blog/popular-post"],

      // CMS などの非同期 URL 依存関係を含む場合
      async prerender() {
        let posts = await getPosts();
        return posts.map((post) => post.href);
      },

      // 非同期パスと静的パスを含む場合
      async prerender({ getStaticPaths }) {
        let posts = await getPosts();
        let static = getStaticPaths();
        return static.concat(
          posts.map((post) => post.href)
        );
      },
    }),
  ],
});
```

## データの読み込みと事前レンダリング

事前レンダリング用の追加のアプリケーション API はありません。事前レンダリングは、サーバーレンダリングと同じルートローダーを使用して、コンポーネントにデータを提供します。

```tsx
export async function loader({ request, params }) {
  let post = await getPost(params.slug);
  return post;
}

export function Post({ loaderData }) {
  return <div>{loaderData.title}</div>;
}
```

サーバーにデプロイされたルートに要求が送信されるのではなく、ビルドによって `new Request()` が作成され、サーバーと同様にアプリケーションで実行されます。

## 静的結果

レンダリングされた結果は `build/client` ディレクトリに出力されます。各パスに 2 つのファイルがあることに気付くでしょう。1 つはユーザーからの最初のドキュメント要求用の HTML ファイル、もう 1 つは React Router がクライアントサイドルーティングのために取得するデータ用の `[name].data` ファイルです。

ビルドの出力には、事前レンダリングされたファイルが表示されます。

```sh
> react-router build
vite v5.2.11 building for production...
...
vite v5.2.11 building SSR bundle for production...
...
Prerender: Generated build/client/index.html
Prerender: Generated build/client/blog.data
Prerender: Generated build/client/blog/index.html
Prerender: Generated build/client/blog/my-first-post.data
Prerender: Generated build/client/blog/my-first-post/index.html
...
```

`react-router dev` を使用して開発している間は、事前レンダリングの結果は公開ディレクトリに保存されません。これは、`react-router build` の場合にのみ発生します。

## デプロイ/配信

事前レンダリングを有効にしたサイトをデプロイするには、複数のオプションがあります。

### 静的デプロイメント

アプリケーション内のすべてのパスを事前レンダリングする場合は、`build/client/` ディレクトリを任意の CDN にデプロイできます。これにより、完全に静的なサイトが作成され、SPA にハイドレートされ、ナビゲーション時に事前レンダリングされたサーバーデータが読み込まれ、`clientLoader` と `clientAction` を介して動的なデータの読み込みと変更を実行できます。

### `react-router-serve` を介して配信

デフォルトでは、`react-router-serve` はこれらのファイルを [`express.static`][express-static] を介して配信し、静的ファイルと一致しないパスは React Router ハンドラーにフォールバックします。

これにより、一部のルートを事前レンダリングし、他のルートをランタイムで動的にレンダリングするハイブリッド設定を実行することもできます。たとえば、`/blog/*` 内のものは事前レンダリングし、`/auth/*` 内のものはサーバーレンダリングできます。

### 手動サーバー構成

サーバーをさらに細かく制御する場合は、独自のサーバーで、アセットと同様にこれらの静的ファイルを配信できます。ただし、ハッシュ化された静的アセットと静的 `.html`/`.data` ファイルのキャッシュヘッダーを区別することをお勧めします。

```js
// 長寿命の Cache-Control ヘッダーを使用して、JS/CSS ファイルなどのハッシュ化された静的アセットを配信
app.use(
  "/assets",
  express.static("build/client/assets", {
    immutable: true,
    maxAge: "1y",
  })
);

// Cache-Control なしで静的 HTML と .data 要求を配信
app.use("/", express.static("build/client"));

// 残りの未処理の要求を React Router ハンドラーを介して配信
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);
```

[express-static]: https://expressjs.com/en/4x/api.html#express.static



