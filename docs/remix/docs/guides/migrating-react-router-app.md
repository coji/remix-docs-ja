---
title: React Router からの移行
description: React Router アプリを Remix に移行する方法は、一度に行うか、段階的に行うかのいずれかです。このガイドでは、アプリケーションをすばやく実行するための反復的なアプローチを紹介します。
---

<docs-info>要約版と、単純な移行の例を示したリポジトリについては、<a href="https://github.com/kentcdodds/incremental-react-router-to-remix-upgrade-path">React Router から Remix への移行例のリポジトリ</a>をご覧ください。</docs-info> 

# React Router アプリケーションを Remix に移行する

<docs-warning>このガイドは、[Remix Vite][remix-vite] ではなく [クラシック Remix コンパイラ][classic-remix-compiler] を使用していることを前提としています。</docs-warning>

世界中の何百万人もの React アプリケーションが [React Router][react-router] によって支えられています。あなたはいくつかをすでに展開しているかもしれません！ Remix は React Router をベースに構築されているため、移行を容易にするための作業を行ってきました。これは、大規模なリファクタリングを避けるために段階的に作業を進めることができます。

まだ React Router を使用していない場合は、再考する価値のある理由がいくつかあります！ 履歴管理、動的なパスマッチング、ネストされたルーティングなど。[React Router ドキュメント][react-router-docs] を見て、提供している機能を確認してください。


[classic-remix-compiler]: https://remix.run/docs/en/v1/guides/remix-compiler
[remix-vite]: https://remix.run/docs/en/v1/guides/remix-vite
[react-router]: https://reactrouter.com/
[react-router-docs]: https://reactrouter.com/docs/en/v6
## React Router v6 を使用するようにしてください

古いバージョンの React Router を使用している場合は、最初に v6 にアップグレードする必要があります。アプリを v6 に迅速かつ反復的にアップグレードするには、[v5 から v6 への移行ガイド][migration-guide-from-v5-to-v6] と[下位互換性パッケージ][backwards-compatibility-package] をご覧ください。

[migration-guide-from-v5-to-v6]: [移行ガイドの URL をここに挿入]
[backwards-compatibility-package]: [下位互換性パッケージの URL をここに挿入] 

## Remix のインストール

まず、Remix でビルドするために必要なパッケージをいくつかインストールする必要があります。以下の手順に従って、すべてのコマンドをプロジェクトのルートから実行してください。

```shell
npm install @remix-run/react @remix-run/node @remix-run/serve
npm install -D @remix-run/dev
```
## サーバーおよびブラウザのエントリポイントの作成

ほとんどの React Router アプリは、主にブラウザで実行されます。サーバーの唯一の仕事は、単一の静的 HTML ページを送信することです。React Router は、クライアント側でルートベースのビューを管理します。これらのアプリは一般的に、ルート `index.js` のようなブラウザエントリポイントファイルを持ち、次のようになります。

```tsx filename=index.tsx
import { render } from "react-dom";

import App from "./App";

render(<App />, document.getElementById("app"));
```

サーバーレンダリングされた React アプリは少し異なります。ブラウザスクリプトはアプリをレンダリングしていませんが、サーバーが提供する DOM を「ハイドレート」しています。ハイドレーションとは、DOM 内の要素を React コンポーネントの対応物にマッピングし、イベントリスナーを設定してアプリをインタラクティブにするプロセスです。

2 つの新しいファイルを作成してみましょう。

* `app/entry.server.tsx` （または `entry.server.jsx`）
* `app/entry.client.tsx` （または `entry.client.jsx`）

<docs-info>Remix のすべてのアプリコードは、慣習により `app` ディレクトリに配置されます。既存のアプリで同じ名前のディレクトリを使用している場合は、Remix への移行時に区別するために `src` や `old-app` などの名前に変更してください。</docs-info>

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

クライアントエントリポイントは次のようになります。

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

Remix は React Router を基盤としていることを説明しました。アプリは、JSX の `Route` コンポーネントで定義されたルートを使って `BrowserRouter` をレンダリングする可能性があります。Remix ではこれを行う必要はありませんが、その説明は後回しにしておきます。現時点では、Remix アプリが動作するために必要な最低レベルのルートを提供する必要があります。

