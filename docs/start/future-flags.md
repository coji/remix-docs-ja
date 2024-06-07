---
title: 未来のフラグ
order: 5
---

# 未来のフラグ

以下の未来のフラグは安定しており、採用する準備ができています。未来のフラグの詳細については、[開発戦略][development-strategy] を参照してください。

## 最新の v2.x への更新

まず、最新の未来のフラグを含む、v2.x の最新のマイナーバージョンに更新します。

👉 **最新の v2 に更新**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## Vite プラグイン

**背景**

Remix は、独自のクローズドコンパイラ（現在は「クラシックコンパイラ」と呼ばれています）を使用しなくなり、代わりに [Vite][vite] を使用します。Vite は、JavaScript プロジェクト向けの強力で、高性能で、拡張可能な開発環境です。パフォーマンス、トラブルシューティングなどの詳細については、[Vite ドキュメント][vite-docs] を参照してください。

これは未来のフラグではありませんが、新しい機能と一部の機能フラグは Vite プラグインでのみ利用可能であり、クラシックコンパイラは Remix の次のバージョンで削除されます。

👉 **Vite をインストール**

```shellscript nonumber
npm install -D vite
```

**コードを更新**

👉 **`remix.config.js` を Remix アプリのルートにある `vite.config.ts` に置き換える**

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

👉 **`<LiveReload/>` を削除し、`<Scripts />` を保持**

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

👉 **`tsconfig.json` を更新**

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

👉 **`remix.env.d.ts` を更新/削除**

`remix.env.d.ts` の以下の型宣言を削除します

```diff filename=remix.env.d.ts
- /// <reference types="@remix-run/dev" />
- /// <reference types="@remix-run/node" />
```

`remix.env.d.ts` が空になった場合は、削除します

```shellscript nonumber
rm remix.env.d.ts
```

**パスエイリアスの設定**

Vite は、デフォルトでパスエイリアスを提供しません。`~` を `app` ディレクトリのエイリアスとして定義するなど、この機能に依存していた場合は、[vite-tsconfig-paths][vite-tsconfig-paths] プラグインをインストールして、Remix コンパイラの動作と一致するように、`tsconfig.json` から Vite のパスエイリアスを自動的に解決できます。

👉 **`vite-tsconfig-paths` をインストール**

```shellscript nonumber
npm install -D vite-tsconfig-paths
```

👉 **Vite 設定に `vite-tsconfig-paths` を追加**

```ts filename=vite.config.ts lines=[3,6]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
});
```

**`@remix-run/css-bundle` を削除**

Vite は、CSS サブエフェクトインポート、PostCSS、CSS モジュール、その他の CSS バンドル機能に対する組み込みサポートを提供しています。Remix Vite プラグインは、バンドルされた CSS を関連するルートに自動的に添付します。

<nobr>[`@remix-run/css-bundle`][css-bundling]</nobr> パッケージは、Vite を使用する場合、その `cssBundleHref` エクスポートが常に `undefined` になるため、冗長です。

👉 **`@remix-run/css-bundle` をアンインストール**

```shellscript nonumber
npm uninstall @remix-run/css-bundle
```

👉 **`cssBundleHref` への参照を削除**

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

**`links` で参照される CSS インポートを修正する**

[CSS を `links` 関数で参照している場合][regular-css]、[Vite の明示的な `?url` インポート構文][vite-url-imports] を使用して、対応する CSS インポートを更新する必要があります。

👉 **`links` で使用される CSS インポートに `?url` を追加**

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

👉 **Vite 設定にグローバル Node ポリフィルをインストールする**

```diff filename=vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
+import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

+installGlobals();

export default defineConfig({
  plugins: [remix()],
});
```

👉 **Vite dev サーバーポートを設定する（オプション）**

```js filename=vite.config.ts lines=[2-4]
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix()],
});
```

**カスタムサーバーを移行する**

カスタムサーバーまたは Cloudflare Functions を移行している場合は、[完全な移行ガイド][migrate-a-custom-server] を参照してください。

**MDX ルートを移行する**

[MDX][mdx] を使用している場合は、公式の [MDX Rollup プラグイン][mdx-rollup-plugin] を使用する必要があります。段階的な手順については、[完全な移行ガイド][migrate-mdx] を参照してください。

## v3_fetcherPersist

**背景**

フェッチャーのライフサイクルは、所有者コンポーネントがアンマウントされたときではなく、アイドル状態に戻ったときに基づいています。詳細については、[RFC を参照してください][fetcherpersist-rfc]。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードを更新**

アプリに影響することはほとんどありません。`useFetchers` の使用状況を確認する必要があるかもしれません。これらは以前よりも長く持続する可能性があります。何をしているかによって、以前よりも長い間何かがレンダリングされる可能性があります。

## v3_relativeSplatPath

**背景**

`dashboard/*`（単なる `*` ではなく）のような、複数のセグメントを持つスプラットパスに対する相対パスの一致とリンクを変更します。詳細については、[CHANGELOG を参照してください][relativesplatpath-changelog]。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードを更新**

`dashboard.$.tsx` または `route("dashboard/*")` のように、パスとスプラットを含むルートがあり、その下に ` <Link to="relative">` または ` <Link to="../relative">` のような相対リンクがある場合、コードを更新する必要があります。

👉 **ルートを 2 つに分割する**

スプラットルートはすべて、レイアウトルートとスプラットを含む子ルートに分割します。

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

そのルートツリー内の相対リンクを持つ `<Link>` 要素をすべて更新して、同じ場所に引き続きリンクするために、追加の `..` 相対セグメントを含めます。

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

サーバー側のリクエストが中止された場合（たとえば、ローダーが完了する前にユーザーがページから移動した場合）、Remix は `new Error("query() call aborted...")` などのエラーではなく、`request.signal.reason` をスローします。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードを更新**

`handleError` 内でカスタムロジックを使用して、以前のエラーメッセージと一致させて、他のエラーと区別していた場合を除き、コードを調整する必要はありません。

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


