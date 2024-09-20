---
title: アプリチュートリアル（長編）
order: 4
hidden: true
---

# ジョークアプリチュートリアル

<docs-warning>このチュートリアルは、現在、[Remix Vite][remix-vite] ではなく [Classic Remix Compiler][classic-remix-compiler] を使用していることを前提としています。</docs-warning>

Remix を学びたいですか？あなたは正しい場所にいます。[Remix Jokes][remix-jokes] を一緒に作ってみましょう！

<docs-info><a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=hsIWJpuxNj0">Kent と一緒にこのチュートリアルをライブストリームで進めてみましょう</a></docs-info>

<a href="https://remix-jokes.lol"><img src="https://remix-jokes.lol/social.png" style="aspect-ratio: 300 / 157; width: 100%"/></a>

このチュートリアルは、Remix で使用可能な主要な API の概要を理解するための包括的な方法です。最終的には、お母さんやパートナー、犬に見せられるフルアプリケーションが完成し、きっとあなたと同じように Remix に興奮してくれるでしょう（ただし、保証はできません）。

このチュートリアルでは、Remix に焦点を当てます。つまり、Remix の中核となるアイデアから気をそらすような要素はいくつか省略します。たとえば、CSS スタイルシートをページに適用する方法を紹介しますが、自分でスタイルを書くことはしません。そのため、コピー＆ペーストできるものを提供するだけです。ただし、自分ですべて書き出したい場合は、もちろん可能です（ただ、時間がかかります）。そのため、チュートリアルを台無しにしたくない場合は、クリックして展開する `<details>` 要素にコードを隠します。

<details>

<summary>クリックしてください</summary>

チュートリアルには、この `<details>` 要素の後ろにコードを隠している箇所がいくつかあります。これは、コピー＆ペーストの量を自分で選択できるようにするためです。ただし、Remix とは関係のない概念（クラス名の推測など）に苦労することはお勧めしません。チュートリアルの主なポイントを理解したら、これらのセクションを参照して作業内容を確認してください。あるいは、素早く進めたい場合は、そのままコードをコピー＆ペーストしても構いません。判断はしません！

</details>

チュートリアルでは、さまざまなドキュメント（Remix ドキュメントと [MDN][mdn] のウェブドキュメント）へのリンクを貼ります（MDN をまだ使ったことがない場合は、Remix を使う際に頻繁に使うことになるでしょう。ウェブについても詳しくなれます）。行き詰まったら、スキップしたドキュメントのリンクを確認してください。このチュートリアルの目的は、Remix とウェブ API のドキュメントに慣れることでもあるため、ドキュメントに説明がある場合は、そのリンクが貼られます。

このチュートリアルでは TypeScript を使用します。TypeScript の部分をスキップまたは削除して、チュートリアルを進めても構いません。TypeScript を使用すると、特に SQLite データベースからデータモデルにアクセスするために [Prisma][prisma] を使用する場合、Remix はさらに使いやすくなります。

<docs-info>💿 こんにちは、私は Remix ディスクのレイチェルです。何か実際に _実行_ する必要があるときは、私が現れます。</docs-info>

<docs-warning>自由に探索を進めてください。ただし、チュートリアルから大きく外れてしまうと（たとえば、デプロイのステップに進む前に試してしまうなど）、重要な要素を見逃しているため、期待通りに動作しない可能性があります。</docs-warning>

<docs-error>チュートリアルの後半まで、ブラウザに JavaScript を追加しません。これは、JavaScript の読み込みに時間がかかったり、読み込みに失敗した場合でもアプリケーションがどのように動作するかを示すためです。そのため、実際に JavaScript をページに追加するまでは、`useState` などの機能は使用できません。</docs-error>

## 概要

このチュートリアルでは、以下のトピックについて説明します。

