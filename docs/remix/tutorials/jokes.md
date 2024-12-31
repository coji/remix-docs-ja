---
title: アプリチュートリアル (長編)
order: 4
hidden: true
---

# ジョークアプリチュートリアル

<docs-warning>このチュートリアルは現在、[Remix Vite][remix-vite]ではなく、[Classic Remix Compiler][classic-remix-compiler]を使用していることを前提としています。</docs-warning>

Remixを学びたいですか？あなたは正しい場所にいます。 [Remix Jokes][remix-jokes]を作りましょう！

<docs-info><a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=hsIWJpuxNj0">このライブストリームでケントと一緒にこのチュートリアルを進めてください</a></docs-info>

<a href="https://remix-jokes.lol"><img src="https://remix-jokes.lol/social.png" style="aspect-ratio: 300 / 157; width: 100%"/></a>

このチュートリアルは、Remixで利用可能な主要なAPIの概要を把握するための包括的な方法です。 最後に、お母さん、恋人、または犬に見せることができる完全なアプリケーションが完成します。そして、彼らもあなたと同じくらいRemixに興奮してくれると確信しています（保証はしませんが）。

Remixに焦点を当てます。これは、Remixについて学んでほしいコアなアイデアから気をそらすいくつかのことをスキップすることを意味します。たとえば、CSSスタイルシートをページに表示する方法を示しますが、自分でスタイルを書く必要はありません。そのため、そのようなものについては、コピー/ペーストできるものを提供します。ただし、すべて自分で書きたい場合は、完全に可能です（時間がかかるだけです）。そのため、クリックして展開する必要がある小さな`<details>`要素に入れて、自分でコーディングしたい場合に何もネタバレしないようにします。

<details>

<summary>クリックしてください</summary>

チュートリアルには、コードをこれらの`<details>`要素の背後に隠している箇所がいくつかあります。これは、ネタバレせずに、どれだけコピー/ペーストしたいかを選択できるようにするためです。ただし、使用するクラス名を推測するなど、Remixとは関係のない概念で苦労することはお勧めしません。チュートリアルの要点を理解したら、これらのセクションを参照して作業を確認してください。または、すばやく実行したい場合は、進めながらコピー/ペーストすることもできます。私たちはあなたを判断しません！

</details>

チュートリアル全体を通して、さまざまなドキュメント（Remixドキュメントと[MDN][mdn]のWebドキュメント）へのリンクを貼ります（まだMDNを使用していない場合は、Remixで*たくさん*使用することになり、その過程でWebのスキルも向上します）。行き詰まった場合は、スキップした可能性のあるドキュメントリンクを必ず確認してください。このチュートリアルの目標の1つは、RemixとWeb APIのドキュメントに慣れてもらうことなので、ドキュメントで説明されている場合は、ここで再説明するのではなく、それらにリンクします。

このチュートリアルでは、TypeScriptを使用します。自由にフォローして、TypeScriptの部分をスキップ/削除してください。特に、SQLiteデータベースからデータモデルにアクセスするために[Prisma][prisma]も使用するため、RemixはTypeScriptを使用するとさらに良くなることがわかります。

<docs-info>💿 こんにちは、私はRemixディスクのレイチェルです。実際に何かを*実行*する必要があるときにいつでも表示されます。</docs-info>

<docs-warning>自由に探索してください。ただし、チュートリアルから逸脱しすぎると（たとえば、そのステップに到達する前にデプロイしようとするなど）、重要なことを見逃したために期待どおりに動作しない場合があります。</docs-warning>

<docs-error>チュートリアルの終盤まで、ブラウザにJavaScriptを追加しません。これは、JavaScriptの読み込みに時間がかかる場合（または読み込みに失敗した場合）に、アプリケーションがどれだけうまく機能するかを示すためです。そのため、実際にページにJavaScriptを追加するまで、そのステップに到達するまで`useState`のようなものを使用することはできません。</docs-error>

## アウトライン

このチュートリアルで取り扱うトピックは以下の通りです。

* 新しいRemixプロジェクトの生成
* 慣習的なファイル
* ルート（ネストされたものも含む ✨）
* スタイリング
* データベースとのやり取り（`sqlite`と`prisma`を使用）
* ミューテーション
* バリデーション
* 認証
* エラー処理：予期しないエラー（開発者がミスをした場合）と予期されるエラー（エンドユーザーがミスをした場合）の両方
* メタタグによるSEO
* JavaScript...
* リソースルート
* デプロイ

チュートリアルの各セクションへのリンクは、ナビゲーションバー（モバイルの場合はページ上部、デスクトップの場合は右側）にあります。

## 前提条件

このチュートリアルは、[CodeSandbox][code-sandbox]（素晴らしいブラウザ内エディター）またはローカルのコンピューターで進めることができます。CodeSandboxを使用する場合は、良好なインターネット接続と最新のブラウザがあれば十分です。ローカルで実行する場合は、以下のものがインストールされている必要があります。

* [Node.js][node-js] バージョン (>=18.0.0)
* [npm][npm] 7 以上
* コードエディター（[VSCode][vs-code] がおすすめです）

最後にデプロイの手順も行う場合は、[Fly.io][fly-io] のアカウントも必要になります。

また、システムのコマンドライン/ターミナルインターフェースでコマンドを実行します。そのため、それらに慣れている必要があります。

ReactとTypeScript/JavaScriptの経験があることを前提としています。知識を復習したい場合は、以下のリソースを確認してください。

* [Reactのために知っておくべきJavaScript][java-script-to-know-for-react]
* [React初心者向けガイド][the-beginner-s-guide-to-react]

また、[HTTP API][the-http-api] をよく理解していると役立ちますが、必須ではありません。

それでは、始めましょう！

