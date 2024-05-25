---
title: React Router からの移行
description: React Router アプリを Remix に移行するには、一度に行うか段階的に行うかのいずれかを選択できます。このガイドでは、アプリを迅速に稼働させるための反復的なアプローチについて説明します。
---

<docs-info>簡略化された移行の TL;DR バージョンとリポジトリについては、<a href="https://github.com/kentcdodds/incremental-react-router-to-remix-upgrade-path">React Router から Remix への移行例のリポジトリ</a> をご覧ください。</docs-info>

# React Router アプリの Remix への移行

<docs-warning>このガイドでは、現在、[Remix Vite][remix-vite] ではなく、[クラシック Remix コンパイラ][classic-remix-compiler] を使用していることを前提としています。</docs-warning>

世界中で展開されている何百もの React アプリケーションは、[React Router][react-router] によって支えられています。おそらく、あなたもいくつかのアプリをリリースしているでしょう！Remix は React Router をベースに構築されているため、移行を容易にするために、段階的に行えるようにしています。

まだ React Router を使用していない場合は、再考する理由がいくつかあります！履歴管理、動的なパスマッチング、ネストされたルーティングなど、多くの機能があります。[React Router のドキュメント][react-router-docs] を見て、提供されている機能を確認してください。

## アプリが React Router v6 を使用していることを確認する

React Router の古いバージョンを使用している場合は、最初に v6 にアップグレードする必要があります。[v5 から v6 への移行ガイド][migration-guide-from-v5-to-v6] と [下位互換性パッケージ][backwards-compatibility-package] を確認して、アプリを v6 に迅速かつ段階的にアップグレードしてください。

## Remix のインストール

まず、Remix を構築するために、いくつかのパッケージをインストールする必要があります。以下の手順に従って、プロジェクトのルートからすべてのコマンドを実行します。

```shell
npm install @remix-run/react @remix-run/node @remix-run/serve
npm install -D @remix-run/dev
```

## サーバーとブラウザのエントリポイントの作成

ほとんどの React Router アプリは主にブラウザで実行されます。サーバーの唯一の仕事は、静的な HTML ページを 1 つ送信することです。React Router は、クライアント側でルーティングベースのビューを管理します。これらのアプリは、一般的にルート `index.js` のようなブラウザのエントリポイントファイルを持っており、次のようなものになります。

```tsx filename=index.tsx
import { render } from "react-dom";

import App from "./App";

render(<App />, document.getElementById("app"));
```

サーバーレンダリングされた React アプリは少し異なります。ブラウザスクリプトはアプリをレンダリングするのではなく、サーバーから提供された DOM を「ハイドレート」しています。ハイドレーションとは、DOM の要素を対応する React コンポーネントにマッピングし、イベントリスナーを設定して、アプリが対話型になるようにするプロセスです。

まず、2 つの新しいファイルを作成します。

- `app/entry.server.tsx` (または `entry.server.jsx`)
- `app/entry.client.tsx` (または `entry.client.jsx`)

<docs-info>Remix のアプリコードはすべて、慣例として `app` ディレクトリに配置されます。既存のアプリが同じ名前のディレクトリを使用している場合は、`src` や `old-app` のように名前を変更して、Remix への移行時に区別してください。</docs-info>

```tsx filename=app/entry.server.tsx
import { PassThrough } from "node:stream";

import type {
  AppLoadContext,
  EntryContext,
} from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onAllReady() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(
              createReadableStreamFromReadable(body),
              {
                headers: responseHeaders,
                status: responseStatusCode,
              }
            )
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(
              createReadableStreamFromReadable(body),
              {
                headers: responseHeaders,
                status: responseStatusCode,
              }
            )
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
```

クライアントのエントリポイントは次のようになります。

```tsx filename=app/entry.client.tsx
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
```

## ルートルートの作成

Remix は React Router をベースに構築されていると説明しました。アプリは、JSX `Route` コンポーネントで定義されたルートを持つ `BrowserRouter` をレンダリングしている可能性があります。Remix では、これは必要ありませんが、後ほど詳しく説明します。今のところ、Remix アプリが動作するために必要な最低レベルのルートを提供する必要があります。

ルートルート（または Wes Bos の言葉を借りれば「ルートルート」）は、アプリケーションの構造を提供する役割を果たします。デフォルトのエクスポートは、他のすべてのルートが読み込み、依存する完全な HTML ツリーをレンダリングするコンポーネントです。アプリの足場やシェルと考えてください。

クライアントレンダリングされたアプリでは、React アプリのマウントのための DOM ノードを含む index HTML ファイルがあります。ルートルートは、このファイルの構造を反映したマークアップをレンダリングします。

`app` ディレクトリに `root.tsx` (または `root.jsx`) という名前の新しいファイルを作成します。このファイルの内容は異なりますが、`index.html` が次のようなものだと仮定しましょう。

```html filename=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="My beautiful React app"
    />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>My React App</title>
  </head>
  <body>
    <noscript
      >You need to enable JavaScript to run this
      app.</noscript
    >
    <div id="root"></div>
  </body>
</html>
```

`root.tsx` では、構造を反映したコンポーネントをエクスポートします。

```tsx filename=app/root.tsx
import { Outlet } from "@remix-run/react";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="My beautiful React app"
        />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <title>My React App</title>
      </head>
      <body>
        <div id="root">
          <Outlet />
        </div>
      </body>
    </html>
  );
}
```

ここで、いくつか注意すべき点があります。

- `noscript` タグを削除しました。サーバーレンダリングが完了したため、JavaScript を無効にしたユーザーでもアプリが表示されます（そして、時間の経過とともに [プログレッシブエンハンスメントを改善するためのいくつかの調整][a-few-tweaks-to-improve-progressive-enhancement] を加えることで、アプリのほとんどは依然として動作するはずです）。
- ルート要素の内側に `@remix-run/react` から `Outlet` コンポーネントをレンダリングします。これは、通常、React Router アプリで一致したルートをレンダリングするために使用するのと同じコンポーネントです。ここでは同じ機能を果たしますが、Remix のルーター用に調整されています。

<docs-warning>**重要：**ルートルートを作成したら、`public` ディレクトリから `index.html` を削除してください。このファイルが残っていると、サーバーは `/` ルートにアクセスしたときに、Remix アプリではなく、この HTML を送信する可能性があります。</docs-warning>

## 既存のアプリコードの適応

まず、既存の React コードのルートを `app` ディレクトリに移動します。プロジェクトルートに `src` ディレクトリがある場合、そのルートのアプリコードは、`app/src` に移動する必要があります。

また、このディレクトリの名前を変更して、これが古いコードであることを明確にすることをお勧めします。最終的には、すべてのコードが移行された後に削除できます。このアプローチの利点は、一度にすべてを行う必要がなく、アプリはこれまで通りに動作することです。デモプロジェクトでは、このディレクトリを `old-app` と名付けています。

最後に、ルートの `App` コンポーネント（`root` 要素にマウントされたコンポーネント）で、React Router の `<BrowserRouter>` を削除します。Remix は、プロバイダーを直接レンダリングする必要なしに、これを処理します。

## インデックスとキャッチオールルートの作成

Remix は、ルートルート以外にも、`<Outlet />` で何をレンダリングするかを知るためにルートが必要です。幸いなことに、アプリはすでに `<Route>` コンポーネントをレンダリングしており、Remix は、[ルーティング規則][routing-conventions] を使用して移行できます。

まず、`app` に `routes` という名前の新しいディレクトリを作成します。このディレクトリに、`_index.tsx` と `$.tsx` という名前の 2 つのファイルを作成します。`$.tsx` は [**キャッチオールまたは「スプラット」ルート**][a-catch-all-route] と呼ばれ、`routes` ディレクトリに移動していないルートを、古いアプリで処理するために使用できます。

`_index.tsx` と `$.tsx` ファイル内では、古いルート `App` からコードをエクスポートするだけです。

```tsx filename=app/routes/_index.tsx
export { default } from "~/old-app/app";
```

```tsx filename=app/routes/$.tsx
export { default } from "~/old-app/app";
```

## バンドラの置き換えを Remix に

Remix は、アプリの開発とビルドのために独自のバンドラと CLI ツールを提供します。アプリは、Create React App のようなものを利用してブートストラップされているか、Webpack でカスタムビルドが設定されている可能性があります。

`package.json` ファイルで、現在のビルドと開発スクリプトの代わりに `remix` コマンドを使用するようにスクリプトを更新します。

```json filename=package.json
{
  "scripts": {
    "build": "remix build",
    "dev": "remix dev",
    "start": "remix-serve build/index.js",
    "typecheck": "tsc"
  }
}
```

そして、あなたのアプリはサーバーレンダリングされ、ビルド時間が 90 秒から 0.5 秒に短縮されました ⚡

## ルートの作成

時間の経過とともに、React Router の `<Route>` コンポーネントによってレンダリングされたルートを、独自のルートファイルに移行する必要があります。[ルーティング規則][routing-conventions] で示されたファイル名とディレクトリ構造に従って、移行を行うことができます。

ルートファイルのデフォルトエクスポートは、`<Outlet />` でレンダリングされるコンポーネントです。そのため、`App` に次のようなルートがある場合、

```tsx filename=app/old-app/app.tsx
function About() {
  return (
    <main>
      <h1>About us</h1>
      <PageContent />
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```

ルートファイルは次のようになります。

```tsx filename=app/routes/about.tsx
export default function About() {
  return (
    <main>
      <h1>About us</h1>
      <PageContent />
    </main>
  );
}
```

このファイルを作成したら、`App` から `<Route>` コンポーネントを削除できます。すべてのルートが移行されたら、`<Routes>` を削除し、最終的には `old-app` 内のすべてのコードを削除できます。

## 注意事項と次のステップ

この時点で、最初の移行が完了したと言えるかもしれません。おめでとう！しかし、Remix は、従来の React アプリとは少し異なる方法で動作しています。もしそうじゃなかったら、わざわざ Remix を構築した意味がありません 😅

### 危険なブラウザへの参照

クライアントレンダリングされたコードベースをサーバーレンダリングされたコードベースに移行する際の一般的な問題点は、サーバーで実行されるコードにブラウザ API への参照がある可能性があることです。一般的な例としては、状態の初期化があります。

```tsx
function Count() {
  const [count, setCount] = React.useState(
    () => localStorage.getItem("count") || 0
  );

  React.useEffect(() => {
    localStorage.setItem("count", count);
  }, [count]);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

この例では、`localStorage` がグローバルストアとして使用され、ページのリロード間でデータを永続化します。`useEffect` で `localStorage` を `count` の現在の値で更新しますが、`useEffect` はブラウザでのみ呼び出されるため、完全に安全です！しかし、`localStorage` に基づいて状態を初期化することは問題があります。このコールバックは、サーバーとブラウザの両方で実行されます。

解決策として、`window` オブジェクトをチェックし、ブラウザでのみコールバックを実行するという方法があるかもしれません。しかし、これにより、恐れられている [ハイドレーションの不一致][hydration-mismatch] が発生する可能性があります。React は、サーバーによってレンダリングされたマークアップが、クライアントのハイドレーション中にレンダリングされるマークアップと同一であることを期待しています。これにより、`react-dom` は、DOM 要素を対応する React コンポーネントにどのように対応付ければよいかを知ることができ、イベントリスナーをアタッチし、状態が変化したときに更新を実行できます。そのため、ローカルストレージからサーバーで初期化した値とは異なる値が取得されると、新しい問題が発生します。

#### クライアント専用コンポーネント

ここでの潜在的な解決策の 1 つは、サーバーで使用でき、[ローダーデータ][loader-data] を介してコンポーネントにプロップとして渡すことができる、別のキャッシュメカニズムを使用することです。しかし、アプリでサーバー上でコンポーネントをレンダリングする必要がない場合は、サーバーでのレンダリングをスキップし、ハイドレーションが完了するまでブラウザでレンダリングを待つという、より単純な解決策があるかもしれません。

```tsx
// ハイドレーションは、`SomeComponent` のバージョンインスタンスがハイドレートされた後に
// 1 回だけ更新されるため、コンポーネントの外部にあるメモリ状態を安全に追跡できます。
// その後、ブラウザは、ページがリロードされ、`isHydrating` が true にリセットされるまで、
// ルートの変更にわたってレンダリングの処理を引き継ぎます。ハイドレーションの不一致を心配する必要はありません。
let isHydrating = true;

function SomeComponent() {
  const [isHydrated, setIsHydrated] = React.useState(
    !isHydrating
  );

  React.useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  if (isHydrated) {
    return <Count />;
  } else {
    return <SomeFallbackComponent />;
  }
}
```

この解決策を簡素化するために、[`remix-utils`][remix-utils] コミュニティパッケージにある [`ClientOnly` コンポーネント][client-only-component] を使用することをお勧めします。使用例は、[`examples` リポジトリ][examples-repository] で確認できます。

### `React.lazy` と `React.Suspense`

[`React.lazy`][react-lazy] と [`React.Suspense`][react-suspense] を使用してコンポーネントを遅延ロードしている場合、使用している React のバージョンによっては問題が発生する可能性があります。React 18 までは、サーバーで動作しませんでした。`React.Suspense` は、もともとブラウザ専用の機能として実装されていました。

React 17 を使用している場合は、いくつかの選択肢があります。

- React 18 にアップグレードする
- 上記の [クライアント専用のアプローチ][client-only-approach] を使用する
- [Loadable Components][loadable-components] のような代替の遅延ロードソリューションを使用する
- `React.lazy` と `React.Suspense` を完全に削除する

Remix は、管理するすべてのルートのコード分割を自動的に処理するため、`routes` ディレクトリにコードを移動したら、`React.lazy` を手動で使用する必要はほとんどありません。

### 設定

さらに設定を行うことはオプションですが、以下は開発ワークフローを最適化するために役立つ可能性があります。

#### `remix.config.js`

すべての Remix アプリは、プロジェクトルートに `remix.config.js` ファイルを受け入れます。設定はオプションですが、明瞭にするためにいくつか含めることをお勧めします。利用可能なすべてのオプションの詳細については、[設定に関するドキュメント][docs-on-configuration] を参照してください。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  ignoredRouteFiles: ["**/*.css"],
  assetsBuildDirectory: "public/build",
};
```

#### `jsconfig.json` または `tsconfig.json`

TypeScript を使用している場合は、すでにプロジェクトに `tsconfig.json` がある可能性があります。`jsconfig.json` はオプションですが、多くのエディタにとって役立つコンテキストを提供します。これは、言語設定に含めることをお勧めする最小限の設定です。

<docs-info>Remix は、<code>~~/\_</code> パスエイリアスを使用して、ファイルがプロジェクト内のどこに置かれていても、ルートからモジュールを簡単にインポートします。`remix.config.js` で `appDirectory` を変更する場合は、<code>~~/\_</code> のパスエイリアスも更新する必要があります。</docs-info>

```json filename=jsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    }
  }
}
```

```json filename=tsconfig.json
{
  "include": ["remix.env.d.ts", "**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "isolatedModules": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "moduleResolution": "Bundler",
    "baseUrl": ".",
    "noEmit": true,
    "paths": {
      "~/*": ["./app/*"]
    }
  }
}
```

TypeScript を使用している場合は、プロジェクトのルートに、適切なグローバル型参照を含む `remix.env.d.ts` ファイルを作成する必要もあります。

```ts filename=remix.env.d.ts
/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />
```

### 非標準のインポートに関する注意

この時点で、アプリは変更せずに実行できる可能性があります。Create React App や高度に設定されたバンドラ設定を使用している場合は、スタイルシートや画像などの非 JavaScript モジュールを含めるために `import` を使用している可能性があります。

Remix は、ほとんどの非標準のインポートをサポートしていません。これは、私たちが Remix を構築した理由の 1 つであり、正当な理由があります 😅。以下は、Remix で遭遇する可能性のある違いと、移行時にリファクタリングする方法の、網羅的ではないリストです。

#### アセットのインポート

多くのバンドラは、プラグインを使用して、画像やフォントなどのさまざまなアセットをインポートすることを可能にしています。これらは通常、アセットのファイルパスを表す文字列としてコンポーネントに渡されます。

```tsx
import logo from "./logo.png";

export function Logo() {
  return <img src={logo} alt="My logo" />;
}
```

Remix では、これは基本的に同じように動作します。`<link>` 要素でロードされるフォントなどのアセットは、通常、ルートモジュールでインポートし、`links` 関数が返すオブジェクトにファイル名を含めます。[ルートの `links` についてのドキュメントを参照してください。][see-our-docs-on-route-links-for-more-information]

#### SVG のインポート

Create React App や他のいくつかのビルドツールでは、SVG ファイルを React コンポーネントとしてインポートできます。これは、SVG ファイルの一般的なユースケースですが、Remix ではデフォルトでサポートされていません。

```tsx bad nocopy
// Remix では動作しません！
import MyLogo from "./logo.svg";

export function Logo() {
  return <MyLogo />;
}
```

SVG ファイルを React コンポーネントとして使用する場合、最初にコンポーネントを作成し、直接インポートする必要があります。[React SVGR][react-svgr] は、これらのコンポーネントを [コマンドライン][command-line] から生成したり、[オンラインのプレイグラウンド][online-playground] で生成してコピー＆ペーストしたりするのに役立つ、優れたツールセットです。

```svg filename=icon.svg
<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" />
</svg>
```

```tsx filename=icon.tsx good
export default function Icon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="icon"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
      />
    </svg>
  );
}
```

#### CSS のインポート

Create React App や他の多くのビルドツールでは、さまざまな方法でコンポーネントに CSS をインポートすることをサポートしています。Remix は、以下の説明するような、いくつかの一般的な CSS バンドリングソリューションとともに、通常の CSS ファイルのインポートをサポートしています。

### ルートの `links` エクスポート

Remix では、通常のスタイルシートをルートコンポーネントファイルからロードできます。インポートしても、スタイルに対して魔法のようなことは行われません。代わりに、スタイルシートをロードするために使用できる URL が返されます。スタイルシートをコンポーネントで直接レンダリングするか、[`links` エクスポート][see-our-docs-on-route-links-for-more-information] を使用することができます。

アプリのスタイルシートと他のいくつかのアセットを、ルートルートの `links` 関数に移動してみましょう。

```tsx filename=app/root.tsx lines=[2,5,7-16,32]
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import { Links } from "@remix-run/react";

import App from "./app";
import stylesheetUrl from "./styles.css";

export const links: LinksFunction = () => {
  // `links` は、
  // `<link />` コンポーネントのプロパティにマッピングされたプロパティを持つ
  // オブジェクトの配列を返します。
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/logo192.png" },
    { rel: "manifest", href: "/manifest.json" },
    { rel: "stylesheet", href: stylesheetUrl },
  ];
};

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Web site created using create-react-app"
        />
        <Links />
        <title>React App</title>
      </head>
      <body>
        <App />
      </body>
    </html>
  );
}
```

32 行目に、すべての個別の `<link />` コンポーネントを置き換える `<Links />` コンポーネントをレンダリングしていることに注目してください。ルートルートでのみリンクを使用する場合は、これは無関係ですが、すべての子ルートは独自のリンクをエクスポートすることができ、ここでもレンダリングされます。`links` 関数は、ユーザーが移動する可能性のあるページのリソースを事前に取得できるように、[`PageLinkDescriptor` オブジェクト][page-link-descriptor-object] を返すこともできます。

既存のルートコンポーネントで、直接または [`react-helmet`][react-helmet] のような抽象化を介して、ページに `<link />` タグをクライアント側で注入している場合は、それらを削除し、代わりに `links` エクスポートを使用することができます。多くのコードと、依存関係を 1 つか 2 つ削除することができます！

### CSS のバンドリング

Remix は、[CSS Modules][css-modules]、[Vanilla Extract][vanilla-extract]、[CSS の副作用インポート][css-side-effect-imports] をネイティブにサポートしています。これらの機能を使用するには、アプリケーションで CSS のバンドリングを設定する必要があります。

まず、生成された CSS バンドルにアクセスするために、`@remix-run/css-bundle` パッケージをインストールします。

```sh
npm install @remix-run/css-bundle
```

次に、`cssBundleHref` をインポートし、リンク記述子に追加します。最も可能性が高いのは、`root.tsx` に追加して、アプリケーション全体に適用することです。

```tsx filename=root.tsx lines=[2,6-8]
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno

export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
      ? [{ rel: "stylesheet", href: cssBundleHref }]
      : []),
    // ...
  ];
};
```

[CSS のバンドリングに関するドキュメントを参照してください。][css-bundling]

<docs-info>

**注意：**Remix は現在、Sass/Less の処理を直接サポートしていませんが、別々のプロセスとして実行して、CSS ファイルを生成し、それを Remix アプリにインポートすることができます。

</docs-info>

### `<head>` でのコンポーネントのレンダリング

`<link>` がルートコンポーネントでレンダリングされ、最終的にはルートの `<Links />` コンポーネントでレンダリングされるのと同様に、アプリは、ドキュメントの `<head>` に追加のコンポーネントをレンダリングするために、何らかの注入のトリックを使用している可能性があります。これは、ドキュメントの `<title>` や `<meta>` タグを変更するために、よく行われます。

`links` と同様に、各ルートは、そのルートの `<meta>` タグをレンダリングするために必要な値（および `<title>`、`<link rel="canonical">`、`<script type="application/ld+json">` などのメタデータに関連する他のいくつかのタグ）を返す `meta` 関数をエクスポートすることもできます。

`meta` の動作は `links` と少し異なります。ルート階層の他の `meta` 関数の値をマージするのではなく、**各リーフルートは、独自のタグのレンダリングを担当します**。これは、次の理由によります。

- 最適な SEO を実現するために、メタデータをより細かく制御したいことが多い
- [Open Graph プロトコル][open-graph-protocol] に従う一部のタグの場合、タグの順序は、クローラーやソーシャルメディアサイトでの解釈に影響を与え、Remix が複雑なメタデータをどのようにマージすべきかを推測することは予測不可能です
- 一部のタグは複数の値を許可しますが、他のタグは許可しません。Remix は、これらのすべてのケースをどのように処理すべきかを推測するべきではありません

### インポートの更新

Remix は、`react-router-dom` から取得したものをすべて再エクスポートし、`@remix-run/react` からこれらのモジュールを取得するようにインポートを更新することをお勧めします。多くの場合、これらのコンポーネントは、Remix に最適化された追加の機能と機能でラップされています。

**前：**

```tsx bad nocopy
import { Link, Outlet } from "react-router-dom";
```

**後：**

```tsx good
import { Link, Outlet } from "@remix-run/react";
```

## 最後に

包括的な移行ガイドを提供するために最善を尽くしましたが、Remix は、多くの React アプリの構築方法とは大きく異なる、いくつかの重要な原則に基づいて、ゼロから構築されていることに注意することが重要です。この時点で、アプリは実行できる可能性がありますが、ドキュメントをよく読んで API を調べていくうちに、コードの複雑さを大幅に減らし、アプリのエンドユーザーエクスペリエンスを向上させることができると思います。そこにたどり着くまでには少し時間がかかるかもしれませんが、一度に一口ずつ、その象を食べることはできます。

さあ、アプリを _remix_ しましょう。その過程で構築したものが気に入ると思います！💿

### さらに読む

- [Remix の哲学][remix-philosophy]
- [Remix の技術的な解説][remix-technical-explanation]
- [Remix でのデータのロード][data-loading-in-remix]
- [Remix でのルーティング][routing-in-remix]
- [Remix でのスタイリング][styling-in-remix]
- [よくある質問][frequently-asked-questions]
- [よくある「注意点」][common-gotchas]

[react-router]: https://reactrouter.com
[react-router-docs]: https://reactrouter.com/start/concepts
[migration-guide-from-v5-to-v6]: https://reactrouter.com/en/6.22.3/upgrading/v5
[backwards-compatibility-package]: https://www.npmjs.com/package/react-router-dom-v5-compat
[a-few-tweaks-to-improve-progressive-enhancement]: ../pages/philosophy#progressive-enhancement
[routing-conventions]: ./routing
[a-catch-all-route]: ../file-conventions/routes#splat-routes