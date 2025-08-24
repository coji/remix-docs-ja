---
title: 未来のフラグ
order: 5
---

# 将来のフラグと非推奨

このガイドでは、Remixアプリで将来のフラグを採用するプロセスを説明します。この戦略に従うことで、Remixの次のメジャーバージョンへのアップグレードを最小限の変更で済ませることができます。将来のフラグの詳細については、[開発戦略][development-strategy]を参照してください。

各ステップの後にコミットを作成し、すべてを一度に行うのではなく、それをリリースすることを強くお勧めします。ほとんどのフラグは任意の順序で採用できますが、以下に例外を記載します。

## 最新の v2.x へのアップデート

まず、最新の v2.x のマイナーバージョンにアップデートして、最新のフューチャーフラグを入手してください。アップグレードすると、いくつかの非推奨警告が表示される可能性があります。これについては後述します。

👉 **最新の v2 にアップデート**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## `installGlobals` の削除

**背景**

以前の Remix では、`fetch` のポリフィルをインストールする必要がありました。これは `installGlobals()` を呼び出すことで実現していました。

次のメジャーバージョンでは、組み込みの `fetch` サポートを利用するために、Node 20 以上が必須となります。

注意: Remix プロジェクトで miniflare/cloudflare worker を使用している場合は、[互換性フラグ][compatibility-flag] が `2023-03-01` 以降に設定されていることを確認してください。

👉 **Node 20 以上にアップデート**

最新の偶数バージョンの Node LTS にアップグレードすることを推奨します。

👉 **`installGlobals` を削除**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

-installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

## Vite プラグインの採用

**背景**

Remix は、独自のクローズドコンパイラ（現在は「クラシックコンパイラ」と呼ばれています）を使用しなくなり、代わりに [Vite][vite] を使用するようになりました。Vite は、JavaScript プロジェクト向けの強力で高性能かつ拡張可能な開発環境です。パフォーマンス、トラブルシューティングなどの詳細については、[Vite のドキュメント][vite-docs] を参照してください。

これは将来のフラグではありませんが、新機能と一部の機能フラグは Vite プラグインでのみ利用可能であり、クラシックコンパイラは Remix の次のバージョンで削除されます。

👉 **Vite をインストールする**

```shellscript nonumber
npm install -D vite
```

**コードを更新する**

👉 **Remix アプリのルートにある `remix.config.js` を `vite.config.ts` に置き換える**

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

[サポートされている Remix 設定オプション][supported-remix-config-options] のサブセットは、プラグインに直接渡す必要があります。

```ts filename=vite.config.ts lines=[3-5]
export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
});
```

👉 **`unstable_optimizeDeps` を追加する（オプション）**

多くのユーザーが、[依存関係の最適化][dependency-optimization] を自動的に行うことで、Vite プラグインをより簡単に採用できることに気づきました。このため、Vite プラグインに `unstable_optimizeDeps` フラグを追加しました。

このフラグは、React Router v7 まで「不安定」な状態のままになるため、React Router v7 にアップグレードする前に Remix v2 アプリでこれを使用することは必須ではありません。

```ts filename=vite.config.ts lines=[4-6]
export default defineConfig({
  plugins: [
    remix({
      future: {
        unstable_optimizeDeps: true,
      },
    }),
  ],
});
```

👉 **`<LiveReload/>` を削除し、`<Scripts />` は保持する**

```diff
  import {
-   LiveReload,
    Outlet,
    Scripts,
  }

  export default function App() {
    return (
      <html>
        <head>
        </head>
        <body>
          <Outlet />
-         <LiveReload />
          <Scripts />
        </body>
      </html>
    )
  }
```

👉 **`tsconfig.json` を更新する**

`tsconfig.json` の `types` フィールドを更新し、`skipLibCheck`、`module`、および `moduleResolution` がすべて正しく設定されていることを確認します。

```json filename=tsconfig.json lines=[3-6]
{
  "compilerOptions": {
    "types": ["@remix-run/node", "vite/client"],
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

👉 **`remix.env.d.ts` を更新/削除する**

`remix.env.d.ts` の次の型宣言を削除します。

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts` が空になった場合は、削除します。

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスを設定する**

