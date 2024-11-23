---
title: Future Flags
order: 5
---

# Future Flagsと非推奨化

このガイドでは、RemixアプリでFuture Flagsを採用するプロセスを説明します。この戦略に従うことで、次のメジャーバージョンへのアップグレードを最小限の変更で実行できます。Future Flagsの詳細については、[開発戦略][development-strategy]を参照してください。

各ステップの後でコミットを作成し、一度にすべてを行うのではなく、段階的にリリースすることを強くお勧めします。ほとんどのフラグは、以下に示す例外を除いて、任意の順序で採用できます。


## 最新のv2.xへのアップデート

まず、最新のFuture Flagsを含むv2.xの最新のマイナーバージョンにアップデートします。アップグレード時に多くの非推奨化警告が表示される可能性がありますが、これについては後ほど説明します。

👉 **最新のv2にアップデート**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## `installGlobals`の削除

**背景**

以前は、Remixでは`fetch`ポリフィルをインストールする必要がありました。これは`installGlobals()`を呼び出すことで実現されていました。

次のメジャーバージョンでは、Node 20以上が必須となり、組み込みの`fetch`サポートを利用できるようになります。

注: miniflare/Cloudflare WorkerをRemixプロジェクトで使用している場合は、[互換性フラグ][compatibility-flag]が`2023-03-01`以降に設定されていることを確認してください。

👉 **Node 20以上にアップデート**

最新の偶数番号のNode LTSバージョンにアップグレードすることをお勧めします。

👉 **`installGlobals`の削除**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

-installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

## Viteプラグインの採用

**背景**

Remixは独自のクローズドコンパイラ（現在は「Classic Compiler」と呼ばれています）を使用せず、代わりに[Vite][vite]を使用するようになりました。Viteは、JavaScriptプロジェクトのための強力で高性能かつ拡張性の高い開発環境です。パフォーマンス、トラブルシューティングなどについては、[Viteのドキュメント][vite-docs]を参照してください。

これはFuture Flagではありませんが、新しい機能と一部のFeature FlagはViteプラグインでのみ使用可能であり、Classic Compilerは次のRemixバージョンで削除されます。

👉 **Viteのインストール**

```shellscript nonumber
npm install -D vite
```

**コードの更新**

👉 **Remixアプリのルートにある`remix.config.js`を`vite.config.ts`に置き換える**

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

[サポートされているRemixの設定オプション][supported-remix-config-options]のサブセットは、プラグインに直接渡す必要があります。

```ts filename=vite.config.ts lines=[3-5]
export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
});
```

👉 **`unstable_optimizeDeps`の追加（オプション）**

多くのユーザーが、依存関係の自動[最適化][dependency-optimization]によって、Viteプラグインの採用が容易になったと感じています。このため、Viteプラグインに`unstable_optimizeDeps`フラグを追加しました。

このフラグはReact Router v7まで「不安定」な状態のままなので、React Router v7にアップグレードする前にRemix v2アプリでこれを採用する必要はありません。

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

👉 **`<LiveReload/>`の削除、`<Scripts />`の維持**

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

Viteはデフォルトでパスエイリアスを提供しません。`~`を`app`ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths]プラグインをインストールして、tsconfig.jsonのパスエイリアスをViteで自動的に解決し、Remixコンパイラの動作と一致させることができます。

👉 **`vite-tsconfig-paths`のインストール**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite設定への`vite-tsconfig-paths`の追加**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

**`@remix-run/css-bundle`の削除**

Viteは、CSS副作用インポート、PostCSS、CSS Modulesなど、他のCSSバンドリング機能を組み込んでサポートしています。Remix Viteプラグインは、バンドルされたCSSを関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr>パッケージは、Viteを使用する場合、その`cssBundleHref`エクスポートは常に`undefined`になるため、冗長です。

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

[リンク関数でCSSを参照している場合][regular-css]、対応するCSSインポートを[Viteの明示的な`?url`インポート構文][vite-url-imports]を使用するように更新する必要があります。

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

👉 **Vite開発サーバーポートの設定（オプション）**

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

フェッチャのライフサイクルは、所有者コンポーネントのマウント解除時ではなく、アイドル状態に戻る時点に基づいています。詳細については、[RFCを参照][fetcherpersist-rfc]してください。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードの更新**

アプリに影響を与える可能性は低いでしょう。`useFetchers`の使用状況を確認し、以前よりも長く保持される可能性があるかどうかを確認することをお勧めします。何をしているかによっては、以前よりも長くレンダリングされる可能性があります。