ルートルート（Wes Bos 風に言えば「ルートルート」）は、アプリケーションの構造を提供する役割を担います。そのデフォルトのエクスポートは、他のすべてのルートがロードして依存する、完全な HTML ツリーをレンダリングするコンポーネントです。アプリの足場やシェルと考えてください。

クライアント側でレンダリングされたアプリでは、React アプリをマウントするための DOM ノードを含む index HTML ファイルがあります。ルートルートは、このファイルの構造を反映するマークアップをレンダリングします。

`app` ディレクトリに `root.tsx` （または `root.jsx`）という新しいファイルを作成します。このファイルの内容は異なりますが、`index.html` が次のようになっていると仮定しましょう。

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

`root.tsx` で、その構造を反映するコンポーネントをエクスポートします。

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

ここで注目すべき点がいくつかあります。

* `noscript` タグを削除しました。サーバーでレンダリングするため、JavaScript を無効にしても、ユーザーはアプリを見ることができます（そして、時間の経過とともに [プログレッシブエンハンスメントを向上させるためのいくつかの調整][a-few-tweaks-to-improve-progressive-enhancement] を加えることで、アプリの多くは引き続き機能するはずです）。
* ルート要素内では、`@remix-run/react` から `Outlet` コンポーネントをレンダリングします。これは、React Router アプリで通常、一致したルートをレンダリングするために使用されるコンポーネントと同じです。ここでは同じ機能を果たしますが、Remix のルーターに合わせて調整されています。