Vite はデフォルトではパスエイリアスを提供しません。`app` ディレクトリのエイリアスとして `~` を定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths] プラグインをインストールして、Remix コンパイラの動作に合わせて、Vite の `tsconfig.json` からパスエイリアスを自動的に解決できます。

👉 **`vite-tsconfig-paths` をインストールする**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite 設定に `vite-tsconfig-paths` を追加する**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

**`@remix-run/css-bundle` を削除する**

Vite には、CSS サイドエフェクトインポート、PostCSS、CSS モジュールなどの CSS バンドル機能が組み込まれています。Remix Vite プラグインは、バンドルされた CSS を関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr> パッケージは、`cssBundleHref` エクスポートが常に `undefined` になるため、Vite を使用する場合は冗長です。

👉 **`@remix-run/css-bundle` をアンインストールする**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref` への参照を削除する**

```diff filename=app/root.tsx
- import { cssBundleHref } from "@remix-run/css-bundle";
  import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

  export const links: LinksFunction = () => [
-   ...(cssBundleHref
-     ? [{ rel: "stylesheet", href: cssBundleHref }]
-     : []),
    // ...
  ];
```

**`links` で参照されている CSS インポートを修正する**

[`links` 関数で CSS を参照している][regular-css] 場合は、対応する CSS インポートを更新して、[Vite の明示的な `?url` インポート構文を使用する必要があります。][vite-url-imports]

👉 **`links` で使用されている CSS インポートに `?url` を追加する**

```diff
-import styles from "~/styles/dashboard.css";
+import styles from "~/styles/dashboard.css?url";

