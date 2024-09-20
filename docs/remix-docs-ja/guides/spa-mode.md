---
title: SPA モード
---

# SPA モード

Remix は当初から、サーバーアーキテクチャはあなた自身のものだと考えてきました。そのため、Remix は [Web Fetch API][fetch] を基盤として構築されており、組み込みの adapter やコミュニティ提供の adapter を介して、あらゆる最新の [ランタイム][runtimes] 上で動作します。私たちは、サーバーを持つことは、ほとんどのアプリにとって最高の UX/パフォーマンス/SEO などをもたらすと考えていますが、現実世界では、シングルページアプリケーション (SPA) に適したユースケースが数多く存在することも否定できません。

- サーバーを管理したくない場合、GitHub Pages やその他の CDN 上の静的ファイルを使用してアプリをデプロイしたい場合
- Node.js サーバーを実行したくない場合
- [React Router アプリを Remix に移行][migrate-rr] したい場合
- サーバーレンダリングできない特殊な埋め込みアプリを開発している場合
- 「あなたのボスは SPA アーキテクチャの UX 上限を気にしておらず、開発チームにアーキテクチャを再構築するための時間/能力を与えてくれない」[- Kent C. Dodds][kent-tweet]

そのため、[2.5.0][2.5.0] ([RFC][rfc]) で **SPA モード** のサポートを追加しました。これは、[クライアントデータ][client-data] API を基盤として構築されています。

<docs-info>SPA モードでは、アプリで Vite と [Remix Vite プラグイン][remix-vite] を使用している必要があります。</docs-info>

## SPA モードとは

SPA モードは、`createBrowserRouter`/`RouterProvider` を使用して独自の [React Router + Vite][rr-setup] セットアップを行った場合に得られるものとほぼ同じですが、いくつかの Remix の利点も追加されています。

- ファイルベースのルーティング (または [`routes()`][routes-config] を使用した構成ベース)
- [`route.lazy`][route-lazy] を使用した自動ルーティングベースのコード分割
- ルートモジュールを事前にフェッチするための `<Link prefetch>` サポート
- Remix の [`<Meta>`][meta]/[`<Links>`][links] API を使用した `<head>` の管理

SPA モードは、実行時に Remix サーバーを実行する予定がなく、ビルド時に静的な `index.html` ファイルを生成し、データのロードと変更には [クライアントデータ][client-data] API のみを使用することを Remix に伝えます。

`index.html` は、`root.tsx` ルートの `HydrateFallback` コンポーネントから生成されます。`index.html` を生成するための最初の「レンダリング」には、ルートよりも深いルートは含まれません。これにより、`index.html` ファイルは、CDN/サーバーで適切に構成されていれば、`/` 以外のパス (例: `/about`) で配信/ハイドレートできます。

## 使用方法

リポジトリの SPA モードテンプレートを使用して、すぐに使い始めることができます。

```shellscript
npx create-remix@latest --template remix-run/remix/templates/spa
```

または、Remix+Vite アプリで Remix Vite プラグインの構成に `ssr: false` を設定することで、手動で SPA モードを有効にすることができます。

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

SPA モードでは、従来の Remix SSR アプリと同じように開発を行い、実際には実行中の Remix 開発サーバーを使用することで、HMR/HDR を有効にします。

```sh
npx remix vite:dev
```

### 本番環境

SPA モードでアプリをビルドすると、Remix は `/` ルートのサーバーハンドラーを呼び出し、レンダリングされた HTML を、クライアント側の資産 (デフォルトでは `build/client/index.html`) と一緒に `index.html` ファイルに保存します。

```sh
npx remix vite:build
```

#### プレビュー

[vite preview][vite-preview] を使用して、ローカルで本番環境のビルドをプレビューできます。

```shellscript
npx vite preview
```

<docs-warning>`vite preview` は、本番環境サーバーとして使用するためのものではありません。</docs-warning>

#### デプロイメント

デプロイするには、選択した任意の HTTP サーバーからアプリを配信できます。サーバーは、単一のルート `/index.html` ファイルから複数のパスを配信するように構成する必要があります (一般的には「SPA フォールバック」と呼ばれます)。サーバーがこの機能を直接サポートしていない場合は、その他のステップが必要になる場合があります。

簡単な例として、[sirv-cli][sirv-cli] を使用できます。

```shellscript
npx sirv-cli build/client/ --single
```

または、`express` サーバーで配信する場合 (ただし、その時点で Remix を SSR モードで実行することを検討した方が良いかもしれません 😉)。

```js
app.use("/assets", express.static("build/client/assets"));
app.get("*", (req, res, next) =>
  res.sendFile(
    path.join(process.cwd(), "build/client/index.html"),
    next
  )
);
```

## ドキュメント全体ではなく、div をハイドレートする

HTML `document` 全体ではなく、`<div id="app">` のようなドキュメントのサブセクションのみをハイドレートする場合は、SPA モードを使用し、いくつかの小さな変更を加えることで実現できます。

**1. `index.html` ファイルを追加する**

Remix は HTML ドキュメントをレンダリングしないため、Remix の外部で HTML を提供する必要があります。最も簡単な方法は、ビルド時に Remix によってレンダリングされた HTML を置き換えることができるプレースホルダーを備えた、`app/index.html` ドキュメントを保持することです。これにより、最終的な `index.html` を生成できます。

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

`<!-- Remix SPA -->` HTML コメントは、Remix HTML に置き換える部分です。

<docs-info>空白は DOM/VDOM ツリーで意味を持つため、周囲の `div` の周りの空白を含めないようにすることが重要です。そうしないと、React のハイドレーションの問題が発生します。</docs-info>

**2. `root.tsx` を更新する**