<docs-warning>**重要:** ルートルートを作成したら、`public` ディレクトリから `index.html` を削除してください。このファイルが残っていると、サーバーは ``/` ルートにアクセスした際に Remix アプリではなくこの HTML を送信してしまう可能性があります。</docs-warning>


## 既存のアプリコードの適応

まず、既存の React コードのルートを `app` ディレクトリに移動します。プロジェクトルートの `src` ディレクトリにルートアプリコードがある場合、`app/src` に移動する必要があります。

このディレクトリの名前を変更して、これが古いコードであることを明確にすることをお勧めします。そうすれば、最終的にすべてのコンテンツを移行した後、削除できます。このアプローチの素晴らしい点は、アプリが通常どおりに動作するために、一度にすべてを行う必要がないことです。デモプロジェクトでは、このディレクトリの名前を `old-app` にしています。

最後に、ルート `App` コンポーネント（`root` 要素にマウントされたコンポーネント）で、React Router の `<BrowserRouter>` を削除します。Remix は、プロバイダーを直接レンダリングせずに、これを行います。 

## インデックスルートとキャッチオールルートの作成

Remixでは、`<Outlet />`内でレンダリングするものを知るために、ルートルート以外のルートが必要です。幸いなことに、アプリ内ですでに`<Route>`コンポーネントをレンダリングしており、Remixは[ルーティング規則][routing-conventions]を使用するように移行する際にそれらを使用できます。

まず、`app`に`routes`という名前の新しいディレクトリを作成します。そのディレクトリ内に、`_index.tsx`と`$.tsx`という名前の2つのファイルを作成します。`$.tsx`は[**キャッチオールルートまたは「スラッシュ」ルート**][a-catch-all-route]と呼ばれ、まだ`routes`ディレクトリに移行していないルートを古いアプリで処理するために役立ちます。

`_index.tsx`と`$.tsx`ファイル内では、古いルート`App`からのコードをエクスポートするだけです。

```tsx filename=app/routes/_index.tsx
export { default } from "~/old-app/app";
```

```tsx filename=app/routes/$.tsx
export { default } from "~/old-app/app";
```

[routing-conventions]: https://remix.run/docs/en/v1/guides/routing
[a-catch-all-route]: https://remix.run/docs/en/v1/guides/routing#catch-all-routes
## Remix でバンドラを置き換える

Remix は、アプリの開発とビルドのために独自のバンドラと CLI ツールを提供します。おそらく、あなたのアプリは Create React App のようなものでブートストラップされているか、Webpack でカスタムビルドが設定されているでしょう。

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

そして、パッと！あなたのアプリはサーバーサイドレンダリングされ、ビルド時間は 90 秒から 0.5 秒に短縮されます⚡
## ルートの作成

時間が経つにつれて、React Routerの`<Route>`コンポーネントによってレンダリングされるルートを、独自のルートファイルに移行したくなるでしょう。当社の[ルーティング規則][routing-conventions]に記載されているファイル名とディレクトリ構造が、この移行をガイドします。

ルートファイルのデフォルトエクスポートは、`<Outlet />`でレンダリングされるコンポーネントです。そのため、`App`内に次のようなルートがある場合:

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

このファイルを作成したら、`App`から`<Route>`コンポーネントを削除できます。すべてのルートの移行が完了したら、`<Routes>`を削除し、最終的に`old-app`のすべてのコードを削除できます。

## 落とし穴と次のステップ

ここまで来たら、最初の移行は完了したと言えるかもしれません。おめでとうございます！ しかし、Remix は一般的な React アプリとは少し異なる方法で動作します。もしそうじゃなければ、なぜわざわざ Remix を作ったのでしょうか？ 😅 

### 安全でないブラウザ参照

クライアントレンダリングされたコードベースをサーバーレンダリングされたコードベースに移行する際に頻繁に発生する問題の1つは、サーバーで実行されるコードにブラウザAPIへの参照が含まれている可能性があることです。一般的な例は、状態を初期化する際に発生します。

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

この例では、`localStorage`はページのリロード間でデータを永続化するためのグローバルストアとして使用されています。`useEffect`内で`count`の現在の値で`localStorage`を更新していますが、これは`useEffect`がブラウザ内でのみ呼び出されるため、完全に安全です！しかし、`localStorage`に基づいて状態を初期化することは問題です。なぜなら、このコールバックはサーバーとブラウザの両方で実行されるからです。

あなたの定番の解決策は、`window`オブジェクトを確認し、コールバックをブラウザ内でのみ実行することかもしれません。しかし、これは別の問題につながる可能性があり、それは恐ろしい[ハイドレーションの不一致][hydration-mismatch]です。Reactは、サーバーでレンダリングされたマークアップがクライアントのハイドレーション中にレンダリングされるものと同一であることに依存しています。これは、`react-dom`がDOM要素を対応するReactコンポーネントに一致させ、イベントリスナーをアタッチし、状態が変更されるにつれて更新を実行する方法を知っていることを保証します。そのため、ローカルストレージからサーバーで初期化したものとは異なる値が得られた場合、新たな問題に対処する必要があります。

[hydration-mismatch]: https://reactjs.org/docs/react-dom.html#hydration-mismatch
#### クライアントのみのコンポーネント

1つの可能な解決策は、サーバーで使用でき、ルートの[ローダーデータ][loader-data]からプロップとしてコンポーネントに渡される別のキャッシュメカニズムを使用することです。しかし、アプリでコンポーネントをサーバーでレンダリングすることが不可欠でない場合は、サーバーでのレンダリングを完全にスキップし、ハイドレーションが完了するまでブラウザでのレンダリングを待つ方が簡単な解決策となる場合があります。

```tsx
// ハイドレーションは、コンポーネント外でメモリ状態を
// 追跡できます。これは、`SomeComponent`のバージョン
// インスタンスがハイドレートされた後にのみ更新されるためです。
// その後、ブラウザはルーティング変更にわたって
// レンダリングの処理を引き継ぎ、ページが
// 再読み込みされ`isHydrating`がtrueに
// リセットされるまで、ハイドレーションの不一致を
// 心配する必要はなくなります。
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

この解決策を簡素化するために、[`remix-utils`][remix-utils] コミュニティパッケージの[`ClientOnly`コンポーネント][client-only-component]を使用することをお勧めします。使用方法の例は、[`examples`リポジトリ][examples-repository]にあります。

[loader-data]: https://remix.run/docs/en/v1/api/conventions#loader-data
[client-only-component]: https://github.com/remix-run/remix/tree/main/packages/remix-utils
[remix-utils]: https://github.com/remix-run/remix/tree/main/packages/remix-utils
[examples-repository]: https://github.com/remix-run/remix/tree/main/examples
### `React.lazy` と `React.Suspense`