export const links = () => {
  return [
    { rel: "stylesheet", href: styles }
  ];
}
```

**Tailwind CSS または Vanilla Extract を移行する**

Tailwind CSS または Vanilla Extract を使用している場合は、[完全な移行ガイド][migrate-css-frameworks] を参照してください。

**Remix アプリサーバーから移行する**

👉 **`dev`、`build`、および `start` スクリプトを更新する**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **Vite 開発サーバーポートを設定する（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーを移行する**

カスタムサーバーまたは Cloudflare Functions を移行する場合は、[完全な移行ガイド][migrate-a-custom-server] を参照してください。

**MDX ルートを移行する**

[MDX][mdx] を使用している場合は、公式の [MDX Rollup プラグイン][mdx-rollup-plugin] を使用する必要があります。ステップバイステップのチュートリアルについては、[完全な移行ガイド][migrate-mdx] を参照してください。

[vite]: https://vitejs.dev/
[vite-docs]: https://vitejs.dev/guide/
[supported-remix-config-options]: https://github.com/remix-run/remix/blob/main/packages/remix-vite/README.md#remix-plugin-options
[dependency-optimization]: https://vitejs.dev/guide/dep-pre-bundling.html
[vite-tsconfig-paths]: https://github.com/aleclarson/vite-tsconfig-paths
[css-bundling]: https://remix.run/docs/en/main/utils/css-bundle
[regular-css]: https://remix.run/docs/en/main/styling/css#regular-css
[vite-url-imports]: https://vitejs.dev/guide/assets.html#the-public-directory
[migrate-css-frameworks]: https://remix.run/docs/en/main/other-api/vite#migrate-tailwind-css-or-vanilla-extract
[migrate-a-custom-server]: https://remix.run/docs/en/main/other-api/vite#migrate-a-custom-server
[mdx]: https://mdxjs.com/
[mdx-rollup-plugin]: https://github.com/mdx-js/mdx/tree/main/packages/rollup
[migrate-mdx]: https://remix.run/docs/en/main/other-api/vite#migrate-mdx-routes

## v3_fetcherPersist

**背景**

fetcherのライフサイクルは、オーナーコンポーネントがアンマウントされる時ではなく、アイドル状態に戻る時に基づくようになりました。詳細については、[RFCを参照してください][fetcherpersist-rfc]。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードを更新する**

アプリに影響を与える可能性は低いでしょう。以前よりも長く持続する可能性があるため、`useFetchers` の使用状況を確認することをお勧めします。何をしているかによっては、以前よりも長くレンダリングされる可能性があります。

[fetcherpersist-rfc]: https://github.com/remix-run/remix/blob/main/rfcs/0000-fetcher-persist.md

## v3_relativeSplatPath

**背景**

`dashboard/*` (単なる `*` ではなく) のような複数セグメントのスプラットパスに対する相対パスのマッチングとリンクを変更します。詳細については、[CHANGELOG][relativesplatpath-changelog] を参照してください。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードの更新**

`dashboard.$.tsx` や `route("dashboard/*")` のように、パスとスプラットを持つルートがあり、その下に `<Link to="relative">` や `<Link to="../relative">` のような相対リンクがある場合は、コードを更新する必要があります。

👉 **ルートを2つに分割する**

スプラットルートについては、レイアウトルートとスプラットを持つ子ルートに分割します。

```diff
└── routes
    ├── _index.tsx
+   ├── dashboard.tsx
    └── dashboard.$.tsx

// または
routes(defineRoutes) {
  return defineRoutes((route) => {
    route("/", "home/route.tsx", { index: true });
-    route("dashboard/*", "dashboard/route.tsx")
+    route("dashboard", "dashboard/layout.tsx", () => {
+      route("*", "dashboard/route.tsx");
    });
  });
},
```

👉 **相対リンクを更新する**

そのルートツリー内の相対リンクを持つ `<Link>` 要素を、同じ場所にリンクし続けるために、追加の `..` 相対セグメントを含めるように更新します。

```diff
// dashboard.$.tsx または dashboard/route.tsx
function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <nav>
-        <Link to="">Dashboard Home</Link>
-        <Link to="team">Team</Link>
-        <Link to="projects">Projects</Link>
+        <Link to="../">Dashboard Home</Link>
+        <Link to="../team">Team</Link>
+        <Link to="../projects">Projects</Link>
      </nav>
    </div>
  );
}
```

## v3_throwAbortReason

**背景**

ローダーが完了する前にユーザーがページから移動するなど、サーバー側のリクエストが中断された場合、Remixは `new Error("query() call aborted...")` のようなエラーではなく、`request.signal.reason` をスローします。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードの更新**

以前のエラーメッセージを他のエラーと区別するために `handleError` 内でカスタムロジックを使用していた場合を除き、コードを調整する必要はおそらくありません。

## v3_lazyRouteDiscovery

**背景**

このフラグを使用すると、Remixは初期ロード時にクライアントに完全なルートマニフェストを送信しなくなります。代わりに、Remixはサーバーレンダリングされたルートのみをマニフェストで送信し、ユーザーがアプリケーション内を移動するにつれて残りのルートをフェッチします。詳細については、[ドキュメント][lazy-route-discovery]と[ブログ記事][lazy-route-discovery-blog-post]を参照してください。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_lazyRouteDiscovery: true,
  },
});
```

**コードの更新**

この機能を使用するために、アプリケーションコードを変更する必要はありません。

特定のリンクで積極的なルート検出を無効にしたい場合は、新しい[`<Link discover>`][discover-prop] APIを使用すると便利な場合があります。

[lazy-route-discovery]: https://remix.run/docs/en/main/future/lazy-route-discovery
[lazy-route-discovery-blog-post]: https://remix.run/blog/lazy-route-discovery
[discover-prop]: https://remix.run/docs/en/main/components/link#discover

## v3_singleFetch

<docs-warning>

このフラグには、[Vite プラグイン][vite-plugin]が必要です。

</docs-warning>

**背景**

このフラグを使用すると、Remix はクライアントサイドのナビゲーション中にデータリクエストに対して単一の fetch を使用します。これにより、データリクエストをドキュメントリクエストと同じように扱うことでデータローディングが簡素化され、ヘッダーとキャッシュを別々に処理する必要がなくなります。高度なユースケースでは、きめ細かい再検証を選択することもできます。詳細については、["Single Fetch" のドキュメント][single-fetch]を参照してください。

👉 **フラグ（と型）を有効にする**

```ts filename=vite.config.ts lines=[5-10,16]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
});
```

**コードを更新する**

フラグを有効にした状態で、ほとんどの場合、コードをそのまま使用できるはずですが、次の変更は時間をかけて行う必要があり、次のメジャーバージョンより前に必須になります。

👉 **`json()`/`defer()` を削除して、生のオブジェクトを使用する**

Single Fetch は JSON オブジェクトと Promise をそのままサポートしているため、`loader`/`action` 関数から生のデータを返すことができます。

```diff
-import { json } from "@remix-run/node";

export async function loader({}: LoaderFunctionArgs) {
  let tasks = await fetchTasks();
- return json(tasks);
+ return tasks;
}
```

```diff
-import { defer } from "@remix-run/node";

export async function loader({}: LoaderFunctionArgs) {
  let lazyStuff = fetchLazyStuff();
  let tasks = await fetchTasks();
- return defer({ tasks, lazyStuff });
+ return { tasks, lazyStuff };
}
```

`json`/`defer` の 2 番目のパラメーターを使用して、レスポンスにカスタムステータスまたはヘッダーを設定していた場合は、新しい `data` API を使用して引き続き設定できます。（これらのヘッダーを Single Fetch データリクエストに適用するには、`headers` エクスポートが必要であることに注意してください）。

```diff
-import { json } from "@remix-run/node";
+import { data } from "@remix-run/node";

// This example assumes you already have a headers function to handle header
// merging for your document requests
export function headers() {
  // ...
}

export async function loader({}: LoaderFunctionArgs) {
  let tasks = await fetchTasks();
-  return json(tasks, {
+  return data(tasks, {
    headers: {
      "Cache-Control": "public, max-age=604800"
    }
  });
}
```

👉 **サーバーのアボート遅延を調整する**

`entry.server.tsx` ファイルでカスタムの `ABORT_DELAY` を使用していた場合は、Single Fetch で利用される新しい `streamTimeout` API を使用するように変更する必要があります。

```diff filename=entry.server.tsx
-const ABORT_DELAY = 5000;
+// 5 秒後に保留中のすべての Promise を拒否/キャンセルします
+export const streamTimeout = 5000;

// ...

function handleBrowserRequest(/* ... */) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
-        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          /* ... */
        },
        onShellError(error: unknown) {
          /* ... */
        },
        onError(error: unknown) {
          /* ... */
        },
      }
    );

