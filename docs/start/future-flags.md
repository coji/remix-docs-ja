---
title: 未来の機能
order: 5
---

# 未来の機能

以下の未来の機能は安定しており、導入の準備が整っています。未来の機能の詳細については、[開発戦略][development-strategy]を参照してください。

## 最新のv2.xへの更新

最新の未来の機能を利用するには、まずv2.xの最新マイナーバージョンに更新します。

👉 **最新のv2に更新**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## Viteプラグイン

**背景**

Remixは、独自のクローズドコンパイラ（現在「クラシックコンパイラ」と呼ばれています）を使用しなくなりました。代わりに[Vite][vite]を使用するようになりました。Viteは、JavaScriptプロジェクト用の強力で高性能な拡張可能な開発環境です。パフォーマンス、トラブルシューティングなどの詳細については、[Viteドキュメント][vite-docs]を参照してください。

これは未来の機能ではありませんが、新しい機能や一部の機能フラグはViteプラグインでのみ利用可能で、クラシックコンパイラは次のバージョンのRemixで削除されます。

👉 **Viteのインストール**

```shellscript nonumber
npm install -D vite
```

**コードの更新**

👉 **ルートのRemixアプリで`remix.config.js`を`vite.config.ts`に置き換えます**

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

👉 **`<LiveReload/>`を削除し、`<Scripts />`を保持します**

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

👉 **`remix.env.d.ts`の更新/削除**

`remix.env.d.ts`で以下の型宣言を削除します

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts`が空になったら、削除します

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスの設定**

Viteはデフォルトでパスエイリアスを提供しません。`~`を`app`ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths]プラグインをインストールして、Remixコンパイラの動作に合わせて、`tsconfig.json`のパスエイリアスをViteで自動的に解決することができます。

👉 **`vite-tsconfig-paths`のインストール**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite構成に`vite-tsconfig-paths`を追加します**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

**`@remix-run/css-bundle`の削除**

Viteには、CSS副作用のインポート、PostCSS、CSSモジュールなどのCSSバンドリング機能が組み込まれています。Remix Viteプラグインは、バンドルされたCSSを関連するルートに自動的にアタッチします。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr>パッケージは、Viteを使用する場合、その`cssBundleHref`エクスポートは常に`undefined`になるため、冗長です。

👉 **`@remix-run/css-bundle`のアンインストール**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref`への参照を削除します**

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

[`links`関数でCSSを参照している場合][regular-css]は、対応するCSSインポートを[Viteの明示的な`?url`インポート構文][vite-url-imports]を使用するように更新する必要があります。

👉 **`links`で使用されているCSSインポートに`?url`を追加します**

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

**Remixアプリサーバーからの移行**

👉 **`dev`、`build`、`start`スクリプトを更新します**

```json filename=package.json lines=[3-5]
{
  "scripts": {
    "dev": "remix vite:dev",
    "build": "remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}
```

👉 **Vite構成にグローバルノードポリフィルをインストールします**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Vite開発サーバーのポートを設定します（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーの移行**

カスタムサーバーまたはCloudflare Functionsに移行する場合は、[完全な移行ガイド][migrate-a-custom-server]を参照してください。

**MDXルートの移行**

[MDX][mdx]を使用している場合は、公式の[MDX Rollupプラグイン][mdx-rollup-plugin]を使用する必要があります。ステップバイステップのウォークスルーについては、[完全な移行ガイド][migrate-mdx]を参照してください。

## v3_fetcherPersist

**背景**

フェッチャのライフサイクルは、所有者コンポーネントがアンマウントされたときではなく、アイドル状態に戻ったときに基づくようになりました。詳細については、[RFCを参照してください][fetcherpersist-rfc]。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードの更新**

アプリに影響を与える可能性は低いですが、`useFetchers`の使用状況を確認する必要があるかもしれません。それらは以前よりも長く保持される可能性があります。何をしているかによって、以前よりも長くレンダリングされる可能性があります。

## v3_relativeSplatPath

**背景**

`dashboard/*`（単なる`*`ではなく）のようなマルチセグメントスプラットパスに対する相対パスのマッチングとリンクを変更します。詳細については、[CHANGELOGを参照してください][relativesplatpath-changelog]。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードの更新**

`dashboard.$.tsx`や`route("dashboard/*")`のように、パスとスプラットを持つルートがあり、その下に`<Link to="relative">`や`<Link to="../relative">`のような相対リンクがある場合は、コードを更新する必要があります。

👉 **ルートを2つに分割します**

スプラットルートがあれば、レイアウトルートとスプラットを持つ子ルートに分割します。

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

👉 **相対リンクを更新します**

そのルートツリー内の相対リンクを持つ`<Link>`要素をすべて更新して、追加の`..`相対セグメントを含め、同じ場所にリンクし続けます。

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

`handleError`内に、以前のエラーメッセージを一致させて他のエラーと区別するカスタムロジックがなければ、コードを調整する必要はありません。

[development-strategy]: ../guides/api-development-strategy
[fetcherpersist-rfc]: https://github.com/remix-run/remix/discussions/7698
[use-fetchers]: ../hooks/use-fetchers
[use-fetcher]: ../hooks/use-fetcher
[relativesplatpath-changelog]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#futurev3_relativesplatpath
[single-fetch]: ../guides/single-fetch
[vite]: https://vitejs.dev
[vite-docs]: ../guides/vite
[vite-blog-post]: https://remix.run/blog/remix-vite-stable
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


