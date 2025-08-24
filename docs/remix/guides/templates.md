---
title: テンプレート
description: Remix をすぐに使い始めるための最も速い方法
---

# テンプレートとスタック

<docs-warning>Remix を使い始めたばかりですか？最新バージョンの [Remix は現在 React Router v7][remix-now-react-router] です。最新のフレームワーク機能を使用したい場合は、[React Router テンプレート][react-router-templates] を使用してプロジェクトを作成する必要があります。</docs-warning>

[`create-remix`][create_remix] を使用して新しいプロジェクトを生成する際、テンプレートまたはスタックを選択することで、迅速に起動して実行できます。テンプレートは、すぐに使い始められる最小限の出発点です。「スタック」は、より完成度が高く、本番環境に近いアーキテクチャ（テスト、データベース、CI、デプロイ構成などの側面を含む可能性あり）を備えたテンプレートです。

[create_remix]: https://github.com/remix-run/remix/tree/main/packages/create-remix

## テンプレート

`--template` オプションを指定せずに `create-remix` を実行すると、[Remix App Server][remix_app_server] を使用した基本的なテンプレートが取得できます。

```shellscript nonumber
npx create-remix@latest
```

TypeScript を使用することに興味がない場合は、代わりに、よりシンプルな Javascript テンプレートをインストールできます。

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-javascript
```

これは、Remix を初めて試してみる場合に最適な出発点です。この出発点を自分で拡張したり、後でより高度なテンプレートに移行したりすることもできます。

[remix_app_server]: https://github.com/remix-run/remix/tree/main/packages/remix-app-server

### 公式テンプレート

サーバーをより細かく制御したい場合や、[Arc][arc]、[Cloudflare][cloudflare]、[Deno][deno]などの非Nodeランタイムにデプロイしたい場合は、Remixリポジトリにある[公式テンプレート][official_templates]を試してみてください。

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/cloudflare
npx create-remix@latest --template remix-run/remix/templates/cloudflare-workers
npx create-remix@latest --template remix-run/remix/templates/express
npx create-remix@latest --template remix-run/remix/templates/remix
npx create-remix@latest --template remix-run/remix/templates/remix-javascript

## SPAモード
npx create-remix@latest --template remix-run/remix/templates/spa

## クラシックRemixコンパイラ
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/arc
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/cloudflare-pages
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/cloudflare-workers
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/deno
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/express
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/fly
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/remix
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/remix-javascript
```

### サードパーティ製テンプレート

一部のホスティングプロバイダーは、独自のRemixテンプレートを管理しています。詳細については、以下にリストされている公式の統合ガイドを参照してください。

* [Netlify][netlify_template_docs]
* [Vercel][vercel_template_docs]

### 例

また、[コミュニティ主導の例のリポジトリ][examples]も提供しています。各例では、Remixのさまざまな機能、パターン、ツール、ホスティングプロバイダーなどが紹介されています。これらは、動作する例をインストールするのと同様の方法で使用できます。

```shellscript nonumber
npx create-remix@latest --template remix-run/examples/basic
```

## スタック

テンプレートが、CI/CDパイプライン、データベース、ホスティングプラットフォームに関する意見を提供するほど、本番環境に対応したアプリケーションに近い場合、Remixコミュニティはこれらのテンプレートを「スタック」と呼びます。

公式に提供されているスタックがいくつかありますが、独自のスタックを作成することもできます（詳細は下記を参照）。

[機能発表のブログ記事を読む][feature_announcement_blog_post]、そして[YouTubeでRemixスタックの動画を見る][remix_stacks_videos_on_youtube]。

### 公式スタック

公式スタックには、本番アプリケーションに必要な一般的なものがすべて揃っています。

* データベース
* 自動デプロイパイプライン
* 認証
* テスト
* Lint/フォーマット/TypeScript

Remixで素晴らしいWebエクスペリエンスを構築するために、完全にセットアップされた状態で、すぐに作業に取り掛かることができます。以下が公式スタックです。

* [The Blues Stack][blues_stack]: 長時間稼働するNode.jsサーバーとPostgreSQLデータベースを使用して、エッジ（分散型）にデプロイされます。数百万人のユーザーにサービスを提供する、大規模で高速な本番グレードのアプリケーションを対象としています。
* [The Indie Stack][indie_stack]: 永続的なSQLiteデータベースを備えた長時間稼働するNode.jsサーバーにデプロイされます。このスタックは、あなたが管理する動的なデータ（ブログ、マーケティング、コンテンツサイト）を持つWebサイトに最適です。また、MVP、プロトタイプ、および後でBluesスタックに簡単に更新できる概念実証のための、複雑さの低い完璧なブートストラップでもあります。
* [The Grunge Stack][grunge_stack]: 永続化にDynamoDBを使用し、Node.jsを実行するサーバーレス関数にデプロイされます。数百万人のユーザーにサービスを提供するAWSインフラストラクチャ上に本番グレードのアプリケーションをデプロイしたい人を対象としています。