[`React.lazy`][react-lazy] と [`React.Suspense`][react-suspense] を使ってコンポーネントを遅延ロードする場合、使用している React のバージョンによっては問題が発生する可能性があります。React 18 以前では、`React.Suspense` はもともとブラウザ専用の機能として実装されていたため、サーバーでは動作しません。

React 17 を使用している場合は、次のいずれかのオプションがあります。

* React 18 にアップグレードする
* 上記の [クライアント専用のアプローチ][client-only-approach] を使用する
* [Loadable Components][loadable-components] などの代替の遅延ロードソリューションを使用する
* `React.lazy` と `React.Suspense` を完全に削除する

Remix は、管理するすべてのルートのコード分割を自動的に処理するため、`routes` ディレクトリにものを移動する場合、`React.lazy` を手動で使用する必要はほとんどありません。

[react-lazy]: https://reactjs.org/docs/code-splitting.html#reactlazy
[react-suspense]: https://reactjs.org/docs/concurrent-mode-suspense.html
[client-only-approach]: https://remix.run/docs/en/v1/guides/rendering#client-only-components
[loadable-components]: https://github.com/jamiebuilds/loadable-components

### 設定

さらなる設定はオプションですが、以下の設定は開発ワークフローの最適化に役立ちます。 

#### `remix.config.js`

すべての Remix アプリは、プロジェクトルートに `remix.config.js` ファイルを受け入れます。設定はオプションですが、明確にするためにいくつか含めることをお勧めします。利用可能なすべてのオプションの詳細については、[構成に関するドキュメント][docs-on-configuration] を参照してください。

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  ignoredRouteFiles: ["**/*.css"],
  assetsBuildDirectory: "public/build",
};
```

[docs-on-configuration]: https://remix.run/docs/en/v1/guides/configuration
#### `jsconfig.json` または `tsconfig.json`

TypeScript を使用している場合は、プロジェクトに `tsconfig.json` が既に存在する可能性があります。`jsconfig.json` はオプションですが、多くのエディターに役立つコンテキストを提供します。これは、言語設定に含めることをお勧めする最小限の設定です。

<docs-info>Remix は、`~~/\_` パスエイリアスを使用して、ファイルがプロジェクト内のどこにあってもルートからモジュールを簡単にインポートします。`remix.config.js` の `appDirectory` を変更する場合は、`~~/\_` のパスエイリアスも更新する必要があります。</docs-info>

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

TypeScript を使用している場合は、プロジェクトのルートに適切なグローバル型参照を含む `remix.env.d.ts` ファイルを作成する必要もあります。

```ts filename=remix.env.d.ts
/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />
```
### 非標準インポートに関する注意

現時点では、アプリを何も変更せずに実行できるかもしれません。Create React App または高度に構成されたバンドラー設定を使用している場合、`import` を使用してスタイルシートや画像などの非 JavaScript モジュールを含めている可能性があります。

Remix は、ほとんどの非標準インポートをサポートしていません。これは、良い理由があると考えています。以下は、Remix で遭遇する可能性のあるいくつかの違いと、移行時にリファクタリングする方法をまとめたものです。 

**非網羅的なリスト:**

* **CSS:**
    * **Remix:** CSS は、`styles.css` などのファイルにインポートします。`import styles from "./styles.css";`
    * **その他:** `import "./styles.css"`
* **画像:**
    * **Remix:** 画像は、`import image from "./image.png";` のようにインポートします。
    * **その他:** `<img src="./image.png" />`
* **フォント:**
    * **Remix:** フォントは、`import "./fonts/font.woff2";` のようにインポートします。
    * **その他:** `<link rel="stylesheet" href="./fonts/font.css" />`

上記以外にも、Remix では、`import` を使用してインポートする他のモジュールやファイルの種類もサポートしていません。

**移行時のリファクタリング方法:**

* **CSS:** CSS ファイルを `styles.css` などのファイルにインポートします。`import styles from "./styles.css";`
* **画像:** 画像を `import image from "./image.png";` のようにインポートします。
* **フォント:** フォントを `import "./fonts/font.woff2";` のようにインポートします。

これらの変更を行うことで、Remix でのアプリケーションの動作を安定させることができます。
#### アセットのインポート

多くのバンドラーは、画像やフォントなどの様々なアセットをインポートできるように、プラグインを使用しています。これらは通常、アセットのファイルパスを表す文字列としてコンポーネントに渡されます。

```tsx
import logo from "./logo.png";