[code-sandbox]: https://codesandbox.io/
[node-js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[vs-code]: https://code.visualstudio.com/
[fly-io]: https://fly.io/
[java-script-to-know-for-react]: https://kentcdodds.com/blog/javascript-to-know-for-react
[the-beginner-s-guide-to-react]: https://egghead.io/courses/the-beginner-s-guide-to-react
[the-http-api]: https://developer.mozilla.org/en-US/docs/Web/HTTP

## 新しいRemixプロジェクトの生成

<docs-info>

CodeSandboxを使用する予定の場合は、[基本的な例][the-basic-example]を使用して開始できます。

</docs-info>

💿 ターミナルを開き、次のコマンドを実行します。

```shellscript nonumber
npx create-remix@latest
```

<docs-info>

`create-remix@latest`をインストールするかどうかを尋ねられる場合があります。`y`と入力してください。セットアップスクリプトを実行するために初回のみインストールされます。

</docs-info>

セットアップスクリプトが実行されると、いくつかの質問が表示されます。ここではアプリを「remix-jokes」と呼び、Gitリポジトリを初期化し、インストールを実行するように選択します。

```
Where should we create your new project?
remix-jokes

Initialize a new git repository?
Yes

Install dependencies with npm?
Yes
```

Remixは、JavaScript環境の多くでデプロイできます。「Remix App Server」は、[Express][express]に基づいたフル機能の[Node.js][node-js]サーバーです。これは最もシンプルなオプションであり、ほとんどの人のニーズを満たすため、このチュートリアルではこれを使用します。将来的には自由に試してみてください！

`npm install`が完了したら、`remix-jokes`ディレクトリに移動します。

💿 次のコマンドを実行します。

```shellscript nonumber
cd remix-jokes
```

これで`remix-jokes`ディレクトリに移動しました。ここから実行する他のすべてのコマンドは、そのディレクトリ内で行われます。

💿 素晴らしい、お気に入りのエディターで開いて、プロジェクト構造を少し見てみましょう。

[the-basic-example]: https://codesandbox.io/s/github/remix-run/examples/tree/main/basic
[node-js]: https://nodejs.org/
[express]: https://expressjs.com/

## プロジェクト構成の確認

以下にツリー構造を示します。お手元の環境がこれと似た構成になっていることを願います。

```
remix-jokes
├── README.md
├── app
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── root.tsx
│   └── routes
│       └── _index.tsx
├── package-lock.json
├── package.json
├── public
│   └── favicon.ico
├── remix.config.js
├── remix.env.d.ts
└── tsconfig.json
```

これらのファイルについて簡単に説明します。

* `app/` - ここにすべての Remix アプリのコードを配置します。
* `app/entry.client.tsx` - これは、アプリがブラウザで読み込まれるときに最初に実行される JavaScript です。このファイルを使用して、React コンポーネントを[ハイドレート][hydrate]します。
* `app/entry.server.tsx` - これは、リクエストがサーバーに到達したときに最初に実行される JavaScript です。Remix は必要なすべてのデータの読み込みを処理し、あなたはレスポンスを返す役割を担います。このファイルを使用して、React アプリを文字列/ストリームにレンダリングし、それをクライアントへのレスポンスとして送信します。
* `app/root.tsx` - ここにアプリケーションのルートコンポーネントを配置します。ここで `<html>` 要素をレンダリングします。
* `app/routes/` - ここにすべての「ルートモジュール」を配置します。Remix はこのディレクトリ内のファイルを使用して、ファイル名に基づいてアプリの URL ルートを作成します。
* `public/` - ここに静的アセット（画像/フォントなど）を配置します。
* `remix.config.js` - Remix には、このファイルで設定できるいくつかの構成オプションがあります。

💿 それでは、ビルドを実行しましょう。

```shellscript nonumber
npm run build
```

次のような出力が表示されるはずです。

```
Building Remix app in production mode...
Built in 132ms
```

これで、`.cache/` ディレクトリ（Remix が内部で使用するもの）、`build/` ディレクトリ、および `public/build` ディレクトリも作成されているはずです。`build/` ディレクトリはサーバー側のコードです。`public/build/` には、すべてのクライアント側のコードが格納されます。これらの 3 つのディレクトリは `.gitignore` ファイルにリストされているため、生成されたファイルをソース管理にコミットすることはありません。

💿 ビルドされたアプリを実行してみましょう。

```shellscript nonumber
npm start
```

これによりサーバーが起動し、次のように出力されます。

```
Remix App Server started at http://localhost:3000
```

その URL を開くと、いくつかのドキュメントを指す最小限のページが表示されるはずです。

💿 次に、サーバーを停止し、このディレクトリを削除します。

* `app/routes`

これを最小限に切り詰め、段階的に導入していきます。

💿 `app/root.tsx` の内容を以下に置き換えます。

```tsx filename=app/root.tsx
import { LiveReload } from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Remix: So great, it's funny!</title>
      </head>
      <body>
        Hello world
        <LiveReload />
      </body>
    </html>
  );
}
```

<docs-info>

`<LiveReload />` コンポーネントは、開発中に変更を加えるたびにブラウザを自動更新するのに役立ちます。ビルドサーバーが非常に高速であるため、変更に気づく前にリロードが完了することがよくあります ⚡

</docs-info>

`app/` ディレクトリは次のようになっているはずです。

```
app
├── entry.client.tsx
├── entry.server.tsx
└── root.tsx
```

💿 これで設定が完了したので、次のコマンドで開発サーバーを起動します。

```shellscript nonumber
npm run dev
```

[http://localhost:3000][http-localhost-3000] を開くと、アプリが世界に挨拶するはずです。

![最小限の Hello world アプリ][bare-bones-hello-world-app]

素晴らしい、これで何かを追加する準備ができました。

## ルート

まず最初に、ルーティング構造を設定しましょう。アプリが持つすべてのルートは以下の通りです。

```
/
/jokes
/jokes/:jokeId
/jokes/new
/login
```

[`remix.config.js`][remix-config-js] を使ってプログラムでルートを作成することもできますが、より一般的な方法はファイルシステムを使うことです。これは「ファイルベースルーティング」と呼ばれます。

`app/routes` ディレクトリに配置する各ファイルはルートモジュールと呼ばれ、[ルートファイル名の規約][the-route-filename-convention]に従うことで、目的のルーティングURL構造を作成できます。Remixは、このルーティングを処理するために内部で[React Router][react_router]を使用しています。

💿 まず、インデックスルート（`/`）から始めましょう。そのためには、`app/routes/_index.tsx` にファイルを作成し、そのルートモジュールからコンポーネントを `export default` します。今のところは、「Hello Index Route」などと表示するだけで構いません。

<details>

<summary>app/routes/_index.tsx</summary>

```tsx filename=app/routes/_index.tsx
export default function IndexRoute() {
  return <div>Hello Index Route</div>;
}
```

</details>

React Routerは「ネストされたルーティング」をサポートしており、これはルートに親子関係があることを意味します。`app/routes/_index.tsx` は `app/root.tsx` ルートの子です。ネストされたルーティングでは、親は子をレイアウトする責任があります。

💿 `app/root.tsx` を更新して、子を配置しましょう。これには、`@remix-run/react` の `<Outlet />` コンポーネントを使用します。

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[1,15]
import { LiveReload, Outlet } from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Remix: So great, it's funny!</title>
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
```

</details>

<docs-info> `npm run dev` で開発サーバーが実行されていることを確認してください。</docs-info>

これにより、ファイルシステムの変更が監視され、サイトが再構築されます。また、`<LiveReload />` コンポーネントのおかげで、ブラウザがリフレッシュされます。

💿 もう一度サイトを開くと、インデックスルートからの挨拶が表示されるはずです。

![インデックスルートからの挨拶][a-greeting-from-the-index-route]

素晴らしい！次に、`/jokes` ルートを処理しましょう。

💿 `app/routes/jokes.tsx` に新しいルートを作成します（これは親ルートになるため、再度 `<Outlet />` を使用することに注意してください）。

<details>

<summary>app/routes/jokes.tsx</summary>

```tsx filename=app/routes/jokes.tsx
import { Outlet } from "@remix-run/react";

export default function JokesRoute() {
  return (
    <div>
      <h1>J🤪KES</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

</details>

[`/jokes`][jokes] にアクセスすると、そのコンポーネントが表示されるはずです。次に、その `<Outlet />` 内に、いくつかのランダムなジョークを「インデックスルート」にレンダリングします。

💿 `app/routes/jokes._index.tsx` にルートを作成します。

<details>

<summary>app/routes/jokes._index.tsx</summary>

```tsx filename=app/routes/jokes._index.tsx
export default function JokesIndexRoute() {
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>
        I was wondering why the frisbee was getting bigger,
        then it hit me.
      </p>
    </div>
  );
}
```

</details>

[`/jokes`][jokes] をリフレッシュすると、`app/routes/jokes.tsx` と `app/routes/jokes._index.tsx` の両方のコンテンツが表示されます。私の場合は次のようになります。

![ジョークページに表示されたランダムなジョーク：「フリスビーが大きくなっているのはなぜだろうと思っていたら、当たった。」][a-random-joke-on-the-jokes-page-i-was-wondering-why-the-frisbee-was-getting-bigger-then-it-hit-me]

そして、これらの各ルートモジュールは、URLの自分の部分のみに関心があることに注目してください。素晴らしいでしょう？ネストされたルーティングは非常に便利で、まだ始まったばかりです。続けましょう。

💿 次に、`/jokes/new` ルートを処理しましょう。どうすればよいか想像できるでしょう😄。このページでジョークを作成できるようにするため、`name` と `content` フィールドを持つ `form` をレンダリングする必要があります。

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx
export default function NewJokeRoute() {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name="content" />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
```

</details>

素晴らしい、これで [`/jokes/new`][jokes-new] にアクセスすると、フォームが表示されるはずです。

![新しいジョークフォーム][a-new-joke-form]

### パラメータ化されたルート

まもなく、ジョークをIDで保存するデータベースを追加するので、もう少しユニークな、パラメータ化されたルートをもう1つ追加しましょう。

`/jokes/$jokeId`

ここで、パラメータ `$jokeId` は何でも構いません。URLのその部分をデータベースで検索して、適切なジョークを表示できます。パラメータ化されたルートを作成するには、ファイル名に `$` 文字を使用します。（[規約の詳細はこちら][the-route-filename-convention]）。

💿 `app/routes/jokes.$jokeId.tsx` に新しいルートを作成します。今は表示内容についてはあまり気にしないでください（まだデータベースが設定されていません！）。

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx
export default function JokeRoute() {
  return (
    <div>
      <p>これがあなたの面白いジョークです：</p>
      <p>
        なぜカバが木に隠れているのを見つけられないの？
        彼らはそれがとても得意だから。
      </p>
    </div>
  );
}
```

</details>

素晴らしい。これで、[`/jokes/anything-you-want`][jokes-anything-you-want] にアクセスすると、作成したものが（親ルートに加えて）表示されるはずです。

![新しいジョークフォーム][a-new-joke-form-2]

素晴らしい！これで、主要なルートがすべて設定されました！

[the-route-filename-convention]: https://remix.run/docs/en/main/file-conventions/route-files
[jokes-anything-you-want]: http://localhost:3000/jokes/anything-you-want
[a-new-joke-form-2]: https://user-images.githubusercontent.com/1500684/222817799-9969999a-999a-499a-999a-999a999a999a.png

## スタイリング

ウェブでのスタイリングの初期から、CSSをページに適用するために、私たちは `<link rel="stylesheet" href="/path-to-file.css" />` を使用してきました。これはRemixアプリケーションをスタイリングする方法でもありますが、Remixは単に `link` タグをあちこちに配置するよりもはるかに簡単にします。Remixは、ネストされたルーティングのサポートをCSSにもたらし、`link` タグをルートに関連付けることができます。ルートがアクティブな場合、`link` タグがページに存在し、CSSが適用されます。ルートがアクティブでない場合（ユーザーが移動した場合）、`link` タグは削除され、CSSは適用されなくなります。

これは、ルートモジュールで [`links`][links] 関数をエクスポートすることで行います。ホームページをスタイリングしてみましょう。CSSファイルは `app` ディレクトリ内の任意の場所に配置できます。ここでは `app/styles/` に配置します。

まず、ホームページ（インデックスルート `/`）をスタイリングすることから始めます。

💿 `app/styles/index.css` を作成し、次のCSSを記述します。

```css
body {
  color: hsl(0, 0%, 100%);
  background-image: radial-gradient(
    circle,
    rgba(152, 11, 238, 1) 0%,
    rgba(118, 15, 181, 1) 35%,
    rgba(58, 13, 85, 1) 100%
  );
}
```

💿 次に、`app/routes/_index.tsx` を更新して、そのCSSファイルをインポートします。次に、ページにそのリンクを追加するために、[`links`][links] のドキュメントで説明されているように、`links` エクスポートを追加します。

<details>

<summary>app/routes/_index.tsx</summary>

```tsx filename=app/routes/_index.tsx lines=[1,3,5-7]
import type { LinksFunction } from "@remix-run/node";

import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function IndexRoute() {
  return <div>Hello Index Route</div>;
}
```

</details>

ここで、[`/`][http-localhost-3000] にアクセスすると、少しがっかりするかもしれません。美しいスタイルが適用されていません！さて、`app/root.tsx` では、アプリに関する *すべて* をレンダリングしていることを思い出してください。`<html>` から `</html>` までです。つまり、そこに表示されないものは、まったく表示されないということです！

したがって、すべてのアクティブなルートから `link` エクスポートを取得し、それらすべてに `<link />` タグを追加する方法が必要です。幸いなことに、Remixは便利な [`<Links />`][links-component] コンポーネントを提供することで、これを簡単にします。

💿 Remixの `<Links />` コンポーネントを `app/root.tsx` の `<head>` 内に追加してください。

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[2,17]
import {
  Links,
  LiveReload,
  Outlet,
} from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
```

</details>

素晴らしい、もう一度 [`/`][http-localhost-3000] を確認すると、適切にスタイルが適用されているはずです。

![紫色のグラデーションの背景と「Hello Index Route」という白いテキストが表示されたホームページ][the-homepage-with-a-purple-gradient-background-and-white-text-with-the-words-hello-index-route]

やった！しかし、重要でエキサイティングなことを指摘したいと思います。私たちが書いたCSSが `body` 要素をスタイルしていることを知っていますか？[`/jokes`][jokes] ルートで何が起こると予想されますか？確認してみてください。

![背景グラデーションのないジョークページ][the-jokes-page-with-no-background-gradient]

🤯 これはどういうことでしょう？なぜCSSルールが適用されないのでしょうか？`body` が削除されたのでしょうか？いいえ。開発ツールの要素タブを開くと、リンクタグがまったく存在しないことに気づくでしょう！

<docs-info>

これは、CSSを書くときに予期しないCSSの衝突を心配する必要がないことを意味します。好きなように記述でき、ファイルがリンクされている各ルートを確認する限り、他のページに影響を与えていないことがわかります！🔥

これは、CSSファイルを長期的にキャッシュでき、CSSが自然にコード分割されることも意味します。パフォーマンス万歳⚡

</docs-info>

チュートリアルでのスタイリングについては、ほぼすべてです。残りはCSSを書くだけです。必要に応じて自由に記述するか、以下のスタイルをコピーしてください。

<details>

<summary>💿 これを `app/styles/global.css` にコピーします</summary>

```css filename=app/styles/global.css
@font-face {
  font-family: "baloo";
  src: url("/fonts/baloo/baloo.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}

:root {
  --hs-links: 48 100%;
  --color-foreground: hsl(0, 0%, 100%);
  --color-background: hsl(278, 73%, 19%);
  --color-links: hsl(var(--hs-links) 50%);
  --color-links-hover: hsl(var(--hs-links) 45%);
  --color-border: hsl(277, 85%, 38%);
  --color-invalid: hsl(356, 100%, 71%);
  --gradient-background: radial-gradient(
    circle,
    rgba(152, 11, 238, 1) 0%,
    rgba(118, 15, 181, 1) 35%,
    rgba(58, 13, 85, 1) 100%
  );
  --font-body: -apple-system, "Segoe UI", Helvetica Neue, Helvetica,
    Roboto, Arial, sans-serif, system-ui, "Apple Color Emoji",
    "Segoe UI Emoji";
  --font-display: baloo, var(--font-body);
}

html {
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

:-moz-focusring {
  outline: auto;
}

:focus {
  outline: var(--color-links) solid 2px;
  outline-offset: 2px;
}

html,
body {
  padding: 0;
  margin: 0;
  color: var(--color-foreground);
  background-color: var(--color-background);
}

[data-light] {
  --color-invalid: hsl(356, 70%, 39%);
  color: var(--color-background);
  background-color: var(--color-foreground);
}

body {
  font-family: var(--font-body);
  line-height: 1.5;
  background-repeat: no-repeat;
  min-height: 100vh;
  min-height: calc(100vh - env(safe-area-inset-bottom));
}

a {
  color: var(--color-links);
  text-decoration: none;
}

a:hover {
  color: var(--color-links-hover);
  text-decoration: underline;
}

hr {
  display: block;
  height: 1px;
  border: 0;
  background-color: var(--color-border);
  margin-top: 2rem;
  margin-bottom: 2rem;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-display);
  margin: 0;
}

h1 {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

h2 {
  font-size: 1.5rem;
  line-height: 2rem;
}

h3 {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

h4 {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

h5,
h6 {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.container {
  --gutter: 16px;
  width: 1024px;
  max-width: calc(100% - var(--gutter) * 2);
  margin-right: auto;
  margin-left: auto;
}

/* buttons */

.button {
  --shadow-color: hsl(var(--hs-links) 30%);
  --shadow-size: 3px;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-links);
  color: var(--color-background);
  font-family: var(--font-display);
  font-weight: bold;
  line-height: 1;
  font-size: 1.125rem;
  margin: 0;
  padding: 0.625em 1em;
  border: 0;
  border-radius: 4px;
  box-shadow: 0 var(--shadow-size) 0 0 var(--shadow-color);
  outline-offset: 2px;
  transform: translateY(0);
  transition: background-color 50ms ease-out, box-shadow
      50ms ease-out,
    transform 100ms cubic-bezier(0.3, 0.6, 0.8, 1.25);
}

.button:hover {
  --raise: 1px;
  color: var(--color-background);
  text-decoration: none;
  box-shadow: 0 calc(var(--shadow-size) + var(--raise)) 0 0 var(
      --shadow-color
    );
  transform: translateY(calc(var(--raise) * -1));
}

.button:active {
  --press: 1px;
  box-shadow: 0 calc(var(--shadow-size) - var(--press)) 0 0 var(
      --shadow-color
    );
  transform: translateY(var(--press));
  background-color: var(--color-links-hover);
}

.button[disabled],
.button[aria-disabled="true"] {
  transform: translateY(0);
  pointer-events: none;
  opacity: 0.7;
}

.button:focus:not(:focus-visible) {
  outline: none;
}

/* forms */

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  display: block;
  max-width: 100%;
  margin-bottom: 0.5rem;
  color: inherit;
  white-space: normal;
}

[type="text"],
[type="password"],
[type="date"],
[type="datetime"],
[type="datetime-local"],
[type="month"],
[type="week"],
[type="email"],
[type="number"],
[type="search"],
[type="tel"],
[type="time"],
[type="url"],
[type="color"],
textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: block;
  display: flex;
  align-items: center;
  width: 100%;
  height: 2.5rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: hsl(0 0% 100% / 10%);
  background-blend-mode: luminosity;
  box-shadow: none;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: normal;
  line-height: 1.5;
  color: var(--color-foreground);
  transition: box-shadow 200ms, border-color 50ms ease-out,
    background-color 50ms ease-out, color 50ms ease-out;
}

[data-light] [type="text"],
[data-light] [type="password"],
[data-light] [type="date"],
[data-light] [type="datetime"],
[data-light] [type="datetime-local"],
[data-light] [type="month"],
[data-light] [type="week"],
[data-light] [type="email"],
[data-light] [type="number"],
[data-light] [type="search"],
[data-light] [type="tel"],
[data-light] [type="time"],
[data-light] [type="url"],
[data-light] [type="color"],
[data-light] textarea {
  color: var(--color-background);
  background-color: hsl(0 0% 0% / 10%);
}

[type="text"][aria-invalid="true"],
[type="password"][aria-invalid="true"],
[type="date"][aria-invalid="true"],
[type="datetime"][aria-invalid="true"],
[type="datetime-local"][aria-invalid="true"],
[type="month"][aria-invalid="true"],
[type="week"][aria-invalid="true"],
[type="email"][aria-invalid="true"],
[type="number"][aria-invalid="true"],
[type="search"][aria-invalid="true"],
[type="tel"][aria-invalid="true"],
[type="time"][aria-invalid="true"],
[type="url"][aria-invalid="true"],
[type="color"][aria-invalid="true"],
textarea[aria-invalid="true"] {
  border-color: var(--color-invalid);
}

textarea {
  display: block;
  min-height: 50px;
  max-width: 100%;
}

textarea[rows] {
  height: auto;
}

input:disabled,
input[readonly],
textarea:disabled,
textarea[readonly] {
  opacity: 0.7;
  cursor: not-allowed;
}

[type="file"],
[type="checkbox"],
[type="radio"] {
  margin: 0;
}

[type="file"] {
  width: 100%;
}

label {
  margin: 0;
}

[type="checkbox"] + label,
[type="radio"] + label {
  margin-left: 0.5rem;
}

label > [type="checkbox"],
label > [type="radio"] {
  margin-right: 0.5rem;
}

::placeholder {
  color: hsl(0 0% 100% / 65%);
}

.form-validation-error {
  margin: 0;
  margin-top: 0.25em;
  color: var(--color-invalid);
  font-size: 0.8rem;
}

.error-container {
  background-color: hsla(356, 77%, 59%, 0.747);
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
}
```

</details>

<details>

<summary>💿 これを `app/styles/global-large.css` にコピーします</summary>

```css filename=app/styles/global-large.css
h1 {
  font-size: 3.75rem;
  line-height: 1;
}

h2 {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

h3 {
  font-size: 1.5rem;
  line-height: 2rem;
}

h4 {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

h5 {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
```

</details>

<details>

<summary>💿 これを `app/styles/global-medium.css` にコピーします</summary>

```css filename=app/styles/global-medium.css
h1 {
  font-size: 3rem;
  line-height: 1;
}

h2 {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

h3 {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

h4 {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

h5,
h6 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.container {
  --gutter: 40px;
}
```

</details>

<details>

<summary>💿 これを `app/styles/index.css` にコピーします</summary>

```css filename=app/styles/index.css
/*
 * ユーザーがこのページにアクセスすると、このスタイルが適用され、離れると
 * アンロードされるため、ページ間のスタイルの競合をあまり心配する必要はありません！
 */

body {
  background-image: var(--gradient-background);
}

.container {
  min-height: inherit;
}

.container,
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.content {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

h1 {
  margin: 0;
  text-shadow: 0 3px 0 rgba(0, 0, 0, 0.75);
  text-align: center;
  line-height: 0.5;
}

h1 span {
  display: block;
  font-size: 4.5rem;
  line-height: 1;
  text-transform: uppercase;
  text-shadow: 0 0.2em 0.5em rgba(0, 0, 0, 0.5), 0 5px 0
      rgba(0, 0, 0, 0.75);
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 1rem;
  font-family: var(--font-display);
  font-size: 1.125rem;
  line-height: 1;
}

nav ul a:hover {
  text-decoration-style: wavy;
  text-decoration-thickness: 1px;
}

@media print, (min-width: 640px) {
  h1 span {
    font-size: 6rem;
  }

  nav ul {
    font-size: 1.25rem;
    gap: 1.5rem;
  }
}

@media screen and (min-width: 1024px) {
  h1 span {
    font-size: 8rem;
  }
}
```

</details>

<details>

<summary>💿 これを `app/styles/jokes.css` にコピーします</summary>

```css filename=app/styles/jokes.css
.jokes-layout {
  display: flex;
  flex-direction: column;
  min-height: inherit;
}

.jokes-header {
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.jokes-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jokes-header .home-link {
  font-family: var(--font-display);
  font-size: 3rem;
}

.jokes-header .home-link a {
  color: var(--color-foreground);
}

.jokes-header .home-link a:hover {
  text-decoration: none;
}

.jokes-header .logo-medium {
  display: none;
}

.jokes-header a:hover {
  text-decoration-style: wavy;
  text-decoration-thickness: 1px;
}

.jokes-header .user-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  white-space: nowrap;
}

.jokes-main {
  padding-top: 2rem;
  padding-bottom: 2rem;
  flex: 1 1 100%;
}

.jokes-main .container {
  display: flex;
  gap: 1rem;
}

.jokes-list {
  max-width: 12rem;
}

.jokes-outlet {
  flex: 1;
}

.jokes-footer {
  padding-top: 2rem;
  padding-bottom: 1rem;
  border-top: 1px solid var(--color-border);
}

@media print, (min-width: 640px) {
  .jokes-header .logo {
    display: none;
  }

  .jokes-header .logo-medium {
    display: block;
  }

  .jokes-main {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
}

@media (max-width: 639px) {
  .jokes-main .container {
    flex-direction: column;
  }
}
```

</details>

💿 また、<a href="/jokes-tutorial/baloo/baloo.woff" data-noprefetch target="_blank">フォント</a>と<a href="/jokes-tutorial/baloo/License.txt" data-noprefetch target="_blank">そのライセンス</a>をダウンロードし、`public/fonts/baloo` に配置します。

💿 アセットをダウンロードしている間に、<a href="/jokes-tutorial/social.png" data-noprefetch target="_blank">ソーシャルイメージ</a>もダウンロードして、`public/social.png` に配置してください。後で必要になります。

💿 `app/root.tsx` と `app/routes/jokes.tsx` に `links` エクスポートを追加して、ページを美しく見せるためのCSSをいくつか取り込みます（注：それぞれに独自のCSSファイルがあります）。CSSを見て、JSX要素に構造を追加して、見栄えを良くすることができます。リンクもいくつか追加します。

<docs-info>`app/root.tsx` は `global` CSSファイルにリンクするものです。ルートルートのスタイルに「global」という名前が理にかなっているのはなぜだと思いますか？</docs-info>

`global-large.css` および `global-medium.css` ファイルは、メディアクエリベースのCSS用です。

<docs-info>`<link />` タグでメディアクエリを使用できることをご存知ですか？[`<link />` のMDNページを確認してください][check-out-the-mdn-page-for-link]。</docs-info>

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[1,8-10,12-24]
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Outlet,
} from "@remix-run/react";

import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
      <body>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.tsx</summary>

```tsx filename=app/routes/jokes.tsx lines=[1,4,6-8]
import type { LinksFunction } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function JokesRoute() {
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              <li>
                <Link to="some-joke-id">Hippo</Link>
              </li>
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
```

</details>

💿 ホームページからジョークへのリンクを追加し、CSSのクラス名に従ってホームページを美しく見せましょう。

<details>

<summary>app/routes/_index.tsx</summary>

```tsx filename=app/routes/_index.tsx lines=[2,11-26]
import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function IndexRoute() {
  return (
    <div className="container">
      <div className="content">
        <h1>
          Remix <span>Jokes!</span>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="jokes">Read Jokes</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
```

</details>

チュートリアルの残りの部分を進めるにつれて、これらのCSSファイルのクラス名を確認して、そのCSSを最大限に活用することをお勧めします。

CSSに関する簡単な注意点です。多くの人がCSSにランタイムライブラリ（[Styled-Components][styled-components]など）を使用することに慣れているかもしれません。Remixでそれらを使用することもできますが、より伝統的なCSSアプローチを検討することをお勧めします。これらのスタイリングソリューションの作成につながった問題の多くは、Remixでは実際には問題ではないため、よりシンプルなスタイリングアプローチを使用できることがよくあります。

とはいえ、多くのRemixユーザーは[Tailwind CSS][tailwind]に非常に満足しており、このアプローチをお勧めします。基本的に、URL（またはURLを取得するためにインポートできるCSSファイル）を提供できる場合は、Remixがブラウザプラットフォームをキャッシュとロード/アンロードに活用できるため、一般的に良いアプローチです。

## データベース

ほとんどの現実世界のアプリケーションでは、何らかの形式のデータ永続化が必要です。私たちの場合、ジョークをデータベースに保存して、人々が私たちの陽気さを笑ったり、自分たちのジョークを投稿したりできるようにしたいと考えています（認証セクションで近日公開！）。

Remixでは、お好みの永続化ソリューションを使用できます。[Firebase][firebase]、[Supabase][supabase]、[Airtable][airtable]、[Hasura][hasura]、[Google Spreadsheets][google-spreadsheets]、[Cloudflare Workers KV][cloudflare-workers-kv]、[Fauna][fauna]、カスタムの[PostgreSQL][postgre-sql]、またはバックエンドチームのREST/GraphQL APIでさえも。真剣です。何でも好きなものを使ってください。

[firebase]: https://firebase.google.com/
[supabase]: https://supabase.com/
[airtable]: https://airtable.com/
[hasura]: https://hasura.io/
[google-spreadsheets]: https://www.google.com/sheets/about/
[cloudflare-workers-kv]: https://developers.cloudflare.com/workers/runtime-apis/kv/
[fauna]: https://fauna.com/
[postgre-sql]: https://www.postgresql.org/

### Prisma のセットアップ

<docs-info>Prisma チームは、Prisma スキーマを操作する際に非常に役立つ [VSCode 拡張機能][a-vs-code-extension] を作成しました。</docs-info>

このチュートリアルでは、独自の [SQLite][sq-lite] データベースを使用します。これは基本的に、コンピュータ上のファイルに存在するデータベースであり、驚くほど高性能で、何よりも、お気に入りのデータベース ORM である [Prisma][prisma] でサポートされています。どのデータベースを使用すればよいかわからない場合は、ここから始めるのが最適です。

開始するには、次の 2 つのパッケージが必要です。

* 開発中にデータベースとスキーマを操作するための `prisma`。
* ランタイム中にデータベースにクエリを実行するための `@prisma/client`。

💿 Prisma パッケージをインストールします。

```shellscript nonumber
npm install --save-dev prisma
npm install @prisma/client
```

💿 次に、SQLite で Prisma を初期化できます。

```shellscript nonumber
npx prisma init --datasource-provider sqlite
```

これにより、次の出力が得られます。

```
✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.

warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Run prisma db pull to turn your database schema into a Prisma schema.
3. Run prisma generate to generate the Prisma Client. You can then start querying your database.

More information in our documentation:
https://pris.ly/d/getting-started
```

Prisma が初期化されたので、アプリのデータのモデリングを開始できます。これは Prisma のチュートリアルではないため、ここではそれを提供します。Prisma スキーマの詳細については、[ドキュメント][their-docs] を参照してください。

```prisma filename=prisma/schema.prisma lines=[13-19]
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Joke {
  id         String   @id @default(uuid())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  name       String
  content    String
}
```

💿 これを配置したら、次を実行します。

```shellscript nonumber
npx prisma db push
```

このコマンドを実行すると、次の出力が得られます。

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

SQLite database dev.db created at file:./dev.db

🚀  Your database is now in sync with your Prisma schema. Done in 39ms

✔ Generated Prisma Client (4.12.0 | library) to ./node_modules/@prisma/client in 26ms
```

このコマンドはいくつかのことを行いました。まず、`prisma/dev.db` にデータベースファイルを作成しました。次に、提供したスキーマに合わせて、必要なすべての変更をデータベースにプッシュしました。最後に、Prisma の TypeScript 型を生成したため、データベースとのやり取りに API を使用する際に、優れたオートコンプリートと型チェックが得られます。

💿 `prisma/dev.db` を `.gitignore` に追加して、誤ってリポジトリにコミットしないようにしましょう。Prisma の出力で述べたように、秘密をコミットしたくないため、`.env` ファイルは最初から `.gitignore` に追加されています。

```text filename=.gitignore lines=[8]
node_modules

/.cache
/build
/public/build
.env

/prisma/dev.db
```

<docs-warning>データベースが混乱した場合は、いつでも `prisma/dev.db` ファイルを削除して、`npx prisma db push` を再度実行できます。</docs-warning>

次に、テストデータでデータベースを「シード」する小さなファイルを作成します。繰り返しますが、これは実際には remix 固有のものではないため、ここではこれを提供します（心配しないでください。すぐに remix に戻ります）。

💿 これを `prisma/seed.ts` という新しいファイルにコピーします。

```ts filename=prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all(
    getJokes().map((joke) => {
      return db.joke.create({ data: joke });
    })
  );
}

seed();

function getJokes() {
  // shout-out to https://icanhazdadjoke.com/

  return [
    {
      name: "Road worker",
      content: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
    },
    {
      name: "Frisbee",
      content: `I was wondering why the frisbee was getting bigger, then it hit me.`,
    },
    {
      name: "Trees",
      content: `Why do trees seem suspicious on sunny days? Dunno, they're just a bit shady.`,
    },
    {
      name: "Skeletons",
      content: `Why don't skeletons ride roller coasters? They don't have the stomach for it.`,
    },
    {
      name: "Hippos",
      content: `Why don't you find hippopotamuses hiding in trees? They're really good at it.`,
    },
    {
      name: "Dinner",
      content: `What did one plate say to the other plate? Dinner is on me!`,
    },
    {
      name: "Elevator",
      content: `My first time using an elevator was an uplifting experience. The second time let me down.`,
    },
  ];
}
```

必要に応じて、独自のジョークを追加してください。

次に、このファイルを実行する必要があります。型安全性を得るために TypeScript で記述しました（これは、アプリとデータモデルが複雑になるにつれて、はるかに便利になります）。そのため、実行する方法が必要です。

💿 `ts-node` と `tsconfig-paths` を開発依存関係としてインストールします。

```shellscript nonumber
npm install --save-dev ts-node tsconfig-paths
```

💿 これで、それを使用して `seed.ts` ファイルを実行できます。

```shellscript nonumber
npx ts-node --require tsconfig-paths/register prisma/seed.ts
```

これで、データベースにこれらのジョークが含まれました。冗談ではありません！

ただし、データベースをリセットするたびに、そのスクリプトを実行することを覚えておく必要はありません。幸いなことに、そうする必要はありません。

💿 これを `package.json` に追加します。

```json filename=package.json nocopy
{
  "prisma": {
    "seed": "ts-node --require tsconfig-paths/register prisma/seed.ts"
  }
}
```

これで、データベースをリセットするたびに、Prisma はシードファイルも呼び出すようになります。

### データベースへの接続

さて、最後にもう一つ、アプリ内でデータベースに接続する必要があります。これは `prisma/seed.ts` ファイルの先頭で行います。

```ts nocopy
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
```

これで問題なく動作しますが、問題は、開発中にサーバー側の変更を行うたびに、サーバーを停止して完全に再起動したくないということです。そのため、`@remix-run/serve` は実際にはコードを再構築し、完全に新しい状態で要求します。ここで問題となるのは、コードを変更するたびにデータベースへの新しい接続が作成され、最終的に接続が不足してしまうことです。これはデータベースにアクセスするアプリでは非常に一般的な問題であり、Prisma にはそれに対する警告があります。

> 警告: 10 個の Prisma クライアントがすでに実行中です

そのため、この開発時の問題を回避するために、少し追加の作業を行う必要があります。

これは Remix 固有の問題ではないことに注意してください。サーバーコードの「ライブリロード」がある場合は常に、データベースへの接続を切断して再接続するか（時間がかかる可能性があります）、[`global` シングルトン回避策][global-singleton-workaround]を使用する必要があります。

💿 これを `app/utils/singleton.server.ts` および `app/utils/db.server.ts` という 2 つの新しいファイルにコピーしてください。

```ts filename=app/utils/singleton.server.ts
export const singleton = <Value>(
  name: string,
  valueFactory: () => Value
): Value => {
  const g = global as any;
  g.__singletons ??= {};
  g.__singletons[name] ??= valueFactory();
  return g.__singletons[name];
};
```

```ts filename=app/utils/db.server.ts
import { PrismaClient } from "@prisma/client";

import { singleton } from "./singleton.server";

// このモジュールが再インポートされたときにクライアントを検索できるように、一意のキーをハードコードします
export const db = singleton(
  "prisma",
  () => new PrismaClient()
);
```

このコードの分析は読者の練習問題として残しておきます。これは Remix と直接関係がないためです。

ここで強調しておきたいのは、ファイル名の命名規則です。ファイル名の `.server` 部分は、このコードがブラウザに決して含まれないことを Remix に通知します。Remix はサーバーコードがクライアントに含まれないようにうまく処理するため、これはオプションです。ただし、サーバー専用の依存関係の中にはツリーシェイクが難しいものがあるため、ファイル名に `.server` を追加することは、ブラウザ用にバンドルする際にこのモジュールまたはそのインポートを気にしないようにコンパイラーにヒントを与えることになります。`.server` はコンパイラーの境界のような役割を果たします。

### Remixローダーでデータベースから読み込む

さて、Remixのコードを書くのに戻る準備はできましたか？私もです！

私たちの目標は、`/jokes`ルートにジョークのリストを表示し、人々が選択できるジョークへのリンクのリストを作成することです。Remixでは、各ルートモジュールが独自のデータを取得する責任を負います。したがって、`/jokes`ルートにデータが必要な場合は、`app/routes/jokes.tsx`ファイルを更新することになります。

Remixルートモジュールでデータを*ロード*するには、[`loader`][loader]を使用します。これは、レスポンスを返す`async`関数をエクスポートするだけで、コンポーネントでは[`useLoaderData`][use-loader-data]フックを介してアクセスできます。簡単な例を次に示します。

```tsx nocopy
// これは単なる例です。コピー＆ペーストする必要はありません 😄
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async () => {
  return json({
    sandwiches: await db.sandwich.findMany(),
  });
};

export default function Sandwiches() {
  const data = useLoaderData<typeof loader>();
  return (
    <ul>
      {data.sandwiches.map((sandwich) => (
        <li key={sandwich.id}>{sandwich.name}</li>
      ))}
    </ul>
  );
}
```

これで、ここで何をすべきかについて良いアイデアが得られましたか？そうでない場合は、以下の`<details>`で私の解決策を確認できます😄

<docs-info>

Remixとスターターテンプレートから取得する`tsconfig.json`は、上記のように`~`を介して`app/`ディレクトリからのインポートを許可するように構成されているため、あちこちに`../../`がある必要はありません。

</docs-info>

💿 `app/routes/jokes.tsx`ルートモジュールを更新して、データベースからジョークをロードし、ジョークへのリンクのリストをレンダリングします。

<details>

<summary>app/routes/jokes.tsx</summary>

```tsx filename=app/routes/jokes.tsx lines=[2,6,10,16-20,23,47-51]
import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async () => {
  return json({
    jokeListItems: await db.joke.findMany(),
  });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">ランダムなジョークを取得</Link>
            <p>他にもいくつかジョークをチェックしてみてください:</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link to={id}>{name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              自分で追加
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
```

</details>

そして、これで次のようになります。

![ジョークへのリンクのリスト][list-of-links-to-jokes]

[loader]: https://remix.run/docs/en/main/route/loader
[use-loader-data]: https://remix.run/docs/en/main/hooks/use-loader-data
[list-of-links-to-jokes]: https://user-images.githubusercontent.com/1500684/228880779-99999999-9999-9999-9999-999999999999.png

### データの過剰取得

私のソリューションで特定のことについて言及したいと思います。これが私のローダーです：

```tsx lines=[3-7]
export const loader = async () => {
  return json({
    jokeListItems: await db.joke.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
      take: 5,
    }),
  });
};
```

このページに必要なのはジョークの `id` と `name` だけであることに注目してください。`content` を取得する必要はありません。また、合計5つのアイテムに制限し、作成日で並べ替えているため、最新のジョークを取得できます。したがって、`prisma` を使用すると、必要なものだけになるようにクエリを変更し、クライアントに過剰なデータを送信することを避けることができます！これにより、アプリがより高速になり、ユーザーにとってより応答性が高くなります。

さらにクールなことに、これを行うために必ずしも Prisma や直接的なデータベースアクセスが必要なわけではありません。GraphQL バックエンドにアクセスしていますか？素晴らしい、ローダーで通常の GraphQL のものを使用してください。クライアントに [巨大な GraphQL クライアント][huge-graphql-client] を送信することを心配する必要がないため、クライアント側で行うよりもさらに優れています。それをサーバーに保持し、必要なものに絞り込みます。

ああ、REST エンドポイントにアクセスしているだけですか？それも大丈夫です！ローダーで送信する前に、余分なデータを簡単にフィルタリングできます。すべてがサーバー側で発生するため、バックエンドエンジニアに API 全体を変更するように説得することなく、ユーザーのダウンロードサイズを簡単に節約できます。素晴らしい！

レンダリングしないデータをフィルタリングすることは、ネットワーク経由で送信する量を減らすだけでなく、クライアントに公開したくない機密データもフィルタリングする必要があります。

<docs-error>
ローダーから返されるものは、コンポーネントがレンダリングしなくてもクライアントに公開されます。ローダーをパブリック API エンドポイントと同じように注意して扱ってください。
</docs-error>

### ネットワークの型安全性

私たちのコードでは、`useLoaderData` の型ジェネリックを使用し、`loader` を渡すことで、優れたオートコンプリート機能を利用できます。しかし、`loader` と `useLoaderData` は完全に異なる環境で実行されるため、これは *実際には* 型安全性を保証するものではありません。Remix はサーバーが送信したものを確実に取得しますが、実際にはどうなるかは誰にもわかりません。もしかしたら、あなたの同僚が怒りのあまり、サーバーを自動的に犬への参照を削除するように設定したかもしれません（彼らは猫が好きです）。

したがって、データが正しいことを100％確実にする唯一の方法は、`useLoaderData` から返される `data` に対して [アサーション関数][assertion-functions] を使用することです。これはこのチュートリアルの範囲外ですが、私たちはこれを支援できる [zod][zod] を推奨しています。

[assertion-functions]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
[zod]: https://zod.dev/

### データベースクエリのまとめ

`/jokes/:jokeId` ルートに進む前に、ローダーで params ( `:jokeId` など) にアクセスする方法の簡単な例を示します。

```tsx nocopy
export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  console.log(params); // <-- {jokeId: "123"}
};
```

そして、Prisma からジョークを取得する方法は次のとおりです。

```tsx nocopy
const joke = await db.joke.findUnique({
  where: { id: jokeId },
});
```

<docs-warning>URL ルートを参照する場合は `/jokes/:jokeId` であり、ファイルシステムについて話す場合は `/app/routes/jokes.$jokeId.tsx` であることを覚えておいてください。</docs-warning>

💿 素晴らしい！これで、`app/routes/jokes.$jokeId.tsx` の `/jokes/:jokeId` ルートを続行して接続するために必要なすべてがわかりました。

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[1-3,5,7-17,20,25-26]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Error("Joke not found");
  }
  return json({ joke });
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">"{data.joke.name}" Permalink</Link>
    </div>
  );
}
```

</details>

これで、[`/jokes`][jokes] に移動してリンクをクリックすると、ジョークを取得できるようになります。

![ユニークなジョークを表示するジョークページ][jokes-page-showing-a-unique-joke]

次のセクションでは、データベースに存在しないジョークにアクセスしようとした場合の処理を行います。

次に、ランダムなジョークを表示する `app/routes/jokes._index.tsx` の `/jokes` インデックスルートを処理しましょう。

Prisma からランダムなジョークを取得する方法は次のとおりです。

```tsx
const count = await db.joke.count();
const randomRowNumber = Math.floor(Math.random() * count);
const [randomJoke] = await db.joke.findMany({
  skip: randomRowNumber,
  take: 1,
});
```

💿 これでローダーを動作させることができるはずです。

<details>

<summary>app/routes/jokes._index.tsx</summary>

```tsx filename=app/routes/jokes._index.tsx lines=[1-2,4,6-14,17,22-25]
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    skip: randomRowNumber,
    take: 1,
  });
  return json({ randomJoke });
};

export default function JokesIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.randomJoke.content}</p>
      <Link to={data.randomJoke.id}>
        "{data.randomJoke.name}" Permalink
      </Link>
    </div>
  );
}
```

</details>

これで、[`/jokes`][jokes] ルートにジョークへのリンクのリストとランダムなジョークが表示されるはずです。

![ランダムなジョークを表示するジョークページ][jokes-page-showing-a-random-joke]

## ミューテーション

`/jokes/new` ルートができたものの、このフォームはまだ何もしていません。これを接続しましょう！念のため、今のコードがどうなっているかを示します（`method="post"` が重要なので、必ずあなたのコードにも含まれていることを確認してください）。

```tsx filename=app/routes/jokes.new.tsx
export default function NewJokeRoute() {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name="content" />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
```

大したことはありません。ただのフォームです。このフォームをルートモジュールへの単一のエクスポートで動作させることができると言ったらどうでしょう？できます！それは [`action`][action] 関数エクスポートです！少し読んでみてください。

必要な Prisma コードは次のとおりです。

```tsx
const joke = await db.joke.create({
  data: { name, content },
});
```

💿 `app/routes/jokes.new.tsx` に `action` を作成します。

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx lines=[1-2,4,6-25]
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { db } from "~/utils/db.server";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  // この型チェックは、念のためと、TypeScript を満足させるためです。
  // 次にバリデーションを調べます！
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    throw new Error("Form not submitted correctly.");
  }

  const fields = { content, name };

  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name="content" />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
```

</details>

これがうまくいけば、新しいジョークを作成して、新しいジョークのページにリダイレクトされるはずです。

<docs-info>

`redirect` ユーティリティは、ユーザーをリダイレクトするための適切なヘッダー/ステータスコードを持つ [`Response`][response] オブジェクトを作成するための Remix のシンプルなユーティリティです。

</docs-info>

![ジョーク作成フォームに入力された状態][create-new-joke-form-filled-out]

![新しく作成されたジョークが表示された状態][newly-created-joke-displayed]

やった！すごくないですか？`useEffect` や `useAnything` フックは不要です。フォームと、送信を処理する非同期関数だけです。とてもクールです。必要であれば、これらのすべてを行うこともできますが、なぜそうする必要があるのでしょうか？これは本当に素晴らしいです。

もう一つ気づくことは、ジョークの新しいページにリダイレクトされたとき、そこにあったということです！しかし、キャッシュの更新について考える必要はまったくありませんでした。Remix は自動的にキャッシュを無効化してくれます。それについて考える必要はありません。*それ* がクールです 😎

バリデーションを追加してみませんか？典型的な React のバリデーションアプローチを確実に行うことができます。`useState` を `onChange` ハンドラーなどで接続します。そして、ユーザーが入力しているときにリアルタイムのバリデーションを取得するのは良いことです。しかし、そのすべての作業を行ったとしても、サーバー側でバリデーションを行う必要があります。

この作業に取り掛かる前に、ルートモジュールの `action` 関数についてもう一つ知っておくべきことがあります。戻り値は `loader` 関数と同じである必要があります。つまり、`Response` または（便宜上）シリアライズ可能な JavaScript オブジェクトです。通常、アクションが成功した場合は、一部の Web サイトで見たことがあるかもしれない、迷惑な「再送信の確認」ダイアログを避けるために `redirect` を使用します。

<!-- TODO: `redirect` が成功したアクションに適している理由についてのページを追加し、ここにリンクします。 -->

しかし、エラーがある場合は、エラーメッセージを含むオブジェクトを返すことができ、コンポーネントは [`useActionData`][use-action-data] からこれらの値を取得してユーザーに表示できます。

💿 `name` フィールドと `content` フィールドが十分に長いことをバリデーションしてください。名前は少なくとも 3 文字以上、コンテンツは少なくとも 10 文字以上にする必要があります。このバリデーションをサーバー側で行ってください。

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx lines=[3,6,8-12,14-18,30-34,37-40,42-48,55,65,68-75,78-86,92,94-101,104-112,115-122]
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "That joke's name is too short";
  }
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };
  const fields = { content, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              defaultValue={actionData?.fields?.name}
              name="name"
              type="text"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.name
              )}
              aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.content
              )}
              aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
```

</details>

<details>

<summary>app/utils/request.server.ts</summary>

```ts filename=app/utils/request.server.ts
import { json } from "@remix-run/node";

/**
 * このヘルパー関数は、クライアントに正確な HTTP ステータス、
 * 400 Bad Request を返すのに役立ちます。
 */
export const badRequest = <T>(data: T) =>
  json<T>(data, { status: 400 });
```

</details>

素晴らしい！これで、サーバー上のフィールドをバリデーションし、クライアントにそれらのエラーを表示するフォームができました。

![バリデーションエラーのある新しいジョークフォーム][new-joke-form-with-validation-errors]

私のコード例を少し開いてみませんか？私がこれを行っている方法についていくつかお見せしたいことがあります。

まず、`useActionData` ジェネリック関数に `typeof action` を渡していることに注目してください。これにより、`actionData` の型が適切に推論され、型安全性が得られます。`useActionData` は、アクションがまだ呼び出されていない場合は `undefined` を返す可能性があることに注意してください。そのため、ここでは少し防御的なプログラミングが行われています。

また、フィールドも返していることに気づくかもしれません。これは、何らかの理由で JavaScript の読み込みに失敗した場合に、フォームがサーバーからの値で再レンダリングできるようにするためです。それが `defaultValue` のすべてです。

`badRequest` ヘルパー関数は、渡されたデータの型を自動的に推論しながら、正確な HTTP ステータスである [`400 Bad Request`][400-bad-request] をクライアントに返します。ステータスを指定せずに `json()` を使用した場合、フォームの送信にエラーがあったため、適切ではない `200 OK` レスポンスになります。

もう一つ指摘したいのは、これらすべてが非常に素晴らしく宣言的であるということです。ここでは状態についてまったく考える必要はありません。アクションはいくつかのデータを取得し、それを処理して値を返します。コンポーネントはアクションデータを消費し、その値に基づいてレンダリングします。ここでは状態を管理する必要はありません。競合状態について考える必要もありません。何もありません。

ああ、そして、クライアント側のバリデーション（ユーザーが入力している間）が必要な場合は、アクションが使用している `validateJokeContent` 関数と `validateJokeName` 関数を呼び出すだけです。クライアントとサーバー間でコードをシームレスに共有することができます！*それ* はクールです！

## 認証

皆さんお待ちかねの瞬間です！小さなアプリケーションに認証を追加します。認証を追加する理由は、ジョークを作成したユーザーとジョークを関連付けられるようにするためです。

このセクションで理解しておくと良いことの1つは、Web上での[HTTPクッキー][http-cookies]の仕組みです。

今回は、認証をゼロから自作します。心配しないでください、思ったほど怖いものではありません。

[http-cookies]: https://developer.mozilla.org/ja/docs/Web/HTTP/Cookies

### データベースの準備

<docs-warning>データベースがめちゃくちゃになった場合は、いつでも `prisma/dev.db` ファイルを削除して、再度 `npx prisma db push` を実行できます。また、`npm run dev` で開発サーバーを再起動することも忘れないでください。</docs-warning>

まず、更新された `prisma/schema.prisma` ファイルをお見せします。

💿 `prisma/schema.prisma` ファイルを以下のように更新してください。

```prisma filename=prisma/schema.prisma lines=[13-20,24-25]
// これはあなたの Prisma スキーマファイルです。
// 詳細については、ドキュメントを参照してください: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  username     String   @unique
  passwordHash String
  jokes        Joke[]
}

model Joke {
  id         String   @id @default(uuid())
  jokesterId String
  jokester   User     @relation(fields: [jokesterId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  name       String
  content    String
}
```

更新が完了したら、データベースをこのスキーマにリセットしましょう。

💿 これを実行してください。

```shellscript nonumber
npx prisma db push
```

データベースのリセットを促されるので、「y」を押して確定してください。

すると、次のような出力が表示されます。

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"


⚠️ We found changes that cannot be executed:

  • Added the required column `jokesterId` to the `Joke` table without a default value. There are 9 rows in this table, it is not possible to execute this step.


✔ To apply this change we need to reset the database, do you want to continue? All data will be lost. … yes
The SQLite database "dev.db" from "file:./dev.db" was successfully reset.

🚀  Your database is now in sync with your Prisma schema. Done in 1.56s

✔ Generated Prisma Client (4.12.0 | library) to ./node_modules/@prisma/client in 34ms
```

この変更により、`jokesterId` の値なしに `joke` を作成できなくなったため、プロジェクトでいくつかの TypeScript エラーが発生し始めます。

💿 まず、`prisma/seed.ts` ファイルを修正しましょう。

```ts filename=prisma/seed.ts lines=[5-12,15-16]
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const kody = await db.user.create({
    data: {
      username: "kody",
      // これは "twixrox" のハッシュ化されたバージョンです
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    },
  });
  await Promise.all(
    getJokes().map((joke) => {
      const data = { jokesterId: kody.id, ...joke };
      return db.joke.create({ data });
    })
  );
}

seed();

function getJokes() {
  // https://icanhazdadjoke.com/ に感謝します

  return [
    {
      name: "道路作業員",
      content: `私の父が道路作業員として働いている会社から盗みを働いているとは、決して信じたくありませんでした。しかし、家に帰ると、すべての兆候がありました。`,
    },
    {
      name: "フリスビー",
      content: `フリスビーが大きくなっているのはなぜだろうと思っていたら、ハッとしました。`,
    },
    {
      name: "木",
      content: `なぜ木は晴れた日に疑わしく見えるのでしょうか？わかりません、少し日陰になっているだけです。`,
    },
    {
      name: "骸骨",
      content: `なぜ骸骨はジェットコースターに乗らないのでしょうか？彼らにはそのための胃がないからです。`,
    },
    {
      name: "カバ",
      content: `なぜ木の中にカバが隠れているのを見つけられないのでしょうか？彼らはそれがとても得意だからです。`,
    },
    {
      name: "夕食",
      content: `あるお皿が別のお皿に何と言ったでしょう？夕食は私のおごりです！`,
    },
    {
      name: "エレベーター",
      content: `初めてエレベーターを使ったときは、気分が高揚する体験でした。2回目はがっかりしました。`,
    },
  ];
}
```

💿 素晴らしい、それでは再度シードを実行しましょう。

```shellscript nonumber
npx prisma db seed
```

そして、次のように出力されます。

```
Environment variables loaded from .env
Running seed command `ts-node --require tsconfig-paths/register prisma/seed.ts` ...

🌱  The seed command has been executed.
```

素晴らしい！これでデータベースの準備ができました。

### 認証フローの概要

さて、認証は従来のユーザー名/パスワード方式で行います。パスワードのハッシュ化には[`bcryptjs`][bcryptjs]を使用しますので、誰もアカウントに無理やり侵入することはできません。

💿 忘れないうちに、今すぐインストールしておきましょう。

```shellscript nonumber
npm install bcryptjs
```

💿 `bcryptjs`ライブラリにはDefinitelyTypedにTypeScriptの定義があるので、こちらもインストールしましょう。

```shellscript nonumber
npm install --save-dev @types/bcryptjs
```

全体の流れを簡単に図で示します。

![Excalidraw 認証図][excalidraw-authentication-diagram]

以下に文章で説明します。

* `/login` ルートで。
* ユーザーがログインフォームを送信します。
* フォームデータが検証されます。
  * フォームデータが無効な場合、エラーとともにフォームを返します。
* ログインタイプが「register」の場合
  * ユーザー名が利用可能かどうかを確認します。
    * ユーザー名が利用できない場合、エラーとともにフォームを返します。
  * パスワードをハッシュ化します。
  * 新しいユーザーを作成します。
* ログインタイプが「login」の場合
  * ユーザーが存在するかどうかを確認します。
    * ユーザーが存在しない場合、エラーとともにフォームを返します。
  * パスワードハッシュが一致するかどうかを確認します。
    * パスワードハッシュが一致しない場合、エラーとともにフォームを返します。
* 新しいセッションを作成します。
* `Set-Cookie`ヘッダーとともに`/jokes`ルートにリダイレクトします。

### ログインフォームの作成

さて、大まかな話は十分です。Remixのコードを書き始めましょう！

ログインページを作成します。そのページで使用するCSSを用意しました。

<details>

<summary>💿 このCSSを `app/styles/login.css` にコピーしてください</summary>

```css
/*
 * ユーザーがこのページにアクセスすると、このスタイルが適用されます。離れると、
 * アンロードされるので、ページ間のスタイルの競合をあまり心配する必要はありません！
 */

body {
  background-image: var(--gradient-background);
}

.container {
  min-height: inherit;
}

.container,
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.content {
  padding: 1rem;
  background-color: hsl(0, 0%, 100%);
  border-radius: 5px;
  box-shadow: 0 0.2rem 1rem rgba(0, 0, 0, 0.5);
  width: 400px;
  max-width: 100%;
}

@media print, (min-width: 640px) {
  .content {
    padding: 2rem;
    border-radius: 8px;
  }
}

h1 {
  margin-top: 0;
}

fieldset {
  display: flex;
  justify-content: center;
}

fieldset > :not(:last-child) {
  margin-right: 2rem;
}

.links ul {
  margin-top: 1rem;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.links a:hover {
  text-decoration-style: wavy;
  text-decoration-thickness: 1px;
}
```

</details>

💿 `app/routes/login.tsx` ファイルを追加して、`/login` ルートを作成します。

<details>

<summary>app/routes/login.tsx</summary>

```tsx filename=app/routes/login.tsx
import type { LinksFunction } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";

import stylesUrl from "~/styles/login.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              ログインまたは登録？
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked
              />{" "}
              ログイン
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
              />{" "}
              登録
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">ユーザー名</label>
            <input
              type="text"
              id="username-input"
              name="username"
            />
          </div>
          <div>
            <label htmlFor="password-input">パスワード</label>
            <input
              id="password-input"
              name="password"
              type="password"
            />
          </div>
          <button type="submit" className="button">
            送信
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li>
            <Link to="/jokes">ジョーク</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

</details>

これは次のようになります。

![ログイン/登録ラジオボタンとユーザー名/パスワードフィールド、送信ボタンを備えたログインフォーム][a-login-form-with-a-login-register-radio-button-and-username-password-fields-and-a-submit-button]

私のソリューションでは、`useSearchParams` を使用して `redirectTo` クエリパラメータを取得し、それを隠し入力に入れていることに注意してください。これにより、`action` はユーザーをリダイレクトする場所を知ることができます。これは、ユーザーをログインページにリダイレクトするときに後で役立ちます。

素晴らしい、UIが良くなったので、ロジックを追加しましょう。これは、`/jokes/new` ルートで行ったことと非常によく似ています。できる限り（検証など）を埋めて、まだ実装していないロジックの部分（*実際に*登録/ログインするなど）についてはコメントを残しておきます。

💿 `app/routes/login.tsx` の `action` で検証を実装します。

<details>

<summary>app/routes/login.tsx</summary>

```tsx filename=app/routes/login.tsx lines=[2,7,12-13,19-23,25-29,31-37,39-112,115,138-141,150-153,164-172,174-182,190-198,200-208,210-219]
import type {
  ActionFunctionArgs,
  LinksFunction,
} from "@remix-run/node";
import {
  Link,
  useActionData,
  useSearchParams,
} from "@remix-run/react";

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

function validateUsername(username: string) {
  if (username.length < 3) {
    return "ユーザー名は3文字以上である必要があります";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "パスワードは6文字以上である必要があります";
  }
}

function validateUrl(url: string) {
  const urls = ["/jokes", "/", "https://remix.run"];
  if (urls.includes(url)) {
    return url;
  }
  return "/jokes";
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/jokes"
  );
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "フォームが正しく送信されませんでした。",
    });
  }

  const fields = { loginType, password, username };
  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginType) {
    case "login": {
      // ログインしてユーザーを取得
      // ユーザーがいない場合は、フィールドとformErrorを返す
      // ユーザーがいる場合は、セッションを作成して/jokesにリダイレクト
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "未実装",
      });
    }
    case "register": {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `ユーザー名 ${username} のユーザーはすでに存在します`,
        });
      }
      // ユーザーを作成
      // セッションを作成して/jokesにリダイレクト
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "未実装",
      });
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "ログインタイプが無効です",
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>ログイン</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              ログインまたは登録？
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              ログイン
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                  actionData?.fields?.loginType ===
                  "register"
                }
              />{" "}
              登録
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">ユーザー名</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              aria-errormessage={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">パスワード</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.password
              )}
              aria-errormessage={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            送信
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li>
            <Link to="/jokes">ジョーク</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

</details>

それが完了すると、フォームは次のようになります。

![エラーのあるログインフォーム][login-form-with-errors]

いいね！さあ、面白い部分に取り掛かりましょう。まずは `login` 側から始めましょう。ユーザー名 `kody` で、パスワード（ハッシュ化）が `twixrox` のユーザーをシードします。したがって、そのユーザーとしてログインできるように十分なロジックを実装する必要があります。このロジックは、`app/utils/session.server.ts` という別のファイルに配置します。

開始するには、そのファイルに次のものが必要です。

* `username` と `password` を受け入れる `login` という名前の関数をエクスポートします。
* `username` を持つユーザーをPrismaにクエリします。
* ユーザーがいない場合は、`null` を返します。
* `bcrypt.compare` を使用して、指定された `password` をユーザーの `passwordHash` と比較します。
* パスワードが一致しない場合は、`null` を返します。
* パスワードが一致する場合は、ユーザーを返します。

💿 `app/utils/session.server.ts` というファイルを作成し、上記の要件を実装します。

<details>

<summary>app/utils/session.server.ts</summary>

```ts filename=app/utils/session.server.ts
import bcrypt from "bcryptjs";

import { db } from "./db.server";

type LoginForm = {
  password: string;
  username: string;
};

export async function login({
  password,
  username,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, username };
}
```

</details>

素晴らしい、これで `app/routes/login.tsx` を更新して使用できるようになりました。

<details>

<summary>app/routes/login.tsx</summary>

```tsx filename=app/routes/login.tsx lines=[6,16-25] nocopy
// ...

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { login } from "~/utils/session.server";

// ...

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  // ...
  switch (loginType) {
    case "login": {
      const user = await login({ username, password });
      console.log({ user });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "ユーザー名/パスワードの組み合わせが正しくありません",
        });
      }
      // ユーザーがいる場合は、セッションを作成して/jokesにリダイレクト
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "未実装",
      });
    }
    // ...
  }
};

export default function Login() {
  // ...
}
```

</details>

作業を確認するために、`login` 呼び出し後に `app/routes/login.tsx` に `console.log` を追加しました。

<docs-info>覚えておいてください、`actions` と `loaders` はサーバー上で実行されるため、それらに配置した `console.log` 呼び出しはブラウザのコンソールでは確認できません。それらは、サーバーを実行しているターミナルウィンドウに表示されます。</docs-info>

💿 それが完了したら、ユーザー名 `kody` とパスワード `twixrox` でログインを試み、ターミナル出力を確認してください。私が得たのは次のとおりです。

```
{
  user: {
    id: '1dc45f54-4061-4d9e-8a6d-28d6df6a8d7f',
    username: 'kody'
  }
}
```

<docs-warning>問題が発生した場合は、`npx prisma studio` を実行してブラウザでデータベースを確認してください。`npx prisma db seed` を実行するのを忘れたため、データがない可能性があります（これを書いているときに私がそうしたように😅）。</docs-warning>

やった！ユーザーを取得しました！次に、そのユーザーのIDをセッションに入れる必要があります。これは `app/utils/session.server.ts` で行います。Remixには、セッションのいくつかのタイプのストレージメカニズムを管理するのに役立つ組み込みの抽象化があります（[ドキュメントはこちら][here-are-the-docs]）。最もシンプルで非常にうまくスケールするため、[`createCookieSessionStorage`][create-cookie-session-storage] を使用します。

💿 ユーザーIDとリダイレクト先のルートを受け入れる `createUserSession` 関数を `app/utils/session.server.ts` に記述します。次のことを行う必要があります。

* 新しいセッションを作成します（クッキーストレージの `getSession` 関数を介して）。
* セッションに `userId` フィールドを設定します。
* `Set-Cookie` ヘッダーを設定して、指定されたルートにリダイレクトします（クッキーストレージの `commitSession` 関数を介して）。

注：手助けが必要な場合は、[セッションドキュメント][here-are-the-docs]に、基本的なフロー全体の小さな例があります。それができたら、`app/routes/login.tsx` でそれを使用してセッションを設定し、`/jokes` ルートにリダイレクトします。

<details>

<summary>app/utils/session.server.ts</summary>

```ts filename=app/utils/session.server.ts lines=[1-4,35-38,40-53,55-66]
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import bcrypt from "bcryptjs";

import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

export async function login({
  username,
  password,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }
  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, username };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRETを設定する必要があります");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // 通常はこれを `secure: true` にする必要があります
    // ただし、これはSafariのlocalhostでは機能しません
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
```

</details>

<details>

<summary>app/routes/login.tsx</summary>

```tsx filename=app/routes/login.tsx lines=[7,29] nocopy
// ...

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  createUserSession,
  login,
} from "~/utils/session.server";

// ...

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  // ...

  switch (loginType) {
    case "login": {
      const user = await login({ username, password });

      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `ユーザー名/パスワードの組み合わせが正しくありません`,
        });
      }
      return createUserSession(user.id, redirectTo);
    }

    // ...
  }
};

// ...
```

</details>

`SESSION_SECRET` 環境変数について簡単に説明します。`secrets` オプションの値は、悪者が悪意のある目的で使用する可能性があるため、コードに含めたくないものです。代わりに、環境から値を読み取ります。つまり、`.env` ファイルに環境変数を設定する必要があります。ちなみに、Prismaは自動的にそのファイルをロードするため、本番環境にデプロイするときにその値を設定するだけで済みます。

💿 `.env` ファイルを `SESSION_SECRET` で更新します（任意の値を指定できます）。

これで、[ネットワークタブ][network-tab]を開き、[`/login`][login]に移動して、`kody` と `twixrox` を入力し、ネットワークタブの応答ヘッダーを確認します。次のようになります。

![POST応答の「Set-Cookie」ヘッダーを示すDevToolsネットワークタブ][dev-tools-network-tab-showing-a-set-cookie-header-on-the-post-response]

また、[アプリケーションタブ][application-tab]のクッキーセクションを確認すると、そこにクッキーが設定されているはずです。

![DevToolsアプリケーションタブの表示][dev-tools-application-tab-showing]

これで、ブラウザがサーバーに対して行うすべてのリクエストにそのクッキーが含まれるようになります（クライアント側で何もする必要はありません。[これがクッキーの仕組みです][http-cookies]）。

![クッキーを示すリクエストヘッダー][request-headers-showing-the-cookie]

これで、そのヘッダーを読み取って、そこに設定した `userId` を取得することで、サーバー上でユーザーが認証されているかどうかを確認できます。これをテストするために、`db.joke.create` 呼び出しに `jokesterId` フィールドを追加して、`/jokes/new` ルートを修正しましょう。

<docs-info>[ドキュメント][here-are-the-docs]を確認して、リクエストからセッションを取得する方法を学ぶことを忘れないでください</docs-info>

💿 `app/utils/session.server.ts` を更新して、セッションから `userId` を取得します。私のソリューションでは、3つの関数を作成します：`getUserSession(request: Request)`、`getUserId(request: Request)`、`requireUserId(request: Request, redirectTo: string)`。

<details>

<summary>app/utils/session.server.ts</summary>

```ts filename=app/utils/session.server.ts lines=[55-57,59-66,68-81]
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import bcrypt from "bcryptjs";

import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

export async function login({
  username,
  password,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }
  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, username };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRETを設定する必要があります");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // 通常はこれを `secure: true` にする必要があります
    // ただし、これはSafariのlocalhostでは機能しません
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo],
    ]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
```

</details>

<docs-info>私の例では、`Response` を `throw` していることに気づきましたか？！</docs-info>

私の例では、`redirect` をスローする `requireUserId` を作成しました。`redirect` は、[`Response`][response] オブジェクトを返すユーティリティ関数であることを思い出してください。Remixは、スローされた応答をキャッチしてクライアントに送り返します。これは、`requireUserId` 関数のユーザーが、戻り値が常に `userId` を提供すると想定でき、応答がスローされてコードの実行が停止するため、`userId` がない場合に何が起こるかを心配する必要がないように、このような抽象化で「早期に終了」するのに最適な方法です。

これについては、後のエラー処理セクションで詳しく説明します。

また、私たちのソリューションが、以前のログインルートの `redirectTo` 機能を利用していることにも気づくかもしれません。

💿 次に、`app/routes/jokes.new.tsx` を更新して、その関数を使用して `userId` を取得し、`db.joke.create` 呼び出しに渡します。

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx lines=[7,24,53]
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "そのジョークは短すぎます";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "そのジョークの名前は短すぎます";
  }
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "フォームが正しく送信されませんでした。",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };
  const fields = { content, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>あなた自身の面白いジョークを追加してください</p>
      <form method="post">
        <div>
          <label>
            名前：{" "}
            <input
              defaultValue={actionData?.fields?.name}
              name="name"
              type="text"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.name
              )}
              aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            内容：{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.content
              )}
              aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            追加
          </button>
        </div>
      </form>
    </div>
  );
}
```

</details>

素晴らしい！これで、ユーザーが新しいジョークを作成しようとすると、新しいジョークを作成するために `userId` が必要なため、ログインページにリダイレクトされます。

### ログアウトアクションの構築

ログインしていることをユーザーが確認でき、ログアウトする方法を提供する必要があるでしょう？そう思います。実装しましょう。

💿 `app/utils/session.server.ts` を更新して、Prisma からユーザーを取得する `getUser` 関数と、ユーザーをログアウトするために [`destroySession`][destroy-session] を使用する `logout` 関数を追加します。

<details>

<summary>app/utils/session.server.ts</summary>

```ts filename=app/utils/session.server.ts lines=[84-100,102-109]
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import bcrypt from "bcryptjs";

import { db } from "./db.server";

type LoginForm = {
  password: string;
  username: string;
};

export async function login({
  password,
  username,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, username };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // 通常は `secure: true` にしたいところですが、
    // Safari の localhost では動作しません
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo],
    ]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  const user = await db.user.findUnique({
    select: { id: true, username: true },
    where: { id: userId },
  });

  if (!user) {
    throw await logout(request);
  }

  return user;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
```

</details>

💿 素晴らしい。次に、`app/routes/jokes.tsx` ルートを更新して、ユーザーがログインしていない場合はログインリンクを表示できるようにします。ログインしている場合は、ユーザー名とログアウトフォームを表示します。また、UI を少し整理して、既存のクラス名に合わせます。準備ができたら、例をコピー/ペーストしてください。

<details>

<summary>app/routes/jokes.tsx</summary>

```tsx filename=app/routes/jokes.tsx lines=[3,14,20-22,28,30,50-61]
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const jokeListItems = await db.joke.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 5,
  });
  const user = await getUser(request);

  return json({ jokeListItems, user });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`こんにちは ${data.user.username}`}</span>
              <form action="/logout" method="post">
                <button type="submit" className="button">
                  ログアウト
                </button>
              </form>
            </div>
          ) : (
            <Link to="/login">ログイン</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">ランダムなジョークを取得</Link>
            <p>他にもいくつかジョークがあります:</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link to={id}>{name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              自分で追加
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/logout.tsx</summary>

```tsx filename=app/routes/logout.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/utils/session.server";

export const action = async ({
  request,
}: ActionFunctionArgs) => logout(request);

export const loader = async () => redirect("/");
```

</details>

ローダーでユーザーを取得し、コンポーネントでレンダリングするのは非常に簡単だったと思います。続行する前に、私のバージョンのコードの他の部分についていくつか指摘しておきたいことがあります。

まず、新しい `logout` ルートは、ログアウトを簡単にするためだけに存在します。アクション（ローダーではなく）を使用している理由は、GET リクエストではなく POST リクエストを使用することで [CSRF][csrf] の問題を回避したいからです。これが、ログアウトボタンがリンクではなくフォームである理由です。さらに、Remix は `action` を実行したときにのみローダーを再呼び出しするため、`loader` を使用した場合、キャッシュは無効になりません。`loader` は、誰かが何らかの理由でそのページにアクセスした場合に備えて、ホームに戻すためだけに存在します。

```tsx
<Link to="new" className="button">
  自分で追加
</Link>
```

`to` プロパティが `/` なしで "new" に設定されていることに注目してください。これがネストされたルーティングの利点です。URL 全体を構築する必要はありません。相対的に指定できます。これは、現在のルートのデータを Remix にリロードさせる `<Link to=".">ランダムなジョークを取得</Link>` リンクでも同じです。

素晴らしい。これでアプリは次のようになります。

![ジョークページはきれいにデザインされています][jokes-page-nice-and-designed]

![新しいジョークフォームがデザインされています][new-joke-form-designed]

[destroy-session]: https://remix.run/docs/en/main/utils/sessions#destroysession
[csrf]: https://owasp.org/www-community/attacks/csrf
[jokes-page-nice-and-designed]: https://user-images.githubusercontent.com/1500684/225884117-99999999-9999-9999-9999-999999999999.png
[new-joke-form-designed]: https://user-images.githubusercontent.com/1500684/225884122-99999999-9999-9999-9999-999999999999.png

### ユーザー登録

さて、そろそろユーザー登録のサポートを追加する良いタイミングでしょう！私のように忘れていましたか？😅 まあ、先に進む前に、その部分を追加しましょう。

幸いなことに、これをサポートするために必要なのは、`app/utils/session.server.ts` を `login` 関数と非常によく似た `register` 関数で更新することだけです。ここでの違いは、データベースに保存する前に `bcrypt.hash` を使用してパスワードをハッシュする必要があることです。次に、`app/routes/login.tsx` ルートの `register` ケースを更新して、登録を処理します。

💿 `app/utils/session.server.ts` と `app/routes/login.tsx` の両方を更新して、ユーザー登録を処理します。

<details>

<summary>app/utils/session.server.ts</summary>

```tsx filename=app/utils/session.server.ts lines=[14-23]
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import bcrypt from "bcryptjs";

import { db } from "./db.server";

type LoginForm = {
  password: string;
  username: string;
};

export async function register({
  password,
  username,
}: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { passwordHash, username },
  });
  return { id: user.id, username };
}

