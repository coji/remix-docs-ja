---
title: SPA モード
---

# SPA モード

Remix は当初から、サーバーアーキテクチャはユーザーが所有するという考え方を貫いています。そのため、Remix は [Web Fetch API][fetch] を基盤として構築されており、ビルトインまたはコミュニティ提供のアダプターを介して、あらゆる最新の [ランタイム][runtimes] で実行できます。ほとんどのアプリでは、サーバーを使用することで最高の UX/パフォーマンス/SEO などが得られると考えていますが、現実世界ではシングルページアプリケーション (SPA) に適したユースケースが数多く存在することも否定できません。

- サーバーを管理したくない、GitHub Pages またはその他の CDN で静的ファイルを使用してアプリをデプロイしたい
- Node.js サーバーを実行したくない
- [React Router アプリを移行したい][migrate-rr]
- サーバーサイドレンダリングできない特殊なタイプの埋め込みアプリを開発している
- 「あなたのボスは SPA アーキテクチャの UX の限界を気にしておらず、開発チームにアーキテクチャの再設計に時間/能力を割く余裕を与えてくれない」[- Kent C. Dodds][kent-tweet]

そのため、[2.5.0][2.5.0] ([RFC][rfc]) で **SPA モード** のサポートを追加しました。これは、[クライアントデータ][client-data] API を基盤として構築されています。

<docs-info>SPA モードを使用するには、アプリで Vite と [Remix Vite プラグイン][remix-vite] を使用する必要があります。</docs-info>

## SPA モードとは？

SPA モードは、基本的に `createBrowserRouter`/`RouterProvider` を使用した独自の [React Router + Vite][rr-setup] セットアップと同様ですが、いくつかの追加の Remix の機能が備わっています。

- ファイルベースのルーティング（または [`routes()`][routes-config] を介した設定ベース）
- [`route.lazy`][route-lazy] による自動ルートベースのコード分割
- ルートモジュールを事前にフェッチするための `<Link prefetch>` サポート
- Remix の [`<Meta>`][meta]/[`<Links>`][links] API を使用した `<head>` の管理

SPA モードは、実行時に Remix サーバーを実行する予定がなく、ビルド時に静的な `index.html` ファイルを生成し、データの読み込みと変更には [クライアントデータ][client-data] API のみを使用することを Remix に指示します。

`index.html` は、`root.tsx` ルートの `HydrateFallback` コンポーネントから生成されます。`index.html` を生成するための最初の「レンダリング」には、ルートよりも深いルートは含まれません。これにより、CDN/サーバーで設定されている場合、`/`（つまり `/about`）を超えるパスに対して `index.html` ファイルを提供/ハイドレートできます。

## 使い方

リポジトリの SPA モードテンプレートを使用してすぐに開始できます。

```shellscript
npx create-remix@latest --template remix-run/remix/templates/spa
```

または、Remix+Vite アプリで Remix Vite プラグインの設定で `ssr: false` を設定することで、手動で SPA モードを有効にすることができます。

```js
// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      ssr: false,
    }),
  ],
});
```

### 開発

SPA モードでは、従来の Remix SSR アプリと同様に開発を行い、実際には HMR/HDR を有効にするために実行中の Remix 開発サーバーを使用します。

```sh
npx remix vite:dev
```

### 本番環境

SPA モードでアプリをビルドすると、Remix は `/` ルートのサーバーハンドラーを呼び出し、レンダリングされた HTML をクライアントサイドアセット（デフォルトでは `build/client/index.html`）と一緒に `index.html` ファイルに保存します。

```sh
npx remix vite:build
```

#### プレビュー

[vite preview][vite-preview] を使用して、ローカルで本番ビルドをプレビューできます。

```shellscript
npx vite preview
```

<docs-warning>`vite preview` は本番サーバーとして使用することを目的としていません。</docs-warning>

#### デプロイ

デプロイするには、任意の HTTP サーバーからアプリを提供できます。サーバーは、単一のルート `/index.html` ファイルから複数のパスを提供するように設定する必要があります（一般的に「SPA フォールバック」と呼ばれます）。サーバーがこの機能を直接サポートしていない場合は、追加の手順が必要になる場合があります。

