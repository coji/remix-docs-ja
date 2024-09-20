---
title: Future Flags
order: 5
---

# Future Flags

以下のフューチャーフラッグは安定していて、採用する準備ができています。フューチャーフラッグの詳細については、[開発戦略][development-strategy] を参照してください。

## 最新の v2.x への更新

最初に、最新のフューチャーフラッグを持つ最新の v2.x のマイナーバージョンに更新します。

👉 **最新の v2 に更新**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## Vite Plugin

**背景**

Remix は、独自のクローズドコンパイラ（現在は「クラシックコンパイラ」と呼ばれています）を使用しなくなり、代わりに [Vite][vite] を使用するようになりました。Vite は、JavaScript プロジェクトのための強力で、高性能で、拡張可能な開発環境です。[Vite ドキュメント][vite-docs] を参照すると、パフォーマンス、トラブルシューティングなどに関する詳細情報が得られます。

これはフューチャーフラッグではありませんが、新しい機能と一部のフューチャーフラッグは Vite プラグインでのみ使用でき、クラシックコンパイラは Remix の次のバージョンで削除されます。

👉 **Vite をインストールする**

```shellscript nonumber
npm install -D vite
```

**コードを更新する**

👉 **ルートの Remix アプリで `remix.config.js` を `vite.config.ts` に置き換える**

```ts filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

[サポートされている Remix 設定オプション][supported-remix-config-options] のサブセットは、プラグインに直接渡される必要があります。

```ts filename=vite.config.ts lines=[3-5]
export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
});
```

👉 **`<LiveReload/>` を削除し、`<Scripts />` を保持する**

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

`tsconfig.json` の `types` フィールドを更新し、`skipLibCheck`、`module`、`moduleResolution` がすべて正しく設定されていることを確認します。

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

`remix.env.d.ts` で次の型宣言を削除します。

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts` が空になったら、削除します。

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスを設定する**

Vite はデフォルトでパスエイリアスを提供しません。`~` を `app` ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths] プラグインをインストールして、Remix コンパイラの動作に合わせて、Vite で `tsconfig.json` からパスエイリアスを自動的に解決することができます。

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

Vite は、CSS サイドエフェクトインポート、PostCSS、CSS モジュールなど、他の CSS バンドル機能に対する組み込みのサポートを提供しています。Remix Vite プラグインは、バンドルされた CSS を関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr> パッケージは、Vite を使用する場合には冗長です。その `cssBundleHref` エクスポートは常に `undefined` になります。

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

[`links` 関数で CSS を参照している場合][regular-css]、対応する CSS インポートを、[Vite の明示的な `?url` インポート構文][vite-url-imports] を使用して更新する必要があります。

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

**Tailwind CSS または Vanilla Extract の移行**

Tailwind CSS または Vanilla Extract を使用している場合は、[完全な移行ガイド][migrate-css-frameworks] を参照してください。

**Remix App Server からの移行**

👉 **`dev`、`build`、`start` スクリプトを更新する**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **Vite 設定でグローバルな Node ポリフィルをインストールする**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Vite 開発サーバーのポートを設定する（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーの移行**

カスタムサーバーまたは Cloudflare Functions を移行している場合は、[完全な移行ガイド][migrate-a-custom-server] を参照してください。

**MDX ルートの移行**

[MDX][mdx] を使用している場合は、公式の [MDX Rollup プラグイン][mdx-rollup-plugin] を使用する必要があります。手順ごとのチュートリアルについては、[完全な移行ガイド][migrate-mdx] を参照してください。

## v3_fetcherPersist

**背景**

フェッチャーのライフサイクルは、所有者コンポーネントがアンマウントされるのではなく、アイドル状態に戻るタイミングに基づくようになりました。詳細については、[RFC を参照してください][fetcherpersist-rfc]。

👉 **フラッグを有効にする**

```ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードを更新する**

アプリへの影響はほとんどない可能性があります。`useFetchers` の使用状況を確認したい場合があります。これは、以前よりも長く持続する可能性があります。何をしているかによって、以前よりも長い時間レンダリングされる可能性があります。

## v3_relativeSplatPath

**背景**

`dashboard/*` （`*` だけではなく）のような複数セグメントのスプラットパスの相対パスの一致とリンクを変更します。詳細については、[CHANGELOG を参照してください][relativesplatpath-changelog]。

👉 **フラッグを有効にする**

```ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードを更新する**

`dashboard.$.tsx` や `route("dashboard/*")` のように、パスとスプラットを含むルートがあり、その下に `<Link to="relative">` や `<Link to="../relative">` のような相対リンクがある場合は、コードを更新する必要があります。

👉 **ルートを 2 つに分割する**

スプラットルートがある場合は、レイアウトルートとスプラットを含む子ルートに分割します。

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

👉 **相対リンクを更新する**

そのルートツリー内の相対リンクを持つ `<Link>` 要素をすべて更新して、同じ場所に引き続きリンクするように、追加の `..` 相対セグメントを含めます。

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

ローダーが完了する前にユーザーがページから移動するなど、サーバー側の要求が中止された場合、Remix は `new Error("query() call aborted...")` などのエラーではなく、`request.signal.reason` をスローします。

👉 **フラッグを有効にする**

```ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードを更新する**

以前のエラーメッセージを一致させて他のエラーと区別するために、`handleError` 内にカスタムロジックがあった場合を除き、コードを調整する必要はない可能性があります。

## unstable_singleFetch

[Single Fetch][single-fetch] 動作をオプトインします（フラッグが安定したら、詳細は説明されます）。

## unstable_lazyRouteDiscovery

[Lazy Route Discovery][lazy-route-discovery] 動作をオプトインします（フラッグが安定したら、詳細は説明されます）。

## unstable_optimizeDeps

開発中に自動的な [依存関係の最適化][dependency-optimization] をオプトインします。

[development-strategy]: ../guides/api-development-strategy
[fetcherpersist-rfc]: https://github.com/remix-run/remix/discussions/7698
[relativesplatpath-changelog]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#futurev3_relativesplatpath
[single-fetch]: ../guides/single-fetch
[lazy-route-discovery]: ../guides/lazy-route-discovery
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