export async function login({
  password,
  username,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, username };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // 通常は `secure: true` にしたいところですが
    // これは Safari の localhost では機能しません
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    return null;
  }
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo],
    ]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  const user = await db.user.findUnique({
    select: { id: true, username: true },
    where: { id: userId },
  });

  if (!user) {
    throw await logout(request);
  }

  return user;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
```

</details>

<details>

<summary>app/routes/login.tsx</summary>

```tsx filename=app/routes/login.tsx lines=[17,104-112]
import type {
  ActionFunctionArgs,
  LinksFunction,
} from "@remix-run/node";
import {
  Link,
  useActionData,
  useSearchParams,
} from "@remix-run/react";

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  createUserSession,
  login,
  register,
} from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

function validateUsername(username: string) {
  if (username.length < 3) {
    return "Usernames must be at least 3 characters long";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Passwords must be at least 6 characters long";
  }
}

function validateUrl(url: string) {
  const urls = ["/jokes", "/", "https://remix.run"];
  if (urls.includes(url)) {
    return url;
  }
  return "/jokes";
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/jokes"
  );
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fields = { loginType, password, username };
  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginType) {
    case "login": {
      const user = await login({ username, password });
      console.log({ user });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "Username/Password combination is incorrect",
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    case "register": {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `User with username ${username} already exists`,
        });
      }
      const user = await register({ username, password });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "Something went wrong trying to create a new user.",
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "Login type invalid",
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                  actionData?.fields?.loginType ===
                  "register"
                }
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              aria-errormessage={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.password
              )}
              aria-errormessage={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

</details>

ふう、これで完了です。これでユーザーは新しいアカウントを登録できます！

## 予期せぬエラー

申し訳ありませんが、いつかはエラーを回避できなくなるでしょう。サーバーがダウンしたり、同僚が `// @ts-ignore` を使ったり、などなど。ですから、予期せぬエラーの可能性を受け入れて、それに対処する必要があります。

幸いなことに、Remix のエラー処理は素晴らしいです。React の [エラー境界機能][error-boundary-feature] を使ったことがあるかもしれません。Remix では、ルートモジュールが [`ErrorBoundary` コンポーネント][error-boundary-component] をエクスポートでき、それが使用されます。さらに、サーバーでも動作するのが素晴らしい点です！それだけでなく、`loader` や `action` のエラーも処理します！すごいですね！それでは、始めましょう！

`loader` からデータを取得する `useLoaderData` フックや、`action` からデータを取得する `useActionData` フックと同様に、`ErrorBoundary` は `useRouteError` フックからスローされたインスタンスを取得します。

アプリに 4 つの `ErrorBoundary` を追加します。ジョークの読み込みや処理でエラーが発生した場合に備えて、`app/routes/jokes.*` の各子ルートに 1 つずつ、それ以外のすべてのエラーを処理するために `app/root.tsx` に 1 つです。

<docs-info>`app/root.tsx` の `ErrorBoundary` は少し複雑です</docs-info>

`app/root.tsx` モジュールは `<html>` 要素のレンダリングを担当することを思い出してください。`ErrorBoundary` がレンダリングされるとき、デフォルトのエクスポートの *代わりに* レンダリングされます。つまり、`app/root.tsx` モジュールは `<html>` 要素を `<Link />` 要素などと一緒にレンダリングする必要があります。

💿 これらの各ファイルにシンプルな `ErrorBoundary` を追加してください。

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[6,8,28-49,51-57,59-74]
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Outlet,
  useRouteError,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";

import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

function Document({
  children,
  title = "Remix: So great, it's funny!",
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error";
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[6,11-19] nocopy
// ...

import {
  Link,
  useLoaderData,
  useParams,
} from "@remix-run/react";

// ...

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">
      There was an error loading joke by the id "${jokeId}".
      Sorry.
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx nocopy
// ...

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes._index.tsx</summary>

```tsx filename=app/routes/jokes._index.tsx nocopy
// ...

export function ErrorBoundary() {
  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
}
```

</details>

さて、これらが配置されたので、エラーが発生した場合に何が起こるかを確認しましょう。各ルートのデフォルトコンポーネント、ローダー、またはアクションにこれを追加してください。

```ts
throw new Error("Testing Error Boundary");
```

私が得た結果は次のとおりです。

![アプリエラー][app-error]

![ジョークページエラー][joke-page-error]

![ジョークインデックスページエラー][joke-index-page-error]

![新しいジョークページエラー][new-joke-page-error]

私が気に入っているのは、子ルートの場合、アプリの使えなくなった部分は実際に壊れた部分だけであるということです。アプリの残りの部分は完全にインタラクティブです。ユーザーエクスペリエンスにとって、もう1つのポイントです！

[error-boundary-feature]: https://reactjs.org/docs/error-boundaries.html
[error-boundary-component]: https://remix.run/docs/en/main/route/error-boundary
[app-error]: https://user-images.githubusercontent.com/1500684/228884479-9969999a-999a-499a-888a-999999999999.png
[joke-page-error]: https://user-images.githubusercontent.com/1500684/228884484-99999999-9999-4999-8888-999999999999.png
[joke-index-page-error]: https://user-images.githubusercontent.com/1500684/228884488-99999999-9999-4999-8888-999999999999.png
[new-joke-page-error]: https://user-images.githubusercontent.com/1500684/228884491-99999999-9999-4999-8888-999999999999.png

## 予期されるエラー

時には、ユーザーが予期できることを行うことがあります。必ずしもバリデーションの話をしているわけではありません。ユーザーが認証されているか（ステータス `401`）、または実行しようとしていることに対して承認されているか（ステータス `403`）といったことです。あるいは、存在しないものを探しているのかもしれません（ステータス `404`）。

予期しないエラーを500レベルのエラー（[サーバーエラー][server-errors]）と考えると、予期されるエラーは400レベルのエラー（[クライアントエラー][client-errors]）と考えると役立つかもしれません。

クライアントエラーのレスポンスを確認するために、Remixは[`isRouteErrorResponse`][is-route-error-response]ヘルパー関数を提供しています。サーバーコードが問題を検出した場合、[`Response`][response]オブジェクトをスローします。Remixは、スローされた`Response`をキャッチし、`ErrorBoundary`をレンダリングします。何をスローしても構わないので、`isRouteErrorResponse`ヘルパー関数は、スローされたインスタンスが`Response`オブジェクトであるかどうかを確認する方法です。

最後に、これはフォームのバリデーションなどのためのものではありません。これについては、すでに`useActionData`で説明しました。これは、ユーザーが何かを行ったために、デフォルトのコンポーネントを適切にレンダリングできない状況のためのものであり、代わりに別のものをレンダリングしたい場合に使用します。

<docs-info>`ErrorBoundary`を使用すると、デフォルトのエクスポートは「ハッピーパス」を表し、エラーを心配する必要がなくなります。デフォルトのコンポーネントがレンダリングされる場合、すべてが正常であると想定できます。</docs-info>

この理解を踏まえて、次のルートに`isRouteErrorResponse`チェックを追加します。

* `app/root.tsx` - 最後の手段としてのフォールバックとして。
* `app/routes/jokes.$jokeId.tsx` - ユーザーが存在しないジョークにアクセスしようとした場合（404）。
* `app/routes/jokes.new.tsx` - ユーザーが認証されていない状態でこのページにアクセスしようとした場合（401）。現在、認証せずに送信しようとすると、ログインにリダイレクトされます。ジョークを書くのに時間を費やしたのに、リダイレクトされるのは非常に迷惑です。不可解にリダイレクトするのではなく、最初に認証する必要があるというメッセージをレンダリングできます。
* `app/routes/jokes._index.tsx` - データベースにジョークがない場合、ランダムなジョークは404で見つかりません。（`prisma/dev.db`を削除し、`npx prisma db push`を実行してこれをシミュレートします。シードデータを戻すために、後で`npx prisma db seed`を実行することを忘れないでください。）

💿 これらの`isRouteErrorResponse`チェックをルートに追加しましょう。

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[3,63-75]
import type { LinksFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Outlet,
  useRouteError,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";

import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

function Document({
  children,
  title = "Remix: So great, it's funny!",
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document
        title={`${error.status} ${error.statusText}`}
      >
        <div className="error-container">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error";
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[4,8,20-22,41,43-49]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }
  return json({ joke });
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">"{data.joke.name}" Permalink</Link>
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">
        Huh? What the heck is "{jokeId}"?
      </div>
    );
  }

  return (
    <div className="error-container">
      There was an error loading joke by the id "${jokeId}".
      Sorry.
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes._index.tsx</summary>

```tsx filename=app/routes/jokes._index.tsx lines=[3,6,18-22,41,43-50]
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    skip: randomRowNumber,
    take: 1,
  });
  if (!randomJoke) {
    throw new Response("No random joke found", {
      status: 404,
    });
  }
  return json({ randomJoke });
};

export default function JokesIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.randomJoke.content}</p>
      <Link to={data.randomJoke.id}>
        "{data.randomJoke.name}" Permalink
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">
        <p>There are no jokes to display.</p>
        <Link to="new">Add your own</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx lines=[3,5,7,10,16,20-30,162,164-171]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useActionData,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({});
};

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "That joke's name is too short";
  }
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };
  const fields = { content, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              defaultValue={actionData?.fields?.name}
              name="name"
              type="text"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.name
              )}
              aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.content
              )}
              aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
```

</details>

これが私が得たものです。

![アプリ 400 Bad Request][app-400-bad-request]

![ジョークページの404][a-404-on-the-joke-page]

![ランダムジョークページの404][a-404-on-the-random-joke-page]

![新しいジョークページの401][a-401-on-the-new-joke-page]

素晴らしい！エラーを処理する準備が整いました。そして、ハッピーパスを少しも複雑にしませんでした！🎉

ああ、すべてが文脈に沿っているのが好きではありませんか？そのため、アプリの残りの部分はこれまでどおりに機能し続けます。ユーザーエクスペリエンスのもう1つのポイント💪

そうですね、`ErrorBoundary`を追加している間です。ユーザーが所有している場合はジョークを削除できるようにすることで、`app/routes/jokes.$jokeId.tsx`ルートを少し改善してみませんか。そうでない場合は、`ErrorBoundary`で403エラーを返すことができます。

`delete`で注意すべきことの1つは、HTMLフォームが`method="get"`と`method="post"`のみをサポートしていることです。`method="delete"`はサポートしていません。したがって、フォームがJavaScriptの有無にかかわらず機能するようにするには、次のようなことを行うのが良いでしょう。

```tsx
<form method="post">
  <button name="intent" type="submit" value="delete">
    Delete
  </button>
</form>
```

そして、`action`は、`request.formData().get('intent')`に基づいて削除する意図があるかどうかを判断できます。

💿 `app/routes/jokes.$jokeId.tsx`ルートに削除機能を追加します。

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[2,5,7,11,15,31-59,69-78,88-101]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }
  return json({ joke });
};

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(
      `The intent ${form.get("intent")} is not supported`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response(
      "Pssh, nice try. That's not your joke",
      { status: 403 }
    );
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">"{data.joke.name}" Permalink</Link>
      <form method="post">
        <button
          className="button"
          name="intent"
          type="submit"
          value="delete"
        >
          Delete
        </button>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          Sorry, but "{jokeId}" is not your joke.
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="error-container">
          Huh? What the heck is "{jokeId}"?
        </div>
      );
    }
  }

  return (
    <div className="error-container">
      There was an error loading joke by the id "${jokeId}".
      Sorry.
    </div>
  );
}
```

</details>

自分のジョークではないジョークを削除しようとした場合に適切なエラーメッセージが表示されるようになったので、ユーザーがジョークを所有していない場合は、削除ボタンを非表示にすることもできます。

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[16,22,24,34,77,88]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }
  return json({
    isOwner: userId === joke.jokesterId,
    joke,
  });
};

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(
      `The intent ${form.get("intent")} is not supported`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response(
      "Pssh, nice try. That's not your joke",
      { status: 403 }
    );
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">"{data.joke.name}" Permalink</Link>
      {data.isOwner ? (
        <form method="post">
          <button
            className="button"
            name="intent"
            type="submit"
            value="delete"
          >
            Delete
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          Sorry, but "{jokeId}" is not your joke.
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="error-container">
          Huh? What the heck is "{jokeId}"?
        </div>
      );
    }
  }

  return (
    <div className="error-container">
      There was an error loading joke by the id "${jokeId}".
      Sorry.
    </div>
  );
}
```

