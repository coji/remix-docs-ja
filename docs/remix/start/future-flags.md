---
title: Future フラグ
order: 5
---

# Future フラグと非推奨事項

このガイドでは、Remix アプリで Future フラグを採用するプロセスについて説明します。この戦略に従うことで、最小限の変更で Remix の次のメジャーバージョンにアップグレードできます。Future フラグの詳細については、[開発戦略][development-strategy]を参照してください。

各ステップの後でコミットを作成し、一度にすべてを行うのではなく、段階的にリリースすることを強くお勧めします。ほとんどのフラグは、以下に記載されている例外を除き、任意の順序で採用できます。


## 最新の v2.x への更新

まず、最新の Future フラグを含む v2.x の最新のマイナーバージョンに更新します。アップグレードすると、多くの非推奨警告が表示される可能性がありますが、それについては後で説明します。

👉 **最新の v2 に更新**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## `installGlobals`の削除

**背景**

以前は、Remix では `fetch` ポリフィルをインストールする必要がありました。これは、`installGlobals()` を呼び出すことによって実現されていました。

次のメジャーバージョンでは、Node 20 以上が必要になり、組み込みの `fetch` サポートを利用できます。

注: miniflare/cloudflare worker を Remix プロジェクトで使用している場合は、[互換性フラグ][compatibility-flag]が `2023-03-01` 以降に設定されていることを確認してください。

👉 **Node 20+ への更新**

最新の偶数番号の Node LTS バージョンにアップグレードすることをお勧めします。

👉 **`installGlobals`の削除**

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

Remix は、独自のクローズドコンパイラ（現在は「Classic Compiler」と呼ばれています）を使用しなくなり、代わりに[Vite][vite]を使用するようになりました。Vite は、JavaScript プロジェクト用の強力で高性能な拡張可能な開発環境です。パフォーマンス、トラブルシューティングなどについては、[Vite ドキュメント][vite-docs]を参照してください。

これは Future フラグではありませんが、新しい機能と一部の機能フラグは Vite プラグインでのみ使用可能であり、Classic Compiler は Remix の次のバージョンで削除されます。

👉 **Vite のインストール**

```shellscript nonumber
npm install -D vite
```

**コードの更新**

👉 **ルートの `remix.config.js` を `vite.config.ts` に置き換えます**

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

👉 **`unstable_optimizeDeps` の追加（オプション）**

多くのユーザーが、依存関係の自動[最適化][dependency-optimization]により、Vite プラグインの採用が容易になったことを発見しました。このため、`unstable_optimizeDeps` フラグを Vite プラグインに追加しました。

このフラグは、React Router v7 まで「不安定」状態のままなので、React Router v7 にアップグレードする前に Remix v2 アプリでこれを使用する必要はありません。

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

👉 **`<LiveReload/>`の削除、`<Scripts />`の保持**

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

👉 **`tsconfig.json`の更新**

`tsconfig.json`の`types`フィールドを更新し、`skipLibCheck`、`module`、`moduleResolution`がすべて正しく設定されていることを確認します。

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

👉 **`remix.env.d.ts`の更新/削除**

`remix.env.d.ts`で以下の型宣言を削除します。

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts`が空になった場合は、削除します。

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスの設定**

Vite はデフォルトではパスエイリアスを提供しません。`~`を`app`ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths]プラグインをインストールして、Remixコンパイラの動作に合わせて、Viteで`tsconfig.json`からのパスエイリアスを自動的に解決できます。

👉 **`vite-tsconfig-paths`のインストール**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite 設定への`vite-tsconfig-paths`の追加**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

**`@remix-run/css-bundle`の削除**

Vite は、CSS サイドエフェクトインポート、PostCSS、CSS モジュールなど、他の CSS バンドル機能を組み込みでサポートしています。Remix Vite プラグインは、バンドルされた CSS を関連するルートに自動的に接続します。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr>パッケージは、Viteを使用する場合は冗長です。なぜなら、その`cssBundleHref`エクスポートは常に`undefined`になるからです。

👉 **`@remix-run/css-bundle`のアンインストール**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref`への参照の削除**

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