-    setTimeout(abort, ABORT_DELAY);
+   // React レンダラーを 6 秒後に自動的にタイムアウトさせます。これにより、
+   // React が拒否された境界の内容をフラッシュするのに十分な時間が確保されます。
+   setTimeout(abort, streamTimeout + 1000);
  });
}
```

## v3_routeConfig

<docs-warning>

このフラグには、[Vite プラグイン][vite-plugin]が必要です。

</docs-warning>

設定ベースのルーティングは、React Router v7 の新しいデフォルトであり、アプリディレクトリ内の `routes.ts` ファイルを介して設定されます。Remix における `routes.ts` とその関連 API のサポートは、Remix プロジェクトを React Router v7 に移行する際に必要な変更を最小限に抑えるための移行パスとして設計されています。`@remix-run` スコープ内にいくつかの新しいパッケージが導入されていますが、これらの新しいパッケージは、`routes.ts` 内のコードを React Router v7 の同等のコードとできるだけ類似させるためにのみ存在します。

`v3_routeConfig` future フラグが有効になっている場合、Remix の組み込みファイルシステムルーティングは無効になり、プロジェクトは React Router v7 の設定ベースのルーティングにオプトインされます。Remix のファイルベースのルーティングを引き続き使用したい場合は、以下で `routes.ts` で有効にする方法について説明します。

**コードの更新**

Remix のファイルシステムルーティングとルート設定を React Router v7 の同等の設定に移行するには、次の手順に従います。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_routeConfig: true,
  },
});
```

👉 **`@remix-run/route-config` をインストールする**

このパッケージは、React Router v7 の `@react-router/dev/routes` の API に一致し、React Router v7 への移行を可能な限り容易にします。

```shellscript nonumber
npm install -D @remix-run/route-config
```

これにより、コアの `RouteConfig` 型と、コードでルートを設定するためのヘルパーのセットが提供されます。

👉 **設定されたルートなしで `app/routes.ts` ファイルを追加する**

```shellscript nonumber
touch app/routes.ts
```

```ts filename=app/routes.ts
import type { RouteConfig } from "@remix-run/route-config";

export default [] satisfies RouteConfig;
```

これは、新しい `routes.ts` ファイルが正常に取得されていることを確認するのに適した方法です。ルートがまだ定義されていないため、アプリは空白のページをレンダリングするはずです。