</details>
[server-errors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses
[client-errors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
[is-route-error-response]: https://remix.run/docs/en/main/utils/is-route-error-response
[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[app-400-bad-request]: https://user-images.githubusercontent.com/1500684/235219899-99999999-9999-9999-9999-999999999999.png
[a-404-on-the-joke-page]: https://user-images.githubusercontent.com/1500684/235220000-99999999-9999-9999-9999-999999999999.png
[a-404-on-the-random-joke-page]: https://user-images.githubusercontent.com/1500684/235220077-99999999-9999-9999-9999-999999999999.png
[a-401-on-the-new-joke-page]: https://user-images.githubusercontent.com/1500684/235220144-99999999-9999-9999-9999-999999999999.png

## メタタグを使ったSEO

メタタグはSEOやソーシャルメディアに役立ちます。難しいのは、必要なデータにアクセスできるコードの部分が、データをリクエスト/使用するコンポーネントにあることが多いということです。

これがRemixに[`meta`][meta]エクスポートがある理由です。以下のルートにいくつかの便利なメタタグを追加してみましょう。

* `app/routes/login.tsx`
* `app/routes/jokes.$jokeId.tsx` - (これはジョークの名前をタイトルに含めることができて面白いです)

しかし、始める前に、`<html>`から`</html>`まですべてをレンダリングする責任があることを覚えておいてください。つまり、これらの`meta`タグが`<html>`の`<head>`にレンダリングされるようにする必要があります。これがRemixが[`Meta`コンポーネント][meta-component]を提供している理由です。

💿 `Meta`コンポーネントを`app/root.tsx`に追加し、上記のルートに`meta`エクスポートを追加してください。`Meta`コンポーネントは、提供されたときに上書きできるように、既存の`<title>`タグの上に配置する必要があります。

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[3,9,33-42,46,56-69]
import type {
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  useRouteError,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";

import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

export const meta: MetaFunction = () => {
  const description =
    "Remixを学びながら、同時に笑いましょう！";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Remix: とても素晴らしい、面白い！" },
  ];
};

function Document({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="keywords" content="Remix,jokes" />
        <meta
          name="twitter:image"
          content="https://remix-jokes.lol/social.png"
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta name="twitter:creator" content="@remix_run" />
        <meta name="twitter:site" content="@remix_run" />
        <meta name="twitter:title" content="Remix Jokes" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        {children}
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document
        title={`${error.status} ${error.statusText}`}
      >
        <div className="error-container">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : "不明なエラー";
  return (
    <Document title="おっと！">
      <div className="error-container">
        <h1>アプリエラー</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
```

</details>

<details>

<summary>app/routes/login.tsx</summary>

```tsx filename=app/routes/login.tsx lines=[4,25-34]
import type {
  ActionFunctionArgs,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Link,
  useActionData,
  useSearchParams,
} from "@remix-run/react";

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  createUserSession,
  login,
  register,
} from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const meta: MetaFunction = () => {
  const description =
    "Remix Jokesに自分のジョークを投稿するためにログインしてください！";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Remix Jokes | ログイン" },
  ];
};

function validateUsername(username: string) {
  if (username.length < 3) {
    return "ユーザー名は3文字以上である必要があります";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "パスワードは6文字以上である必要があります";
  }
}

function validateUrl(url: string) {
  const urls = ["/jokes", "/", "https://remix.run"];
  if (urls.includes(url)) {
    return url;
  }
  return "/jokes";
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/jokes"
  );
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "フォームが正しく送信されませんでした。",
    });
  }

  const fields = { loginType, password, username };
  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginType) {
    case "login": {
      const user = await login({ username, password });
      console.log({ user });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "ユーザー名/パスワードの組み合わせが正しくありません",
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    case "register": {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `ユーザー名 ${username} のユーザーはすでに存在します`,
        });
      }
      const user = await register({ username, password });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "新しいユーザーを作成しようとして問題が発生しました。",
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "ログインタイプが無効です",
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>ログイン</h1>
        <form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              ログインまたは登録？
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              ログイン
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                  actionData?.fields?.loginType ===
                  "register"
                }
              />{" "}
              登録
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">ユーザー名</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              aria-errormessage={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">パスワード</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.password
              )}
              aria-errormessage={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            送信
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li>
            <Link to="/jokes">ジョーク</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[4,21-36]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  const { description, title } = data
    ? {
        description: `「${data.joke.name}」のジョークなどをお楽しみください`,
        title: `「${data.joke.name}」のジョーク`,
      }
    : { description: "ジョークが見つかりませんでした", title: "ジョークなし" };

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title },
  ];
};

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("なんてジョークだ！見つかりませんでした。", {
      status: 404,
    });
  }
  return json({
    isOwner: userId === joke.jokesterId,
    joke,
  });
};

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(
      `インテント ${form.get("intent")} はサポートされていません`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("存在しないものを削除することはできません", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response(
      "プッシュ、いい試みだ。それはあなたのジョークではありません",
      { status: 403 }
    );
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>これがあなたの面白いジョークです：</p>
      <p>{data.joke.content}</p>
      <Link to=".">「{data.joke.name}」パーマリンク</Link>
      {data.isOwner ? (
        <form method="post">
          <button
            className="button"
            name="intent"
            type="submit"
            value="delete"
          >
            削除
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          あなたがしようとしていることは許可されていません。
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          申し訳ありませんが、「{jokeId}」はあなたのジョークではありません。
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="error-container">
          え？「{jokeId}」って何？
        </div>
      );
    }
  }

  return (
    <div className="error-container">
      ID「{jokeId}」によるジョークの読み込み中にエラーが発生しました。
      申し訳ありません。
    </div>
  );
}
```

</details>

素晴らしい！これで検索エンジンやソーシャルメディアプラットフォームは私たちのサイトを少しは気に入ってくれるでしょう。

## リソースルート

ルートでHTMLドキュメント以外のものをレンダリングしたい場合があります。たとえば、ブログ記事のソーシャルイメージや、製品の画像、レポートのCSVデータ、RSSフィード、サイトマップを生成するエンドポイントがあるかもしれません。あるいは、モバイルアプリ用のAPIルートを実装したい場合や、その他の場合もあるでしょう。

これが[リソースルート][resource-routes]の目的です。私たちのジョークのすべてをRSSフィードで提供するのはクールだと思います。URL `/jokes.rss` にあるのが理にかなっていると思います。これを機能させるには、`。` をエスケープする必要があります。この文字はRemixルートのファイル名で特別な意味を持つからです。[特殊文字のエスケープについてはこちら][escaping-special-characters-here]をご覧ください。

<docs-info>信じられないかもしれませんが、あなたはすでにこれらの1つを作成しています。ログアウトルートを確認してください！UIは必要ありません。そこにあるのは、変更を処理して迷える魂をリダイレクトするためだけです。</docs-info>

この例では、RSS仕様を読みたくない限り、少なくとも例をちらっと見ておくとよいでしょう😅。

💿 `/jokes.rss` ルートを作成します。

<details>

<summary>app/routes/jokes[.]rss.tsx</summary>

```tsx filename=app/routes/jokes[.]rss.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";