**`links`で参照されているCSSインポートの修正**

[ `links`関数でCSSを参照している場合][regular-css]、対応するCSSインポートを[Viteの明示的な`?url`インポート構文を使用するように更新する必要があります。][vite-url-imports]

👉 **`links`で使用されているCSSインポートに`?url`を追加**

```diff
-import styles from "~/styles/dashboard.css";
+import styles from "~/styles/dashboard.css?url";

export const links = () => {
  return [
    { rel: "stylesheet", href: styles }
  ];
}
```

**Tailwind CSSまたはVanilla Extractの移行**

Tailwind CSSまたはVanilla Extractを使用している場合は、[完全な移行ガイド][migrate-css-frameworks]を参照してください。

**Remix App Serverからの移行**

👉 **`dev`、`build`、`start`スクリプトの更新**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **Vite devサーバーポートの設定（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーの移行**

カスタムサーバーまたはCloudflare Functionsを移行する場合は、[完全な移行ガイド][migrate-a-custom-server]を参照してください。

**MDXルートの移行**

[MDX][mdx]を使用している場合は、公式の[MDX Rollupプラグイン][mdx-rollup-plugin]を使用する必要があります。ステップバイステップのチュートリアルについては、[完全な移行ガイド][migrate-mdx]を参照してください。


## v3_fetcherPersist

**背景**

フェッチャーのライフサイクルは、所有者コンポーネントのマウント解除時ではなく、アイドル状態に戻るようになったタイミングに基づいています。詳細については、[RFC を参照してください][fetcherpersist-rfc]。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードの更新**

アプリに影響を与えることはほとんどありません。`useFetchers`の使用状況を確認すると、以前よりも長く保持される場合があります。何をしているかによっては、以前よりも長くレンダリングされる場合があります。


## v3_relativeSplatPath

**背景**

`dashboard/*`など、複数セグメントのsplatパス（単なる`*`に対して）の相対パスの一致とリンクを変更します。詳細については、[CHANGELOG を参照してください][relativesplatpath-changelog]。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードの更新**

`dashboard.$.tsx`や`route("dashboard/*")`のようにパスとsplatを持つルートがあり、その下に`<Link to="relative">`や`<Link to="../relative">`のような相対リンクがある場合、コードを更新する必要があります。

👉 **ルートを2つに分割**

splatルートについては、レイアウトルートとsplatを持つ子ルートに分割します。

```diff

└── routes
    ├── _index.tsx
+   ├── dashboard.tsx
    └── dashboard.$.tsx

// or
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

👉 **相対リンクの更新**

そのルートツリー内の相対リンクを持つ`<Link>`要素を更新して、追加の`..`相対セグメントを含め、同じ場所にリンクし続けます。

```diff
// dashboard.$.tsx or dashboard/route.tsx
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

ローダーが完了する前にユーザーがページから離れるなど、サーバー側のリクエストが中止された場合、Remix は `new Error("query() call aborted...")` などのエラーではなく、`request.signal.reason` をスローします。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードの更新**

以前のエラーメッセージと一致させて他のエラーと区別するカスタムロジックが`handleError`内になかった限り、コードを調整する必要はありません。


## v3_lazyRouteDiscovery

**背景**

