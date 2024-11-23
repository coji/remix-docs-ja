---
title: テンプレート
description: Remix で開発を始めるための最速の方法
---

# テンプレートとスタック

[`create-remix`][create_remix] を使用して新しいプロジェクトを生成する場合、すぐに開発を開始するためのテンプレートまたはスタックを選択できます。テンプレートは、開発を始めるための最小限の出発点です。スタックは、より完成度が高く、本番環境に近いアーキテクチャ（テスト、データベース、CI、デプロイ構成など）を含むテンプレートです。

## テンプレート

`--template` オプションを指定せずに `create-remix` を実行すると、[Remix App Server][remix_app_server] を使用する基本的なテンプレートが生成されます。

```shellscript nonumber
npx create-remix@latest
```

TypeScript を使用しない場合は、代わりにシンプルな Javascript テンプレートをインストールできます。

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/remix-javascript
```

これは、Remix を初めて試す場合に最適な出発点です。この出発点を自分で拡張したり、後でより高度なテンプレートに移行したりすることができます。

### 公式テンプレート

サーバーをより詳細に制御したい場合や、[Arc][arc]、[Cloudflare][cloudflare]、[Deno][deno] などのノード以外のランタイムにデプロイする場合は、Remix リポジトリから[公式テンプレート][official_templates] のいずれかを使用できます。

```shellscript nonumber
npx create-remix@latest --template remix-run/remix/templates/cloudflare
npx create-remix@latest --template remix-run/remix/templates/cloudflare-workers
npx create-remix@latest --template remix-run/remix/templates/express
npx create-remix@latest --template remix-run/remix/templates/remix
npx create-remix@latest --template remix-run/remix/templates/remix-javascript

## SPA モード
npx create-remix@latest --template remix-run/remix/templates/spa