import { db } from "~/utils/db.server";

function escapeCdata(s: string) {
  return s.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const jokes = await db.joke.findMany({
    include: { jokester: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost")
    ? "http"
    : "https";
  const domain = `${protocol}://${host}`;
  const jokesUrl = `${domain}/jokes`;

  const rssString = `
    <rss xmlns:blogChannel="${jokesUrl}" version="2.0">
      <channel>
        <title>Remix Jokes</title>
        <link>${jokesUrl}</link>
        <description>Some funny jokes</description>
        <language>en-us</language>
        <generator>Kody the Koala</generator>
        <ttl>40</ttl>
        ${jokes
          .map((joke) =>
            `
            <item>
              <title><![CDATA[${escapeCdata(
                joke.name
              )}]]></title>
              <description><![CDATA[A funny joke called ${escapeHtml(
                joke.name
              )}]]></description>
              <author><![CDATA[${escapeCdata(
                joke.jokester.username
              )}]]></author>
              <pubDate>${joke.createdAt.toUTCString()}</pubDate>
              <link>${jokesUrl}/${joke.id}</link>
              <guid>${jokesUrl}/${joke.id}</guid>
            </item>
          `.trim()
          )
          .join("\n")}
      </channel>
    </rss>
  `.trim();

  return new Response(rssString, {
    headers: {
      "Cache-Control": `public, max-age=${
        60 * 10
      }, s-maxage=${60 * 60 * 24}`,
      "Content-Type": "application/xml",
      "Content-Length": String(
        Buffer.byteLength(rssString)
      ),
    },
  });
};
```

</details>

![RSSフィードのXMLドキュメント][xml-document-for-rss-feed]

わーい！このAPIを使えば、想像できることは何でもできます。必要であれば、アプリのネイティブバージョン用のJSON APIを作成することもできます。ここには多くの力があります。

💿 `app/routes/_index.tsx` と `app/routes/jokes.tsx` ページにそのRSSフィードへのリンクを自由に配置してください。`<Link />` を使用する場合は、Reactアプリの一部ではないURLへのクライアントサイドの遷移はできないため、`reloadDocument` プロパティを使用する必要があることに注意してください。

<details>

<summary>app/routes/_index.tsx</summary>

```tsx filename=app/routes/_index.tsx lines=[22-26]
import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import stylesUrl from "~/styles/index.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export default function IndexRoute() {
  return (
    <div className="container">
      <div className="content">
        <h1>
          Remix <span>Jokes!</span>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="jokes">Read Jokes</Link>
            </li>
            <li>
              <Link reloadDocument to="/jokes.rss">
                RSS
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.tsx</summary>

```tsx filename=app/routes/jokes.tsx lines=[85-91]
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const jokeListItems = await db.joke.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 5,
  });
  const user = await getUser(request);

  return json({ jokeListItems, user });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link to={id}>{name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link reloadDocument to="/jokes.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
```

</details>

## JavaScript...

もしかしたら、JavaScriptアプリに実際にJavaScriptを含めるべきかもしれませんね。😂

真面目な話、ネットワークタブを開いてアプリに移動してください。

![JavaScriptがロードされていないことを示すネットワークタブ][network-tab-indicating-no-java-script-is-loaded]

今までアプリがJavaScriptをロードしていないことに気づきましたか？😆 これは実はかなり重要なことです。アプリ全体がページ上でJavaScriptなしで動作できます。これは、Remixがプラットフォームを非常にうまく活用しているからです。

アプリがJavaScriptなしで動作することがなぜ重要なのでしょうか？JavaScriptを無効にして実行しているユーザーが0.002％いることを心配しているからでしょうか？そうではありません。それは、誰もが高速な接続でアプリに接続しているわけではなく、JavaScriptのロードに時間がかかったり、まったくロードに失敗したりすることがあるからです。JavaScriptなしでアプリを機能させるということは、そのような場合でも、JavaScriptのロードが完了する前から、アプリがユーザーのために*動作する*ことを意味します。

ユーザーエクスペリエンスのもう一つのポイントです！

ページにJavaScriptを含める理由もあります。たとえば、一般的なUIエクスペリエンスの中には、JavaScriptなしではアクセスできないものがあります（特にフォーカスの管理は、ページ全体のリロードが頻繁に行われる場合はあまり良くありません）。また、ページにJavaScriptがある場合は、楽観的なUI（近日公開）でさらに優れたユーザーエクスペリエンスを実現できます。しかし、ネットワーク接続が悪いユーザーのために、JavaScriptなしでRemixでどこまでできるかをお見せするのはクールだと思いました。💪

さて、今度はこのページにJavaScriptをロードしましょう😆

💿 Remixの[`<Scripts />`コンポーネント][scripts-component]を使用して、`app/root.tsx`内のすべてのJavaScriptファイルをロードします。

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[11,75]
import type {
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";

import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

export const meta: MetaFunction = () => {
  const description =
    "Remixを学び、同時に笑いましょう！";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Remix: とても素晴らしい、面白い！" },
  ];
};

function Document({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="keywords" content="Remix,jokes" />
        <meta
          name="twitter:image"
          content="https://remix-jokes.lol/social.png"
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta name="twitter:creator" content="@remix_run" />
        <meta name="twitter:site" content="@remix_run" />
        <meta name="twitter:title" content="Remix Jokes" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document
        title={`${error.status} ${error.statusText}`}
      >
        <div className="error-container">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error";
  return (
    <Document title="おっと！">
      <div className="error-container">
        <h1>アプリエラー</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
```

</details>

![JavaScriptがロードされたことを示すネットワークタブ][network-tab-showing-java-script-loaded]

💿 もう一つできることは、すべての`ErrorBoundary`コンポーネントで`console.error(error);`を実行すると、ブラウザのコンソールにサーバー側のエラーもログに記録されることです。🤯

<details>

<summary>app/root.tsx</summary>

```tsx filename=app/root.tsx lines=[92]
import type {
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";

import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

export const meta: MetaFunction = () => {
  const description =
    "Remixを学び、同時に笑いましょう！";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Remix: とても素晴らしい、面白い！" },
  ];
};

function Document({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="keywords" content="Remix,jokes" />
        <meta
          name="twitter:image"
          content="https://remix-jokes.lol/social.png"
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
        />
        <meta name="twitter:creator" content="@remix_run" />
        <meta name="twitter:site" content="@remix_run" />
        <meta name="twitter:title" content="Remix Jokes" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    return (
      <Document
        title={`${error.status} ${error.statusText}`}
      >
        <div className="error-container">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error";
  return (
    <Document title="おっと！">
      <div className="error-container">
        <h1>アプリエラー</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[114]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  const { description, title } = data
    ? {
        description: `「${data.joke.name}」ジョークなどをお楽しみください`,
        title: `「${data.joke.name}」ジョーク`,
      }
    : { description: "ジョークが見つかりません", title: "ジョークなし" };

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title },
  ];
};

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("なんてジョークだ！見つかりません。", {
      status: 404,
    });
  }
  return json({
    isOwner: userId === joke.jokesterId,
    joke,
  });
};

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(
      `インテント${form.get("intent")}はサポートされていません`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("存在しないものは削除できません", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response(
      "プッシュ、いい試みだ。それはあなたのジョークではありません",
      { status: 403 }
    );
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>これがあなたの面白いジョークです：</p>
      <p>{data.joke.content}</p>
      <Link to=".">「{data.joke.name}」パーマリンク</Link>
      {data.isOwner ? (
        <form method="post">
          <button
            className="button"
            name="intent"
            type="submit"
            value="delete"
          >
            削除
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          あなたがやろうとしていることは許可されていません。
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          申し訳ありませんが、「{jokeId}」はあなたのジョークではありません。
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="error-container">
          え？「{jokeId}」って何？
        </div>
      );
    }
  }

  return (
    <div className="error-container">
      ID「{jokeId}」によるジョークのロード中にエラーが発生しました。
      申し訳ありません。
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes._index.tsx</summary>

```tsx filename=app/routes/jokes._index.tsx lines=[42]
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    skip: randomRowNumber,
    take: 1,
  });
  if (!randomJoke) {
    throw new Response("ランダムなジョークが見つかりません", {
      status: 404,
    });
  }
  return json({ randomJoke });
};

export default function JokesIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>これがランダムなジョークです：</p>
      <p>{data.randomJoke.content}</p>
      <Link to={data.randomJoke.id}>
        「{data.randomJoke.name}」パーマリンク
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">
        <p>表示するジョークがありません。</p>
        <Link to="new">自分で追加する</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      私はドジを踏みました。
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx lines=[159]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  useActionData,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("認証されていません", { status: 401 });
  }
  return json({});
};

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "そのジョークは短すぎます";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "そのジョークの名前は短すぎます";
  }
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "フォームが正しく送信されませんでした。",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };
  const fields = { content, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>あなた自身の面白いジョークを追加してください</p>
      <form method="post">
        <div>
          <label>
            名前：{" "}
            <input
              defaultValue={actionData?.fields?.name}
              name="name"
              type="text"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.name
              )}
              aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            内容：{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.content
              )}
              aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            追加
          </button>
        </div>
      </form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>ジョークを作成するにはログインする必要があります。</p>
        <Link to="/login">ログイン</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      予期せぬエラーが発生しました。申し訳ありません。
    </div>
  );
}
```

</details>

![サーバー側のエラーのログを示すブラウザコンソール][browser-console-showing-the-log-of-a-server-side-error]

### フォーム

Remixには独自の[`<Form />`][form-component]コンポーネントがあります。JavaScriptがまだ読み込まれていない場合は、通常のフォームと同じように動作しますが、JavaScriptが有効になっている場合は、代わりに`fetch`リクエストを行うように「段階的に拡張」されるため、ページ全体の再読み込みは行われません。

💿 すべての`<form />`要素を見つけて、Remixの`<Form />`コンポーネントに変更してください。

<details>

<summary>app/routes/login.tsx</summary>

```tsx filename=app/routes/login.tsx lines=[7,145,247]
import type {
  ActionFunctionArgs,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useSearchParams,
} from "@remix-run/react";

import stylesUrl from "~/styles/login.css";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  createUserSession,
  login,
  register,
} from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const meta: MetaFunction = () => {
  const description =
    "Remix Jokesに自分のジョークを投稿するためにログインしてください！";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Remix Jokes | ログイン" },
  ];
};

function validateUsername(username: string) {
  if (username.length < 3) {
    return "ユーザー名は3文字以上である必要があります";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "パスワードは6文字以上である必要があります";
  }
}

function validateUrl(url: string) {
  const urls = ["/jokes", "/", "https://remix.run"];
  if (urls.includes(url)) {
    return url;
  }
  return "/jokes";
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl(
    (form.get("redirectTo") as string) || "/jokes"
  );
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "フォームが正しく送信されませんでした。",
    });
  }

  const fields = { loginType, password, username };
  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginType) {
    case "login": {
      const user = await login({ username, password });
      console.log({ user });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "ユーザー名/パスワードの組み合わせが正しくありません",
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    case "register": {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `ユーザー名 ${username} のユーザーはすでに存在します`,
        });
      }
      const user = await register({ username, password });
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError:
            "新しいユーザーを作成しようとして問題が発生しました。",
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: "ログインタイプが無効です",
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>ログイン</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              ログインまたは登録？
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              ログイン
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={
                  actionData?.fields?.loginType ===
                  "register"
                }
              />{" "}
              登録
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">ユーザー名</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.username
              )}
              aria-errormessage={
                actionData?.fieldErrors?.username
                  ? "username-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">パスワード</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(
                actionData?.fieldErrors?.password
              )}
              aria-errormessage={
                actionData?.fieldErrors?.password
                  ? "password-error"
                  : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            送信
          </button>
        </Form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li>
            <Link to="/jokes">ジョーク</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.tsx</summary>

```tsx filename=app/routes/jokes.tsx lines=[7,54,58]
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const jokeListItems = await db.joke.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 5,
  });
  const user = await getUser(request);

  return json({ jokeListItems, user });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`こんにちは ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  ログアウト
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">ログイン</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">ランダムなジョークを取得</Link>
            <p>他にもいくつかジョークをチェックしてみてください：</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link to={id}>{name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              自分のジョークを追加
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link reloadDocument to="/jokes.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[8,97,106]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  const { description, title } = data
    ? {
        description: `「${data.joke.name}」のジョークなどをお楽しみください`,
        title: `「${data.joke.name}」のジョーク`,
      }
    : { description: "ジョークが見つかりません", title: "ジョークなし" };

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title },
  ];
};

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("なんてジョークだ！見つかりませんでした。", {
      status: 404,
    });
  }
  return json({
    isOwner: userId === joke.jokesterId,
    joke,
  });
};

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(
      `インテント ${form.get("intent")} はサポートされていません`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("存在しないものは削除できません", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response(
      "プッシュ、いい試みだ。それはあなたのジョークではありません",
      { status: 403 }
    );
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p>これがあなたの面白いジョークです：</p>
      <p>{data.joke.content}</p>
      <Link to=".">「{data.joke.name}」パーマリンク</Link>
      {data.isOwner ? (
        <Form method="post">
          <button
            className="button"
            name="intent"
            type="submit"
            value="delete"
          >
            削除
          </button>
        </Form>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          あなたがしようとしていることは許可されていません。
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          申し訳ありませんが、「{jokeId}」はあなたのジョークではありません。
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="error-container">
          え？「{jokeId}」って何？
        </div>
      );
    }
  }

  return (
    <div className="error-container">
      ID「{jokeId}」によるジョークの読み込み中にエラーが発生しました。
      申し訳ありません。
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx lines=[7,86,153]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  useActionData,
  useRouteError,
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("認証されていません", { status: 401 });
  }
  return json({});
};

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "そのジョークは短すぎます";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "そのジョークの名前は短すぎます";
  }
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "フォームが正しく送信されませんでした。",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };
  const fields = { content, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>自分の面白いジョークを追加してください</p>
      <Form method="post">
        <div>
          <label>
            名前：{" "}
            <input
              defaultValue={actionData?.fields?.name}
              name="name"
              type="text"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.name
              )}
              aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            内容：{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.content
              )}
              aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            追加
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>ジョークを作成するにはログインする必要があります。</p>
        <Link to="/login">ログイン</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      予期しないエラーが発生しました。申し訳ありません。
    </div>
  );
}
```

</details>

### プリフェッチ

ユーザーがリンクにフォーカスしたり、マウスオーバーしたりした場合、そこへ移動したい可能性が高いです。そのため、移動先のページをプリフェッチすることができます。特定のリンクに対してこれを有効にするには、以下のように記述します。

```
<Link prefetch="intent" to="somewhere/neat">Somewhere Neat</Link>
```

💿 `app/routes/jokes.tsx` のジョークリンクのリストに `prefetch="intent"` を追加してください。

<details>

<summary>app/routes/jokes.tsx</summary>

```tsx filename=app/routes/jokes.tsx lines=[73]
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const jokeListItems = await db.joke.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
    take: 5,
  });
  const user = await getUser(request);

  return json({ jokeListItems, user });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link prefetch="intent" to={id}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link reloadDocument to="/jokes.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
```

</details>

## オプティミスティックUI

ページにJavaScriptが追加されたので、*プログレッシブエンハンスメント*の恩恵を受け、アプリに*オプティミスティックUI*を追加することで、JavaScriptを使ってサイトを*さらに良く*することができます。

アプリは非常に高速ですが（特にローカルでは😅）、一部のユーザーはアプリへの接続が悪い場合があります。これは、ジョークを送信しても、何か表示されるまでしばらく待たなければならないことを意味します。どこかにローディングスピナーを追加することもできますが、リクエストの成功を楽観的に考え、ユーザーが表示するであろうものをレンダリングする方が、はるかに優れたユーザーエクスペリエンスになります。

オプティミスティックUIに関する非常に詳細な[ガイド][guide-on-optimistic-ui]があるので、ぜひ読んでみてください。

💿 `app/routes/jokes.new.tsx` ルートにオプティミスティックUIを追加してください。

`app/routes/jokes.$jokeId.tsx` と `app/routes/jokes.new.tsx` の両方でUIを再利用できるように、`app/components/` に `joke.tsx` という新しいファイルを作成することをお勧めします。

<details>

<summary>app/components/joke.tsx</summary>

```tsx filename=app/components/joke.tsx lines=[5,9,16-18,22]
import type { Joke } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

export function JokeDisplay({
  canDelete = true,
  isOwner,
  joke,
}: {
  canDelete?: boolean;
  isOwner: boolean;
  joke: Pick<Joke, "content" | "name">;
}) {
  return (
    <div>
      <p>あなたの面白いジョークはこちらです:</p>
      <p>{joke.content}</p>
      <Link to=".">"{joke.name}" パーマリンク</Link>
      {isOwner ? (
        <Form method="post">
          <button
            className="button"
            disabled={!canDelete}
            name="intent"
            type="submit"
            value="delete"
          >
            削除
          </button>
        </Form>
      ) : null}
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx lines=[14,91]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from "@remix-run/react";

import { JokeDisplay } from "~/components/joke";
import { db } from "~/utils/db.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const meta: MetaFunction<typeof loader> = ({
  data,
}) => {
  const { description, title } = data
    ? {
        description: `"${data.joke.name}" のジョークなどをお楽しみください`,
        title: `"${data.joke.name}" のジョーク`,
      }
    : { description: "ジョークが見つかりませんでした", title: "ジョークなし" };

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title },
  ];
};

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("なんてジョークだ！見つかりませんでした。", {
      status: 404,
    });
  }
  return json({
    isOwner: userId === joke.jokesterId,
    joke,
  });
};

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(
      `インテント ${form.get("intent")} はサポートされていません`,
      { status: 400 }
    );
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("存在しないものは削除できません", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response(
      "プッシュ、いい試みだ。それはあなたのジョークではありません",
      { status: 403 }
    );
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <JokeDisplay isOwner={data.isOwner} joke={data.joke} />
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          あなたがしようとしていることは許可されていません。
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          申し訳ありませんが、"{jokeId}" はあなたのジョークではありません。
        </div>
      );
    }
    if (error.status === 404) {
      return (
        <div className="error-container">
          え？ "{jokeId}" って何？
        </div>
      );
    }
  }

  return (
    <div className="error-container">
      ID "${jokeId}" のジョークの読み込み中にエラーが発生しました。
      申し訳ありません。
    </div>
  );
}
```

</details>

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx lines=[11,15,84,86-103]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  useActionData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";

import { JokeDisplay } from "~/components/joke";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import {
  getUserId,
  requireUserId,
} from "~/utils/session.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("認証されていません", { status: 401 });
  }
  return json({});
};

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "そのジョークは短すぎます";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "そのジョークの名前は短すぎます";
  }
}

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");
  if (
    typeof content !== "string" ||
    typeof name !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "フォームが正しく送信されませんでした。",
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };
  const fields = { content, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  if (navigation.formData) {
    const content = navigation.formData.get("content");
    const name = navigation.formData.get("name");
    if (
      typeof content === "string" &&
      typeof name === "string" &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return (
        <JokeDisplay
          canDelete={false}
          isOwner={true}
          joke={{ name, content }}
        />
      );
    }
  }

  return (
    <div>
      <p>あなた自身の面白いジョークを追加してください</p>
      <Form method="post">
        <div>
          <label>
            名前:{" "}
            <input
              defaultValue={actionData?.fields?.name}
              name="name"
              type="text"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.name
              )}
              aria-errormessage={
                actionData?.fieldErrors?.name
                  ? "name-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            内容:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(
                actionData?.fieldErrors?.content
              )}
              aria-errormessage={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            追加
          </button>
        </div>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>ジョークを作成するにはログインする必要があります。</p>
        <Link to="/login">ログイン</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      予期せぬエラーが発生しました。申し訳ありません。
    </div>
  );
}
```

</details>

私の例で気に入っていることの1つは、サーバーが使用する*まったく同じ*検証関数を使用できることです。したがって、送信されたものがサーバー側の検証に失敗する場合、失敗することがわかっているので、オプティミスティックUIのレンダリングすら行いません。

とはいえ、この宣言的なオプティミスティックUIのアプローチは、エラーリカバリについて心配する必要がないため、素晴らしいです。リクエストが失敗した場合、コンポーネントは再レンダリングされ、送信ではなくなり、すべてが以前と同じように機能します。素晴らしい！

そのエクスペリエンスがどのようなものかを示すデモを次に示します。

<video src="/jokes-tutorial/img/optimistic-ui.mp4" controls muted loop autoplay></video>

[guide-on-optimistic-ui]: https://remix.run/docs/en/main/guides/optimistic-ui

## デプロイ

ここで作成したユーザーエクスペリエンスには非常に満足しています。さあ、これをデプロイしましょう！Remixでは、デプロイに多くのオプションがあります。このチュートリアルの開始時に `npx create-remix@latest` を実行したとき、いくつかのオプションが提示されました。ここで作成したチュートリアルはNode.js (`prisma`)に依存しているため、お気に入りのホスティングプロバイダーの1つである[Fly.io][fly-io]にデプロイします。

💿 続行する前に、[flyをインストール][install-fly]し、[アカウントにサインアップ][sign-up-for-an-account]する必要があります。

<docs-info>Fly.ioはアカウント作成時にクレジットカード番号を要求します（[彼らのブログ記事][their-blog-article]で理由を確認してください）。ただし、シンプルなサイドプロジェクトとしてホストされるこのアプリのニーズをカバーする無料プランがあります。</docs-info>

💿 それが完了したら、プロジェクトディレクトリ内から次のコマンドを実行します。

```shellscript nonumber
fly launch
```

flyの担当者は、素晴らしいセットアップエクスペリエンスをまとめてくれました。彼らはあなたのRemixプロジェクトを検出し、開始するためにいくつかの質問をします。以下は私の出力/選択です。

```
Creating app in /Users/kentcdodds/Desktop/remix-jokes
Scanning source code
Detected a Remix app
? Choose an app name (leave blank to generate one): remix-jokes
automatically selected personal organization: Kent C. Dodds
Some regions require a paid plan (fra, maa).
See https://fly.io/plans to set up a plan.

