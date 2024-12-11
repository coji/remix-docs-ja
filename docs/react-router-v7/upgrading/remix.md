---
title: Remixからのアップグレード
order: 2
---

# Remixからのアップグレード

React Router v7は、v2に続くRemixの次のメジャーバージョンです（詳細については、当社の["Incremental Path to React 19" ブログ投稿][incremental-path-to-react-19]を参照してください）。

すべての[Remix v2の将来的なフラグ][v2-future-flags]を有効にしている場合、Remix v2からReact Router v7へのアップグレードは、主に依存関係の更新を含みます。

<docs-info>

手順2～8の大部分は、コミュニティメンバーの[James Restall][jrestall]によって作成された[codemod][codemod]を使用して自動的に更新できます。

</docs-info>

## 1. 未来のフラグを採用する

**👉 未来のフラグを採用する**

Remix v2アプリケーションですべての既存の[将来的なフラグ][v2-future-flags]を採用します。

## 2. 依存関係を更新する

以前はランタイム固有のパッケージ(`@remix-run/node`、`@remix-run/cloudflare`など)を通じて再エクスポートされていた「共有」APIの大部分は、v7では`react-router`に統合されました。そのため、`@react-router/node`または`@react-router/cloudflare`からインポートする代わりに、`react-router`から直接インポートします。

```diff
-import { redirect } from "@remix-run/node";
+import { redirect } from "react-router";
```

v7でランタイム固有のパッケージからインポートする必要があるAPIは、Nodeの`createFileSessionStorage`やCloudflareの`createWorkersKVSessionStorage`など、そのランタイムに固有のAPIのみです。

**👉 codemodを実行する（自動化）**

次の[codemod][codemod]を使用して、パッケージとインポートを自動的に更新できます。このcodemodは、すべてのパッケージとインポートを更新します。元に戻す必要がある場合に備えて、codemodを実行する前に、保留中の変更をコミットしてください。

```shellscript nonumber
npx codemod remix/2/react-router/upgrade
```

**👉 新しい依存関係をインストールする**

codemodで依存関係を更新した後、Remixパッケージを削除し、新しいReact Routerパッケージを追加するために、依存関係をインストールする必要があります。

```shellscript nonumber
npm install
```

**👉 依存関係を更新する（手動）**

codemodを使用しない場合は、手動で依存関係を更新できます。

<details>
<summary>アルファベット順のパッケージ名の変更の表を表示するには展開します</summary>

| Remix v2パッケージ                   |     | React Router v7パッケージ                     |
| ---------------------------------- | --- | ------------------------------------------- |
| `@remix-run/architect`             | ➡️  | `@react-router/architect`                   |
| `@remix-run/cloudflare`            | ➡️  | `@react-router/cloudflare`                  |
| `@remix-run/dev`                   | ➡️  | `@react-router/dev`                         |
| `@remix-run/express`               | ➡️  | `@react-router/express`                     |
| `@remix-run/fs-routes`             | ➡️  | `@react-router/fs-routes`                   |
| `@remix-run/node`                  | ➡️  | `@react-router/node`                        |
| `@remix-run/react`                 | ➡️  | `react-router`                              |
| `@remix-run/route-config`          | ➡️  | `@react-router/dev`                         |
| `@remix-run/routes-option-adapter` | ➡️  | `@react-router/remix-routes-option-adapter` |
| `@remix-run/serve`                 | ➡️  | `@react-router/serve`                       |
| `@remix-run/server-runtime`        | ➡️  | `react-router`                              |
| `@remix-run/testing`               | ➡️  | `react-router`                              |

</details>

## 3. `package.json`の`scripts`を変更する

<docs-info>

codemodを使用した場合、これは自動的に完了しているので、この手順をスキップできます。

</docs-info>

**👉 `package.json`のスクリプトを更新する**

| スクリプト      | Remix v2                            |     | React Router v7                            |
| ----------- | ----------------------------------- | --- | ------------------------------------------ |
| `dev`       | `remix vite:dev`                    | ➡️  | `react-router dev`                         |
| `build`     | `remix vite:build`                  | ➡️  | `react-router build`                       |
| `start`     | `remix-serve build/server/index.js` | ➡️  | `react-router-serve build/server/index.js` |
| `typecheck` | `tsc`                               | ➡️  | `react-router typegen && tsc`              |

