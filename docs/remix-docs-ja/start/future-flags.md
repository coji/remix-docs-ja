---
title: Future Flags
order: 5
---

# Future Flags

次のフューチャーフラグは安定しており、採用する準備ができています。フューチャーフラグの詳細については、[開発戦略][development-strategy]を参照してください。

## 最新のv2.xへのアップデート

最新のフューチャーフラグを利用するには、まずv2.xの最新マイナーバージョンにアップデートしてください。

👉 **最新のv2にアップデート**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## Vite Plugin

**背景**

Remixは、独自のクローズドコンパイラ（現在は「クラシックコンパイラ」と呼ばれています）を使用せず、[Vite][vite]を使用するようになりました。Viteは、JavaScriptプロジェクトのための強力で高性能、拡張可能な開発環境です。[Viteドキュメント][vite-docs]では、パフォーマンス、トラブルシューティングなどの詳細を確認できます。

これはフューチャーフラグではありませんが、新しい機能と一部のフューチャーフラグはViteプラグインでのみ利用可能であり、クラシックコンパイラはRemixの次のバージョンで削除される予定です。

👉 **Viteをインストール**

```shellscript nonumber
npm install -D vite
```

**コードのアップデート**

👉 **Remixアプリのルートにある`remix.config.js`を`vite.config.ts`に置き換える**

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

[サポートされているRemix構成オプション][supported-remix-config-options]のサブセットは、プラグインに直接渡す必要があります。

```ts filename=vite.config.ts lines=[3-5]
export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
});
```

👉 **`<LiveReload/>`を削除し、`<Scripts />`を残す**

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

👉 **`tsconfig.json`をアップデートする**

`tsconfig.json`の`types`フィールドをアップデートし、`skipLibCheck`、`module`、`moduleResolution`がすべて正しく設定されていることを確認してください。

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

👉 **`remix.env.d.ts`をアップデート/削除する**

`remix.env.d.ts`内の次の型宣言を削除してください。

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts`が空になったら、削除してください。

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスの設定**

Viteはデフォルトでパスエイリアスを提供しません。`~`を`app`ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths]プラグインをインストールして、Viteの`tsconfig.json`からパスエイリアスを自動的に解決し、Remixコンパイラの動作に合わせることができます。

👉 **`vite-tsconfig-paths`をインストールする**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite構成に`vite-tsconfig-paths`を追加する**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

**`@remix-run/css-bundle`を削除する**

Viteは、CSS副作用インポート、PostCSS、CSS Modulesなど、他のCSSバンドル機能に対する組み込みのサポートを提供しています。Remix Viteプラグインは、バンドルされたCSSを関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr>パッケージは、Viteを使用する場合は冗長です。その`cssBundleHref`エクスポートは常に`undefined`になるためです。

👉 **`@remix-run/css-bundle`をアンインストールする**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref`への参照を削除する**

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

**`links`内で参照されているCSSインポートを修正する**

[CSSを`links`関数内で参照している場合][regular-css]は、対応するCSSインポートを[Viteの明示的な`?url`インポート構文を使用するように更新する必要があります。][vite-url-imports]

👉 **`links`で使用されているCSSインポートに`?url`を追加する**

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

👉 **`dev`、`build`、`start`スクリプトをアップデートする**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **Vite構成にグローバルNodeポリフィルをインストールする**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Vite devサーバーポートを設定する（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーの移行**

カスタムサーバーまたはCloudflare Functionsを移行している場合は、[完全な移行ガイド][migrate-a-custom-server]を参照してください。

**MDXルートの移行**

[MDX][mdx]を使用している場合は、公式の[MDX Rollupプラグイン][mdx-rollup-plugin]を使用する必要があります。ステップバイステップのチュートリアルについては、[完全な移行ガイド][migrate-mdx]を参照してください。

## v3_fetcherPersist

**背景**

フェッチャーのライフサイクルは、所有者コンポーネントのマウント解除時ではなく、アイドル状態に戻るタイミングに基づくようになりました。詳細については、[RFC][fetcherpersist-rfc]を参照してください。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードのアップデート**