これらのスタックを使用するには、`create-remix`を実行するときに`--template`オプションを指定します。例：

```shellscript nonumber
npx create-remix@latest --template remix-run/blues-stack
```

はい、これらは音楽ジャンルにちなんで名付けられています。🤘 ロックオン。

### コミュニティスタック

[GitHubのコミュニティスタックのリストを閲覧する][remix_stack_topic]ことができます。

コミュニティスタックは、`create-remix`を実行する際に`--template`オプションにGitHubのユーザー名/リポジトリの組み合わせを渡すことで使用できます。例：

```shellscript nonumber
npx create-remix@latest --template :username/:repo
```

<docs-success>コミュニティとスタックを共有したい場合は、他の人が見つけられるように[remix-stack][remix_stack_topic]トピックでタグ付けすることを忘れないでください。そして、はい、自分のスタックには音楽のサブジャンル（「ロック」ではなく「インディー」など！）にちなんだ名前を付けることをお勧めします。</docs-success>

## その他の情報

### プライベートテンプレート

もしあなたのテンプレートがプライベートなGitHubリポジトリにある場合、`--token`オプションを使ってGitHubトークンを渡すことができます。

```shellscript nonumber
npx create-remix@latest --template your-private/repo --token yourtoken
```

[トークンには`repo`アクセス権限が必要です][repo_access_token]。

### ローカルテンプレート

`--template` オプションには、ローカルディレクトリまたはディスク上の tarball を指定できます。例：

```shellscript nonumber
npx create-remix@latest --template /my/remix-stack
npx create-remix@latest --template /my/remix-stack.tar.gz
npx create-remix@latest --template /my/remix-stack.tgz
npx create-remix@latest --template file:///Users/michael/my-remix-stack.tar.gz
```

### カスタムテンプレートのヒント

#### 依存関係のバージョン

package.jsonで依存関係を`*`に設定した場合、Remix CLIはそれをインストールされたRemixバージョンのセマンティックバージョンのキャレットに変更します。

```diff
-   "remix": "*",
+   "remix": "^2.0.0",
```

これにより、特定のパッケージの最新バージョンにテンプレートを定期的に更新する必要がなくなります。もちろん、そのパッケージのバージョンを手動で管理したい場合は、`*`を設定する必要はありません。

#### 初期化のカスタマイズ

テンプレートのルートに `remix.init/index.js` ファイルがある場合、プロジェクトが生成され、依存関係がインストールされた後にそのファイルが実行されます。これにより、テンプレートの初期化の一部として、好きなことを実行する機会が得られます。たとえば、bluesスタックでは、`app`プロパティはグローバルに一意である必要があるため、`remix.init/index.js`ファイルを使用して、プロジェクト用に作成されたディレクトリの名前といくつかのランダムな文字に変更します。

`remix.init/index.js`を使用して、追加の設定のために開発者にさらに質問をすることもできます（[inquirer][inquirer]のようなものを使用）。これを行うために依存関係をインストールする必要がある場合がありますが、これらの依存関係は初期化中にのみ役立ちます。その場合は、依存関係を含む`remix.init/package.json`を作成することもでき、Remix CLIはスクリプトを実行する前にそれらをインストールします。

初期化スクリプトが実行されると、`remix.init`フォルダーは削除されるため、完成したコードベースを散らかす心配はありません。

<docs-warning>消費者は`remix.init`スクリプトの実行をオプトアウトできることに注意してください。手動でオプトアウトするには、`remix init`を実行する必要があります。</docs-warning>

[create_remix]: ../other-api/create-remix

[remix_app_server]: ../other-api/serve

[repo_access_token]: https://github.com/settings/tokens/new?description=Remix%20Private%20Stack%20Access&scopes=repo

[inquirer]: https://npm.im/inquirer

[feature_announcement_blog_post]: /blog/remix-stacks

[remix_stacks_videos_on_youtube]: https://www.youtube.com/playlist?list=PLXoynULbYuEC8-gJCqyXo94RufAvSA6R3

[blues_stack]: https://github.com/remix-run/blues-stack

[indie_stack]: https://github.com/remix-run/indie-stack

[grunge_stack]: https://github.com/remix-run/grunge-stack

[remix_stack_topic]: https://github.com/topics/remix-stack

[official_templates]: https://github.com/remix-run/remix/tree/main/templates

[examples]: https://github.com/remix-run/examples

[vercel_template_docs]: https://vercel.com/docs/frameworks/remix

[netlify_template_docs]: https://docs.netlify.com/integrations/frameworks/remix

[arc]: https://arc.codes/docs/en/get-started/quickstart

[deno]: https://deno.com

[cloudflare]: https://www.cloudflare.com
[remix-now-react-router]: https://remix.run/blog/incremental-path-to-react-19
[react-router-templates]: https://github.com/remix-run/react-router-templates