export function Logo() {
  return <img src={logo} alt="My logo" />;
}
```

Remixでは、基本的に同じように動作します。 `<link>`要素によってロードされるフォントなどのアセットの場合、通常はルートモジュールにインポートし、`links`関数が返すオブジェクトにファイル名を指定します。 [ルートの`links`に関するドキュメントを参照してください。][see-our-docs-on-route-links-for-more-information]

[see-our-docs-on-route-links-for-more-information]: [ルートの`links`に関するドキュメントへのリンク]
#### SVG インポート

Create React App やその他のビルドツールでは、SVG ファイルを React コンポーネントとしてインポートできます。これは SVG ファイルの一般的なユースケースですが、Remix ではデフォルトでサポートされていません。

```tsx bad nocopy
// Remix では動作しません！
import MyLogo from "./logo.svg";

export function Logo() {
  return <MyLogo />;
}
```

SVG ファイルを React コンポーネントとして使用したい場合は、まずコンポーネントを作成して直接インポートする必要があります。[React SVGR][react-svgr] は、これらのコンポーネントを [コマンドライン][command-line] から生成したり、コピー＆ペーストする場合は [オンラインプレイグラウンド][online-playground] で生成したりするのに役立つ優れたツールセットです。

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

[react-svgr]: https://react-svgr.com/
[command-line]: https://react-svgr.com/docs/cli/
[online-playground]: https://react-svgr.com/playground/
#### CSS インポート

Create React App や他の多くのビルドツールでは、コンポーネントに CSS をインポートする様々な方法がサポートされています。Remix は、以下の説明するような一般的な CSS バンドルソリューションに加えて、通常の CSS ファイルのインポートもサポートしています。 

### `links` エクスポートのルート

Remix では、通常のスタイルシートをルートコンポーネントファイルからロードできます。それらをインポートしても、スタイルに対して魔法のようなことは起こりません。代わりに、スタイルシートを必要に応じてロードするために使用できる URL が返されます。コンポーネントにスタイルシートを直接レンダリングするか、[`links` エクスポート][see-our-docs-on-route-links-for-more-information] を使用できます。

アプリのスタイルシートとその他のいくつかのアセットをルートルートの `links` 関数に移動してみましょう。

```tsx filename=app/root.tsx lines=[2,5,7-16,32]
import type { LinksFunction } from "@remix-run/node"; // または cloudflare/deno
import { Links } from "@remix-run/react";

import App from "./app";
import stylesheetUrl from "./styles.css";

