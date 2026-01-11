---
title: Remix からのアップグレード
order: 3
---

# Remix からのアップグレード

<docs-info>

React Router v7 では、以下の最小バージョンが必要です。

- `node@20`
- `react@18`
- `react-dom@18`

</docs-info>

React Router v7 は、v2 以降の Remix の次のメジャーバージョンです (詳細については、["React 19 への段階的なパス" ブログ記事][incremental-path-to-react-19] を参照してください)。

[Remix v2 のすべての future フラグ][v2-future-flags] を有効にしている場合、Remix v2 から React Router v7 へのアップグレードは、主に依存関係の更新になります。

<docs-info>

ステップ 2～8 の大部分は、コミュニティメンバーの [James Restall][jrestall] が作成した [codemod][codemod] を使用して自動的に更新できます。

</docs-info>

## 1. future フラグを採用する

**👉 future フラグを採用する**

Remix v2 アプリケーションで既存のすべての [future フラグ][v2-future-flags] を採用します。

## 2. 依存関係を更新する

以前はランタイム固有のパッケージ (`@remix-run/node`、`@remix-run/cloudflare` など) を介して再エクスポートされていた「共有」API のほとんどは、v7 ではすべて `react-router` にまとめられました。そのため、`@react-router/node` や `@react-router/cloudflare` からインポートする代わりに、`react-router` から直接インポートすることになります。

```diff
-import { redirect } from "@remix-run/node";
+import { redirect } from "react-router";
```

v7 でランタイム固有のパッケージからインポートする必要がある API は、Node の `createFileSessionStorage` や Cloudflare の `createWorkersKVSessionStorage` など、そのランタイムに固有の API のみです。

**👉 codemod を実行する (自動)**

次の [codemod][codemod] を使用して、パッケージとインポートを自動的に更新できます。この codemod は、すべてのパッケージとインポートを更新します。変更を元に戻す必要がある場合に備えて、codemod を実行する前に保留中の変更をコミットしてください。

```shellscript nonumber
npx codemod remix/2/react-router/upgrade
```

**👉 新しい依存関係をインストールする**

codemod で依存関係が更新されたら、依存関係をインストールして Remix パッケージを削除し、新しい React Router パッケージを追加する必要があります。

```shellscript nonumber
npm install
```

**👉 依存関係を更新する (手動)**

codemod を使用しない場合は、依存関係を手動で更新できます。

<details>
<summary>アルファベット順のパッケージ名変更の表を表示するには展開してください</summary>

| Remix v2 パッケージ                   |     | React Router v7 パッケージ                     |
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

## 3. `package.json` の `scripts` を変更する

<docs-info>

codemod を使用した場合は、自動的に完了しているため、このステップをスキップできます。

</docs-info>

**👉 `package.json` のスクリプトを更新する**

| スクリプト      | Remix v2                            |     | React Router v7                            |
| ----------- | ----------------------------------- | --- | ------------------------------------------ |
| `dev`       | `remix vite:dev`                    | ➡️  | `react-router dev`                         |
| `build`     | `remix vite:build`                  | ➡️  | `react-router build`                       |
| `start`     | `remix-serve build/server/index.js` | ➡️  | `react-router-serve build/server/index.js` |
| `typecheck` | `tsc`                               | ➡️  | `react-router typegen && tsc`              |

## 4. `routes.ts` ファイルを追加する

<docs-info>

codemod _と_ Remix v2 `v3_routeConfig` フラグを使用した場合は、自動的に完了しているため、このステップをスキップできます。

</docs-info>

React Router v7 では、`app/routes.ts` ファイルを使用してルートを定義します。詳細については、[ルーティングのドキュメント][routing] を参照してください。

**👉 依存関係を更新する (Remix v2 `v3_routeConfig` フラグを使用している場合)**

```diff filename=app/routes.ts
-import { type RouteConfig } from "@remix-run/route-config";
-import { flatRoutes } from "@remix-run/fs-routes";
-import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";
+import { type RouteConfig } from "@react-router/dev/routes";
+import { flatRoutes } from "@react-router/fs-routes";
+import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

export default [
  // ルートがどのように定義されているか
] satisfies RouteConfig;
```

