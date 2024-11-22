---
title: プリレンダリング
---

# プリレンダリング

プリレンダリングを使用すると、サーバーではなくビルド時にページをレンダリングできるため、静的コンテンツのページ読み込み速度を向上させることができます。

## 設定

`prerender` オプションをコンフィグに追加します。3つのシグネチャがあります。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // 静的ルートパスすべて
  // （"/post/:slug"のような動的セグメントはありません）
  prerender: true,

  // 任意のURL
  prerender: ["/", "/blog", "/blog/popular-post"],

  // CMSなどの依存関係のための非同期関数
  async prerender({ getStaticPaths }) {
    let posts = await fakeGetPostsFromCMS();
    return ["/", "/blog"].concat(
      posts.map((post) => post.href)
    );
  },
} satisfies Config;
```

## データの読み込みとプリレンダリング

プリレンダリングのための追加のアプリケーションAPIはありません。プリレンダリングは、サーバーサイドレンダリングと同じルートローダーを使用します。

```tsx
export async function loader({ request, params }) {
  let post = await getPost(params.slug);
  return post;
}

export function Post({ loaderData }) {
  return <div>{loaderData.title}</div>;
}
```

デプロイされたサーバーにルートへのリクエストが来る代わりに、ビルドは `new Request()` を作成し、サーバーと同様にアプリを通して実行します。

サーバーサイドレンダリングの場合、プリレンダリングされていないパスへのリクエストは通常どおりサーバーサイドレンダリングされます。

## 静的ファイルの出力

レンダリングされた結果は、`build/client` ディレクトリに出力されます。各パスに対して、最初のドキュメントリクエスト用のHTMLファイルと、クライアントサイドナビゲーション用の`[name].data`ファイルの2つのファイルがあることに気付くでしょう。

ビルドの出力は、プリレンダリングされたファイルを示しています。

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

開発中は、プリレンダリングはレンダリング結果を公開ディレクトリに保存しません。これは `react-router build` の場合のみ発生します。