? Choose a region for deployment: Dallas, Texas (US) (dfw)
Created app 'remix-jokes' in organization 'personal'
Admin URL: https://fly.io/apps/remix-jokes
Hostname: remix-jokes.fly.dev
Created a 1GB volume vol_18l524yj27947zmp in the dfw region
Wrote config file fly.toml

This launch configuration uses SQLite on a single, dedicated volume. It will not scale beyond a single VM. Look into 'fly postgres' for a more robust production database.

? Would you like to deploy now? No
Your app is ready! Deploy with `flyctl deploy`
```

私はすでに `remix-jokes` を使用しているので、別のアプリ名を選択する必要があります（ごめんなさい🙃）。

また、リージョンを選択することもできました。お近くのリージョンを選択することをお勧めします。将来、Flyで実際のアプリをデプロイする場合は、Flyを複数のリージョンにスケールアップすることを決定するかもしれません。

Flyは、このプロジェクトがPrismaでSQLiteを使用していることも検出し、永続ボリュームを作成してくれました。

環境変数を設定する必要があるため、今はデプロイしたくありません。「いいえ」を選択してください。

Flyはいくつかのファイルを生成しました。

* `fly.toml` - Fly固有の設定
* `Dockerfile` - アプリ用のRemix固有のDockerfile
* `.dockerignore` - イメージをビルドするときにインストールを実行するため、`node_modules`を無視するだけです。

💿 次のコマンドを実行して、`SESSION_SECRET` 環境変数を設定します。

```shellscript nonumber
fly secrets set SESSION_SECRET=your-secret-here
```

`your-secret-here` は何でも構いません。これはセッションクッキーに署名するために使用される文字列です。必要に応じてパスワードジェネレーターを使用してください。

もう1つ必要なことは、Prismaが初めてデータベースをセットアップできるように準備することです。スキーマに満足したので、最初の移行を作成できます。

💿 次のコマンドを実行します。

```shellscript nonumber
npx prisma migrate dev
```

これにより、`migrations` ディレクトリに移行ファイルが作成されます。シードファイルを実行しようとするとエラーが発生する場合があります。これは無視しても問題ありません。移行の名前を尋ねられます。

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

SQLite database dev.db created at file:./dev.db

✔ Enter a name for the new migration: … init
```

