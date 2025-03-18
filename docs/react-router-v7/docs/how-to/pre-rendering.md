---
title: プリレンダリング
---

# プリレンダリング

プリレンダリングを使用すると、ページをランタイムではなくビルド時にレンダリングすることで、静的コンテンツのページロードを高速化できます。プリレンダリングは、`react-router.config.ts` の `prerender` 設定で有効になり、`ssr` 設定値に基づいて次の 2 つの方法で使用できます。

- `ssr:true` (デフォルト値) を使用したランタイム SSR サーバーと連携
- `ssr:false` を使用して静的ファイルサーバーにデプロイ

## `ssr:true` を使用したプリレンダリング

### 設定

`prerender` オプションを構成に追加します。3 つのシグネチャがあります。

```ts filename=react-router.config.ts lines=[7-8,10-11,13-21]
import type { Config } from "@react-router/dev/config";

export default {
  // 省略可能 - デフォルトは true
  ssr: true,

  // すべての静的パス (「/post/:slug」のような動的セグメントなし)
  prerender: true,

  // 特定のパス
  prerender: ["/", "/blog", "/blog/popular-post"],

  // CMS のような依存関係のための非同期関数
  async prerender({ getStaticPaths }) {
    let posts = await fakeGetPostsFromCMS();
    return [
      "/",
      "/blog",
      ...posts.map((post) => post.href),
    ];
  },
} satisfies Config;
```

### データローディングとプリレンダリング

プリレンダリングのための特別なアプリケーション API はありません。プリレンダリングされるルートは、サーバーレンダリングと同じルート `loader` 関数を使用します。

```tsx
export async function loader({ request, params }) {
  let post = await getPost(params.slug);
  return post;
}

export function Post({ loaderData }) {
  return <div>{loaderData.title}</div>;
}
```

デプロイされたサーバー上のルートへのリクエストの代わりに、ビルドは `new Request()` を作成し、サーバーと同じようにアプリを通して実行します。

サーバーレンダリングの場合、プリレンダリングされていないパスへのリクエストは、通常どおりサーバーレンダリングされます。

### 静的ファイル出力

レンダリングされた結果は、`build/client` ディレクトリに書き出されます。各パスに対して 2 つのファイルが表示されます。

- 初期ドキュメントリクエスト用の `[url].html` HTML ファイル
- クライアント側のナビゲーションブラウザリクエスト用の `[url].data` ファイル

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

開発中、プリレンダリングはレンダリングされた結果をパブリックディレクトリに保存しません。これは `react-router build` でのみ発生します。

## `ssr:false` を使用したプリレンダリング

上記の例では、ランタイムサーバーをデプロイしているが、一部の静的ページをプリレンダリングしてサーバーへのアクセスを回避し、ロードを高速化することを前提としています。

ランタイム SSR を無効にし、静的ファイルサーバーから提供されるようにプリレンダリングを構成するには、`ssr:false` 構成フラグを設定します。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false, // ランタイムサーバーレンダリングを無効にする
  prerender: true, // すべての静的ルートをプリレンダリングする
} satisfies Config;
```

`prerender` 構成なしで `ssr:false` を指定すると、React Router はそれを [SPA モード](./spa) と呼びます。SPA モードでは、アプリケーションパスの _いずれか_ をハイドレートできる単一の HTML ファイルをレンダリングします。これは、`root` ルートのみを HTML ファイルにレンダリングし、ハイドレーション中にブラウザの URL に基づいてロードする子ルートを決定するためです。つまり、ルートルートで `loader` を使用できますが、他のルートでは使用できません。これは、ブラウザでのハイドレーションまでどのルートをロードするかわからないためです。

`ssr:false` でパスをプリレンダリングする場合は、一致するルートにローダーを含めることができます。これは、ルートだけでなく、それらのパスに一致するすべてのルートをプリレンダリングするためです。`ssr:false` が設定されている場合、`actions` または `headers` 関数をルートに含めることはできません。これは、それらを実行するランタイムサーバーがないためです。

### SPA フォールバックを使用したプリレンダリング

`ssr:false` が必要だが、ルートの _すべて_ をプリレンダリングしたくない場合も問題ありません。プリレンダリングのパフォーマンス/SEO の利点が必要なパスもあれば、SPA で問題ないページもあるかもしれません。

構成オプションの組み合わせを使用してこれを行うこともできます。`prerender` 構成をプリレンダリングするパスに制限するだけで、React Router は他のパスをハイドレートするために提供できる「SPA フォールバック」HTML ファイルも出力します ([SPA モード](./spa) と同じアプローチを使用)。

これは、次のいずれかのパスに書き込まれます。

- `build/client/index.html` - `/` パスがプリレンダリングされていない場合
- `build/client/__spa-fallback.html` - `/` パスがプリレンダリングされている場合

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,

  // SPA フォールバックは build/client/index.html に書き込まれます
  prerender: ["/about-us"],

  // SPA フォールバックは build/client/__spa-fallback.html に書き込まれます
  prerender: ["/", "/about-us"],
} satisfies Config;
```

デプロイサーバーを構成して、それ以外の場合は 404 になるパスに対してこのファイルを提供できます。一部のホストはデフォルトでこれを行いますが、そうでないホストもあります。例として、ホストはこれを実行するために `_redirects` ファイルをサポートする場合があります。

```
# `/` ルートをプリレンダリングしなかった場合
/*    /index.html   200

# `/` ルートをプリレンダリングした場合
/*    /__spa-fallback.html   200
```

アプリの有効なルートで 404 が発生する場合は、ホストを構成する必要がある可能性があります。

[`sirv-cli`](https://www.npmjs.com/package/sirv-cli#user-content-single-page-applications) ツールでこれを行う方法の別の例を次に示します。

```sh
# `/` ルートをプリレンダリングしなかった場合
sirv-cli build/client --single index.html

# `/` ルートをプリレンダリングした場合
sirv-cli build/client --single __spa-fallback.html
```

### 無効なエクスポート

`ssr:false` でプリレンダリングする場合、React Router はビルド時に無効なエクスポートがある場合にエラーを発生させ、見落としやすい一部の間違いを防ぎます。

- `headers`/`action` 関数は、それらを実行するランタイムサーバーがないため、すべてのルートで禁止されています
- `prerender` 構成なしで `ssr:false` (SPA モード) を使用する場合、`loader` はルートルートでのみ許可されます
- `prerender` 構成で `ssr:false` を使用する場合、`loader` は `prerender` パスによって一致するすべてのルートで許可されます
  - 子ルートを持つプリレンダリングされたルートで `loader` を使用している場合は、次のいずれかの方法で、実行時に親 `loaderData` を適切に決定できることを確認する必要があります。
    - すべての子ルートをプリレンダリングして、各子ルートパスのビルド時に親 `loader` を呼び出して `.data` ファイルにレンダリングできるようにするか、
    - プリレンダリングされていない子パスに対して実行時に呼び出すことができる親で `clientLoader` を使用します

