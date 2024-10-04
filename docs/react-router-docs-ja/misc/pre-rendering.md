---
title: 事前レンダリング
---

# 事前レンダリング

事前レンダリングにより、ページをサーバーではなくビルド時にレンダリングして、静的コンテンツのページ読み込み速度を向上させることができます。

## 設定

Vite プラグインに `prerender` オプションを追加します。3 つのシグネチャがあります。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      // すべての静的ルートパス
      // ( "/post/:slug" などの動的セグメントはありません)
      prerender: true,

      // 任意の URL
      prerender: ["/", "/blog", "/blog/popular-post"],

      // CMS などの非同期 URL 依存関係を使用
      async prerender() {
        let posts = await getPosts();
        return posts.map((post) => post.href);
      },

      // 非同期パスと静的パスの両方を使用
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

デプロイされたサーバーにリクエストが来る代わりに、ビルドは `new Request()` を作成し、サーバーと同じようにアプリケーションを実行します。

## 静的結果

レンダリングされた結果は `build/client` ディレクトリに出力されます。各パスに 2 つのファイルがあることに気付くでしょう。1 つはユーザーからの最初のドキュメントリクエスト用の HTML ファイル、もう 1 つは React Router がクライアント側のルーティングのためにフェッチするデータ用の `[name].data` ファイルです。

ビルドの出力は、事前レンダリングされたファイルを示します。

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

`react-router dev` を使用した開発中は、事前レンダリングはレンダリング結果をパブリックディレクトリに保存しません。これは、`react-router build` の場合にのみ発生します。

## デプロイ/提供

事前レンダリングを有効にしたサイトをデプロイするには、複数のオプションがあります。

### 静的デプロイ

アプリケーションのすべてのパスを事前レンダリングする場合、`build/client/` ディレクトリを任意の CDN にデプロイすると、SPA にハイドレートされる完全に静的なサイトが得られます。SPA にハイドレートされ、ナビゲーション時に事前レンダリングされたサーバーデータが読み込まれ、`clientLoader` と `clientAction` を介して動的なデータの読み込みと変更を実行できます。

### react-router-serve を介して提供

デフォルトでは、`react-router-serve` は [`express.static`][express-static] を介してこれらのファイルを提供し、静的ファイルに一致しないパスは Remix ハンドラーにフォールバックします。

これにより、一部のルートを事前レンダリングし、他のルートをランタイムに動的にレンダリングするハイブリッド設定を実行することもできます。たとえば、`/blog/*` 内のものを事前レンダリングし、`/auth/*` 内のものをサーバーレンダリングできます。

### 手動サーバー設定

サーバーをより細かく制御したい場合は、これらの静的ファイルを独自のサーバーの資産と同じように提供できます。ただし、ハッシュされた静的資産と静的な `.html`/`.data` ファイルのキャッシュヘッダーを区別したほうがよいでしょう。

```js
// ハッシュされた静的資産（JS/CSS ファイルなど）を、長期間有効な Cache-Control ヘッダーで提供
app.use(
  "/assets",
  express.static("build/client/assets", {
    immutable: true,
    maxAge: "1y",
  })
);

// 静的 HTML と .data リクエストを Cache-Control なしで提供
app.use(
  "/",
  express.static("build/client", {
    // ディレクトリインデックスの .html リクエストを、末尾にスラッシュを含むようにリダイレクトしない
    redirect: false,
    setHeaders: function (res, path) {
      // ターボストリームデータレスポンスの適切な Content-Type を追加
      if (path.endsWith(".data")) {
        res.set("Content-Type", "text/x-turbo");
      }
    },
  })
);

// 未処理のリクエストを React Router ハンドラーで提供
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);
```

[express-static]: https://expressjs.com/en/4x/api.html#express.static