💿 私は「init」と名付けました。すると、残りの出力が表示されます。

```
Applying migration `20211121111251_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20211121111251_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (4.12.0 | library) to ./node_modules/@prisma/client in 52ms


Running seed command `ts-node --require tsconfig-paths/register prisma/seed.ts` ...

🌱  The seed command has been executed.
```

💿 シードの実行時にエラーが発生した場合は、手動で実行できます。

```shellscript nonumber
npx prisma db seed
```

これで完了です。デプロイする準備ができました。

💿 次のコマンドを実行します。

```shellscript nonumber
fly deploy
```

これにより、Dockerイメージがビルドされ、選択したリージョンのFlyにデプロイされます。少し時間がかかります。待っている間、しばらく話していない人を思い出し、感謝の気持ちを伝えるメッセージを送ってみましょう。

素晴らしい！完了しました。そして、あなたは誰かの1日を素晴らしいものにしました！成功です！

アプリは `https://<your-app-name>.fly.dev` で公開されています！このURLは、オンラインのFlyアカウントでも確認できます。[fly.io/apps][fly-io-apps]。

変更を加えるたびに、`fly deploy` を再度実行して再デプロイするだけです。

## 結論

ふう！これで終わりです。もしあなたがこのすべてをやり遂げたなら、本当に感銘を受けます（[成功をツイート][tweet-your-success]）！Remixにはたくさんのことがあり、私たちはあなたを始めたばかりです。Remixの旅の残りの部分での幸運を祈ります！

