---
title: 貢献
---

# React Router への貢献

貢献ありがとうございます！

オープンソースにおいては、さまざまな種類の貢献が可能であり、そのすべてが価値のあるものです。貢献を準備する際に役立ついくつかのガイドラインを以下に示します。

## オープンガバナンスモデル

さらに進む前に、React Router でのバグ/イシュー/機能提案の取り扱いに関する情報について、オープンガバナンスの[ブログ投稿](https://remix.run/blog/rr-governance)と[ドキュメント](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md)をお読みください。

## セットアップ

コードベースに貢献する前に、リポジトリをフォークする必要があります。これは、どのような種類の貢献をするかによって少し異なります。

- すべての新しい機能、バグ修正、または **`react-router` のコードに触れるもの** は、`dev` ブランチから分岐して、`dev` ブランチにマージする必要があります。
- ドキュメントのみに触れる変更は、`main` ブランチから分岐して、`main` ブランチにマージできます。

以下の手順で、このリポジトリへの変更に貢献するための準備ができます。

1. リポジトリをフォークします（[このページ](https://github.com/remix-run/react-router)の右上にある <kbd>Fork</kbd> ボタンをクリックします）
2. フォークしたリポジトリをローカルにクローンします。

   ```bash
   # ターミナルで、クローンを作成したい親ディレクトリに cd してから
   git clone https://github.com/<your_github_username>/react-router.git
   cd react-router

   # *何らかの* コード変更を行う場合は、必ず dev ブランチをチェックアウトしてください
   git checkout dev
   ```

3. 依存関係をインストールしてビルドします。React Router は [pnpm](https://pnpm.io) を使用しているので、あなたもそうすべきです。`npm` を使用してインストールすると、不要な `package-lock.json` ファイルが生成されます。

## バグを見つけたと思いますか？

issue テンプレートに従い、**最小限で実行可能な**再現方法を提供してください。最も良いのは、[失敗するテスト](https://github.com/remix-run/react-router/blob/dev/integration/bug-report-test.ts) を含むプルリクエストです。次に良いのは、バグを示す [StackBlitz](https://reactrouter.com/new)、CodeSandbox、または GitHub リポジトリへのリンクです。

## Issue が注目されていない？

バグを修正する必要があるのに、誰も修正していない場合は、自分で修正して [プルリクエスト](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request) を作成するのが最善です。オープンソースコードは私たち全員のものであり、それを前進させるのは私たち全員の責任です。

## 新しい API または変更された API を提案しますか？

⚠️ _新機能のプルリクエストから始めないでください。_

新機能は、[オープンガバナンスモデル](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#new-feature-process)に概説されているプロセスを経る必要があり、GitHub で[提案ディスカッション](https://github.com/remix-run/react-router/discussions/new?category=proposals)を開くことから始めることができます。React Router をアプリでどのように使用したいかを示す、思慮深いコメントとサンプルコードを提供してください。変更または追加する必要があるものについて結論を急ぐ前に、現在の API によってどのように制限されているかを示すことができれば、議論がしやすくなります。

私たちは経験から、小さな API の方が通常は優れていることを学んだので、現在の API に明らかな制限がない限り、何か新しいものを追加することには少し抵抗があるかもしれません。とは言え、私たちがこれまで考慮していなかったケースについてお聞きするのはいつでも大歓迎ですので、遠慮なくお申し付けください！ :)

## 例を追加しますか？

例は、main ブランチに直接追加できます。ローカルにクローンした main からブランチを作成します。完了したら、プルリクエストを作成し、例の概要を説明します。

## プルリクエストを作成しますか？

プルリクエストをマージするには、2 人以上の共同作業者の承認が必要です。PR 作成者が共同作業者の場合、それは 1 人としてカウントされます。

<docs-warning>GitHub で PR を作成するときは、ベースを正しいブランチに設定してください。コードに触れる PR を送信する場合は、`dev` ブランチにする必要があります。GitHub で PR を作成するときに、「変更の比較」見出しの下にあるドロップダウンでベースを設定します： <img src="https://raw.githubusercontent.com/remix-run/react-router/main/static/base-branch.png" alt="" width="460" height="350" /></docs-warning>

### テスト

バグを修正したり、機能を追加したりするすべてのコミットには、テストが必要です。

<docs-error>テストなしでコードをマージしないでください！</docs-error>

### ドキュメント + 例

API を変更または追加するすべてのコミットは、関連するすべての例とドキュメントも更新するプルリクエストで行う必要があります。

ドキュメントは `docs` ディレクトリにあります。変更が `main` ブランチに反映されると、ドキュメントサイトに自動的に公開されます。

ドキュメントサイトでの変更の見え方を確認したい場合は、[`react-router-website` リポジトリ](https://github.com/remix-run/react-router-website) をクローンし、`README.md` の指示に従ってローカルで変更を表示します。

## 開発

### パッケージ

React Router は、複数のパッケージのコードをホストするためにモノレポを使用します。これらのパッケージは `packages` ディレクトリにあります。

[pnpm ワークスペース](https://pnpm.io/workspaces/) を使用して、依存関係のインストールとさまざまなスクリプトの実行を管理します。すべてをインストールするには、[pnpm がインストールされている](https://pnpm.io/installation) ことを確認してから、リポジトリのルートから `pnpm install` を実行します。

### ビルド

ルートディレクトリから `pnpm build` を呼び出すと、ビルドが実行されます。これは数秒しかかかりません。個々のパッケージは相互に依存関係があるため、すべてのパッケージをまとめてビルドすることが重要です。

### テスト

テストを実行する前に、ビルドを実行する必要があります。ビルド後、ルートディレクトリから `pnpm test` を実行すると、**すべての** パッケージのテストが実行されます。特定のパッケージのテストを実行する場合は、`pnpm test packages/<package-name>/` を使用します。

```bash
# すべてのパッケージをテストする
pnpm test

# @react-router/dev のみをテストする
pnpm test packages/react-router-dev/
```

## リポジトリのブランチ

このリポジトリは、さまざまな目的のために個別のブランチを維持します。それらは次のようになります。

```
- main   > 最新のリリースと現在のドキュメント
- dev    > 安定版リリース間のアクティブな開発中のコード
- v6     > 特定のメジャーリリースの最新コード
```

さまざまな機能や実験のための他のブランチがあるかもしれませんが、すべての魔法はこれらのブランチから起こります。

## リリース

リリースプロセスのアウトラインについては、[DEVELOPMENT.md](https://github.com/remix-run/react-router/blob/main/DEVELOPMENT.md)を参照してください。