## v3_relativeSplatPath

**背景**

`dashboard/*`のような複数セグメントのスプラットパス（`*`のみではなく）の相対パスの一致とリンクを変更します。詳細については、[CHANGELOGを参照][relativesplatpath-changelog]してください。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードの更新**

`dashboard.$.tsx`や`route("dashboard/*")`のようにパスとスプラットを持つルートで、その下に`<Link to="relative">`や`<Link to="../relative">`のような相対リンクがある場合、コードを更新する必要があります。

👉 **ルートを2つに分割**

スプラットルートについては、レイアウトルートとスプラットを持つ子ルートに分割します。

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

そのルートツリー内の相対リンクを持つ`<Link>`要素を更新して、同じ場所にリンクし続けるために余分な`..`相対セグメントを含めます。

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

ローダーが完了する前にユーザーがページから離れるなど、サーバー側のリクエストが中断された場合、Remixは`new Error("query() call aborted...")`などのエラーではなく、`request.signal.reason`をスローします。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードの更新**

以前のエラーメッセージと一致させて他のエラーと区別していた`handleError`内にカスタムロジックがない限り、コードを調整する必要はないでしょう。


## v3_lazyRouteDiscovery

**背景**

このフラグを使用すると、Remixは初期ロード時にクライアントに完全なルートマニフェストを送信しなくなります。代わりに、サーバーでレンダリングされたルートのみをマニフェストに送信し、ユーザーがアプリケーション内を移動するにつれて残りのルートを取得します。詳細については、[ドキュメント][lazy-route-discovery]と[ブログ投稿][lazy-route-discovery-blog-post]を参照してください。

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

特定のリンクで積極的なルート検出を無効化したい場合は、新しい[`<Link discover>`][discover-prop]APIを使用できます。


## v3_singleFetch

<docs-warning>

このフラグには、[Viteプラグイン][vite-plugin]が必要です。

</docs-warning>

**背景**

このフラグを使用すると、Remixはクライアント側のナビゲーション中にデータリクエストに単一のフェッチを使用します。これにより、データリクエストをドキュメントリクエストと同じように扱うことでデータの読み込みが簡素化され、ヘッダーやキャッシングを別々に処理する必要がなくなります。高度なユースケースでは、詳細な再検証を選択することもできます。詳細については、「Single Fetch」の[ドキュメント][single-fetch]を参照してください。

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

フラグが有効になっている場合、ほとんどの場合、コードをそのまま使用できますが、次の変更は時間とともに必要になり、次のメジャーバージョンより前に必要になります。

👉 **生のオブジェクトの代わりに`json()`/`defer()`を削除**

Single FetchはJSONオブジェクトとPromiseをすぐにサポートしているので、`loader`/`action`関数から生のデータを返すことができます。

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

`json`/`defer`の2番目のパラメーターを使用してレスポンスにカスタムステータスまたはヘッダーを設定していた場合は、新しい`data` APIを使用して引き続き行うことができます。

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

👉 **サーバーの中断遅延の調整**

`entry.server.tsx`ファイルでカスタム`ABORT_DELAY`を使用していた場合は、Single Fetchによって利用される新しい`streamTimeout` APIを使用するように変更する必要があります。

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

このフラグには、[Viteプラグイン][vite-plugin]が必要です。

</docs-warning>

設定ベースのルーティングは、アプリディレクトリの`routes.ts`ファイルで設定されるReact Router v7の新しいデフォルトです。Remixでの`routes.ts`とその関連APIのサポートは、RemixプロジェクトをReact Router v7に移行する際に必要な変更数を最小限に抑えるための移行パスとして設計されています。`@remix-run`スコープ内に新しいパッケージがいくつか導入されていますが、これらの新しいパッケージは、`routes.ts`のコードをReact Router v7の同等のコードとできるだけ似せておくためだけに存在します。

`v3_routeConfig` futureフラグが有効になっている場合、Remixの組み込みファイルシステムルーティングが無効になり、プロジェクトはReact Router v7の設定ベースのルーティングを選択することになります。Remixのファイルベースのルーティングの使用を続ける場合は、以下に`routes.ts`で有効にする方法を説明します。

**コードの更新**

Remixのファイルシステムルーティングとルート設定をReact Router v7の同等の設定に移行するには、次の手順に従います。

👉 **フラグの有効化**

```ts filename=vite.config.ts
remix({
  future: {
    v3_routeConfig: true,
  },
});
```

