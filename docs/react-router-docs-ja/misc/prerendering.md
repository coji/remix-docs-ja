---
title: プリレンダリング
new: true
---

# プリレンダリング

Remix v1 のリリース以降、私たちが最も頻繁に受ける質問の 1 つは、「Remix でどのようにアプリを SSG できますか？」です。

私たちは長い間（そして今でも）、ランタイムサーバーを持つことが、ほとんどのアプリにとって最高の UX/パフォーマンス/SEO などを実現すると考えています。また、サーバーアーキテクチャは自分自身で所有すべきであり、現実世界には、静的に生成されたサイト（以降、プリレンダリングされたサイトと呼びます 😉）に適したユースケースが数多く存在することは明らかです。

私たちはしばらくの間、プリレンダリングを Remix/React Router の第一級機能にする必要はないと考えてきました（そして今でもそう思っています）。あなたは [ユーザーランドでこれを行うことができます][michael-tweet]。[クライアントデータ][client-data] の追加により、ユーザーランドのセットアップで行うことができることがさらに強力になりました。これにより、[さまざまなアーキテクチャ][remix-ssg] を選択できます。

しかし、[シングルフェッチ][single-fetch] を導入するまでは、プリレンダリングの真の力は解放されませんでした。以前は、SPA にハイドレートすることはできましたが、ナビゲーション時には `clientLoader` の使用に制限されていました。シングルフェッチを使用すると、HTML ファイルをプリレンダリングし、同時にビルド時に `loader` 関数を実行して `.data` ファイルに保存することができます。アプリはクライアント側の遷移中にこのファイルを取得できます。

これは、ユーザーランドでも完全に実行できることですが、頻繁にリクエストされるため、専用の組み込み API を提供することにしました。

## 設定

プリレンダリングを有効にするには、React Router Vite プラグインに `prerender` オプションを追加します。

最も単純なユースケースでは、`prerender: true` とすることで、アプリケーションで定義されたすべての静的ルート（動的またはスプラットパラメータを含むパスを除く）がプリレンダリングされます。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      prerender: true,
    }),
  ],
});
```

動的/スプラットパラメータを含むパスをプリレンダリングする必要がある場合、または静的パスのサブセットのみをプリレンダリングする必要がある場合は、パスの配列を指定できます。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      prerender: ["/", "/blog"],
    }),
  ],
});
```

`prerender` は関数にすることもでき、これにより、たとえば CMS からブログ投稿を取得した後、パスを動的に生成できます。この関数は、アプリケーションで定義されたすべての静的パスを取得するために呼び出すことができる `getStaticPaths` 関数を含む単一の引数を受け取ります。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      async prerender({ getStaticPaths }) {
        let slugs = await getSlugsFromCms();
        return [
          ...getStaticPaths(),
          ...slugs.map((s) => `/blog/${s}`),
        ];
      },
    }),
  ],
});
```

## 開発

`react-router dev` を使用して開発している場合、プリレンダリングを有効にしても何も変わりません。HMR/HDR の開発者エクスペリエンスの利点を得るために、vite dev サーバーを使用し続けます。プリレンダリングはビルド時のみのステップです。

## ビルド

プリレンダリングを有効にして `react-router build` を実行すると、サーバーハンドラーがビルドされ、`prerender` で指定したすべてのルートに対して呼び出されます。生成された HTML は `build/client` ディレクトリに出力され、これらのルートのいずれかにローダーが含まれている場合は、ローダーが呼び出され、Single Fetch の `.data` ファイルが `build/client` ディレクトリに保存されます。

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

## デプロイ/サービス

プリレンダリングを有効にしたサイトをデプロイするには、複数のオプションがあります。

### 静的デプロイ

アプリケーションのすべてのパスをプリレンダリングした場合は、`build/client/` ディレクトリを任意の CDN にデプロイできます。これにより、SPA にハイドレートされる完全に静的なサイトが作成されます。ナビゲーション時にはプリレンダリングされたサーバーデータがロードされ、`clientLoader` と `clientAction` を介して動的なデータのロードと変更を実行できます。

### react-router-serve を介してサービスを提供する

デフォルトでは、`react-router-serve` はこれらのファイルを [`express.static`][express-static] を介してサービスを提供し、静的ファイルと一致しないパスは Remix ハンドラーに渡されます。

これにより、一部のルートをプリレンダリングし、他のルートをランタイムで動的にレンダリングするハイブリッドセットアップを実行することもできます。たとえば、`/blog/*` 内のすべてのものをプリレンダリングし、`/auth/*` 内のすべてのものをサーバーレンダリングできます。

### 手動サーバー設定

サーバーをより細かく制御する必要がある場合は、独自のサーバーでこれらの静的ファイルをアセットのようにサービス提供できます。ただし、ハッシュされた静的アセットと静的な `.html`/`.data` ファイルのキャッシュヘッダーを区別することが重要です。

```js
// ハッシュされた静的アセット（JS/CSS ファイルなど）を、有効期限が長い Cache-Control ヘッダーでサービス提供する
app.use(
  "/assets",
  express.static("build/client/assets", {
    immutable: true,
    maxAge: "1y",
  })
);

// 静的 HTML と .data リクエストを、Cache-Control なしでサービス提供する
app.use(
  "/",
  express.static("build/client", {
    // ディレクトリ index.html リクエストを、末尾のスラッシュを含めてリダイレクトしない
    redirect: false,
    setHeaders: function (res, path) {
      // ターボストリームデータレスポンスの適切な Content-Type を追加する
      if (path.endsWith(".data")) {
        res.set("Content-Type", "text/x-turbo");
      }
    },
  })
);

// 残りの処理されていないリクエストを React Router ハンドラーでサービス提供する
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);
```

[michael-tweet]: https://twitter.com/mjackson/status/1585795441907494912
[client-data]: https://remix.run/docs/guides/client-data
[remix-ssg]: https://github.com/brophdawg11/remix-ssg
[single-fetch]: https://remix.run/docs/guides/single-fetch
[express-static]: https://expressjs.com/en/4x/api.html#express.static