このフラグを使用すると、Remix は初期ロード時にクライアントに完全なルートマニフェストを送信しなくなります。代わりに、サーバーでレンダリングされたルートのみをマニフェストに送信し、ユーザーがアプリケーション内を移動するにつれて残りのルートをフェッチします。詳細については、[ドキュメント][lazy-route-discovery]と[ブログ投稿][lazy-route-discovery-blog-post]を参照してください。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_lazyRouteDiscovery: true,
  },
});
```

**コードの更新**

この機能を動作させるためにアプリケーションコードを変更する必要はありません。

特定のリンクで積極的なルート検出を無効にしたい場合は、新しい[`<Link discover>`][discover-prop]APIを使用できます。


## v3_singleFetch

<docs-warning>

このフラグには[Viteプラグイン][vite-plugin]が必要です。

</docs-warning>

**背景**

このフラグを使用すると、Remix はクライアント側のナビゲーション中にデータ要求に単一のフェッチを使用します。これにより、データ要求をドキュメント要求と同じように処理することでデータの読み込みが簡素化され、ヘッダーやキャッシュを異なる方法で処理する必要がなくなります。高度なユースケースでは、詳細な再検証を選択することもできます。「Single Fetch」ドキュメント[single-fetch]を参照してください。

👉 **フラグ（と型）の有効化**

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

**コードの更新**

フラグを有効にしても、ほとんどの場合、コードをそのまま使用できますが、次の変更は時間をかけて行う必要があり、次のメジャーバージョンより前に必要になります。

👉 **生のオブジェクトを優先して`json()`/`defer()`を削除**

Single Fetch は JSON オブジェクトと Promise をすぐにサポートしているので、`loader`/`action`関数から生のデータ返すことができます。

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

`json`/`defer`の2番目のパラメーターを使用して、レスポンスにカスタムステータスまたはヘッダーを設定していた場合、新しい`data`APIを使用して引き続きそれらの値を設定できます。

```diff
-import { json } from "@remix-run/node";
+import { data } from "@remix-run/node";

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

👉 **サーバーのタイムアウトの調整**

`entry.server.tsx`ファイルでカスタム`ABORT_DELAY`を使用していた場合は、Single Fetchによって利用される新しい`streamTimeout`APIを使用するように変更する必要があります。

```diff filename=entry.server.tsx
-const ABORT_DELAY = 5000;
+// Reject/cancel all pending promises after 5 seconds
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
+   // Automatically timeout the React renderer after 6 seconds, which ensures
+   // React has enough time to flush down the rejected boundary contents
+   setTimeout(abort, streamTimeout + 1000);
  });
}
```


## v3_routeConfig

<docs-warning>

このフラグには[Viteプラグイン][vite-plugin]が必要です。

</docs-warning>

設定ベースのルーティングは、React Router v7の新しいデフォルトであり、アプリディレクトリの`routes.ts`ファイルで設定されます。Remixでの`routes.ts`とその関連APIのサポートは、RemixプロジェクトをReact Router v7に移行する際に必要な変更を最小限に抑えるための移行パスとして設計されています。`@remix-run`スコープ内に新しいパッケージがいくつか導入されましたが、これらの新しいパッケージは、`routes.ts`のコードをReact Router v7の同等のコードと可能な限り似せておくためだけに存在します。

`v3_routeConfig`Futureフラグが有効になっている場合、Remixの組み込みファイルシステムルーティングは無効になり、プロジェクトはReact Router v7の設定ベースのルーティングを選択するようになります。Remixのファイルベースのルーティングを引き続き使用したい場合は、以下で`routes.ts`での有効化方法について説明します。

**コードの更新**

Remixのファイルシステムルーティングとルート設定をReact Router v7の同等の設定に移行するには、次の手順に従ってください。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_routeConfig: true,
  },
});
```

👉 **`@remix-run/route-config`のインストール**

このパッケージはReact Router v7の`@react-router/dev/routes`のAPIと一致するため、React Router v7への移行をできるだけ容易にします。

```shellscript nonumber
npm install -D @remix-run/route-config
```

これにより、コア`RouteConfig`型と、コードでルートを設定するためのヘルパーのセットが提供されます。

👉 **ルートが設定されていない`app/routes.ts`ファイルを追加**

```shellscript nonumber
touch app/routes.ts
```

```ts filename=app/routes.ts
import type { RouteConfig } from "@remix-run/route-config";

export default [] satisfies RouteConfig;
```

これは、新しい`routes.ts`ファイルが正常に取得されていることを確認する良い方法です。ルートが定義されていないため、アプリは空白ページをレンダリングするはずです。

👉 **`@remix-run/fs-routes`をインストールして`routes.ts`で使用**

```shellscript nonumber
npm install -D @remix-run/fs-routes
```

このパッケージはReact Router v7の`@react-router/fs-routes`のAPIと一致するため、React Router v7への移行をできるだけ容易にします。

> `ignoredRouteFiles`を`["**/*"]`に設定している場合は、Remixのファイルシステムルーティングを既にオプトアウトしているため、この手順をスキップしてください。

```ts filename=app/routes.ts
import { flatRoutes } from "@remix-run/fs-routes";