👉 **`@remix-run/fs-routes` をインストールし、`routes.ts` で使用する**

```shellscript nonumber
npm install -D @remix-run/fs-routes
```

このパッケージは、React Router v7 の `@react-router/fs-routes` の API に一致し、React Router v7 への移行を可能な限り容易にします。

> `ignoredRouteFiles` を `["**/*"]` に設定している場合は、Remix のファイルシステムルーティングをすでにオプトアウトしているため、この手順をスキップする必要があります。

```ts filename=app/routes.ts
import { flatRoutes } from "@remix-run/fs-routes";

export default flatRoutes();
```

👉 **`routes` 設定オプションを使用していた場合は、`@remix-run/routes-option-adapter` を追加し、`routes.ts` で使用する**

Remix は、コードでルートを定義し、Vite プラグインの `routes` オプションを介して利用可能な代替ファイルシステムルーティング規則をプラグインするメカニズムを提供します。

移行を容易にするために、Remix の `routes` オプションを React Router の `RouteConfig` 配列に変換するアダプターパッケージが利用可能です。

まず、アダプターをインストールすることから始めます。

```shellscript nonumber
npm install -D @remix-run/routes-option-adapter
```

このパッケージは、React Router v7 の `@react-router/remix-routes-option-adapter` の API に一致し、React Router v7 への移行を可能な限り容易にします。

次に、`routes.ts` ファイルを更新してアダプターを使用し、`routes` オプションの値を `remixRoutesOptionAdapter` 関数に渡します。これにより、設定されたルートの配列が返されます。

たとえば、[remix-flat-routes] のような代替ファイルシステムルーティング実装を使用するために `routes` オプションを使用していた場合：

```ts filename=app/routes.ts
import { type RouteConfig } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";
import { flatRoutes } from "remix-flat-routes";

export default remixRoutesOptionAdapter((defineRoutes) =>
  flatRoutes("routes", defineRoutes)
) satisfies RouteConfig;
```

または、`routes` オプションを使用して設定ベースのルートを定義していた場合：

```ts filename=app/routes.ts
import { flatRoutes } from "@remix-run/fs-routes";
import { type RouteConfig } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";

export default remixRoutesOptionAdapter((defineRoutes) => {
  return defineRoutes((route) => {
    route("/", "home/route.tsx", { index: true });
    route("about", "about/route.tsx");
    route("", "concerts/layout.tsx", () => {
      route("trending", "concerts/trending.tsx");
      route(":city", "concerts/city.tsx");
    });
  });
}) satisfies RouteConfig;
```

このように設定ベースのルートを定義している場合は、新しいルート設定 API への移行を検討することをお勧めします。これは、古い API と非常によく似ていながら、より合理化されているためです。たとえば、上記のルートは次のようになります。

```ts
import {
  type RouteConfig,
  route,
  layout,
  index,
} from "@remix-run/route-config";

export default [
  index("home/route.tsx"),
  route("about", "about/route.tsx"),
  layout("concerts/layout.tsx", [
    route("trending", "concerts/trending.tsx"),
    route(":city", "concerts/city.tsx"),
  ]),
] satisfies RouteConfig;
```

さまざまなルート設定アプローチを混在させる必要がある場合は、それらを単一のルート配列にマージできることに注意してください。`RouteConfig` 型は、すべてが有効であることを保証します。

```ts
import { flatRoutes } from "@remix-run/fs-routes";
import type { RouteConfig } from "@remix-run/route-config";
import { route } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";

export default [
  ...(await flatRoutes({ rootDirectory: "fs-routes" })),

  ...(await remixRoutesOptionAdapter(/* ... */)),

  route("/hello", "routes/hello.tsx"),
] satisfies RouteConfig;
```

## 非推奨

### @remix-run/eslint-config

`@remix-run/eslint-config` パッケージは非推奨となり、React Router v7 には含まれません。 [Remix テンプレート][remix-template-eslint-config] に含まれているような、より効率的な ESLint 設定に移行することをお勧めします。

### json

このユーティリティは非推奨となり、React Router v7 では、[Single Fetch][v3_singlefetch] の裸のオブジェクトを返す方式に置き換えられるため削除されます。