- 新しい Remix プロジェクトの作成
- 慣習的なファイル
- ルート（ネストされたルートも✨）
- スタイル設定
- データベースの相互作用（`sqlite` と `prisma` を使用）
- ミューテーション
- バリデーション
- 認証
- エラー処理：予期しないエラー（開発者がミスをした場合）と予期されるエラー（エンドユーザーがミスをした場合）
- メタタグを使用した SEO
- JavaScript...
- リソースルート
- デプロイ

ナビゲーションバー（モバイルの場合はページの上部、デスクトップの場合は右側に表示）に、チュートリアルの各セクションへのリンクがあります。

## 前提条件

このチュートリアルは、[CodeSandbox][code-sandbox]（ブラウザベースの素晴らしいエディタ）またはローカルのコンピュータで実行できます。CodeSandbox で実行する場合は、高速なインターネット接続と最新のブラウザが必要です。ローカルで実行する場合は、以下のものをインストールする必要があります。

- [Node.js][node-js] バージョン（>=18.0.0）
- [npm][npm] 7 以上
- コードエディタ（[VSCode][vs-code] がおすすめです）

チュートリアルの最後にデプロイのステップを参考にしたい場合は、[Fly.io][fly-io] のアカウントも必要です。

また、システムのコマンドライン/ターミナルインターフェースでコマンドを実行します。そのため、コマンドライン/ターミナルインターフェースの基本的な操作に慣れている必要があります。

React と TypeScript/JavaScript の経験があることが前提です。知識を確認したい場合は、以下のリソースを参照してください。

- [React に必要な JavaScript の知識][java-script-to-know-for-react]
- [React ビギナーズガイド][the-beginner-s-guide-to-react]

また、[HTTP API][the-http-api] についてよく理解していることも役立ちますが、必須ではありません。

では、始めましょう！

## 新しい Remix プロジェクトの作成

<docs-info>

CodeSandbox を使用する場合、[基本的な例][the-basic-example] を使用して開始できます。

</docs-info>

💿 ターミナルを開き、以下のコマンドを実行します。

```shellscript nonumber
npx create-remix@latest
```

<docs-info>

これにより、`create-remix@latest` をインストールするかどうか尋ねられる場合があります。`y` と入力してください。これは、セットアップスクリプトを初めて実行する場合にのみインストールされます。

</docs-info>

セットアップスクリプトが実行されると、いくつかの質問が表示されます。アプリの名前を "remix-jokes" とし、Git リポジトリを初期化して、インストールを自動的に実行するように選択します。

```
Where should we create your new project?
remix-jokes

Initialize a new git repository?
Yes

Install dependencies with npm?
Yes
```

Remix は、増え続ける JavaScript 環境のリストにデプロイできます。 "Remix App Server" は、[Express][express] に基づくフル機能の [Node.js][node-js] サーバーです。これは最も単純なオプションであり、ほとんどのニーズを満たすため、このチュートリアルではこれを使用します。将来的に他のオプションを試してみても構いません。

`npm install` が完了したら、`remix-jokes` ディレクトリに移動します。

💿 以下のコマンドを実行します。

```shellscript nonumber
cd remix-jokes
```

これで `remix-jokes` ディレクトリに移動しました。以降は、すべてのコマンドをこのディレクトリから実行します。

💿 それでは、お気に入りのエディタでプロジェクトを開き、プロジェクト構造を少し見てみましょう。

## プロジェクト構造の確認

以下のファイルツリーをご覧ください。あなたのプロジェクトも、だいたいこのようになっているはずです。

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

- `app/` - Remix アプリのすべてのコードがここに格納されます。
- `app/entry.client.tsx` - アプリがブラウザに読み込まれたときに最初に実行される JavaScript です。このファイルを使用して、React コンポーネントを [ハイドレート][hydrate] します。
- `app/entry.server.tsx` - リクエストがサーバーに到達したときに最初に実行される JavaScript です。Remix は必要なデータの読み込みを処理し、あなたはレスポンスを送信する責任があります。このファイルを使用して、React アプリを文字列/ストリームにレンダリングし、それをクライアントへのレスポンスとして送信します。
- `app/root.tsx` - アプリケーションのルートコンポーネントを配置する場所です。ここで `<html>` 要素をレンダリングします。
- `app/routes/` - すべての "ルートモジュール" がここに格納されます。Remix はこのディレクトリ内のファイルを使用して、ファイル名に基づいてアプリの URL ルートを作成します。
- `public/` - 静的なアセット（画像/フォントなど）を格納する場所です。
- `remix.config.js` - Remix には、このファイルで設定できるいくつかの構成オプションがあります。