## 4. `routes.ts`ファイルを追加する

<docs-info>

codemodとRemix v2の`v3_routeConfig`フラグを使用した場合、これは自動的に完了しているので、この手順をスキップできます。

</docs-info>

React Router v7では、`app/routes.ts`ファイルを使用してルートを定義します。詳細については、[ルーティングドキュメント][routing]を参照してください。

**👉 依存関係を更新する（Remix v2の`v3_routeConfig`フラグを使用している場合）**

```diff
// app/routes.ts
-import { type RouteConfig } from "@remix-run/route-config";
-import { flatRoutes } from "@remix-run/fs-routes";
-import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";
+import { type RouteConfig } from "@react-router/dev/routes";
+import { flatRoutes } from "@react-router/fs-routes";
+import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

export default [
  // ルートの定義方法
] satisfies RouteConfig;

```

**👉 `routes.ts`ファイルを追加する（Remix v2の`v3_routeConfig`フラグを使用していない場合）**

```shellscript nonumber
touch app/routes.ts
```

後方互換性のため、そして[ファイルベースの規約][fs-routing]を好む人のために、Remix v2で使用しているのと同じ「フラットルート」規約を、新しい`@react-router/fs-routes`パッケージを介して選択できます。

```ts filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

または、`routes`オプションを使用して設定ベースのルートを定義していた場合：

```ts filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

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

`vite.config.ts`で`routes`オプションを使用していた場合は、削除してください。

```diff
export default defineConfig({
  plugins: [
    remix({
      ssr: true,
-     ignoredRouteFiles: ['**/*'],
-     routes(defineRoutes) {
-       return defineRoutes((route) => {
-         route("/somewhere/cool/*", "catchall.tsx");
-       });
-     },
    })
    tsconfigPaths(),
  ],
});
```

## 5. React Routerの設定を追加する

**👉 プロジェクトに`react-router.config.ts`を追加する**

以前は`vite.config.ts`の`remix`プラグインに渡されていた設定は、現在`react-router.config.ts`からエクスポートされます。

注：この時点で、ステップ1で追加したv3の将来的なフラグを削除する必要があります。

```shellscript nonumber
touch react-router.config.ts
```

```diff
// vite.config.ts
export default defineConfig({
  plugins: [
-   remix({
-     ssr: true,
-     future: {/* all the v3 flags */}
-   }),
+   remix(),
    tsconfigPaths(),
  ],
});

// react-router.config.ts
+import type { Config } from "@react-router/dev/config";
+export default {
+  ssr: true,
+} satisfies Config;
```

## 6. `vite.config`にReact Routerプラグインを追加する

<docs-info>

codemodを使用した場合、この手順は自動的に完了しているので、スキップできます。

</docs-info>

**👉 `vite.config`に`reactRouter`プラグインを追加する**

`@react-router/dev/vite`から新しい`reactRouter`プラグインをインポートして使用するために、`vite.config.ts`を変更します。

```diff
-import { vitePlugin as remix } from "@remix-run/dev";
+import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
-   remix(),
+   reactRouter(),
    tsconfigPaths(),
  ],
});
```

## 7. 型安全を有効にする

<docs-info>

TypeScriptを使用していない場合は、この手順をスキップできます。

</docs-info>

React Routerは、アプリのルートに`.react-router/`ディレクトリにルートモジュールの型を自動的に生成します。このディレクトリはReact Routerによって完全に管理されており、gitignoreする必要があります。[新しい型安全機能][type-safety]の詳細をご覧ください。

**👉 `.gitignore`に`.react-router/`を追加する**

```txt
.react-router/
```

**👉 `tsconfig.json`を更新する**

`tsconfig.json`の`types`フィールドを更新して、以下を含めます。

- `include`フィールドに`.react-router/types/**/*`パス
- `types`フィールドに適切な`@react-router/*`パッケージ
- 簡素化された相対インポートのための`rootDirs`

```diff
{
  "include": [
    /* ... */
+   ".react-router/types/**/*"
  ],
  "compilerOptions": {
-   "types": ["@remix-run/node", "vite/client"],
+   "types": ["@react-router/node", "vite/client"],
    /* ... */
+   "rootDirs": [".", "./.react-router/types"]
  }
}
```

