---
title: サーバーバンドル
---

# サーバーバンドル

<docs-warning>これは、ホスティングプロバイダーの統合のために設計された高度な機能です。アプリを複数のサーバーバンドルにコンパイルする場合、アプリの前にカスタムルーティングレイヤーを配置して、リクエストを正しいバンドルに転送する必要があります。</docs-warning>

Remix は通常、サーバーコードを 1 つの要求ハンドラー関数を公開するバンドルにビルドしますが、ルートツリーを複数のサーバーバンドルに分割して、ルートのサブセットに対する要求ハンドラー関数を公開したい場合があります。このような柔軟性を提供するために、[Remix Vite プラグイン][remix-vite] は、ルートを異なるサーバーバンドルに割り当てる関数である `serverBundles` オプションをサポートしています。

提供された `serverBundles` 関数は、ツリー内の各ルート（アドレス指定できないルート、つまりパスのないレイアウトルートは除く）に対して呼び出され、割り当てたいサーバーバンドル ID を返します。これらのバンドル ID は、サーバービルドディレクトリのディレクトリ名として使用されます。

各ルートについて、この関数は、そのルートに至るまでのルートを含むルートの配列を受け取ります。これは、ルート `branch` と呼ばれ、ルートツリーの異なる部分にサーバーバンドルを作成することができます。たとえば、これを用いて、特定のレイアウトルート内のすべてのルートを含む別のサーバーバンドルを作成できます。

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

`branch` 配列の各 `route` は、次のプロパティを含みます。

- `id` — このルートの一意の ID。ファイル名と同じ名前で、アプリディレクトリを基準とした相対パスで、拡張子は除きます。たとえば、`app/routes/gists.$username.tsx` は、`id` が `routes/gists.$username` になります。
- `path` — このルートが URL パス名と一致するために使用するパス。
- `file` — このルートのエントリポイントの絶対パス。
- `index` — このルートがインデックスルートかどうか。

## ビルドマニフェスト

ビルドが完了すると、Remix は Vite プラグインの `buildEnd` フックを呼び出し、`buildManifest` オブジェクトを渡します。これは、ビルドマニフェストを検査して、リクエストを正しいサーバーバンドルにどのようにルーティングするかを判断する必要がある場合に役立ちます。

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

サーバーバンドルを使用する場合、ビルドマニフェストには、次のプロパティが含まれます。

- `serverBundles` — バンドル ID をバンドルの `id` と `file` にマッピングするオブジェクト。
- `routeIdToServerBundleId` — ルート ID をそのサーバーバンドル ID にマッピングするオブジェクト。
- `routes` — ルート ID をルートメタデータにマッピングするルートマニフェスト。これは、Remix 要求ハンドラーの前にカスタムルーティングレイヤーを構築するために使用できます。

あるいは、Vite プラグインの `manifest` オプションを有効にして、このビルドマニフェストオブジェクトをビルドディレクトリの `.remix/manifest.json` に書き込むこともできます。

[remix-vite]: ./vite
[パスのないレイアウトルート]: ../file-conventions/routes#nested-layouts-without-nested-urls