export default flatRoutes();
```

👉 **`routes`設定オプションを使用していた場合は、`@remix-run/routes-option-adapter`をインストールして`routes.ts`で使用**

Remixは、コードでルートを定義し、代替のファイルシステムルーティング規則をプラグインするためのメカニズムを提供します。これは、Viteプラグインの`routes`オプションを介して利用できます。

移行を容易にするために、Remixの`routes`オプションをReact Routerの`RouteConfig`配列に変換するアダプターパッケージが用意されています。

まず、アダプターをインストールします。

```shellscript nonumber
npm install -D @remix-run/routes-option-adapter
```

このパッケージはReact Router v7の`@react-router/remix-routes-option-adapter`のAPIと一致するため、React Router v7への移行をできるだけ容易にします。

次に、`routes.ts`ファイルを更新してアダプターを使用し、`routes`オプションの値を`remixRoutesOptionAdapter`関数に渡します。この関数は、設定されたルートの配列を返します。

たとえば、[remix-flat-routes]のような代替のファイルシステムルーティング実装を使用するために`routes`オプションを使用していた場合：

```ts filename=app/routes.ts
import { type RouteConfig } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";
import { flatRoutes } from "remix-flat-routes";

export default remixRoutesOptionAdapter((defineRoutes) =>
  flatRoutes("routes", defineRoutes)
) satisfies RouteConfig;
```

または、設定ベースのルートを定義するために`routes`オプションを使用していた場合：

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

このように設定ベースのルートを定義している場合は、古いAPIと非常に似ていますが、より合理化されている新しいルート設定APIに移行することを検討してください。たとえば、上記のルートは次のようになります。

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

異なるルート設定アプローチを混在させる必要がある場合は、それらを1つのルート配列にマージできます。`RouteConfig`型により、すべてが有効なままになります。

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


## 非推奨事項

### `@remix-run/eslint-config`

`@remix-run/eslint-config`パッケージは非推奨となり、React Router v7には含まれません。[Remixテンプレート][remix-template-eslint-config]に含まれるものなど、簡素化されたESLint設定に移行することをお勧めします。

### `json`

このユーティリティは非推奨であり、React Router v7では[Single Fetch][v3_singlefetch]のネイキッドオブジェクトの返却に置き換えられます。

- データのシリアライズ（`Date`オブジェクトの文字列化など）に`json`に依存していなかった場合は、安全に削除できます。
- `json`を使用して`headers`または`status`を返していた場合は、新しい[dataユーティリティ][data-api]をドロップイン置換として使用してこれらの値を設定できます。
- データをJSONにシリアライズする場合は、ネイティブの[Response.json()][response-json]メソッドを使用できます。

詳細については、[Single Fetch][v3_singlefetch]のドキュメントを参照してください。

### `defer`

このユーティリティは非推奨であり、React Router v7では[Single Fetch][v3_singlefetch]のネイキッドオブジェクトの返却に置き換えられます。

- `defer`を使用して`headers`または`status`を返していた場合は、新しい[dataユーティリティ][data-api]をドロップイン置換として使用してこれらの値を設定できます。

詳細については、[Single Fetch][v3_singlefetch]のドキュメントを参照してください。

### `SerializeFrom`

この型は非推奨であり、React Router v7では削除されます。[Single Fetch][v3_singlefetch]はデータのJSONへのシリアライズを行わなくなったためです。

`SerializeFrom`を使用して`loader`/`action`データのラップを解除している場合は、次のようなカスタム型を使用できます。

```ts
type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;
```

ほとんどの場合、`SerializeFrom`を削除して`useLoaderData`/`useActionData`から返される型、または`loader`/`action`関数内のデータの型を使用できます。

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


