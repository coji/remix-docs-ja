---
title: サーバーバンドル
---

# サーバーバンドル

[MODES: framework]

<br/>
<br/>

<docs-warning>これはホスティングプロバイダーとの統合のために設計された高度な機能です。アプリケーションを複数のサーバーバンドルにコンパイルする場合、適切なバンドルにリクエストを誘導するためのカスタムルーティングレイヤーがアプリケーションの前に必要になります。</docs-warning>

React Router は通常、サーバーコードを、リクエストハンドラ関数をエクスポートする単一のバンドルにビルドします。しかし、ルートツリーを複数のサーバーバンドルに分割し、それぞれが特定のルートのサブセットに対してリクエストハンドラ関数を公開したいシナリオがあります。この柔軟性を提供するために、[`react-router.config.ts`][react-router-config] は、ルートを異なるサーバーバンドルに割り当てるための関数である `serverBundles` オプションをサポートしています。

[`serverBundles` 関数][server-bundles-function] は、ツリー内の各ルート（アドレス指定できないルート、例えばパスを持たないレイアウトルートを除く）に対して呼び出され、そのルートに割り当てたいサーバーバンドル ID を返します。これらのバンドル ID は、サーバービルドディレクトリ内のディレクトリ名として使用されます。

各ルートについて、この関数は、そのルートに至るまでの、およびそのルートを含むルートの配列を受け取ります。これはルート `branch` と呼ばれます。これにより、ルートツリーの異なる部分に対してサーバーバンドルを作成できます。例えば、これを使用して、特定のレイアウトルート内のすべてのルートを含む個別のサーバーバンドルを作成することができます。

```ts filename=react-router.config.ts lines=[5-13]
import type { Config } from "@react-router/dev/config";

export default {
  // ...
  serverBundles: ({ branch }) => {
    const isAuthenticatedRoute = branch.some((route) =>
      route.id.split("/").includes("_authenticated"),
    );

    return isAuthenticatedRoute
      ? "authenticated"
      : "unauthenticated";
  },
} satisfies Config;
```

`branch` 配列内の各 `route` には、以下のプロパティが含まれています。

- `id` — このルートの一意の ID であり、`file` のように名前が付けられていますが、アプリディレクトリからの相対パスであり、拡張子はありません。例えば、`app/routes/gists.$username.tsx` は `routes/gists.$username` という `id` を持ちます
- `path` — このルートが URL パス名とマッチングするために使用するパス
- `file` — このルートのエントリーポイントへの絶対パス
- `index` — このルートが index route であるかどうか

## ビルドマニフェスト

ビルドが完了すると、React Router は `buildEnd` hook を呼び出し、`buildManifest` オブジェクトを渡します。これは、ビルドマニフェストを検査して、正しいサーバーバンドルにリクエストをルーティングする方法を決定する必要がある場合に役立ちます。

```ts filename=react-router.config.ts lines=[5-7]
import type { Config } from "@react-router/dev/config";

export default {
  // ...
  buildEnd: async ({ buildManifest }) => {
    // ...
  },
} satisfies Config;
```

サーバーバンドルを使用する場合、ビルドマニフェストには以下のプロパティが含まれます。

- `serverBundles` — バンドル ID をバンドルの `id` と `file` にマッピングするオブジェクト
- `routeIdToServerBundleId` — ルート ID をそのサーバーバンドル ID にマッピングするオブジェクト
- `routes` — ルート ID をルートメタデータにマッピングするルートマニフェスト。これは、React Router のリクエストハンドラの前にカスタムルーティングレイヤーを駆動するために使用できます

[react-router-config]: https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html
[server-bundles-function]: https://api.reactrouter.com/v7/types/_react_router_dev.config.ServerBundlesFunction.html