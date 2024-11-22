---
title: SPA モード
---

# SPA モード

Remix の基本的な考え方は、サーバーアーキテクチャをあなたが所有することです。そのため、Remix は [Web Fetch API][fetch] をベースに構築され、組み込みまたはコミュニティ提供のアダプターを通じて、あらゆる最新の [ランタイム][runtimes] 上で実行できます。 _ほとんど_ のアプリにとって、サーバーは最高の UX/パフォーマンス/SEO などを提供すると考えていますが、現実世界では、シングルページアプリケーションに適したユースケースも数多く存在することは間違いありません。

- サーバーを管理したくない、または GitHub Pages や他の CDN に静的ファイルとしてアプリをデプロイしたい
- Node.js サーバーを実行したくない
- [React Router アプリを Remix に移行したい][migrate-rr]
- サーバーレンダリングできない特殊なタイプの埋め込みアプリを開発している
- 「あなたのボスは SPA アーキテクチャの UX の限界を気にしておらず、開発チームにリアーキテクチャのための時間/能力を与えてくれない」 [- Kent C. Dodds][kent-tweet]

これが、[2.5.0][2.5.0] ([RFC][rfc]) で **SPA モード** のサポートを追加した理由です。これは、[クライアントデータ][client-data] API をベースに構築されています。

<docs-info>SPA モードを使用するには、アプリが Vite と [Remix Vite プラグイン][remix-vite] を使用している必要があります。</docs-info>

## SPA モードとは？

SPA モードは、基本的に `createBrowserRouter`/`RouterProvider` を使用して [React Router + Vite][rr-setup] を独自に設定した場合と同じですが、いくつかの追加の Remix 機能も備えています。

- ファイルベースのルーティング（または [`routes()`][routes-config] を使用した設定ベース）
- [`route.lazy`][route-lazy] を使用したルートベースのコード分割の自動化
- ルートモジュールを事前に読み込むための `<Link prefetch>` のサポート
- Remix [`<Meta>`][meta]/[`<Links>`][links] API を使用した `<head>` の管理

SPA モードは、Remix に実行時に Remix サーバーを実行しないことを伝え、ビルド時に静的な `index.html` ファイルを生成し、データの読み込みと変更には [クライアントデータ][client-data] API だけを使用することを示します。

`index.html` は、`root.tsx` ルートの `HydrateFallback` コンポーネントから生成されます。`index.html` を生成するための最初の「レンダリング」には、ルートよりも深いルートは含まれません。これにより、`index.html` ファイルが、`/`（つまり `/about`）を超えたパスに対して提供/ハイドレートされるように、CDN/サーバーを設定できます。

## 使用方法

リポジトリの SPA モードテンプレートを使用して、すぐに開始できます。

```shellscript
npx create-remix@latest --template remix-run/remix/templates/spa
```

または、Remix + Vite アプリで、Remix Vite プラグインの設定で `ssr: false` を設定することで、手動で SPA モードを有効にすることができます。

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

SPA モードでは、従来の Remix SSR アプリと同じように開発を行い、HMR/HDR を有効にするために実行中の Remix dev サーバーを使用します。

```sh
npx remix vite:dev
```

### プロダクション

SPA モードでアプリをビルドすると、Remix は `/` ルートのサーバーハンドラーを呼び出し、レンダリングされた HTML をクライアント側の資産（デフォルトでは `build/client/index.html`）とともに `index.html` ファイルに保存します。

```sh
npx remix vite:build
```

#### プレビュー

[vite preview][vite-preview] を使用して、ローカルでプロダクションビルドをプレビューできます。

```shellscript
npx vite preview
```

<docs-warning>`vite preview` はプロダクションサーバーとして使用するための設計ではありません。</docs-warning>

#### デプロイ

デプロイするには、任意の HTTP サーバーからアプリを提供できます。サーバーは、単一のルート `/index.html` ファイルから複数のパスを提供するように構成する必要があります（一般的には「SPA フォールバック」と呼ばれます）。この機能を直接サポートしていないサーバーの場合、追加の手順が必要になる場合があります。

簡単な例として、[sirv-cli][sirv-cli] を使用できます。

```shellscript
npx sirv-cli build/client/ --single
```

または、`express` サーバーで提供する場合（ただし、その時点で Remix を SSR モードで実行することを検討する必要があるかもしれません 😉）。

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

HTML ドキュメント全体をハイドレートしたくない場合は、SPA モードを使用して `<div id="app">` などのドキュメントのサブセクションだけをハイドレートできます。変更はわずかです。

**1. `index.html` ファイルを追加する**

