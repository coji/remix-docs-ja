---
title: デプロイメント
toc: false
---

# デプロイメント

Remix は、最初からさまざまなサーバーにデプロイするのに役立つ、いくつかの[スターターテンプレート][starter-templates]を維持しています。アプリケーションを初期化して数分以内にライブにすることができます。

`--template` フラグを使用して `npx create-remix@latest` を実行すると、これらのテンプレートのいずれかの URL を指定できます。例：

```sh
npx create-remix@latest --template remix-run/remix/templates/express
```

各ターゲットには、一意のファイル構造、構成ファイル、実行する必要がある CLI コマンド、設定する必要があるサーバー環境変数などがあります。そのため、アプリをデプロイするには、README.md を読むことが重要です。数分以内にアプリをライブにするために必要な手順がすべて記載されています。

<docs-info>アプリを初期化したら、README.md を必ずお読みください。</docs-info>

さらに、Remix はインフラストラクチャを抽象化しないため、テンプレートはデプロイ先の場所を隠しません（Remix アプリ以外にも関数が必要になる場合があります）。必要に応じて、構成を調整できます。Remix はサーバーで実行されますが、サーバーそのものではありません。

簡単に言うと：アプリをデプロイしたい場合は、マニュアルをお読みください😋

[starter-templates]: https://github.com/remix-run/remix/tree/main/templates