[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite

[remix-vite]: ../guides/vite

[remix-jokes]: https://remix-jokes.lol

[mdn]: https://developer.mozilla.org/en-US

[prisma]: https://www.prisma.io

[code-sandbox]: https://codesandbox.com

[node-js]: https://nodejs.org

[npm]: https://www.npmjs.com

[vs-code]: https://code.visualstudio.com

[fly-io]: https://fly.io

[java-script-to-know-for-react]: https://kentcdodds.com/blog/javascript-to-know-for-react

[the-beginner-s-guide-to-react]: https://kcd.im/beginner-react

[the-http-api]: https://developer.mozilla.org/en-US/docs/Web/HTTP

[the-basic-example]: https://codesandbox.io/s/github/remix-run/examples/tree/main/basic

[express]: https://expressjs.com

[hydrate]: https://react.dev/reference/react-dom/client/hydrateRoot

[http-localhost-3000]: http://localhost:3000

[bare-bones-hello-world-app]: /jokes-tutorial/img/bare-bones.png

[remix-config-js]: ../file-conventions/remix-config

[the-route-filename-convention]: ../file-conventions/routes

[react_router]: https://reactrouter.com

[a-greeting-from-the-index-route]: /jokes-tutorial/img/index-route-greeting.png

[jokes]: http://localhost:3000/jokes

[a-random-joke-on-the-jokes-page-i-was-wondering-why-the-frisbee-was-getting-bigger-then-it-hit-me]: /jokes-tutorial/img/random-joke.png

[jokes-new]: http://localhost:3000/jokes/new

[a-new-joke-form]: /jokes-tutorial/img/new-joke.png

[jokes-anything-you-want]: http://localhost:3000/jokes/hippos

[a-new-joke-form-2]: /jokes-tutorial/img/param-route.png

[links]: ../route/links

[links-component]: ../components/link

[the-homepage-with-a-purple-gradient-background-and-white-text-with-the-words-hello-index-route]: /jokes-tutorial/img/homepage-styles.png

[the-jokes-page-with-no-background-gradient]: /jokes-tutorial/img/jokes-no-styles.png

[check-out-the-mdn-page-for-link]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link

[styled-components]: https://www.styled-components.com

[tailwind]: https://tailwindcss.com

[firebase]: https://firebase.google.com

[supabase]: https://supabase.com

[airtable]: https://www.airtable.com

[hasura]: https://hasura.io

[google-spreadsheets]: https://www.google.com/sheets/about

[cloudflare-workers-kv]: https://www.cloudflare.com/products/workers-kv

[fauna]: https://fauna.com/features

[postgre-sql]: https://www.postgresql.org

[a-vs-code-extension]: https://marketplace.visualstudio.com/items?itemName=Prisma.prisma

[sq-lite]: https://sqlite.org/index.html

[their-docs]: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

[loader]: ../route/loader

[use-loader-data]: ../hooks/use-loader-data

[list-of-links-to-jokes]: /jokes-tutorial/img/jokes-loaded.png

[huge-graphql-client]: https://bundlephobia.com/package/graphql@16.0.1

[assertion-functions]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions

[zod]: https://npm.im/zod

[jokes-page-showing-a-unique-joke]: /jokes-tutorial/img/joke-page.png

[jokes-page-showing-a-random-joke]: /jokes-tutorial/img/random-joke-loaded.png

[action]: ../route/action

[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response

[create-new-joke-form-filled-out]: /jokes-tutorial/img/creating-new-joke.png

[newly-created-joke-displayed]: /jokes-tutorial/img/new-joke-created.png

[use-action-data]: ../hooks/use-action-data

[new-joke-form-with-validation-errors]: /jokes-tutorial/img/new-joke-form-with-errors.png

[400-bad-request]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400

[http-cookies]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

[bcryptjs]: https://npm.im/bcryptjs

[excalidraw-authentication-diagram]: /jokes-tutorial/img/auth-flow.png

[a-login-form-with-a-login-register-radio-button-and-username-password-fields-and-a-submit-button]: /jokes-tutorial/img/login-route.png

[login-form-with-errors]: /jokes-tutorial/img/login-form-with-errors.png

[here-are-the-docs]: ../utils/sessions

[create-cookie-session-storage]: ../utils/sessions#createcookiesessionstorage

[network-tab]: https://developer.chrome.com/docs/devtools/network/reference

[login]: http://localhost:3000/login

[dev-tools-network-tab-showing-a-set-cookie-header-on-the-post-response]: /jokes-tutorial/img/network-tab-set-cookie.png

[application-tab]: https://developer.chrome.com/docs/devtools/storage/cookies

[dev-tools-application-tab-showing]: /jokes-tutorial/img/application-tab-cookies.png

[request-headers-showing-the-cookie]: /jokes-tutorial/img/cookie-header-on-request.png

[destroy-session]: ../utils/sessions#using-sessions

[csrf]: https://developer.mozilla.org/en-US/docs/Glossary/CSRF

[jokes-page-nice-and-designed]: /jokes-tutorial/img/random-joke-designed.png

[new-joke-form-designed]: /jokes-tutorial/img/new-joke-designed.png

[error-boundary-feature]: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

[error-boundary-component]: ../route/error-boundary

[app-error]: /jokes-tutorial/img/app-level-error.png

[joke-page-error]: /jokes-tutorial/img/joke-id-error.png

[joke-index-page-error]: /jokes-tutorial/img/jokes-index-error.png

[new-joke-page-error]: /jokes-tutorial/img/new-joke-error.png

[server-errors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses

[client-errors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses

[is-route-error-response]: ../utils/is-route-error-response

[app-400-bad-request]: /jokes-tutorial/img/app-400.png

[a-404-on-the-joke-page]: /jokes-tutorial/img/joke-404.png

[a-404-on-the-random-joke-page]: /jokes-tutorial/img/jokes-404.png

[a-401-on-the-new-joke-page]: /jokes-tutorial/img/new-joke-401.png

[meta]: ../route/meta

[meta-component]: ../components/meta

[resource-routes]: ../guides/resource-routes

[escaping-special-characters-here]: ../file-conventions/routes-files#escaping-special-characters

[xml-document-for-rss-feed]: /jokes-tutorial/img/jokes-rss-feed.png

[network-tab-indicating-no-java-script-is-loaded]: /jokes-tutorial/img/no-javascript.png

[scripts-component]: ../components/scripts

[network-tab-showing-java-script-loaded]: /jokes-tutorial/img/yes-javascript.png

[browser-console-showing-the-log-of-a-server-side-error]: /jokes-tutorial/img/server-side-error-in-browser.png

[form-component]: ../components/form

[guide-on-optimistic-ui]: ../discussion/pending-ui

[install-fly]: https://fly.io/docs/hands-on/installing

[sign-up-for-an-account]: https://fly.io/docs/hands-on/sign-up

[their-blog-article]: https://fly.io/blog/free-postgres/#a-note-about-credit-cards

[fly-io-apps]: https://fly.io/apps

[tweet-your-success]: https://twitter.com/intent/tweet?text=I%20went%20through%20the%20whole%20remix.run%20jokes%20tutorial!%20%F0%9F%92%BF%20And%20now%20I%20love%20@remix_run!&url=https://remix.run/tutorials/jokes

[global-singleton-workaround]: ../guides/manual-mode#keeping-in-memory-server-state-across-rebuilds

