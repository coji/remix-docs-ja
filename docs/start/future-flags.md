---
title: Future Flags
order: 5
---

# Future Flags

以下のFuture Flagsは安定しており、採用可能です。Future Flagsの詳細については、[開発戦略][development-strategy] を参照してください。

## 最新のv2.xへのアップデート

まずは、最新のFuture Flagsを入手するために、v2.xの最新マイナーバージョンにアップデートしてください。

👉 **最新のv2にアップデート**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## Vite Plugin

**背景**

Remixは、独自のクローズドコンパイラ（現在は「Classic Compiler」と呼ばれています）を使用しなくなり、代わりに[Vite][vite] を使用しています。Viteは、JavaScriptプロジェクト向けの強力で、パフォーマンスが高く、拡張可能な開発環境です。[Viteのドキュメントを参照][vite-docs] して、パフォーマンス、トラブルシューティングなどの詳細を確認してください。

これはFuture Flagではありませんが、新しい機能と一部のFuture Flagは、Vite Pluginでのみ使用可能であり、Classic Compilerは次のRemixバージョンで削除されます。

👉 **Viteをインストール**

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

[サポートされているRemix構成オプションのサブセット][supported-remix-config-options] は、プラグインに直接渡す必要があります。

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

👉 **`remix.env.d.ts`を更新/削除する**

`remix.env.d.ts`内の以下の型宣言を削除します。

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts`が空になったら、削除します。

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスの設定**

Viteは、デフォルトでパスエイリアスを提供しません。`~`を`app`ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths] プラグインをインストールして、Remixコンパイラの動作に合わせて、`tsconfig.json`のパスエイリアスをViteで自動的に解決することができます。

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

Viteは、CSS副作用のインポート、PostCSS、CSS Modulesなど、他のCSSバンドル機能に対する組み込みのサポートを提供しています。Remix Vite Pluginは、バンドルされたCSSを自動的に関連するルートにアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr> パッケージは、Viteを使用する場合、冗長です。その`cssBundleHref`エクスポートは常に`undefined`になります。

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

[`links`関数でCSSを参照している場合][regular-css]、対応するCSSインポートを[Viteの明示的な`?url`インポート構文を使用するように更新する必要があります。][vite-url-imports]

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

Tailwind CSSまたはVanilla Extractを使用している場合は、[完全な移行ガイド][migrate-css-frameworks] を参照してください。

**Remix App Serverからの移行**

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

👉 **Vite構成にグローバルなNodeポリフィルをインストールする**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Vite開発サーバーポートを設定する（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーの移行**

カスタムサーバーまたはCloudflare Functionsを移行している場合は、[完全な移行ガイド][migrate-a-custom-server] を参照してください。

**MDXルートの移行**

[MDX][mdx] を使用している場合は、公式の[MDX Rollup Plugin][mdx-rollup-plugin] を使用する必要があります。ステップバイステップのチュートリアルについては、[完全な移行ガイド][migrate-mdx] を参照してください。

## v3_fetcherPersist

**背景**

フェッチャのライフサイクルは、所有者コンポーネントがアンマウントされたときではなく、アイドル状態に戻ったときに基づいています。[RFCを参照][fetcherpersist-rfc] して、詳細を確認してください。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードの更新**

アプリケーションに影響を与える可能性は低いですが、`useFetchers`の使用方法を確認する必要があるかもしれません。それらは以前よりも長く保持される可能性があります。何をしているかに応じて、以前よりも長い時間レンダリングされる場合があります。

## v3_relativeSplatPath

**背景**

`dashboard/*`（単なる`*`ではなく）のような複数セグメントのスプラットパスに対する、相対パスの一致とリンクを変更します。詳細については、[CHANGELOGを参照][relativesplatpath-changelog] してください。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードの更新**

`dashboard.$.tsx`や`route("dashboard/*")`のように、パスとスプラットを組み合わせたルートがあり、その下に`
`<Link to="relative">`や`
`<Link to="../relative">`のような相対リンクがある場合は、コードを更新する必要があります。

👉 **ルートを2つに分割する**

スプラットルートはすべて、レイアウトルートとスプラットを含む子ルートに分割してください。

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

そのルートツリー内の相対リンクを持つ`
`<Link>`要素をすべて更新し、同じ場所にリンクし続けるために、`..`の相対セグメントを追加します。

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

ローダーが完了する前にユーザーがページから移動するなど、サーバー側のリクエストが中止された場合、Remixは`new Error("query() call aborted...")`などのエラーではなく、`request.signal.reason`をスローします。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードの更新**

以前のエラーメッセージと一致して、他のエラーと区別するカスタムロジックを`handleError`内に記述していない限り、コードを調整する必要はありません。

## unstable_singleFetch

[Single Fetch][single-fetch] の動作をオプトインします（フラグが安定したら、詳細が拡張されます）。

## unstable_fogOfWar

[Fog of War][fog-of-war] の動作をオプトインします（フラグが安定したら、詳細が拡張されます）。

[development-strategy]: ../guides/api-development-strategy
[fetcherpersist-rfc]: https://github.com/remix-run/remix/discussions/7698
[relativesplatpath-changelog]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#futurev3_relativesplatpath
[single-fetch]: ../guides/single-fetch
[fog-of-war]: ../guides/fog-of-war
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