👉 **`@remix-run/route-config`のインストール**

このパッケージはReact Router v7の`@react-router/dev/routes`のAPIと一致し、React Router v7への移行をできるだけ容易にします。

```shellscript nonumber
npm install -D @remix-run/route-config
```

これにより、コアの`RouteConfig`型と、コードでルートを設定するためのヘルパーのセットが提供されます。

👉 **ルートが設定されていない`app/routes.ts`ファイルを追加**

```shellscript nonumber
touch app/routes.ts
```

```ts filename=app/routes.ts
import type { RouteConfig } from "@remix-run/route-config";

export default [] satisfies RouteConfig;
```

これは、新しい`routes.ts`ファイルが正常に取得されていることを確認する良い方法です。ルートが定義されていないため、アプリは現在空白ページをレンダリングするはずです。

👉 **`@remix-run/fs-routes`をインストールして`routes.ts`で使用**

```shellscript nonumber
npm install -D @remix-run/fs-routes
```

このパッケージはReact Router v7の`@react-router/fs-routes`のAPIと一致し、React Router v7への移行をできるだけ容易にします。

>`ignoredRouteFiles`を`["**/*"]`に設定している場合は、Remixのファイルシステムルーティングを既にオプトアウトしているため、この手順をスキップしてください。

```ts filename=app/routes.ts
import { flatRoutes } from "@remix-run/fs-routes";
import type { RouteConfig } from "@remix-run/route-config";

export const routes: RouteConfig = flatRoutes();
```

👉 **`routes`設定オプションを使用している場合、`@remix-run/routes-option-adapter`を追加して`routes.ts`で使用**

Remixは、コードでルートを定義し、代替のファイルシステムルーティング規則をプラグインするためのメカニズムを提供しており、Viteプラグインの`routes`オプションを介して使用できます。

移行を容易にするために、Remixの`routes`オプションをReact Routerの`RouteConfig`配列に変換するアダプターパッケージが用意されています。

まず、アダプターをインストールします。

```shellscript nonumber
npm install -D @remix-run/routes-option-adapter
```

このパッケージはReact Router v7の`@react-router/remix-routes-option-adapter`のAPIと一致し、React Router v7への移行をできるだけ容易にします。

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

このように設定ベースのルートを定義している場合は、以前のAPIと非常によく似ているものの、より簡素化されている新しいルート設定APIに移行することを検討してもよいでしょう。たとえば、上記のルートは次のようになります。

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

異なるルート設定アプローチを混在させる必要がある場合は、それらを1つのルート配列にマージできます。`RouteConfig`型は、すべてが有効であることを保証します。

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


## 非推奨化

### @remix-run/eslint-config

`@remix-run/eslint-config`パッケージは非推奨であり、React Router v7には含まれません。[Remixテンプレート][remix-template-eslint-config]に含まれているものなど、簡素化されたESLint設定に移行することをお勧めします。

### json

このユーティリティは非推奨であり、[Single Fetch][v3_singlefetch]の生のオブジェクトの返却に置き換えられるため、React Router v7で削除されます。

- データのシリアライズ（`Date`オブジェクトの文字列化など）に`json`を依存していなかった場合は、安全に削除できます。
- `json`を介して`headers`または`status`を返していた場合は、新しい[dataユーティリティ][data-api]をドロップイン置換として使用してこれらの値を設定できます。
- データをJSONにシリアライズする場合は、ネイティブの[Response.json()][response-json]メソッドを使用できます。

詳細については、[Single Fetch][v3_singlefetch]のドキュメントを参照してください。

### defer

このユーティリティは非推奨であり、[Single Fetch][v3_singlefetch]の生のオブジェクトの返却に置き換えられるため、React Router v7で削除されます。

- `defer`を介して`headers`または`status`を返していた場合は、新しい[dataユーティリティ][data-api]をドロップイン置換として使用してこれらの値を設定できます。

詳細については、[Single Fetch][v3_singlefetch]のドキュメントを参照してください。

### SerializeFrom

この型は非推奨であり、[Single Fetch][v3_singlefetch]はデータのJSONへのシリアライズを実行しなくなったため、React Router v7で削除されます。

`SerializeFrom`を使用して`loader`/`action`データのラップを解除している場合は、次のようなカスタム型を使用できます。

```ts
type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;
```

ほとんどの場合、`SerializeFrom`を削除して`useLoaderData`/`useActionData`から返される型、または`loader`/`action`関数のデータの型を使用できます。

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