## Classic Remix Compiler
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/arc
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/cloudflare-pages
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/cloudflare-workers
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/deno
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/express
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/fly
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/remix
npx create-remix@latest --template remix-run/remix/templates/classic-remix-compiler/remix-javascript
```

### サードパーティテンプレート

一部のホスティングプロバイダーは独自の Remix テンプレートを管理しています。詳細については、以下に示す公式統合ガイドを参照してください。

- [Netlify][netlify_template_docs]
- [Vercel][vercel_template_docs]

### 例

さまざまな Remix の機能、パターン、ツール、ホスティングプロバイダーなどを示す、[コミュニティ主導の例のリポジトリ][examples] も提供しています。これらの例は、動作中の例をインストールする場合と同様に使用できます。

```shellscript nonumber
npx create-remix@latest --template remix-run/examples/basic
```

## スタック

テンプレートが本番環境対応のアプリケーションに近づき、CI/CD パイプライン、データベース、ホスティングプラットフォームに関する意見を提供するようになった場合、Remix コミュニティではこれらのテンプレートを「スタック」と呼びます。

公式のスタックがいくつか提供されていますが、自分で作成することもできます（以下を参照）。

[機能発表のブログ記事を読む][feature_announcement_blog_post] と [YouTube で Remix スタックのビデオを見る][remix_stacks_videos_on_youtube]。

### 公式スタック

公式のスタックには、本番環境のアプリケーションに必要な一般的なものが用意されています。

- データベース
- 自動デプロイパイプライン
- 認証
- テスト
- リンティング/フォーマット/TypeScript

残りは、Remix を使用して構築したい素晴らしいウェブエクスペリエンスを構築するだけです。これが公式のスタックです。

- [The Blues Stack][blues_stack]: 長時間実行される Node.js サーバーと PostgreSQL データベースを使用して、エッジにデプロイ（分散）されます。何百万人ものユーザーにサービスを提供する大規模で高速な本番環境対応のアプリケーション向けです。
- [The Indie Stack][indie_stack]: 長時間実行される Node.js サーバーと永続的な SQLite データベースにデプロイされます。このスタックは、あなたが管理する動的なデータ（ブログ、マーケティング、コンテンツサイト）を持つウェブサイトに最適です。また、MVP、プロトタイプ、概念実証に最適な低複雑なブートストラップで、後で Blues スタックに簡単に更新できます。
- [The Grunge Stack][grunge_stack]: 永続性のために DynamoDB を使用して、Node.js を実行するサーバーレス関数にデプロイされます。何百万人ものユーザーにサービスを提供する AWS インフラストラクチャに本番環境対応のアプリケーションをデプロイしたい場合に適しています。

これらのスタックは、`create-remix` を実行するときに `--template` オプションを指定することで使用できます。例を以下に示します。

```shellscript nonumber
npx create-remix@latest --template remix-run/blues-stack
```

はい、これらは音楽ジャンルにちなんで名付けられています。🤘 Rock on.

### コミュニティスタック

[GitHub でコミュニティスタックのリストを閲覧する][remix_stack_topic]。

コミュニティスタックは、`create-remix` を実行するときに `--template` オプションに GitHub のユーザー名/リポジトリの組み合わせを渡すことで使用できます。例を以下に示します。

```shellscript nonumber
npx create-remix@latest --template :username/:repo
```

<docs-success>自分のスタックをコミュニティで共有したい場合は、[remix-stack][remix_stack_topic] トピックでタグ付けすることを忘れないでください。そうすれば、他の人がスタックを見つけることができます。また、独自のスタックを「ロック」ではなく「インディ」のような音楽のサブジャンルにちなんで名付けることをお勧めします。</docs-success>

## その他の情報

### プライベートテンプレート

テンプレートがプライベートの GitHub リポジトリにある場合は、`--token` オプションを使用して GitHub トークンを渡すことができます。

```shellscript nonumber
npx create-remix@latest --template your-private/repo --token yourtoken
```

[トークンには `repo` へのアクセス権のみが必要です][repo_access_token]。

### ローカルテンプレート

ディスク上のローカルディレクトリまたは tarball を `--template` オプションに指定できます。例を以下に示します。

```shellscript nonumber
npx create-remix@latest --template /my/remix-stack
npx create-remix@latest --template /my/remix-stack.tar.gz
npx create-remix@latest --template /my/remix-stack.tgz
npx create-remix@latest --template file:///Users/michael/my-remix-stack.tar.gz
```

### カスタムテンプレートのヒント

#### 依存関係のバージョン

`package.json` で依存関係を `*` に設定した場合、Remix CLI はそれをインストールされた Remix バージョンの semver カレットに変更します。

```diff
-   "remix": "*",
+   "remix": "^2.0.0",
```

これにより、テンプレートをその特定のパッケージの最新バージョンに定期的に更新する必要はありません。もちろん、パッケージのバージョンを手動で管理したい場合は、`*` を入力する必要はありません。

#### イニシャライゼーションをカスタマイズする

テンプレートのルートに `remix.init/index.js` ファイルがある場合、そのファイルはプロジェクトが生成され、依存関係がインストールされた後に実行されます。これにより、テンプレートの初期化の一部として必要なことをすべて実行できます。たとえば、Blues スタックでは、`app` プロパティはグローバルに一意である必要があります。そのため、`remix.init/index.js` ファイルを使用して、作成されたプロジェクトのディレクトリ名とランダムな文字を組み合わせた名前に変更します。

`remix.init/index.js` を使用して、開発者に追加の構成に関する質問をさらに尋ねることができます（[inquirer][inquirer] などを使用）。場合によっては、これを実行するために依存関係をインストールする必要がありますが、これらの依存関係は初期化時にのみ役に立ちます。その場合、依存関係を含む `remix.init/package.json` を作成することもできます。Remix CLI は、スクリプトを実行する前にそれらをインストールします。

初期化スクリプトが実行されると、`remix.init` フォルダーは削除されるため、完成したコードベースを混乱させる心配はありません。

<docs-warning>消費者は `remix.init` スクリプトの実行をオプトアウトできます。手動でオプトアウトするには、`remix init` を実行する必要があります。</docs-warning>

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