**👉 `routes.ts` ファイルを追加する (Remix v2 `v3_routeConfig` フラグを _使用していない_ 場合)**

```shellscript nonumber
touch app/routes.ts
```

後方互換性のため、Remix v2 でのルート設定に合わせて `routes.ts` を導入するには、いくつかの方法があります。

1.  「フラットルート」の [ファイルベースの規約][fs-routing] を使用していた場合、新しい `@react-router/fs-routes` パッケージを介して引き続きそれを使用できます。

    ```ts filename=app/routes.ts
    import { type RouteConfig } from "@react-router/dev/routes";
    import { flatRoutes } from "@react-router/fs-routes";

    export default flatRoutes() satisfies RouteConfig;
    ```

2.  `@remix-run/v1-route-convention` パッケージを介して Remix v1 の「ネストされた」規約を使用していた場合も、`@react-router/remix-routes-option-adapter` と組み合わせて引き続きそれを使用できます。

    ```ts filename=app/routes.ts
    import { type RouteConfig } from "@react-router/dev/routes";
    import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";
    import { createRoutesFromFolders } from "@remix-run/v1-route-convention";

    export default remixRoutesOptionAdapter(
      createRoutesFromFolders,
    ) satisfies RouteConfig;
    ```

3.  `routes` オプションを使用して構成ベースのルートを定義していた場合、`@react-router/remix-routes-option-adapter` を介してその構成を保持できます。

    ```ts filename=app/routes.ts
    import { type RouteConfig } from "@react-router/dev/routes";
    import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

    export default remixRoutesOptionAdapter(
      (defineRoutes) => {
        return defineRoutes((route) => {
          route("/", "home/route.tsx", { index: true });
          route("about", "about/route.tsx");
          route("", "concerts/layout.tsx", () => {
            route("trending", "concerts/trending.tsx");
            route(":city", "concerts/city.tsx");
          });
        });
      },
    ) satisfies RouteConfig;
    ```

    - `vite.config.ts` の `routes` オプションも必ず削除してください。

      ```diff filename=vite.config.ts
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

## 5. React Router 構成を追加する

**👉 `react-router.config.ts` をプロジェクトに追加する**

以前は `vite.config.ts` の `remix` プラグインに渡されていた構成は、`react-router.config.ts` からエクスポートされるようになりました。

注: この時点で、ステップ 1 で追加した v3 future フラグを削除する必要があります。

```shellscript nonumber
touch react-router.config.ts
```

```diff filename=vite.config.ts
export default defineConfig({
  plugins: [
-   remix({
-     ssr: true,
-     future: {/* all the v3 flags */}
-   }),
+   reactRouter(),
    tsconfigPaths(),
  ],
});
```

```diff filename=react-router.config.ts
+import type { Config } from "@react-router/dev/config";
+export default {
+  ssr: true,
+} satisfies Config;
```

## 6. React Router プラグインを `vite.config` に追加する

<docs-info>

codemod を使用した場合は、自動的に完了しているため、このステップをスキップできます。

</docs-info>

**👉 `reactRouter` プラグインを `vite.config` に追加する**

`vite.config.ts` を変更して、`@react-router/dev/vite` から新しい `reactRouter` プラグインをインポートして使用します。

```diff filename=vite.config.ts
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

## 7. 型安全性を有効にする

<docs-info>

TypeScript を使用していない場合は、このステップをスキップできます。

</docs-info>

React Router は、ルートモジュールの型をアプリのルートにある `.react-router/` ディレクトリに自動的に生成します。このディレクトリは React Router によって完全に管理され、gitignore にする必要があります。[新しい型安全機能][type-safety] の詳細をご覧ください。

**👉 `.react-router/` を `.gitignore` に追加する**

```txt
.react-router/
```

**👉 `tsconfig.json` を更新する**

`tsconfig.json` の `types` フィールドを更新して、以下を含めます。

