---
title: Remix からのアップグレード
hidden: true
---

# Remix からのアップグレード

<docs-warning>このガイドは開発中であり、`7.0.0`安定版リリース前の React Router の安定化に伴い変更される可能性があります。</docs-warning>

Remix v2 から React Router v7 へのアップグレードパスは、可能な限り破壊的にならないように、[未来のフラグ][future-flags] と、軽微で単純なコード調整のためのコードモッドを使用することが目的です。この最終的なアップグレードに備えるために、既存のすべての [Remix v2 未来のフラグ][v2-future-flags] を採用することから始めることができます。

## v7 プレビュー版へのアップグレード

現在 (潜在的に不安定な) 移行を試す場合は、次の手順でほとんど完了するはずです。問題が発生した場合は、[Discord][remix-discord] または [Github][github-new-issue] でお知らせください。

### ステップ 1 - 未来のフラグを採用する

Remix v2 アプリケーションで、既存の [未来のフラグ][v2-future-flags] をすべて採用します。

### ステップ 2 - 依存関係を更新する

`package.json` およびコード内でパッケージからインポートしている箇所で、`@remix-run/*` パッケージを `react-router` と `@react-router/*` パッケージに更新する必要があります。

| Remix v2 パッケージ            |     | React Router v7 パッケージ    |
| --------------------------- | --- | -------------------------- |
| `@remix-run/architect`      | ➡️  | `@react-router/architect`  |
| `@remix-run/cloudflare`     | ➡️  | `@react-router/cloudflare` |
| `@remix-run/dev`            | ➡️  | `@react-router/dev`        |
| `@remix-run/express`        | ➡️  | `@react-router/express`    |
| `@remix-run/node`           | ➡️  | `@react-router/node`       |
| `@remix-run/react`          | ➡️  | `react-router`             |
| `@remix-run/serve`          | ➡️  | `@react-router/serve`      |
| `@remix-run/server-runtime` | ➡️  | `react-router`             |
| `@remix-run/testing`        | ➡️  | `react-router`             |

以前はランタイム固有のパッケージ (`@remix-run/node`、`@remix-run/cloudflare` など) を通じて再エクスポートされていたほとんどの "共有" API は、v7 ではすべて `react-router` に統合されました。そのため、`@react-router/node` または `@react-router/cloudflare` からインポートする代わりに、`react-router` から直接インポートすることになります。

```diff
-import { redirect } from "@react-router/node";
+import { redirect } from "react-router";
```

v7 では、ランタイム固有のパッケージからインポートすべき API は、Node 用の `createFileSessionStorage` や Cloudflare 用の `createWorkersKVSessionStorage` など、そのランタイム固有の API のみです。

### ステップ 3 - `package.json` の `scripts` を変更する

`package.json` のスクリプトを更新します。

| スクリプト      | Remix v2                            |     | React Router v7                            |
| ----------- | ----------------------------------- | --- | ------------------------------------------ |
| `dev`       | `remix vite:dev`                    | ➡️  | `react-router dev`                         |
| `build`     | `remix vite:build`                  | ➡️  | `react-router build`                       |
| `start`     | `remix-serve build/server/index.js` | ➡️  | `react-router-serve build/server/index.js` |
| `typecheck` | `tsc`                               | ➡️  | `react-router typegen && tsc`              |

### ステップ 4 - `vite.config` のプラグイン名を変更する

`vite.config.ts` のインポートを更新し、プラグイン名を変更します。

```diff
-import { vitePlugin as remix } from "@remix-run/dev";
+import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
-   remix({
-     future: {
-       // all future flags adopted
-     },
-   }),
+   reactRouter(),
    tsconfigPaths(),
  ],
});
```

### ステップ 5 - `routes.ts` ファイルを追加する

React Router v7 では、[`app/routes.ts`][routing] ファイルを使用してルートを定義します。後方互換性のために、そして [ファイルベースの規約][fs-routing] を好むユーザーのために、新しい `@react-router/fs-routes` パッケージを介して、Remix v2 で使用しているのと同じ "フラットルート" 規約を採用することができます。

```ts filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes();
```

### ステップ 6 - エントリファイルのコンポーネント名を変更する

アプリケーションに `entry.server.tsx` や `entry.client.tsx` ファイルがある場合、これらのファイルのメインコンポーネントを更新する必要があります。

