---
title: サーバーバンドル
---

# サーバーバンドル

<docs-warning>これは、ホスティングプロバイダーの統合向けに設計された高度な機能です。アプリを複数のサーバーバンドルにコンパイルする場合、アプリの前にカスタムルーティングレイヤーを配置して、リクエストを正しいバンドルに転送する必要があります。</docs-warning>

Remix は通常、サーバーコードを単一のリクエストハンドラー関数を公開するバンドルにビルドします。ただし、ルートツリーを、ルートのサブセットのリクエストハンドラー関数を公開する複数のサーバーバンドルに分割したい場合があります。このレベルの柔軟性を提供するために、[Remix Vite プラグイン][remix-vite] は、ルートを異なるサーバーバンドルに割り当てるための関数である `serverBundles` オプションをサポートしています。

提供された `serverBundles` 関数は、ツリー内の各ルート（アドレス指定できないルート、たとえばパスレスレイアウトルートを除く）に対して呼び出され、割り当てたいサーバーバンドル ID を返します。これらのバンドル ID は、サーバービルドディレクトリ内のディレクトリ名として使用されます。

各ルートについて、この関数には、そのルートに至るまでのルートの配列（ルート `branch` と呼ばれます）が渡されます。これにより、ルートツリーの異なる部分に対してサーバーバンドルを作成できます。たとえば、これを使用して、特定のレイアウトルート内のすべてのルートを含む個別のサーバーバンドルを作成できます。

```ts filename=vite.config.ts lines=[7-15]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      serverBundles: ({ branch }) => {
        const isAuthenticatedRoute = branch.some((route) =>
          route.id.split("/").includes("_authenticated")
        );

        return isAuthenticatedRoute
          ? "authenticated"
          : "unauthenticated";
      },
    }),
  ],
});
```

`branch` 配列内の各 `route` には、次のプロパティが含まれています。

- `id` — このルートの一意の ID。`file` のように名前が付けられていますが、アプリディレクトリからの相対パスであり、拡張子はありません。たとえば、`app/routes/gists.$username.tsx` の `id` は `routes/gists.$username` になります。
- `path` — このルートが URL パス名と一致するために使用するパス。
- `file` — このルートのエントリポイントへの絶対パス。
- `index` — このルートがインデックスルートであるかどうか。

## ビルドマニフェスト

ビルドが完了すると、Remix は Vite プラグインの `buildEnd` フックを呼び出し、`buildManifest` オブジェクトを渡します。これは、リクエストを正しいサーバーバンドルにルーティングする方法を決定するためにビルドマニフェストを検査する必要がある場合に役立ちます。

```ts filename=vite.config.ts lines=[8-10]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      // ...
      buildEnd: async ({ buildManifest }) => {
        // ...
      },
    }),
  ],
});
```

サーバーバンドルを使用する場合、ビルドマニフェストには次のプロパティが含まれます。

- `serverBundles` — バンドル ID をバンドルの `id` および `file` にマッピングするオブジェクト。
- `routeIdToServerBundleId` — ルート ID をそのサーバーバンドル ID にマッピングするオブジェクト。
- `routes` — ルート ID をルートメタデータにマッピングするルートマニフェスト。これは、Remix リクエストハンドラーの前にカスタムルーティングレイヤーを駆動するために使用できます。

または、Vite プラグインで `manifest` オプションを有効にして、このビルドマニフェストオブジェクトをビルドディレクトリの `.remix/manifest.json` としてディスクに書き込むこともできます。

[remix-vite]: ./vite
[pathless-layout-route]: ../file-conventions/routes#nested-layouts-without-nested-urls