* データをシリアライズするために `json` に依存していなかった場合（`Date` オブジェクトを文字列化するなど）、安全に削除できます。
* `json` を介して `headers` または `status` を返していた場合は、これらの値を設定するためのドロップイン代替として、新しい [data util][data-api] を使用できます。
* データを JSON にシリアライズしたい場合は、ネイティブの [Response.json()][response-json] メソッドを使用できます。

詳細については、[Single Fetch][v3_singlefetch] のドキュメントをご覧ください。

### defer

このユーティリティは非推奨となり、React Router v7 では、[Single Fetch][v3_singlefetch] の裸のオブジェクトを返す方式に置き換えられるため削除されます。

* `defer` を介して `headers` や `status` を返していた場合は、新しい [data util][data-api] をドロップインの代替として使用して、これらの値を設定できます。

詳細については、[Single Fetch][v3_singlefetch] のドキュメントを参照してください。

### SerializeFrom

この型は非推奨であり、[Single Fetch][v3_singlefetch] がデータを JSON にシリアライズしなくなったため、React Router v7 で削除されます。

`SerializeFrom` を使用して `loader`/`action` データをアンラップしている場合は、次のようなカスタム型を使用できます。

```ts
type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;
```

ほとんどの場合、`SerializeFrom` を削除して、`useLoaderData`/`useActionData` から返される型、または `loader`/`action` 関数内のデータの型を使用するだけで済みます。

### マルチパートフォームデータとファイルアップロードユーティリティ

以下のユーティリティは非推奨となり、React Router v7 で削除されます。

- `unstable_parseMultipartFormData`
- `unstable_composeUploadHandlers`
- `unstable_createFileUploadHandler`
- `unstable_createMemoryUploadHandler`

マルチパートフォームデータとファイルアップロードを処理するには、[`@mjackson/form-data-parser`][form-data-parser] と [`@mjackson/file-storage`][file-storage] の使用をお勧めします。

これらのライブラリの使用方法については、[React Router の「ファイルアップロード」ドキュメント][react-router-file-uploads] または [「Remix でのファイルアップロード」ブログ記事][file-uploads-with-remix] も参照してください。

[development-strategy]: ../guides/api-development-strategy

[fetcherpersist-rfc]: https://github.com/remix-run/remix/discussions/7698

[relativesplatpath-changelog]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#futurev3_relativesplatpath

[single-fetch]: ../guides/single-fetch

[lazy-route-discovery]: ../guides/lazy-route-discovery

[lazy-route-discovery-blog-post]: https://remix.run/blog/fog-of-war

[discover-prop]: ../components/link#discover

[vite]: https://vitejs.dev

[vite-docs]: ../guides/vite

[supported-remix-config-options]: ../file-conventions/vite-config

[migrate-css-frameworks]: ../guides/vite#enable-tailwind-via-postcss

[migrate-a-custom-server]: ../guides/vite#migrating-a-custom-server

[migrate-mdx]: ../guides/vite#add-mdx-plugin

[vite-tsconfig-paths]: https://github.com/aleclarson/vite-tsconfig-paths

[css-bundling]: ../styling/bundling

[regular-css]: ../styling/css

[vite-url-imports]: https://vitejs.dev/guide/assets.html#explicit-url-imports

[mdx]: https://mdxjs.com

[mdx-rollup-plugin]: https://mdxjs.com/packages/rollup

[remix-flat-routes]: https://github.com/kiliman/remix-flat-routes

[dependency-optimization]: ../guides/dependency-optimization

[compatibility-flag]: https://developers.cloudflare.com/workers/configuration/compatibility-dates

[vite-plugin]: #adopt-the-vite-plugin

[v3_singlefetch]: #v3_singlefetch

[data-api]: ../utils/data

[response-json]: https://developer.mozilla.org/en-US/docs/Web/API/Response/json

[remix-template-eslint-config]: https://github.com/remix-run/remix/blob/main/templates/remix/.eslintrc.cjs

[form-data-parser]: https://github.com/mjackson/remix-the-web/tree/main/packages/form-data-parser

[file-storage]: https://github.com/mjackson/remix-the-web/tree/main/packages/file-storage

[file-uploads-with-remix]: https://programmingarehard.com/2024/09/06/remix-file-uploads-updated.html/

[react-router-file-uploads]: https://reactrouter.com/how-to/file-uploads