💿 では、ビルドを実行してみましょう。

```shellscript nonumber
npm run build
```

以下のような出力結果が表示されます。

```
Building Remix app in production mode...
Built in 132ms
```

これで、`.cache/` ディレクトリ（Remix が内部的に使用するもの）、`build/` ディレクトリ、`public/build` ディレクトリが作成されているはずです。`build/` ディレクトリにはサーバー側のコードが格納され、`public/build/` ディレクトリにはクライアント側のコードが格納されています。これらの3つのディレクトリは `.gitignore` ファイルに記載されているため、生成されたファイルをソース管理にコミットすることはありません。

💿 では、ビルドされたアプリを実行してみましょう。

```shellscript nonumber
npm start
```

これにより、サーバーが起動し、以下のような出力結果が表示されます。

```
Remix App Server started at http://localhost:3000
```

この URL を開くと、最小限のページが表示され、いくつかのドキュメントへのリンクが示されます。

💿 では、サーバーを停止し、以下のディレクトリを削除します。

- `app/routes`

これは、このチュートリアルで必要最低限のファイル構成にし、段階的に要素を追加するためです。

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
        <title>Remix: 面白いほど素晴らしい！</title>
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

`<LiveReload />` コンポーネントは、開発中に変更を加えるたびにブラウザを自動的にリフレッシュするために役立ちます。ビルドサーバーは非常に高速なので、リロードは気づかないうちに実行されることが多いでしょう⚡

</docs-info>

`app/` ディレクトリは以下のようになるはずです。

```
app
├── entry.client.tsx
├── entry.server.tsx
└── root.tsx
```

💿 設定が完了したら、以下のコマンドで開発サーバーを起動します。

```shellscript nonumber
npm run dev
```