アプリケーションへの影響はほとんどないと思われます。`useFetchers`の使用状況を確認し、以前よりも長く持続する可能性があるかどうかを確認する必要があります。実行している処理によっては、以前よりも長くレンダリングされる場合があります。

## v3_relativeSplatPath

**背景**

`dashboard/*`（単なる`*`に対して）のように、マルチセグメントスプラットパスに対する相対パスマッチングとリンクを変更します。詳細については、[CHANGELOG][relativesplatpath-changelog]を参照してください。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードのアップデート**

`dashboard.$.tsx`または`route("dashboard/*")`のように、パスとスプラットを持つルートで、その下に`"<Link to="relative">"`または`"<Link to="../relative">"`などの相対リンクがある場合は、コードを更新する必要があります。

👉 **ルートを2つに分割する**

スプラットルートがある場合は、レイアウトルートと、スプラットを含む子ルートに分割します。

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

👉 **相対リンクをアップデートする**

そのルートツリー内の相対リンクを持つ`"<Link>"`要素をすべてアップデートし、同じ場所にリンクし続けるために、余分な`..`相対セグメントを含めます。

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

ユーザーがローダーが完了する前にページから移動した場合など、サーバー側のリクエストが中止されると、Remixは`new Error("query() call aborted...")`などのエラーではなく、`request.signal.reason`をスローします。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードのアップデート**

以前のエラーメッセージに一致させて他のエラーと区別していた`handleError`内のカスタムロジックがない限り、コードを調整する必要はありません。

## v3_singleFetch

**背景**

このフラグにより、Remixはアプリ内でSPAナビゲーションを行う場合のデータ要求に対して、「単一フェッチ」アプローチに移行します。詳細については、[ドキュメント][single-fetch]を参照してください。このアプローチに移行することを選択した主な理由は、**シンプルさ**です。Single Fetchでは、データ要求はドキュメント要求と同じように動作するようになり、開発者はヘッダー、キャッシュなどの管理方法を2つの間でどのように異ならせるかについて考える必要がなくなります。より高度なユースケースの場合、開発者は引き続き細かい再検証を選択できます。

👉 **フラグ（および型）を有効にする**

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

**コードのアップデート**

このフラグを有効にすると、ほとんどの場合、コードをそのまま使用できます。ただし、次の変更は時間とともに加える必要があり、次のメジャーバージョン以前に行う必要があります。

👉 **`json()/defer()`を生のオブジェクトに置き換える**

Single Fetchは、JSONオブジェクトとPromiseをネイティブにサポートしているので、`loader`/`action`関数から生のデータを返すことができます。

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

`json`/`defer`の2番目のパラメーターを使用して、レスポンスにカスタムステータスまたはヘッダーを設定していた場合は、新しい`data` APIを使用して引き続き行うことができます。

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

👉 **サーバーの中止遅延を調整する**

`entry.server.tsx`ファイルでカスタム`ABORT_DELAY`を使用していた場合は、Single Fetchで利用されている新しい`streamTimeout` APIを使用するように変更する必要があります。

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

## v3_lazyRouteDiscovery

**背景**

このフラグを使用すると、Remixは最初のロード時にクライアントに完全なルートマニフェストを送信しなくなります。代わりに、サーバーレンダリングされたルートのみをマニフェストに送信し、ユーザーがアプリケーション内を移動するときに残りのルートを取得します。詳細については、[ドキュメント][lazy-route-discovery]と[ブログ投稿][lazy-route-discovery-blog-post]を参照してください。

👉 **フラグを有効にする**

```ts filename=vite.config.ts
remix({
  future: {
    v3_lazyRouteDiscovery: true,
  },
});
```

**コードのアップデート**

この機能を使用するために、アプリケーションコードを変更する必要はありません。

特定のリンクで積極的なルート検出を無効にしたい場合は、新しい[`<Link discover>`][discover-prop] APIを使用することができます。

## unstable_optimizeDeps

開発中に[依存関係の最適化][dependency-optimization]を自動的に行うようにします。このフラグは、React Router v7まで「不安定」な状態のままとなるため、Remix v2アプリでReact Router v7にアップグレードする前に、このフラグを採用する必要はありません。

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
[dependency-optimization]: ../guides/dependency-optimization