ルートルートを更新して、`<div id="app">` のコンテンツのみをレンダリングします。

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

`app/entry.server.tsx` ファイルでは、Remix によってレンダリングされた HTML を静的な `app/index.html` ファイルのプレースホルダーに挿入する必要があります。また、デフォルトの `entry.server.tsx` ファイルのように、`<!DOCTYPE html>` 宣言を先頭に付けるのをやめる必要があります。これは `app/index.html` ファイルに記述する必要があります。

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

<docs-info>アプリに `app/entry.server.tsx` ファイルがない場合は、`npx remix reveal` を実行する必要があるかもしれません。</docs-info>

**4. `entry.client.tsx` を更新する**

`app/entry.client.tsx` を更新して、ドキュメントではなく `<div id="app">` をハイドレートします。

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

<docs-info>アプリに `app/entry.client.tsx` ファイルがない場合は、`npx remix reveal` を実行する必要があるかもしれません。</docs-info>

## 注意点/警告

- SPA モードは、Vite と [Remix Vite プラグイン][remix-vite] を使用する場合にのみ機能します。

- `headers`、`loader`、`action` などのサーバー API は使用できません。これらの API をエクスポートすると、ビルド時にエラーが発生します。

- SPA モードでは、`root.tsx` から `HydrateFallback` のみエクスポートできます。他のルートからエクスポートすると、ビルド時にエラーが発生します。

- 実行中のサーバーがないため、`clientLoader`/`clientAction` メソッドから `serverLoader`/`serverAction` を呼び出すことはできません。これらのメソッドが呼び出されると、ランタイムエラーが発生します。

### サーバービルド

Remix SPA モードは、ビルド時にサーバー上でルートルートの「事前レンダリング」を実行することで、`index.html` ファイルを生成することに注意することが重要です。

- つまり、SPA を作成している場合でも、依然として「サーバービルド」と「サーバーレンダリング」のステップがあり、`document`、`window`、`localStorage` などのクライアント側の側面を参照する依存関係の使用には注意する必要があります。
- 一般的に、これらの問題を解決する方法は、`entry.client.tsx` からブラウザ専用ライブラリをインポートすることです。これにより、これらのライブラリがサーバービルドに含まれるのを防ぐことができます。
- それ以外の場合、一般的に [`React.lazy`][react-lazy] または `remix-utils` の [`<ClientOnly>`][client-only] コンポーネントを使用して、これらの問題を解決できます。

### CJS/ESM 依存関係の問題

アプリの依存関係で ESM/CJS の問題が発生している場合は、Vite の [ssr.noExternal][vite-ssr-noexternal] オプションを使用して、特定の依存関係をサーバーバンドルに含める必要があるかもしれません。

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

これらの問題は通常、公開されたコードが CJS/ESM に対して正しく構成されていない依存関係が原因です。`ssr.noExternal` に特定の依存関係を含めることで、Vite はその依存関係をサーバービルドにバンドルし、サーバーを実行したときにランタイムのインポートの問題を回避するのに役立ちます。

逆のケースで、特定の依存関係をバンドルから外部に保持したい場合は、反対の [`ssr.external`][vite-ssr-external] オプションを使用できます。

## React Router からの移行

SPA モードは、既存の React Router アプリを (SPA であるかどうかに関係なく) Remix アプリに移行するのに役立つと期待されています。

この移行の最初のステップは、現在の React Router アプリを `vite` で実行することです。これにより、非 JS コード (例: CSS、SVG など) に必要なプラグインがすべて揃います。

**現在 `BrowserRouter` を使用している場合**

vite を使用したら、[このガイド][migrating-rr] の手順に従って、`BrowserRouter` アプリを Remix の catch-all ルートにドロップできます。

**現在 `RouterProvider` を使用している場合**

現在 `RouterProvider` を使用している場合は、ルートを個別のファイルに移し、`route.lazy` を使用してロードするのが最善のアプローチです。

- Remix のファイル規則に従ってこれらのファイルに名前を付けて、Remix (SPA) への移行を容易にします。
- ルートコンポーネントを名前付きの `Component` エクスポート (RR 用) と `default` エクスポート (最終的に Remix で使用するため) の両方としてエクスポートします。

ルートがすべて個別のファイルに格納されたら、次のようにできます。

- それらのファイルを Remix の `app/` ディレクトリに移動します。
- SPA モードを有効にします。
- すべての `loader`/`action` 関数を `clientLoader`/`clientAction` に名前変更します。
- React Router の `index.html` ファイルを、`default` コンポーネントと `HydrateFallback` をエクスポートする `app/root.tsx` ルートに置き換えます。

[rfc]: https://github.com/remix-run/remix/discussions/7638
[client-data]: ../guides/client-data
[2.5.0]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v250
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[runtimes]: ../discussion/runtimes
[kent-tweet]: https://twitter.com/kentcdodds/status/1743030378334708017
[rr-setup]: https://reactrouter.com/en/main/start/tutorial#setup
[routes-config]: ../file-conventions/remix-config#routes
[route-lazy]: https://reactrouter.com/en/main/route/lazy
[meta]: ../components/meta
[links]: ../components/links
[migrating-rr]: https://remix.run/docs/en/main/guides/migrating-react-router-app
[remix-vite]: ./vite
[migrate-rr]: #react-router-からの移行
[react-lazy]: https://react.dev/reference/react/lazy
[client-only]: https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#clientonly
[vite-preview]: https://vitejs.dev/guide/cli#vite-preview
[sirv-cli]: https://www.npmjs.com/package/sirv-cli
[vite-ssr-noexternal]: https://vitejs.dev/config/ssr-options#ssr-noexternal
[vite-ssr-external]: https://vitejs.dev/config/ssr-options#ssr-external