export const links: LinksFunction = () => {
  // `links` は、
  // プロパティが `<link />` コンポーネントのプロパティにマッピングされるオブジェクトの配列を返します
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

32 行目で、個別の `<link />` コンポーネントをすべて置き換えた `<Links />` コンポーネントをレンダリングしたことに注意してください。これは、ルートルートでのみリンクを使用する場合には関係ありませんが、すべての子ルートは独自のリンクをエクスポートする可能性があり、ここでもレンダリングされます。`links` 関数は、ユーザーが移動する可能性のあるページのリソースを事前に取得できるように、[`PageLinkDescriptor` オブジェクト][page-link-descriptor-object] を返すこともできます。

現在、既存のルートコンポーネントでページクライアント側で `<link />` タグを挿入している場合、直接または [`react-helmet`][react-helmet] などの抽象化を介して、それを行うのをやめて、代わりに `links` エクスポートを使用できます。多くのコードと、場合によっては 1 つまたは 2 つの依存関係を削除できます！

[see-our-docs-on-route-links-for-more-information]: https://remix.run/docs/en/v1/guides/routing#links-function
[page-link-descriptor-object]: https://remix.run/docs/en/v1/api/remix#pagelinkdescriptor
[react-helmet]: https://www.npmjs.com/package/react-helmet
### CSSバンドル

Remixは、[CSS Modules][css-modules]、[Vanilla Extract][vanilla-extract]、[CSS副作用インポート][css-side-effect-imports]を組み込みでサポートしています。これらの機能を利用するには、アプリケーションにCSSバンドルを設定する必要があります。

まず、生成されたCSSバンドルにアクセスするために、`@remix-run/css-bundle`パッケージをインストールします。

```sh
npm install @remix-run/css-bundle
```

次に、`cssBundleHref`をインポートし、リンク記述子に追加します。ほとんどの場合、`root.tsx`に追加すると、アプリケーション全体に適用されます。

```tsx filename=root.tsx lines=[2,6-8]
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node"; // または cloudflare/deno

export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
      ? [{ rel: "stylesheet", href: cssBundleHref }]
      : []),
    // ...
  ];
};
```

[CSSバンドルに関する詳細については、ドキュメントをご覧ください。][css-bundling]

<docs-info>

**注意:** Remixは現在、Sass/Less処理を直接サポートしていません。ただし、これらを別々のプロセスとして実行してCSSファイルを生成し、その後Remixアプリケーションにインポートすることは可能です。

</docs-info>

[css-modules]: https://www.npmjs.com/package/css-modules
[vanilla-extract]: https://vanilla-extract.style/
[css-side-effect-imports]: https://remix.run/docs/en/v1/guides/css#css-side-effect-imports
[css-bundling]: https://remix.run/docs/en/v1/guides/css#bundling-css

### `<head>` 内でのコンポーネントレンダリング

`<link>` がルートコンポーネント内でレンダリングされ、最終的にルート `<Links />` コンポーネント内でレンダリングされるのと同様に、アプリでは、ドキュメントの `<head>` に追加のコンポーネントをレンダリングするためのインジェクショントリックを使用する場合があります。多くの場合、これはドキュメントの `<title>` や `<meta>` タグを変更するために行われます。

`links` と同様に、各ルートは `meta` 関数をエクスポートすることもできます。この関数は、そのルートの `<meta>` タグをレンダリングするための値を返します（`<title>`、`<link rel="canonical">`、`<script type="application/ld+json">` など、メタデータに関連する他のいくつかのタグも含まれます）。

`meta` の動作は `links` と少し異なります。ルート階層内の他の `meta` 関数の値をマージする代わりに、**各リーフルートは独自のタグをレンダリングする責任があります**。これは次のような理由によるものです。

* 最適な SEO のために、メタデータに対してより詳細な制御をしたいことが多い
* [Open Graph プロトコル][open-graph-protocol] に従う一部のタグの場合、一部のタグの順序が、クローラーやソーシャルメディアサイトによる解釈に影響を与えます。Remix で、複雑なメタデータの結合方法をどのように想定すべきかを予測することは困難です
* 一部のタグは複数の値を許可しますが、他のタグは許可しません。Remix は、これらのすべてのケースをどのように処理すべきかを想定すべきではありません

[open-graph-protocol]: https://ogp.me/
### インポートの更新

Remix は `react-router-dom` から取得できるすべてを再エクスポートしており、`@remix-run/react` からこれらのモジュールを取得するようにインポートを更新することをお勧めします。多くの場合、これらのコンポーネントは Remix に最適化された追加の機能と機能でラップされています。

**変更前:**

```tsx bad nocopy
import { Link, Outlet } from "react-router-dom";
```

**変更後:**

```tsx good
import { Link, Outlet } from "@remix-run/react";
```
## 最後に

この包括的な移行ガイドで可能な限り網羅したつもりですが、Remix は従来の React アプリの構築方法とは大きく異なるいくつかの重要な原則に基づいてゼロから構築されたことを覚えておくことが重要です。現時点ではアプリが動作する可能性がありますが、ドキュメントを精査し、API を探求するにつれて、コードの複雑さを大幅に削減し、アプリのエンドユーザーエクスペリエンスを向上させることができると思います。そこへたどり着くまでには少し時間がかかるかもしれませんが、一口ずつそのゾウを食べていけばいいのです。

さあ、あなたのアプリを *Remix* してみましょう！ 💿 途中で作るもの気に入ると思いますよ！ 

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

[hydration-mismatch]: https://reactjs.org/docs/react-dom.html#hydrate

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

