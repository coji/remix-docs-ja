---
title: プリレンダリング
---

# プリレンダリング

プリレンダリングを使用すると、静的コンテンツのページ読み込み速度を向上させるために、サーバーではなくビルド時にページをレンダリングできます。

## 設定

`prerender` オプションを config に追加します。3 つのシグネチャがあります。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // 静的ルートパスすべて
  // （"/post/:slug" のような動的セグメントは含まない）
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

## データ読み込みとプリレンダリング

プリレンダリング用の追加のアプリケーションAPIはありません。プリレンダリングは、サーバーサイドレンダリングと同じルートローダーを使用します。

```tsx
export async function loader({ request, params }) {
  let post = await getPost(params.slug);
  return post;
}

export function Post({ loaderData }) {
  return <div>{loaderData.title}</div>;
}
```

デプロイされたサーバーでルートへのリクエストが来る代わりに、ビルドは `new Request()` を作成し、サーバーと同様にアプリを通して実行します。

サーバーサイドレンダリングの場合、プリレンダリングされていないパスへのリクエストは通常どおりサーバーサイドレンダリングされます。

## 静的ファイル出力

レンダリングされた結果は `build/client` ディレクトリに出力されます。各パスに2つのファイルがあることに気付くでしょう。

- `[url].html` 最初のドキュメントリクエスト用のHTMLファイル
- `[url].data` クライアントサイドナビゲーションブラウザリクエスト用のファイル

ビルドの出力は、プリレンダリングされたファイルを示します。

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

開発中は、プリレンダリングはレンダリングされた結果を公開ディレクトリに保存しません。これは `react-router build` の場合のみ発生します。