## 8. エントリファイルのコンポーネントの名前を変更する

<docs-info>

codemodを使用した場合、この手順は自動的に完了しているので、スキップできます。

</docs-info>

アプリケーションに`entry.server.tsx`と/または`entry.client.tsx`ファイルがある場合は、これらのファイルのメインコンポーネントを更新する必要があります。

```diff filename=app/entry.server.tsx
-import { RemixServer } from "@remix-run/react";
+import { ServerRouter } from "react-router";

-<RemixServer context={remixContext} url={request.url} />,
+<ServerRouter context={remixContext} url={request.url} />,
```

```diff filename=app/entry.client.tsx
-import { RemixBrowser } from "@remix-run/react";
+import { HydratedRouter } from "react-router/dom";

hydrateRoot(
  document,
  <StrictMode>
-   <RemixBrowser />
+   <HydratedRouter />
  </StrictMode>,
);
```

## 9. `AppLoadContext`の型を更新する

<docs-info>

`remix-serve`を使用していた場合は、この手順をスキップできます。これは、Remix v2でカスタムサーバーを使用していた場合にのみ適用されます。

</docs-info>

React RouterはReactフレームワークとスタンドアロンのルーティングライブラリの両方として使用できるため、`LoaderFunctionArgs`と`ActionFunctionArgs`の`context`引数は、デフォルトではオプションで`any`型付けされます。ローダーとアクションの型安全性を確保するために、ロードコンテキストの型を登録できます。

👉 **ロードコンテキストの型を登録する**

新しい`Route.LoaderArgs`と`Route.ActionArgs`型に移行する前に、移行を容易にするために、一時的に`LoaderFunctionArgs`と`ActionFunctionArgs`にロードコンテキスト型を追加できます。

```ts filename=app/env.ts
declare module "react-router" {
  // v2で使用されていたAppLoadContext
  interface AppLoadContext {
    whatever: string;
  }

  // TODO: ローダーに代わりに`Route.LoaderArgs`を使用するようになったら、これを削除します
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: アクションに代わりに`Route.ActionArgs`を使用するようになったら、これを削除します
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }
}

export {}; // TSがこのモジュールとして扱うために必要
```

<docs-info>

型を登録するために`declare module`を使用することは、[モジュール拡張][ts-module-augmentation]と呼ばれる標準的なTypeScriptテクニックです。
これは、`tsconfig.json`の`include`フィールドで対象となる任意のTypeScriptファイルで行うことができますが、アプリディレクトリ内の専用の`env.ts`を推奨します。

</docs-info>

👉 **新しい型を使用する**

[新しい型生成][type-safety]を採用したら、`LoaderFunctionArgs`/`ActionFunctionArgs`の拡張を削除し、代わりに[`Route.LoaderArgs`][server-loaders]と[`Route.ActionArgs`][server-actions]から`context`引数を使用できます。

```ts filename=app/env.ts
declare module "react-router" {
  // v2で使用されていたAppLoadContext
  interface AppLoadContext {
    whatever: string;
  }
}

export {}; // TSがこのモジュールとして扱うために必要
```

```ts filename=app/routes/my-route.tsx
import type { Route } from "./+types/my-route";

export function loader({ context }: Route.LoaderArgs) {}
// { whatever: string }  ^^^^^^^

export function action({ context }: Route.ActionArgs) {}
// { whatever: string }  ^^^^^^^
```

おめでとうございます！これでReact Router v7を使用できるようになりました。アプリケーションを実行して、すべてが期待通りに動作していることを確認してください。

[incremental-path-to-react-19]: https://remix.run/blog/incremental-path-to-react-19
[v2-future-flags]: https://remix.run/docs/start/future-flags
[routing]: ../start/framework/routing
[fs-routing]: ../how-to/file-route-conventions
[v7-changelog-types]: https://github.com/remix-run/react-router/blob/release-next/CHANGELOG.md#typesafety-improvements
[server-loaders]: ../start/framework/data-loading#server-data-loading
[server-actions]: ../start/framework/actions#server-actions
[ts-module-augmentation]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
[type-safety]: ../explanation/type-safety
[codemod]: https://codemod.com/registry/remix-2-react-router-upgrade
[jrestall]: https://github.com/jrestall