簡単な例として、[sirv-cli][sirv-cli] を使用できます。

```shellscript
npx sirv-cli build/client/ --single
```

または、`express` サーバーを介して提供する場合（ただし、その時点で Remix を SSR モードで実行することを検討した方が良いかもしれません 😉）：

```js
app.use("/assets", express.static("build/client/assets"));
app.get("*", (req, res, next) =>
  res.sendFile(
    path.join(process.cwd(), "build/client/index.html"),
    next
  )
);
```

## ドキュメント全体ではなく div をハイドレートする

HTML ドキュメント全体をハイドレートしたくない場合は、SPA モードを使用し、`<div id="app">` などのドキュメントのサブセクションのみをハイドレートするように、いくつかの小さな変更を加えることができます。

**1. `index.html` ファイルを追加する**

Remix は HTML ドキュメントをレンダリングしないため、Remix の外部で HTML を提供する必要があります。これを行う最も簡単な方法は、ビルド時に Remix でレンダリングされた HTML で置き換えることができるプレースホルダーを使用して、`app/index.html` ドキュメントを保持することです。最終的な `index.html` を生成します。

```html filename=app/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Cool App!</title>
  </head>
  <body>
    <div id="app"><!-- Remix SPA --></div>
  </body>
</html>
```

`<!-- Remix SPA -->` HTML コメントは、Remix HTML で置き換えるものです。

<docs-info>空白は DOM/VDOM ツリーで意味を持つため、周囲の `div` の周囲に空白を含めないことが重要です。それ以外の場合は、React のハイドレーションの問題が発生します。</docs-info>

**2. `root.tsx` を更新する**

`<div id="app">` の内容のみをレンダリングするようにルートルートを更新します。

```tsx filename=app/root.tsx
export function HydrateFallback() {
  return (
    <>
      <p>Loading...</p>
      <Scripts />
    </>
  );
}

export default function Component() {
  return (
    <>
      <Outlet />
      <Scripts />
    </>
  );
}
```

**3. `entry.server.tsx` を更新する**

`app/entry.server.tsx` ファイルでは、Remix でレンダリングされた HTML を取得し、静的 `app/index.html` ファイルのプレースホルダーに挿入する必要があります。また、デフォルトの `entry.server.tsx` ファイルのように `<!DOCTYPE html>` 宣言を事前に追加するのを停止する必要があります。これは `app/index.html` ファイルにあるはずです）。

```tsx filename=app/entry.server.tsx
import fs from "node:fs";
import path from "node:path";

import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const shellHtml = fs
    .readFileSync(
      path.join(process.cwd(), "app/index.html")
    )
    .toString();

  const appHtml = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  const html = shellHtml.replace(
    "<!-- Remix SPA -->",
    appHtml
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
    status: responseStatusCode,
  });
}
```

<docs-info>アプリに `app/entry.server.tsx` ファイルがない場合は、`npx remix reveal` を実行する必要がある場合があります。</docs-info>

**4. `entry.client.tsx` を更新する**

ドキュメントではなく `<div id="app">` をハイドレートするように `app/entry.client.tsx` を更新します。

```tsx filename=app/entry.client.tsx
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(
    document.querySelector("#app"),
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
```

<docs-info>アプリに `app/entry.client.tsx` ファイルがない場合は、`npx remix reveal` を実行する必要がある場合があります。</docs-info>

## 注意点/注意点

- SPA モードは、Vite と [Remix Vite プラグイン][remix-vite] を使用する場合のみ機能します。

- `headers`、`loader`、`action` などのサーバー API は使用できません。これらの API をエクスポートすると、ビルドでエラーが発生します。

- SPA モードでは、`root.tsx` から `HydrateFallback` のみをエクスポートできます。他のルートからエクスポートすると、ビルドでエラーが発生します。

- 実行中のサーバーがないため、`clientLoader`/`clientAction` メソッドから `serverLoader`/`serverAction` を呼び出すことはできません。呼び出すと、ランタイムエラーが発生します。

### サーバービルド

Remix SPA モードでは、ビルド時にサーバーでルートルートを「事前レンダリング」することで `index.html` ファイルが生成されることに注意することが重要です。

