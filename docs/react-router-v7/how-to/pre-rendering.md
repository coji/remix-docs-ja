---
title: プリレンダリング
---

# プリレンダリング

プリレンダリングを使用すると、静的コンテンツのページ読み込みを高速化するために、サーバーではなくビルド時にページをレンダリングできます。

## 設定

`prerender` オプションを構成に追加します。3つのシグネチャがあります。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // すべての静的ルートパス
  // (「/post/:slug」のような動的セグメントはなし)
  prerender: true,

  // 任意のURL
  prerender: ["/", "/blog", "/blog/popular-post"],

  // CMSのような依存関係のための非同期関数
  async prerender({ getStaticPaths }) {
    let posts = await fakeGetPostsFromCMS();
    return ["/", "/blog"].concat(
      posts.map((post) => post.href)
    );
  },
} satisfies Config;
```

## データローディングとプリレンダリング

プリレンダリングのための特別なアプリケーションAPIはありません。プリレンダリングは、サーバーレンダリングと同じルートローダーを使用します。

```tsx
export async function loader({ request, params }) {
  let post = await getPost(params.slug);
  return post;
}

export function Post({ loaderData }) {
  return <div>{loaderData.title}</div>;
}
```

デプロイされたサーバーへのリクエストの代わりに、ビルドは `new Request()` を作成し、サーバーと同じようにアプリを通じて実行します。

サーバーレンダリングの場合、プリレンダリングされていないパスへのリクエストは、通常どおりサーバーレンダリングされます。

## 静的ファイル出力

レンダリングされた結果は、`build/client` ディレクトリに書き込まれます。各パスに対して2つのファイルがあることに気づくでしょう。

- `[url].html` 初期ドキュメントリクエスト用のHTMLファイル
- `[url].data` クライアント側のナビゲーションブラウザリクエスト用のファイル

ビルドの出力には、プリレンダリングされたファイルが示されます。

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

開発中、プリレンダリングはレンダリングされた結果をパブリックディレクトリに保存しません。これは `react-router build` の場合にのみ発生します。

