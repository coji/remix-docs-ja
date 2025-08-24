---
title: デプロイ
toc: false
---

# デプロイ

Remix は、最初から様々なサーバーへのデプロイを支援するためのいくつかの[スターターテンプレート][starter-templates]を維持しています。アプリを初期化して、数分以内に稼働させることができるはずです。

`npx create-remix@latest` を `--template` フラグ付きで実行すると、これらのテンプレートのいずれかの URL を指定できます。例：

```sh
npx create-remix@latest --template remix-run/remix/templates/express
```

各ターゲットには、独自のファイル構造、構成ファイル、実行する必要がある CLI コマンド、設定する必要があるサーバー環境変数などがあります。このため、アプリをデプロイするには README.md を読むことが重要です。アプリを数分以内に稼働させるために必要なすべての手順が記載されています。

<docs-info>アプリを初期化した後、必ず README.md を読んでください</docs-info>

さらに、Remix はインフラストラクチャを抽象化しないため、テンプレートはデプロイ先に関する情報を隠蔽しません（Remix アプリ以外にも必要な機能があるかもしれません！）。必要に応じて構成を調整してください。Remix はサーバー上で実行されますが、サーバーそのものではありません。

要するに、アプリをデプロイしたい場合は、マニュアルを読んでください 😋

[starter-templates]: https://github.com/remix-run/remix/tree/main/templates