- つまり、SPA を作成している場合でも、「サーバービルド」と「サーバーレンダリング」の手順があるため、`document`、`window`、`localStorage` など、クライアント側の側面を参照する依存関係の使用には注意する必要があります。
- 一般的に、これらの問題を解決する方法は、サーバービルドに含まれないように、`entry.client.tsx` からブラウザー専用のライブラリをインポートすることです。
- それ以外の場合は、[`React.lazy`][react-lazy] または `remix-utils` の [`<ClientOnly>`][client-only] コンポーネントを使用して、一般的にこれらの問題を解決できます。

### CJS/ESM 依存関係の問題

アプリの依存関係で ESM/CJS の問題が発生している場合は、Vite の [ssr.noExternal][vite-ssr-noexternal] オプションを使用して、特定の依存関係をサーバーバンドルに含める必要がある場合があります。

```ts filename=vite.config.ts lines=[12-15]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ssr: false,
    }),
    tsconfigPaths(),
  ],
  ssr: {
    // サーバービルドに `problematic-dependency` をバンドルする
    noExternal: ["problematic-dependency"],
  },
  // ...
});
```

これらの問題は、通常、公開されたコードが CJS/ESM に対して正しく設定されていない依存関係が原因です。`ssr.noExternal` に特定の依存関係を含めることで、Vite は依存関係をサーバービルドにバンドルし、サーバーの実行時にランタイムインポートの問題を回避するのに役立ちます。

逆のユースケースがあり、依存関係をバンドルから明示的に除外したい場合は、反対の [`ssr.external`][vite-ssr-external] オプションを使用できます。

## React Router からの移行

SPA モードは、既存の React Router アプリを Remix アプリ（SPA かどうかは問わず）に移行する際に役立つと予想しています。

この移行の最初のステップは、現在の React Router アプリを `vite` で実行することです。これにより、JS 以外のコード（つまり、CSS、SVG など）に必要なプラグインがすべて揃います。

**現在 `BrowserRouter` を使用している場合**

`vite` を使用している場合は、[このガイド][migrating-rr]の手順に従って、`BrowserRouter` アプリをキャッチオール Remix ルートにドロップできるはずです。

**現在 `RouterProvider` を使用している場合**

現在 `RouterProvider` を使用している場合は、ルートを個々のファイルに移動し、`route.lazy` を介して読み込むのが最適なアプローチです。

- Remix ファイルの規則に従ってこれらのファイルに名前を付けると、Remix（SPA）への移行が容易になります。
- ルートコンポーネントを名前付き `Component` エクスポート（RR 用）とデフォルトエクスポート（最終的に Remix で使用するため）としてエクスポートします。

すべてのルートが独自のファイルに存在するようになったら、次のことができます。

- これらのファイルを Remix の `app/` ディレクトリに移動します。
- SPA モードを有効にします。
- すべての `loader`/`action` 関数を `clientLoader`/`clientAction` に名前変更します。
- React Router の `index.html` ファイルを、`default` コンポーネントと `HydrateFallback` をエクスポートする `app/root.tsx` ルートに置き換えます。

[rfc]: https://github.com/remix-run/remix/discussions/7638
[client-data]: ../guides/client-data
[2.5.0]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v250
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[runtimes]: ../discussion/runtimes
[kent-tweet]: https://twitter.com/kentcdodds/status/1743030378334708017
[rr-setup]: https://reactrouter.com/v6/start/tutorial#setup
[routes-config]: ../file-conventions/remix-config#routes
[route-lazy]: https://reactrouter.com/v6/route/lazy
[meta]: ../components/meta
[links]: ../components/links
[migrating-rr]: https://remix.run/docs/en/main/guides/migrating-react-router-app
[remix-vite]: ./vite
[migrate-rr]: #migrating-from-react-router
[react-lazy]: https://react.dev/reference/react/lazy
[client-only]: https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#clientonly
[vite-preview]: https://vitejs.dev/guide/cli#vite-preview
[sirv-cli]: https://www.npmjs.com/package/sirv-cli
[vite-ssr-noexternal]: https://vitejs.dev/config/ssr-options#ssr-noexternal
[vite-ssr-external]: https://vitejs.dev/config/ssr-options#ssr-external