```diff filename=app/entry.server.tsx
- import { RemixServer } from "@remix-run/react";
+ import { ServerRouter } from "react-router";

- <RemixServer context={remixContext} url={request.url} />,
+ <ServerRouter context={remixContext} url={request.url} />,
```

```diff filename=app/entry.client.tsx
- import { RemixBrowser } from "@remix-run/react";
+ import { HydratedRouter } from "react-router/dom";

hydrateRoot(
  document,
  <StrictMode>
-   <RemixBrowser />
+   <HydratedRouter />
  </StrictMode>,
);
```

### ステップ 7 - `AppLoadContext` の型を更新する

<docs-info>これは、Remix v2 でカスタムサーバーを使用していた場合にのみ該当します。`remix-serve` を使用していた場合は、この手順をスキップすることができます。</docs-info>

Remix アプリで `getLoadContext` を使用していた場合、`LoaderFunctionArgs`/`ActionFunctionArgs` 型は、`context` パラメータの型を (オプションで `any` として) 誤って指定していることに気づかれると思います。これらの型は `context` 型にジェネリックを受け付けますが、それでも React Router SPA アプリには存在しないため、プロパティはオプションのままです。

長期的には、新しい React Router v7 の typegen から新しい [`Route.LoaderArgs`][server-loaders]/[`Route.ActionArgs`][server-actions] 型に移行するのが適切な方法です。

ただし、アップグレードを容易にするため、短期的な解決策として、TypeScript の [モジュール拡張][ts-module-augmentation] 機能を使用して、組み込みの `LoaderFunctionArgs`/`ActionFunctionArgs` インターフェースをオーバーライドすることができます。

これは、`vite.config.ts` に次のコードを記述することで実現できます。

```ts filename="vite.config.ts"
// v2 で使用した AppLoadContext
interface AppLoadContext {
  whatever: string;
}

// v7 にコンテキストの型と必須であることを伝える
declare module "react-router" {
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }
}
```

これにより、React Router v7 にアップグレードしてアプリケーションをリリースすることができます。その後、新しい typegen アプローチにルートを段階的に移行することができます。

## プレビュー版で知っておくべき問題点

### 型安全性

v7 では、型に関するストーリーを改善するために大きな変更を加えましたが、安定版 v7 リリースの前に、それらを採用するためのパスを可能な限りスムーズにするために努力しています。新しい型に関するストーリーについては、[v7 ドラフトリリースノート][v7-changelog-types] で詳しく説明しています。大きな負担ではない場合は、v7 では全面的にこのアプローチに移行するのが型を扱う上で最善の方法です。

現時点では、v7 プレビュー版にデータ型を _段階的に_ 移行するための適切な方法がありません。Remix から React Router にデータ API (`useLoaderData`、`useFetcher`、`Await` など) のジェネリックを導入しなかった理由は、Remix v2 よりも優れた方法が提供できると確信していたためであり、React Router で API をリリースしてから取り下げるような事態を避けたいと考えていたからです。React Router v7 での型に関するストーリーがより明確になった今、アップグレードパスがどのように見えるか、よりよく理解できるようになりました。この領域の改善は、今後の v7 プレビュー版で提供される予定です。

現時点では、React Router v7 にアップグレードすると、Remix v2 アプリコードに存在していたこれらのジェネリックが不足しているため、TypeScript がエラーを大量に表示します。現時点では、プレリリースのテストを続けるために、2 つの選択肢があります。

**オプション 1 - `@ts-expect-error` または `@ts-ignore` を使用して型エラーを無視する**

```diff
+// @ts-expect-error
let data = useLoaderData<typeof loader>();
```

**オプション 2 - ジェネリックを削除し、型を手動でキャストする**

```diff
-let data = useLoaderData<typeof loader>();
+let data = useLoaderData() as ReturnType<Awaited<typeof loader>>;
```

[future-flags]: ../community/api-development-strategy
[v2-future-flags]: https://remix.run/docs/start/future-flags
[remix-discord]: https://rmx.as/discord
[github-new-issue]: https://github.com/remix-run/react-router/issues/new/choose
[routing]: ../start/routing
[fs-routing]: ../misc/file-route-conventions
[v7-changelog-types]: https://github.com/remix-run/react-router/blob/release-next/CHANGELOG.md#typesafety-improvements
[server-loaders]: ../start/data-loading#server-data-loading
[server-actions]: ../start/actions#server-actions
[ts-module-augmentation]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation



