---
title: React Routerからの移行
description: React RouterアプリをRemixに移行するには、一度に行うことも、段階的に行うこともできます。このガイドでは、アプリを迅速に実行するための反復的なアプローチについて説明します。
---

<docs-info>要約版と、簡素化された移行を示すリポジトリをご覧になりたい場合は、<a href="https://github.com/kentcdodds/incremental-react-router-to-remix-upgrade-path">React RouterからRemixへの移行例のリポジトリ</a>をご覧ください。</docs-info>

# React Router アプリケーションを Remix に移行する

<docs-warning>このガイドは現在、[Remix Vite][remix-vite]ではなく、[Classic Remix Compiler][classic-remix-compiler]を使用していることを前提としています。</docs-warning>

世界中で展開されている何百万もの React アプリケーションが [React Router][react-router] によって支えられています。おそらく、あなたもいくつかリリースしていることでしょう！Remix は React Router を基盤として構築されているため、大規模なリファクタリングを避けるために段階的に作業できる簡単な移行プロセスになるよう努めてきました。

まだ React Router を使用していない場合でも、再考する価値のあるいくつかの説得力のある理由があると考えています！履歴管理、動的なパスマッチング、ネストされたルーティングなど、多くの機能があります。[React Router のドキュメント][react-router-docs] を見て、私たちが提供するすべての機能を確認してください。

## React Router v6 の使用を保証する

古いバージョンの React Router を使用している場合、最初のステップは v6 にアップグレードすることです。アプリを迅速かつ段階的に v6 にアップグレードするには、[v5 から v6 への移行ガイド][migration-guide-from-v5-to-v6] と [後方互換性パッケージ][backwards-compatibility-package] を参照してください。

## Remixのインストール

最初に、Remixで開発するためにいくつかのパッケージをインストールする必要があります。以下の手順に従って、プロジェクトのルートディレクトリからすべてのコマンドを実行してください。

```shell
npm install @remix-run/react @remix-run/node @remix-run/serve
npm install -D @remix-run/dev
```

## サーバーとブラウザのエントリポイントの作成

ほとんどのReact Routerアプリは主にブラウザで動作します。サーバーの唯一の仕事は、単一の静的HTMLページを送信することであり、React Routerはクライアント側でルートベースのビューを管理します。これらのアプリは一般的に、次のようなルート`index.js`のようなブラウザのエントリポイントファイルを持っています。

```tsx filename=index.tsx
import { render } from "react-dom";

import App from "./App";

render(<App />, document.getElementById("app"));
```

サーバーレンダリングされたReactアプリは少し異なります。ブラウザスクリプトはアプリをレンダリングするのではなく、サーバーが提供したDOMを「ハイドレート」します。ハイドレーションとは、DOM内の要素を対応するReactコンポーネントにマッピングし、イベントリスナーを設定してアプリをインタラクティブにするプロセスです。

2つの新しいファイルを作成しましょう。

* `app/entry.server.tsx` (または `entry.server.jsx`)
* `app/entry.client.tsx` (または `entry.client.jsx`)

<docs-info>Remixのすべてのアプリコードは、慣例により`app`ディレクトリに配置されます。既存のアプリが同じ名前のディレクトリを使用している場合は、Remixに移行する際に区別するために、`src`や`old-app`のような名前に変更してください。</docs-info>

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

## `root` ルートの作成

RemixはReact Routerの上に構築されていることを述べました。あなたのアプリは、JSXの`Route`コンポーネントで定義されたルートを持つ`BrowserRouter`をレンダリングする可能性があります。Remixではそれを行う必要はありませんが、それについては後で詳しく説明します。今のところ、Remixアプリが動作するために必要な最低レベルのルートを提供する必要があります。

ルートルート（Wes Bos風に言えば「ルートルート」）は、アプリケーションの構造を提供する役割を担います。そのデフォルトエクスポートは、他のすべてのルートがロードして依存する完全なHTMLツリーをレンダリングするコンポーネントです。アプリの足場またはシェルと考えてください。

クライアント側でレンダリングされるアプリでは、ReactアプリをマウントするためのDOMノードを含むindex HTMLファイルがあります。ルートルートは、このファイルの構造を反映したマークアップをレンダリングします。

`app`ディレクトリに`root.tsx`（または`root.jsx`）という新しいファイルを作成します。そのファイルの内容は異なりますが、`index.html`が次のようになっていると仮定しましょう。

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

`root.tsx`で、その構造を反映するコンポーネントをエクスポートします。

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

いくつかの点に注意してください。

* `noscript`タグを削除しました。サーバーサイドレンダリングを行うため、JavaScriptを無効にしたユーザーでもアプリを表示できます（そして、時間とともに[漸進的エンハンスメントを改善するためのいくつかの調整][a-few-tweaks-to-improve-progressive-enhancement]を行うと、アプリの大部分が機能するようになります）。
* ルート要素内では、`@remix-run/react`から`Outlet`コンポーネントをレンダリングします。これは、通常React Routerアプリで一致したルートをレンダリングするために使用するコンポーネントと同じです。ここでは同じ機能を果たしますが、Remixのルーターに合わせて調整されています。

<docs-warning><strong>重要：</strong>ルートルートを作成したら、`public`ディレクトリから`index.html`を削除してください。ファイルを保持すると、`/`ルートにアクセスしたときに、RemixアプリではなくそのHTMLがサーバーから送信される可能性があります。</docs-warning>

## 既存のアプリコードの適応

まず、既存のReactコードのルートを`app`ディレクトリに移動します。プロジェクトルートの`src`ディレクトリにルートアプリコードが存在する場合は、`app/src`に移動する必要があります。

このディレクトリの名前を変更して、これが古いコードであることを明確にすることをお勧めします。これにより、最終的にすべてのコンテンツを移行した後、削除することができます。このアプローチの利点は、アプリが通常どおりに動作するために、一度にすべてを行う必要がないことです。デモプロジェクトでは、このディレクトリを`old-app`と名付けています。

最後に、ルート`App`コンポーネント（`root`要素にマウントされていたコンポーネント）で、React Routerの`<BrowserRouter>`を削除します。Remixは、プロバイダーを直接レンダリングする必要なく、これを処理します。

## インデックスルートとキャッチオールルートの作成

Remixはルートルート以外に`<Outlet />`で何をレンダリングするかを知るためのルートを必要とします。幸いなことに、既にアプリ内で`<Route>`コンポーネントをレンダリングしており、Remixは[ルーティング規則][routing-conventions]を使用するように移行する際にそれらを使用できます。

まず、`app`内に`routes`という新しいディレクトリを作成します。そのディレクトリ内に`_index.tsx`と`$.tsx`という2つのファイルを作成します。`$.tsx`は[**キャッチオールルートまたは「スプラット」ルート**][a-catch-all-route]と呼ばれ、まだ`routes`ディレクトリに移動していないルートを古いアプリで処理するために役立ちます。

`_index.tsx`と`$.tsx`ファイル内では、古いルート`App`からコードをエクスポートするだけです。

```tsx filename=app/routes/_index.tsx
export { default } from "~/old-app/app";
```

```tsx filename=app/routes/$.tsx
export { default } from "~/old-app/app";
```

## バンドラーをRemixに置き換える

Remixは、アプリの開発とビルドのために独自のバンドラーとCLIツールを提供します。おそらく、あなたのアプリはCreate React Appのようなものを使ってブートストラップされたか、あるいはWebpackを使ったカスタムビルド設定を持っているでしょう。

`package.json`ファイルで、現在のビルドと開発スクリプトの代わりに`remix`コマンドを使用するようにスクリプトを更新します。

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

そして、あっという間に！あなたのアプリはサーバーサイドレンダリングされ、ビルド時間は90秒から0.5秒に短縮されました⚡

## ルートの作成

時間が経つにつれて、React Routerの`<Route>`コンポーネントによってレンダリングされるルートを、独自のルートファイルに移行したいと思うでしょう。[ルーティング規則][routing-conventions]で概説されているファイル名とディレクトリ構造がこの移行をガイドします。

ルートファイルのデフォルトエクスポートは、`<Outlet />`でレンダリングされるコンポーネントです。そのため、`App`に次のようなルートがある場合：

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

このファイルを作成したら、`App`から`<Route>`コンポーネントを削除できます。すべてのルートの移行が完了したら、`<Routes>`、そして最終的に`old-app`内のすべてのコードを削除できます。

## 落とし穴と次のステップ

この時点で、最初の移行が完了したと言えるかもしれません。おめでとうございます！しかし、Remixは一般的なReactアプリとは少し異なる方法で動作します。そうでなければ、そもそもなぜそれを構築する手間をかけたのでしょうか？😅

### 安全でないブラウザ参照

クライアントレンダリングコードベースをサーバーレンダリングコードベースに移行する際のよくある問題点は、サーバー上で実行されるコードにブラウザAPIへの参照が含まれている可能性があることです。状態の初期化時に見られる一般的な例を以下に示します。

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

この例では、`localStorage`がグローバルストアとして使用され、ページのリロードを跨いでデータを保持しています。`useEffect`内で`count`の現在の値で`localStorage`を更新していますが、`useEffect`はブラウザでのみ呼び出されるため、これは完全に安全です！しかし、`localStorage`に基づいて状態を初期化することは問題です。このコールバックはサーバーとブラウザの両方で実行されるためです。

解決策として、`window`オブジェクトをチェックし、ブラウザでのみコールバックを実行することを考えるかもしれません。しかし、これは別の問題、恐ろしい[ハイドレーションの不一致][hydration-mismatch]につながる可能性があります。Reactは、サーバーでレンダリングされたマークアップがクライアントのハイドレーション中にレンダリングされるものと同一であることに依存しています。これにより、`react-dom`はDOM要素とその対応するReactコンポーネントを一致させる方法を知り、イベントリスナーをアタッチし、状態の変化に合わせて更新を実行できます。そのため、ローカルストレージがサーバーで初期化したものとは異なる値を返す場合、新たな問題に対処する必要があります。

#### クライアントのみのコンポーネント

ここで考えられる解決策の1つは、サーバーで使用でき、ルートの[ローダーデータ][loader-data]からプロップとしてコンポーネントに渡される、異なるキャッシングメカニズムを使用することです。しかし、サーバー上でコンポーネントをレンダリングすることがアプリケーションにとって重要ではない場合は、サーバーでのレンダリングを完全にスキップし、ハイドレーションが完了するまでブラウザでのレンダリングを待つという、より簡単な解決策があります。

```tsx
// コンポーネントの外側のメモリ内状態では、ハイドレーションを安全に追跡できます。
// これは、`SomeComponent`のバージョンインスタンスがハイドレートされた後、一度だけ更新されるためです。そこから、
// ブラウザはルートの変更にわたってレンダリングの処理を引き継ぎ、ページが
// 再読み込みされ`isHydrating`がtrueにリセットされるまで、ハイドレーションの不一致について心配する必要がなくなります。
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

この解決策を簡素化するために、[`remix-utils`][remix-utils]コミュニティパッケージの[`ClientOnly`コンポーネント][client-only-component]の使用をお勧めします。その使用方法の例は、[`examples`リポジトリ][examples-repository]にあります。

### `React.lazy` と `React.Suspense`

[`React.lazy`][react-lazy] と [`React.Suspense`][react-suspense] を使用してコンポーネントを遅延読み込みしている場合、使用しているReactのバージョンによっては問題が発生する可能性があります。React 18までは、`React.Suspense`は当初ブラウザのみの機能として実装されていたため、サーバーでは動作しませんでした。

React 17を使用している場合、いくつかの選択肢があります。

* React 18にアップグレードする
* 上記で説明されている[クライアント側のみのアプローチ][client-only-approach]を使用する
* [Loadable Components][loadable-components]などの代替の遅延読み込みソリューションを使用する
* `React.lazy`と`React.Suspense`を完全に削除する

Remixは管理するすべてのルートのコード分割を自動的に処理するため、`routes`ディレクトリに要素を移動する際には、`React.lazy`を手動で使用することはほとんど（もしあれば）必要ありません。

### 設定

さらなる設定は任意ですが、開発ワークフローの最適化に役立つ可能性のあるものが以下に示されています。

#### `remix.config.js`

すべてのRemixアプリは、プロジェクトルートに`remix.config.js`ファイルを受け入れます。設定はオプションですが、明確にするためにいくつか含めることをお勧めします。利用可能なすべてのオプションの詳細については、[設定に関するドキュメント][docs-on-configuration]を参照してください。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  ignoredRouteFiles: ["**/*.css"],
  assetsBuildDirectory: "public/build",
};
```

#### `jsconfig.json` または `tsconfig.json`

TypeScriptを使用している場合、プロジェクトに`tsconfig.json`が既に存在する可能性があります。`jsconfig.json`はオプションですが、多くのエディターにとって役立つコンテキストを提供します。 以下は、言語設定に含めることをお勧めする最小限の設定です。

<docs-info>Remixは、ファイルがプロジェクト内のどこに存在してもルートからモジュールを簡単にインポートするために、<code>~~/\_</code>パスエイリアスを使用します。`remix.config.js`の`appDirectory`を変更する場合は、<code>~~/\_</code>のパスエイリアスも更新する必要があります。</docs-info>

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

TypeScriptを使用している場合は、適切なグローバル型参照を使用して、プロジェクトのルートに`remix.env.d.ts`ファイルを作成する必要もあります。

```ts filename=remix.env.d.ts
/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />
```

### 非標準インポートに関する注意

現時点では、変更を加えずにアプリを実行できる*可能性*があります。Create React Appや高度に設定されたバンドラーを使用している場合、スタイルシートや画像などのJavaScript以外のモジュールを含めるために`import`を使用している可能性があります。

Remixはほとんどの非標準インポートをサポートしておらず、それは正当な理由によるものだと考えています。以下は、Remixで遭遇する可能性のあるいくつかの違いとその移行時のリファクタリング方法の非網羅的なリストです。

#### アセットのインポート

多くのバンドラーは、画像やフォントなどの様々なアセットのインポートを可能にするプラグインを使用しています。これらは通常、アセットのファイルパスを表す文字列としてコンポーネントに取り込まれます。

```tsx
import logo from "./logo.png";

export function Logo() {
  return <img src={logo} alt="My logo" />;
}
```

Remixでは、基本的に同じように動作します。`<link>`要素によって読み込まれるフォントなどのアセットについては、一般的にルートモジュールでインポートし、`links`関数が返すオブジェクトにファイル名を含めます。[ルート`links`に関するドキュメントを参照してください。][see-our-docs-on-route-links-for-more-information]

#### SVG のインポート

Create React App やその他のビルドツールでは、SVG ファイルを React コンポーネントとしてインポートできます。これは SVG ファイルの一般的なユースケースですが、Remix ではデフォルトでサポートされていません。

```tsx bad nocopy
// これは Remix では動作しません！
import MyLogo from "./logo.svg";

export function Logo() {
  return <MyLogo />;
}
```

SVG ファイルを React コンポーネントとして使用したい場合は、最初にコンポーネントを作成し、直接インポートする必要があります。[React SVGR][react-svgr] は、[コマンドライン][command-line] から、または[オンラインプレイグラウンド][online-playground]で（コピー＆ペーストする場合）これらのコンポーネントを生成するのに役立つ優れたツールセットです。

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

Create React App や多くのビルドツールは、様々な方法でコンポーネントに CSS をインポートすることをサポートしています。Remix は、下記で説明するいくつかの一般的な CSS バンドルソリューションに加えて、通常の CSS ファイルのインポートもサポートしています。

### Route `links` エクスポート

Remixでは、通常のスタイルシートをルートコンポーネントファイルから読み込むことができます。スタイルシートをインポートしても、スタイルに対して特別な処理が行われるわけではなく、スタイルシートを読み込むために使用できるURLが返されます。コンポーネント内でスタイルシートを直接レンダリングするか、[`links` エクスポート][see-our-docs-on-route-links-for-more-information]を使用できます。

アプリのスタイルシートとその他のいくつかのアセットをルートルートの`links`関数に移動してみましょう。

```tsx filename=app/root.tsx lines=[2,5,7-16,32]
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import { Links } from "@remix-run/react";

import App from "./app";
import stylesheetUrl from "./styles.css";

export const links: LinksFunction = () => {
  // `links` は、プロパティが `<link />` コンポーネントのプロップにマップされるオブジェクトの配列を返します。
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

32行目では、個々の`<link />`コンポーネントをすべて置き換えた`<Links />`コンポーネントをレンダリングしていることに気付くでしょう。ルートルートでのみリンクを使用する場合、これは重要ではありませんが、すべての子ルートは、ここでレンダリングされる独自のリンクをエクスポートする場合があります。`links`関数は、ユーザーが移動する可能性のあるページのリソースをプリフェッチできる[`PageLinkDescriptor`オブジェクト][page-link-descriptor-object]を返すこともできます。

現在、既存のルートコンポーネントで、直接または[`react-helmet`][react-helmet]のような抽象化を介して、`<link />`タグをクライアントサイドでページに挿入している場合は、それを行うのをやめ、代わりに`links`エクスポートを使用できます。多くのコードと、場合によっては1つまたは2つの依存関係を削除できます！

### CSS バンドリング

Remix は、[CSS Modules][css-modules]、[Vanilla Extract][vanilla-extract]、および[CSS サイドエフェクトインポート][css-side-effect-imports] を組み込みでサポートしています。これらの機能を使用するには、アプリケーションで CSS バンドリングを設定する必要があります。

まず、生成された CSS バンドルにアクセスするには、`@remix-run/css-bundle` パッケージをインストールします。

```sh
npm install @remix-run/css-bundle
```

次に、`cssBundleHref` をインポートし、リンク記述子に追加します。これは、アプリケーション全体に適用されるように、ほとんどの場合 `root.tsx` にあるでしょう。

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

[CSS バンドリングの詳細については、ドキュメントを参照してください。][css-bundling]

<docs-info>

**注記:** Remix は現在、Sass/Less の処理を直接サポートしていませんが、それらを別個のプロセスとして実行して CSS ファイルを生成し、それを Remix アプリにインポートすることは可能です。

</docs-info>

### `<head>` 内でのコンポーネントのレンダリング

`<link>` がルートコンポーネント内でレンダリングされ、最終的にルート `<Links />` コンポーネントでレンダリングされるのと同様に、アプリはドキュメントの `<head>` に追加のコンポーネントをレンダリングするために、いくつかのインジェクションのトリックを使用する場合があります。これは多くの場合、ドキュメントの `<title>` や `<meta>` タグを変更するために実行されます。

`links` と同様に、各ルートは `meta` 関数をエクスポートすることもできます。この関数は、そのルートの `<meta>` タグ（`<title>`、`<link rel="canonical">`、`<script type="application/ld+json">` など、メタデータに関連する他のいくつかのタグも含む）をレンダリングするために必要な値を返します。

`meta` の動作は `links` とわずかに異なります。ルート階層内の他の `meta` 関数の値をマージする代わりに、**各リーフルートは独自のタグのレンダリングを担当します**。これは以下の理由からです。

* 最適なSEOのために、メタデータに対するより細かい制御が必要になることが多い
* [Open Graph プロトコル][open-graph-protocol] に従う一部のタグの場合、タグの順序によって、クローラーやソーシャルメディアサイトによる解釈に影響を与え、Remix が複雑なメタデータの結合方法を想定するのは予測が難しくなる
* 一部のタグは複数の値を許可しますが、一部のタグは許可しません。Remix は、これらのすべてのケースをどのように処理したいかを想定すべきではありません

### インポートの更新

Remix は `react-router-dom` から取得できるすべてを再エクスポートしますが、これらのモジュールを `@remix-run/react` から取得するようにインポートを更新することをお勧めします。多くの場合、これらのコンポーネントには、Remix向けに最適化された追加の機能がラップされています。

**変更前:**

```tsx bad nocopy
import { Link, Outlet } from "react-router-dom";
```

**変更後:**

```tsx good
import { Link, Outlet } from "@remix-run/react";
```

## 最後に

包括的な移行ガイドを提供するために最善を尽くしましたが、Remixは多くの既存のReactアプリとは大きく異なるいくつかの重要な原則に基づいてゼロから構築されていることに注意することが重要です。現時点ではアプリが動作する可能性がありますが、ドキュメントを精査し、APIを探索するにつれて、コードの複雑さを大幅に削減し、エンドユーザーエクスペリエンスを向上させることができると思います。そこに到達するには少し時間がかかるかもしれませんが、「大きな仕事も少しずつやればできる」ということです。

さあ、あなたのアプリを*Remix*しましょう！その過程で生まれるもの気に入っていただけると思います！💿

### さらに読む

* [Remix の哲学][remix-philosophy]
* [Remix の技術的な説明][remix-technical-explanation]
* [Remix でのデータ読み込み][data-loading-in-remix]
* [Remix でのルーティング][routing-in-remix]
* [Remix でのスタイリング][styling-in-remix]
* [よくある質問][frequently-asked-questions]
* [よくある落とし穴][common-gotchas]

[react-router]: https://reactrouter.com
[react-router-docs]: https://reactrouter.com/v6/start/concepts
[migration-guide-from-v5-to-v6]: https://reactrouter.com/en/6.22.3/upgrading/v5
[backwards-compatibility-package]: https://www.npmjs.com/package/react-router-dom-v5-compat
[a-few-tweaks-to-improve-progressive-enhancement]: ../pages/philosophy#progressive-enhancement
[routing-conventions]: ./routing
[a-catch-all-route]: ../file-conventions/routes#splat-routes
[hydration-mismatch]: https://react.dev/reference/react-dom/client/hydrateRoot
[loader-data]: ../route/loader
[client-only-component]: https://github.com/sergiodxa/remix-utils/blob/main/src/react/client-only.tsx
[remix-utils]: https://www.npmjs.com/package/remix-utils
[examples-repository]: https://github.com/remix-run/examples/blob/main/client-only-components/app/routes/_index.tsx
[react-lazy]: https://reactjs.org/docs/code-splitting.html#reactlazy
[react-suspense]: https://reactjs.org/docs/react-api.html#reactsuspense
[client-only-approach]: #client-only-components
[loadable-components]: https://loadable-components.com/docs/loadable-vs-react-lazy
[docs-on-configuration]: ../file-conventions/remix-config
[see-our-docs-on-route-links-for-more-information]: ../route/links
[react-svgr]: https://react-svgr.com
[command-line]: https://react-svgr.com/docs/cli
[online-playground]: https://react-svgr.com/playground
[page-link-descriptor-object]: ../route/links#pagelinkdescriptor
[react-helmet]: https://www.npmjs.com/package/react-helmet
[remix-philosophy]: ../pages/philosophy
[remix-technical-explanation]: ../pages/technical-explanation
[data-loading-in-remix]: ./data-loading
[routing-in-remix]: ./routing
[styling-in-remix]: ./styling
[frequently-asked-questions]: ../pages/faq
[common-gotchas]: ../pages/gotchas
[css-modules]: ./styling#css-modules
[vanilla-extract]: ./styling#vanilla-extract
[css-side-effect-imports]: ./styling#css-side-effect-imports
[css-bundling]: ./styling#css-bundling
[open-graph-protocol]: https://ogp.me
[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite
[remix-vite]: ./vite