- `include` フィールドの `.react-router/types/**/*` パス
- `types` フィールドの適切な `@react-router/*` パッケージ
- 相対インポートを簡略化するための `rootDirs`

```diff filename=tsconfig.json
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

## 8. エントリファイル内のコンポーネントの名前を変更する

<docs-info>

codemod を使用した場合は、自動的に完了しているため、このステップをスキップできます。

</docs-info>

アプリケーションに `entry.server.tsx` および/または `entry.client.tsx` ファイルがある場合は、これらのファイル内のメインコンポーネントを更新する必要があります。

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

## 9. `AppLoadContext` の型を更新する

<docs-info>

`remix-serve` を使用していた場合は、このステップをスキップできます。これは、Remix v2 でカスタムサーバーを使用していた場合にのみ適用されます。

</docs-info>

React Router は React フレームワーク _と_ スタンドアロンのルーティングライブラリの両方として使用できるため、`LoaderFunctionArgs` および `ActionFunctionArgs` の `context` 引数はオプションになり、デフォルトでは `any` として型付けされるようになりました。ロードコンテキストの型を登録して、ローダーとアクションの型安全性を確保できます。

👉 **ロードコンテキストの型を登録する**

新しい `Route.LoaderArgs` および `Route.ActionArgs` 型に移行する前に、移行を容易にするために、ロードコンテキスト型で `LoaderFunctionArgs` および `ActionFunctionArgs` を一時的に拡張できます。

```ts filename=app/env.ts
declare module "react-router" {
  // v2 で使用される AppLoadContext
  interface AppLoadContext {
    whatever: string;
  }

  // TODO: ローダーで `Route.LoaderArgs` に移行したら、これを削除します
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  // TODO: アクションで `Route.ActionArgs` に移行したら、これを削除します
  interface ActionFunctionArgs {
    context: AppLoadContext;
  }
}

export {}; // これをモジュールとして扱うために TS に必要
```

<docs-info>

`declare module` を使用して型を登録することは、[モジュール拡張][ts-module-augmentation] と呼ばれる標準的な TypeScript テクニックです。
これは、`tsconfig.json` の `include` フィールドでカバーされる任意の TypeScript ファイルで実行できますが、アプリディレクトリ内の専用の `env.ts` をお勧めします。

</docs-info>

👉 **新しい型を使用する**

[新しい型生成][type-safety] を採用したら、`LoaderFunctionArgs`/`ActionFunctionArgs` の拡張を削除し、代わりに [`Route.LoaderArgs`][server-loaders] および [`Route.ActionArgs`][server-actions] から `context` 引数を使用できます。

```ts filename=app/env.ts
declare module "react-router" {
  // v2 で使用される AppLoadContext
  interface AppLoadContext {
    whatever: string;
  }
}

export {}; // これをモジュールとして扱うために TS に必要
```

```ts filename=app/routes/my-route.tsx
import type { Route } from "./+types/my-route";

export function loader({ context }: Route.LoaderArgs) {}
// { whatever: string }  ^^^^^^^

export function action({ context }: Route.ActionArgs) {}
// { whatever: string }  ^^^^^^^
```

おめでとうございます! これで React Router v7 を使用できるようになりました。アプリケーションを実行して、すべてが期待どおりに動作していることを確認してください。

[incremental-path-to-react-19]: https://remix.run/blog/incremental-path-to-react-19
[v2-future-flags]: https://remix.run/docs/start/future-flags
[routing]: ../start/framework/routing
[fs-routing]: ../how-to/file-route-conventions
[v7-changelog-types]: https://github.com/remix-run/react-router/blob/release-next/CHANGELOG.md#type-safety-improvements
[server-loaders]: ../start/framework/data-loading#server-data-loading
[server-actions]: ../start/framework/actions#server-actions
[ts-module-augmentation]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
[type-safety]: ../explanation/type-safety
[codemod]: https://codemod.com/registry/remix-2-react-router-upgrade
[jrestall]: https://github.com/jrestall