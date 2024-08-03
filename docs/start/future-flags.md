---
title: 将来のフラグ
order: 5
---

# 将来のフラグ

次の将来のフラグは安定しており、採用できます。 将来のフラグの詳細については、[開発戦略][development-strategy]をご覧ください。

## 最新のv2.xへの更新

まず、最新の将来のフラグを入手するために、v2.xの最新のマイナーバージョンに更新してください。

👉 **最新のv2に更新する**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## Viteプラグイン

**背景**

Remixは、独自のクローズドコンパイラ（現在は「クラシックコンパイラ」と呼ばれています）を使用しなくなり、代わりに[Vite][vite]を使用しています。 Viteは、JavaScriptプロジェクトのための強力でパフォーマンスの高い拡張可能な開発環境です。 [Viteのドキュメントを見る][vite-docs] パフォーマンス、トラブルシューティングなど、詳細については。

これは将来のフラグではありませんが、新しい機能と一部の機能フラグはViteプラグインでのみ使用できます。クラシックコンパイラはRemixの次のバージョンで削除されます。

👉 **Viteをインストールする**

```shellscript nonumber
npm install -D vite
```

**コードを更新する**

👉 **`remix.config.js`をRemixアプリのルートにある`vite.config.ts`に置き換える**

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

👉 **`<LiveReload/>`を削除し、`<Scripts />`を保持する**

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

👉 **`tsconfig.json`を更新する**

`tsconfig.json`の`types`フィールドを更新し、`skipLibCheck`、`module`、`moduleResolution`がすべて正しく設定されていることを確認してください。

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

👉 **`remix.env.d.ts`を更新/削除する**

`remix.env.d.ts`で以下の型宣言を削除します。

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts`が空になった場合は、削除します。

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスを構成する**

Viteはデフォルトでパスエイリアスを提供しません。 `~`を`app`ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths]プラグインをインストールして、Remixコンパイラの動作に合わせて、`tsconfig.json`内のパスエイリアスをViteで自動的に解決できます。

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

Viteには、CSS副作用インポート、PostCSS、CSSモジュールなど、他のCSSバンドル機能に対する組み込みのサポートがあります。Remix Viteプラグインは、バンドルされたCSSを関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr>パッケージは、Viteを使用している場合は冗長です。なぜなら、その`cssBundleHref`エクスポートは常に`undefined`になるからです。

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

**`links`で参照されるCSSインポートを修正する**

[CSSを`links`関数で参照している場合][regular-css]は、対応するCSSインポートを[Viteの明示的な`?url`インポート構文][vite-url-imports]を使用するように更新する必要があります。

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

**Tailwind CSSまたはVanilla Extractを移行する**

Tailwind CSSまたはVanilla Extractを使用している場合は、[完全な移行ガイド][migrate-css-frameworks]を参照してください。

**Remix App Serverから移行する**

👉 **`dev`、`build`、`start`スクリプトを更新する**

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

👉 **Vite開発サーバーポートを構成する（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーを移行する**

カスタムサーバーまたはCloudflare Functionsを移行する場合は、[完全な移行ガイド][migrate-a-custom-server]を参照してください。

**MDXルートを移行する**

[MDX][mdx]を使用している場合は、公式の[MDX Rollupプラグイン][mdx-rollup-plugin]を使用する必要があります。ステップバイステップのチュートリアルについては、[完全な移行ガイド][migrate-mdx]を参照してください。

## v3_fetcherPersist

**背景**

フェッチャーのライフサイクルは、所有者コンポーネントがアンマウントされるのではなく、アイドル状態に戻ったときに基づくようになりました。[RFCを見る][fetcherpersist-rfc] 詳細については。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードを更新する**

アプリに影響を与える可能性は低いですが、`useFetchers`の使用方法を確認することをお勧めします。これらは以前よりも長く持続する可能性があります。何をしているかによって、以前よりも長い時間レンダリングされる可能性があります。

## v3_relativeSplatPath

**背景**

`dashboard/*`（単なる`*`ではなく）のようなマルチセグメントスプラットパスの相対パスの一致とリンクを変更します。 [CHANGELOGを見る][relativesplatpath-changelog] 詳細については。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードを更新する**

`dashboard.$.tsx`または`route("dashboard/*")`のようなパスとスプラットを持つルートがあり、その下に` <Link to="relative">`または` <Link to="../relative">`のような相対リンクがある場合は、コードを更新する必要があります。

👉 **ルートを2つに分割する**

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

そのルートツリー内の相対リンクを持つ`<Link>`要素をすべて更新して、`..`相対セグメントを追加し、同じ場所に引き続きリンクするようにします。

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

ユーザーがローダーが完了する前にページから移動した場合など、サーバーサイドのリクエストが中止されると、Remixは`new Error("query() call aborted...")`などのエラーではなく、`request.signal.reason`をスローします。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードを更新する**

以前のエラーメッセージと一致して、他のエラーとの差別化を行うために`handleError`内にカスタムロジックがある場合を除き、コードを調整する必要はありません。

## unstable_singleFetch

[Single Fetch][single-fetch]の動作をオプトインします（フラグが安定したら詳細は拡張されます）。

## unstable_lazyRouteDiscovery

[Lazy Route Discovery][lazy-route-discovery]の動作をオプトインします（フラグが安定したら詳細は拡張されます）。

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