Remix は HTML ドキュメントをレンダリングしないため、HTML ドキュメントを外部から提供する必要があります。最も簡単な方法は、`app/index.html` ドキュメントを保持し、ビルド時に Remix でレンダリングされた HTML を置換できるプレースホルダーを保持して、最終的な `index.html` を生成することです。

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

`<!-- Remix SPA -->` の HTML コメントは、Remix の HTML で置換されます。

<docs-info>空白は DOM/VDOM ツリーで意味を持つため、周りに空白を含めないようにしてください。そうしないと、React のハイドレーションで問題が発生します。</docs-info>

**2. `root.tsx` を更新する**

`<div id="app">` のコンテンツだけをレンダリングするようにルートルートを更新します。

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

`app/entry.server.tsx` ファイルでは、Remix でレンダリングされた HTML を静的な `app/index.html` ファイルのプレースホルダーに挿入する必要があります。また、デフォルトの `entry.server.tsx` ファイルのように、`<!DOCTYPE html>` 宣言を先頭に付けるのをやめる必要があります。これは `app/index.html` ファイルに含まれるべきです。

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

## 注釈/注意点

- SPA モードは、Vite と [Remix Vite プラグイン][remix-vite] を使用した場合にのみ機能します

- `headers`、`loader`、`action` などのサーバー API は使用できません。ビルド時にエラーが発生します

- SPA モードでは、`root.tsx` から `HydrateFallback` だけをエクスポートできます。他のルートからエクスポートすると、ビルド時にエラーが発生します

- `clientLoader`/`clientAction` メソッドから `serverLoader`/`serverAction` を呼び出すことはできません。実行中のサーバーがないため、呼び出されると実行時エラーが発生します

### サーバービルド

Remix SPA モードでは、ビルド時にサーバーでルートルートを「事前レンダリング」することによって、`index.html` ファイルが生成されることに注意することが重要です

- これは、SPA を作成している場合でも、「サーバービルド」と「サーバーレンダリング」の手順が必要になるため、`document`、`window`、`localStorage` などのクライアント側の側面を参照する依存関係を使用する際には注意する必要があることを意味します。
- 通常、これらの問題を解決する方法は、`entry.client.tsx` からブラウザ専用のライブラリをインポートして、サーバービルドに含まれないようにすることです
- そうでない場合は、[`React.lazy`][react-lazy] または `remix-utils` の [`<ClientOnly>`][client-only] コンポーネントを使用して、通常これらの問題を解決できます。

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
    // `problematic-dependency` をサーバービルドにバンドルする
    noExternal: ["problematic-dependency"],
  },
  // ...
});
```

これらの問題は、通常、公開されたコードが CJS/ESM に対して正しく設定されていない依存関係が原因です。`ssr.noExternal` に特定の依存関係を含めることで、Vite は依存関係をサーバービルドにバンドルし、サーバーの実行時にインポートの問題を回避するのに役立ちます。

逆の場合で、特定の依存関係をバンドルから外部に保ちたい場合は、反対の [`ssr.external`][vite-ssr-external] オプションを使用できます。

## React Router からの移行

SPA モードは、既存の React Router アプリを Remix アプリ（SPA かどうかは問いません）に移行する際にも役立つと予想されます。

この移行の最初のステップは、現在の React Router アプリを `vite` で実行することです。これにより、非 JS コード（CSS、SVG など）に必要なプラグインがすべて揃います。

**現在 `BrowserRouter` を使用している場合**

`vite` を使用したら、[このガイド][migrating-rr] の手順に従って、`BrowserRouter` アプリをキャッチオールの Remix ルートにドロップできます。

**現在 `RouterProvider` を使用している場合**

現在 `RouterProvider` を使用している場合は、ルートを個別のファイルに移動し、`route.lazy` を使用して読み込むのが最適な方法です。

- Remix ファイルの規約に従ってこれらのファイルに名前を付けると、Remix（SPA）への移動が容易になります。
- ルートコンポーネントを、名前付きの `Component` エクスポート（RR 用）と `default` エクスポート（最終的に Remix で使用するため）の両方としてエクスポートします。

ルートがすべて独自のファイルに存在するようになったら、次のようにできます。

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
[migrate-rr]: #react-router-から-の移行
[react-lazy]: https://react.dev/reference/react/lazy
[client-only]: https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#clientonly
[vite-preview]: https://vitejs.dev/guide/cli#vite-preview
[sirv-cli]: https://www.npmjs.com/package/sirv-cli
[vite-ssr-noexternal]: https://vitejs.dev/config/ssr-options#ssr-noexternal
[vite-ssr-external]: https://vitejs.dev/config/ssr-options#ssr-external