[http://localhost:3000][http-localhost-3000] を開くと、アプリが世界に挨拶します。

![最小限の Hello world アプリ][bare-bones-hello-world-app]

素晴らしいですね！これで、要素を追加していくことができます。

## ルート

最初に行うことは、ルーティング構造を設定することです。このアプリに使用するルートを以下に示します。

```
/
/jokes
/jokes/:jokeId
/jokes/new
/login
```

[`remix.config.js`][remix-config-js] を介してプログラムでルートを作成することもできますが、より一般的な方法はファイルシステムを使用することです。これは "ファイルベースのルーティング" と呼ばれます。

`app/routes` ディレクトリに配置する各ファイルは、ルートモジュールと呼ばれ、[ルートファイル名の規則][the-route-filename-convention] に従うことで、目的のルーティング URL 構造を作成できます。Remix は、内部で [React Router][react_router] を使用してルーティングを処理します。

💿 まず、インデックスルート (`/`) から始めましょう。そのためには、`app/routes/_index.tsx` にファイルを作成し、そのルートモジュールからコンポーネントを `export default` します。ここでは、とりあえず "Hello Index Route" と表示させても構いません。

<details>

<summary>app/routes/_index.tsx</summary>

```tsx filename=app/routes/_index.tsx
export default function IndexRoute() {
  return <div>Hello Index Route</div>;
}
```

</details>

React Router は "ネストされたルーティング" をサポートしているため、ルートには親子関係があります。`app/routes/_index.tsx` は、`app/root.tsx` ルートの子です。ネストされたルーティングでは、親は子レイアウトの責任を負います。

💿 `app/root.tsx` を更新して、子要素を配置します。そのためには、`@remix-run/react` から `<Outlet />` コンポーネントを使用します。

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
        <title>Remix: 面白いほど素晴らしい！</title>
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

<docs-info>開発サーバーは `npm run dev` で実行されていることを忘れないでください。</docs-info>

これにより、ファイルシステムの変更が監視され、サイトが再ビルドされます。`<LiveReload />` コンポーネントのおかげで、ブラウザがリフレッシュされます。

💿 サイトを再度開くと、インデックスルートからの挨拶が表示されるはずです。

![インデックスルートからの挨拶][a-greeting-from-the-index-route]

素晴らしいですね！次に、`/jokes` ルートを処理します。

💿 `app/routes/jokes.tsx` に新しいルートを作成します（これは親ルートになるため、再び `<Outlet />` を使用します）。

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

[`/jokes`][jokes] にアクセスすると、このコンポーネントが表示されるはずです。この `<Outlet />` 内に、"インデックスルート" でランダムなジョークをいくつか表示します。

💿 `app/routes/jokes._index.tsx` にルートを作成します。

<details>

<summary>app/routes/jokes._index.tsx</summary>

```tsx filename=app/routes/jokes._index.tsx
export default function JokesIndexRoute() {
  return (
    <div>
      <p>ランダムなジョークはこちらです:</p>
      <p>
        フリスビーがどんどん大きくなる理由がわからなかったのですが、
        急にわかりました。
      </p>
    </div>
  );
}
```

</details>

[`/jokes`][jokes] をリフレッシュすると、`app/routes/jokes.tsx` と `app/routes/jokes._index.tsx` の内容が表示されます。私の場合、以下のように表示されます。

![ジョークページのランダムなジョーク：「フリスビーがどんどん大きくなる理由がわからなかったのですが、急にわかりました。」][a-random-joke-on-the-jokes-page-i-was-wondering-why-the-frisbee-was-getting-bigger-then-it-hit-me]

これらのルートモジュールはそれぞれ、URL の一部のみを処理していることに注目してください。実に素晴らしいですね！ネストされたルーティングは非常に便利で、これはほんの序章に過ぎません。さらに進めていきましょう。

💿 次に、`/jokes/new` ルートを処理します。この処理方法はおそらくお分かりでしょう😄。このページではユーザーがジョークを作成できるようにしたいので、`name` フィールドと `content` フィールドを持つ `form` をレンダリングします。

<details>

<summary>app/routes/jokes.new.tsx</summary>

```tsx filename=app/routes/jokes.new.tsx
export default function NewJokeRoute() {
  return (
    <div>
      <p>あなた自身の面白いジョークを追加してください</p>
      <form method="post">
        <div>
          <label>
            名前: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            内容: <textarea name="content" />
          </label>
        </div>
        <div>
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

これで、[`/jokes/new`][jokes-new] にアクセスすると、作成したフォームが表示されます。

![新しいジョークのフォーム][a-new-joke-form]

### パラメータ化されたルート

すぐにデータベースを追加して、ID でジョークを保存します。そのため、もう1つ、少しユニークなルートを追加しましょう。パラメータ化されたルートです。

`/jokes/$jokeId`

このパラメータ `$jokeId` は任意の値にすることができ、データベースから URL のその部分を探し出して、正しいジョークを表示できます。パラメータ化されたルートを作成するには、ファイル名に `$` 文字を使用します。([こちらで規則の詳細を確認してください][the-route-filename-convention])。

💿 `app/routes/jokes.$jokeId.tsx` に新しいルートを作成します。今は、表示される内容はあまり気にする必要はありません（まだデータベースを設定していません！）。

<details>

<summary>app/routes/jokes.$jokeId.tsx</summary>

```tsx filename=app/routes/jokes.$jokeId.tsx
export default function JokeRoute() {
  return (
    <div>
      <p>あなた自身の面白いジョークはこちらです:</p>
      <p>
        カバが木に隠れているのを見たことがないのはなぜでしょう？
        それは、カバは木に隠れるのがとても上手だからです。
      </p>
    </div>
  );
}
```

</details>

これで、[`/jokes/anything-you-want`][jokes-anything-you-want] にアクセスすると、作成した内容が表示されます（親ルートも表示されます）。

![新しいジョークのフォーム][a-new-joke-form-2]

素晴らしいですね！これで、主要なルートの設定が完了しました！

## スタイル設定

ウェブのスタイル設定は、常に `<link rel="stylesheet" href="/path-to-file.css" />` を使用して CSS をページに適用してきました。Remix アプリケーションでも同様ですが、Remix は `link` タグを到处乱雑に配置するよりもはるかに簡単です。Remix はネストされたルーティングの機能を CSS に適用し、`link` タグをルートに関連付けることができます。ルートがアクティブになると、`link` タグがページに表示され、CSS が適用されます。ルートがアクティブでなくなると（ユーザーが別のページに移動すると）、`link` タグが削除され、CSS が適用されなくなります。

そのためには、ルートモジュールに [`links`][links] 関数をエクスポートします。では、ホームページのスタイルを設定しましょう。CSS ファイルは、`app` ディレクトリ内の任意の場所に配置できます。ここでは、`app/styles/` に配置します。

まず、ホームページ（インデックスルート `/`）のスタイルを設定します。

💿 `app/styles/index.css` を作成し、以下の CSS を貼り付けます。

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

💿 `app/routes/_index.tsx` を更新して、この CSS ファイルをインポートします。次に、[ドキュメントに記載されているように][links]、`links` エクスポートを追加して、このリンクをページに追加します。

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

これで、[`/`][http-localhost-3000] にアクセスしても、少しがっかりするかもしれません。美しいスタイルが適用されていないからです！`app/root.tsx` でアプリの _すべて_（`<html>` から `</html>` まで）をレンダリングしていることを思い出してください。そこに表示されないものは、まったく表示されません！

そのため、すべての active ルートから `link` エクスポートを取得し、それらすべてに対して `<link />` タグを追加する必要があります。幸いなことに、Remix は、[`<Links />`][links-component] コンポーネントという便利なコンポーネントを提供することで、この作業を簡単にしてくれます。

💿 `app/root.tsx` の `<head>` 内に、Remix の `<Links />` コンポーネントを追加します。

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
        <title>Remix: 面白いほど素晴らしい！</title>
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

これで、[`/`][http-localhost-3000] を再度確認すると、スタイリッシュに表示されるはずです。

![紫色のグラデーションの背景と白いテキストで「Hello Index Route」と表示されたホームページ][the-homepage-with-a-purple-gradient-background-and-white-text-with-the-words-hello-index-route]

やったー！しかし、重要なことと、興奮すべき点について言及しておきます。作成した CSS が `body` 要素をスタイル設定していることを知っていますね。[`/jokes`][jokes] ルートではどうなると思いますか？確認してみましょう。

![背景グラデーションのないジョークページ][the-jokes-page-with-no-background-gradient]

🤯 なぜでしょう？CSS ルールが適用されていません。`body` が削除されたのでしょうか？いいえ。開発ツールの要素タブを開くと、リンクタグがまったく存在しないことがわかります！

<docs-info>

つまり、CSS を書くときに、予期しない CSS の競合を心配する必要はありません。好きに CSS を記述できます。リンクされている各ルートを確認すれば、他のページに影響を与えていないことがわかります！🔥

これはまた、CSS ファイルを長期的にキャッシュでき、CSS が自然にコードスプリットされることを意味します。パフォーマンスが向上します⚡

</docs-info>

スタイル設定について説明するのは、大体これで終わりです。残りは、CSS を記述することだけです。自分で記述しても構いませんし、以下のスタイルをコピー＆ペーストしても構いません。

<details>

<summary>💿 以下のコードを `app/styles/global.css` にコピーします。</summary>

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