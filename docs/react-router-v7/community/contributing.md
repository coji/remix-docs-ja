---
title: 貢献
---

# React Router への貢献

貢献ありがとうございます！素晴らしいです！

オープンソースには、さまざまな種類の貢献があり、どれも価値があります。貢献を準備する際に役立ついくつかのガイドラインを以下に示します。

## セットアップ

コードベースに貢献する前に、リポジトリをフォークする必要があります。これは、どのような種類の貢献をするかによって少し異なります。

- すべての新しい機能、バグ修正、または **`react-router` コードに触れるもの** は、`dev` ブランチから分岐して、`dev` ブランチにマージする必要があります。
- ドキュメントのみに触れる変更は、`main` ブランチから分岐して、`main` ブランチにマージできます。

次の手順で、このリポジトリへの変更に貢献するための準備ができます。

1. リポジトリをフォークします（[このページ](https://github.com/remix-run/react-router)の右上にある <kbd>Fork</kbd> ボタンをクリックします）
2. フォークしたものをローカルにクローンします。

```bash
# ターミナルで、クローンを作成したい親ディレクトリに cd し、次に
git clone https://github.com/<your_github_username>/react-router.git
cd react-router

# *コードの変更* を行う場合は、必ず dev ブランチをチェックアウトしてください
git checkout dev
```

3. 依存関係をインストールしてビルドします。React Router は [pnpm](https://pnpm.io) を使用しているため、あなたも使用する必要があります。`npm` を使用してインストールすると、不要な `package-lock.json` ファイルが生成されます。

## バグを見つけたと思いますか？

問題テンプレートに従い、コード例を使用して再現への明確な道筋を示してください。最良なのは、失敗するテストを含むプルリクエストです。次に良いのは、バグを示す CodeSandbox またはリポジトリへのリンクです。

## 例を追加しますか？

例は、main ブランチに直接追加できます。ローカルにクローンした main からブランチを作成します。完了したら、プルリクエストを作成して、例の概要を説明します。

## 新しい API または変更された API を提案しますか？

React Router をアプリでどのように使用したいかを示す、思慮深いコメントとサンプルコードを提供してください。変更または追加する必要があるものについての結論に飛びつく前に、現在の API によってどのように制限されているかを最初に示すことができれば、会話に役立ちます。

私たちは経験から、小さな API の方が通常は優れていることを学んだため、現在の API に明らかな制限がない限り、何か新しいものを追加することには少し抵抗があるかもしれません。とはいえ、これまで考慮していなかったケースについて常に聞きたいと思っていますので、遠慮しないでください！:)

## 問題が注目されていない？

バグを修正する必要があり、誰も修正していない場合は、自分で修正を提供し、[プルリクエスト](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)を作成するのが最善です。オープンソースコードは私たち全員のものであり、それを前進させるのは私たち全員の責任です。

## プルリクエストを作成しますか？

プルリクエストをマージするには、2人以上の共同作業者の承認が必要です。PR作成者が共同作業者の場合、それは1つとしてカウントされます。

<docs-warning>GitHub で PR を作成するときは、ベースを正しいブランチに設定していることを確認してください。コードに触れる PR を送信する場合は、これが `dev` ブランチである必要があります。GitHub で PR を作成するときに、[「変更を比較」](https://raw.githubusercontent.com/remix-run/react-router/main/static/base-branch.png)見出しの下のドロップダウンでベースを設定します。</docs-warning>

### テスト

バグを修正したり、機能を追加したりするすべてのコミットには、テストが必要です。

`<blink>テストなしでコードをマージしないでください！</blink>`

### ドキュメント + 例

API を変更または追加するすべてのコミットは、関連するすべての例とドキュメントも更新するプルリクエストで行う必要があります。

ドキュメントは `docs` ディレクトリにあります。変更が `main` ブランチに反映されると、ドキュメントサイトに自動的に公開されます。

変更がドキュメントサイトでどのように表示されるかをプレビューする場合は、[`react-router-website` リポジトリ](https://github.com/remix-run/react-router-website)をクローンし、`README.md` の指示に従って、変更をローカルで表示します。

## 開発

### パッケージ

React Router は、複数のパッケージのコードをホストするためにモノレポを使用しています。これらのパッケージは `packages` ディレクトリにあります。

依存関係のインストールとさまざまなスクリプトの実行を管理するために、[pnpm ワークスペース](https://pnpm.io/workspaces/)を使用しています。すべてをインストールするには、[pnpm がインストールされている](https://pnpm.io/installation)ことを確認し、リポジトリのルートから `pnpm install` を実行します。

### ビルド

ルートディレクトリから `pnpm build` を呼び出すと、ビルドが実行されます。これは数秒しかかかりません。個々のパッケージは相互に依存関係があるため、すべてのパッケージをまとめてビルドすることが重要です。

### テスト

テストを実行する前に、ビルドを実行する必要があります。ビルド後、ルートディレクトリから `pnpm test` を実行すると、**すべての** パッケージのテストが実行されます。特定のパッケージのテストを実行する場合は、`pnpm test --projects packages/<package-name>` を使用します。

```bash
# すべてのパッケージをテストする
pnpm test

# react-router-dom のみをテストする
pnpm test --projects packages/react-router-dom
```

## リポジトリのブランチ

このリポジトリは、さまざまな目的のために個別のブランチを維持しています。それらは次のようになります。

```
- main   > 最新のリリースと現在のドキュメント
- dev    > 安定版リリース間のアクティブな開発中のコード
- v5     > 特定のメジャーリリースの最新コード
```

さまざまな機能や実験のための他のブランチがあるかもしれませんが、すべての魔法はこれらのブランチから発生します。

## 新しいリリース

新しいリリースをカットする時期になったら、リリースの種類に応じて、ブランチ戦略に基づいたプロセスに従います。

### `react-router@next` リリース

`dev` ブランチの現在の状態から実験的なリリースを作成します。これらは `@next` タグを使用してインストールできます。

```bash
pnpm add react-router-dom@next
# または
npm install react-router-dom@next
```

これらのリリースは、PR が `dev` ブランチにマージされると自動化されます。

### 最新のメジャーリリース

```bash
# dev ブランチから開始します。
git checkout dev

# ホットフィックスとドキュメントの更新がリリースで利用可能であることを確認するために、
# main ブランチを dev にマージします。
git merge main

# dev から新しいリリースブランチを作成します。
git checkout -b release/v6.1.0

# 新しいタグを作成し、コードベース全体のバージョン参照を更新します。
pnpm run version [nextVersion]

# 新しいリリースタグとともにリリースブランチをプッシュします。
git push origin release/v6.1.0 --follow-tags

# GitHub アクションがすべてのテストを実行するのを待ちます。テストに合格した場合、
# リリースは準備完了です！リリースブランチを main と dev にマージします。
git checkout main
git merge release/v6.1.0
git checkout dev
git merge release/v6.1.0

# これでリリースブランチを削除できます。
git branch -D release/v6.1.0
git push origin --delete release/v6.1.0

# 次に、GitHub に移動して、新しいタグからリリースを作成します。
# GitHub Actions が残りの処理を行います！
```

### ホットフィックスリリース

すぐに修正する必要がある重大なバグが発生することがあります。バグが最新のリリースに影響する場合は、`main`（またはバグが存在する関連するメジャーリリースブランチ）から直接新しいバージョンを作成できます。

```bash
# main ブランチから、新しいリリースを作成する前に、必ずビルドとすべてのテストを実行してください。
pnpm install && pnpm build && pnpm test

# テストに合格したと仮定して、リリースタグを作成し、コードベース全体のバージョン参照を更新します。
pnpm run version [nextVersion]

# 新しいリリースタグとともに変更をプッシュします。
git push origin main --follow-tags

# GitHub で、新しいタグからリリースを作成すると、GitHub アクションを介して公開されます。

# ホットフィックスが完了したら、変更を dev にマージし、必要に応じて競合をクリーンアップします。
git checkout dev
git merge main
git push origin dev
```

