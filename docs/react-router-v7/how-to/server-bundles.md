---
title: サーバーバンドル
---

# サーバーバンドル

[MODES: framework]

<br/>
<br/>

<docs-warning>これは、ホスティングプロバイダーとの統合のために設計された高度な機能です。アプリケーションを複数のサーバーバンドルにコンパイルする場合、正しいバンドルにリクエストをルーティングするためのカスタムルーティングレイヤーをアプリケーションの前に配置する必要があります。</docs-warning>

React Routerは通常、サーバーコードを単一のバンドルにビルドし、リクエストハンドラー関数をエクスポートします。しかし、ルートツリーを複数のサーバーバンドルに分割し、それぞれがルートのサブセットに対するリクエストハンドラー関数を公開したいシナリオもあります。この柔軟性を提供するために、[`react-router.config.ts`][react-router-config]は、異なるサーバーバンドルにルートを割り当てるための関数である`serverBundles`オプションをサポートしています。

[`serverBundles`関数][server-bundles-function]は、ツリー内の各ルート（アドレス指定できないルート、例えばパスのないレイアウトルートを除く）に対して呼び出され、そのルートに割り当てたいサーバーバンドルIDを返します。これらのバンドルIDは、サーバービルドディレクトリ内のディレクトリ名として使用されます。

各ルートについて、この関数は、そのルートに至るまでのルートと、そのルート自体を含むルートの配列（ルート`branch`と呼ばれる）を受け取ります。これにより、ルートツリーの異なる部分に対してサーバーバンドルを作成できます。例えば、特定のレイアウトルート内のすべてのルートを含む個別のサーバーバンドルを作成するためにこれを使用できます。

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

`branch`配列内の各`route`には、以下のプロパティが含まれています。

- `id` — このルートの一意のID。`file`のように命名されますが、アプリディレクトリからの相対パスで拡張子なしです。例: `app/routes/gists.$username.tsx`は`routes/gists.$username`という`id`を持ちます。
- `path` — このルートがURLパス名を照合するために使用するパス
- `file` — このルートのエントリポイントへの絶対パス
- `index` — このルートがインデックスルートであるかどうか

## ビルドマニフェスト

ビルドが完了すると、React Routerは`buildEnd`フックを呼び出し、`buildManifest`オブジェクトを渡します。これは、正しいサーバーバンドルにリクエストをルーティングする方法を決定するためにビルドマニフェストを検査する必要がある場合に役立ちます。

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

- `serverBundles` — バンドルIDをバンドルの`id`と`file`にマッピングするオブジェクト
- `routeIdToServerBundleId` — ルートIDをそのサーバーバンドルIDにマッピングするオブジェクト
- `routes` — ルートIDをルートメタデータにマッピングするルートマニフェスト。これは、React Routerのリクエストハンドラーの前にカスタムルーティングレイヤーを駆動するために使用できます。

[react-router-config]: https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html
[server-bundles-function]: https://api.reactrouter.com/v7/types/_react_router_dev.config.ServerBundlesFunction.html