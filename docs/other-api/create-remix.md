---
title: "create-remix (CLI)"
---

# `create-remix`

`create-remix` CLI は、新しい Remix プロジェクトを作成します。引数を渡さずにこのコマンドを実行すると、インタラクティブな CLI が起動し、新しいプロジェクトを構成して指定されたディレクトリにセットアップします。

```sh
npx create-remix@latest
```

必要に応じて、目的のディレクトリパスを引数として渡すことができます。

```sh
npx create-remix@latest <projectDir>
```

デフォルトのアプリケーションは、組み込みの [Remix App Server][remix-app-server] を使用する TypeScript アプリです。異なる設定に基づいてアプリケーションを作成する場合は、[`--template`][template-flag-hash-link] フラグを使用できます。

```sh
npx create-remix@latest --template <templateUrl>
```

使用可能なコマンドとフラグの完全なリストを取得するには、次のように実行します。

```sh
npx create-remix@latest --help
```

### パッケージマネージャー

`create-remix` は、さまざまなパッケージマネージャーを使用して呼び出すこともできます。これにより、npm、Yarn、pnpm、Bun のいずれかを選択してインストールプロセスを管理できます。

```sh
npm create remix@latest <projectDir>
# または
yarn create remix <projectDir>
# または
pnpm create remix <projectDir>
# または
bunx create-remix <projectDir>
```

### `create-remix --template`

使用可能なテンプレートの詳細なガイドについては、[テンプレートページ][templates] を参照してください。

有効なテンプレートは次のとおりです。

- GitHub リポジトリの省略形 - `:username/:repo` または `:username/:repo/:directory`
- GitHub リポジトリ（またはその中のディレクトリ）の URL - `https://github.com/:username/:repo` または `https://github.com/:username/:repo/tree/:branch/:directory`
  - この形式を使用する場合、ブランチ名（`:branch`）に `/` を含めることはできません。`create-remix` はブランチ名とディレクトリパスを区別できません。
- リモートの tarball の URL - `https://example.com/remix-template.tar.gz`
- ファイルのディレクトリのローカルファイルパス - `./path/to/remix-template`
- tarball のローカルファイルパス - `./path/to/remix-template.tar.gz`

```sh
npx create-remix@latest ./my-app --template remix-run/grunge-stack
npx create-remix@latest ./my-app --template remix-run/remix/templates/remix
npx create-remix@latest ./my-app --template remix-run/examples/basic
npx create-remix@latest ./my-app --template :username/:repo
npx create-remix@latest ./my-app --template :username/:repo/:directory
npx create-remix@latest ./my-app --template https://github.com/:username/:repo
npx create-remix@latest ./my-app --template https://github.com/:username/:repo/tree/:branch
npx create-remix@latest ./my-app --template https://github.com/:username/:repo/tree/:branch/:directory
npx create-remix@latest ./my-app --template https://github.com/:username/:repo/archive/refs/tags/:tag.tar.gz
npx create-remix@latest ./my-app --template https://github.com/:username/:repo/releases/latest/download/:tag.tar.gz
npx create-remix@latest ./my-app --template https://example.com/remix-template.tar.gz
npx create-remix@latest ./my-app --template ./path/to/remix-template
npx create-remix@latest ./my-app --template ./path/to/remix-template.tar.gz
```

<aside aria-label="プライベート GitHub リポジトリテンプレート">
<docs-info>

プライベート GitHub リポジトリのテンプレートから新しいプロジェクトを作成するには、そのリポジトリへのアクセス権を持つパーソナルアクセストークンを `--token` フラグに渡します。

</docs-info>
</aside>

### `create-remix --overwrite`

`create-remix` は、テンプレートとアプリを作成するディレクトリ間のファイルの衝突を検出すると、テンプレートのバージョンでこれらのファイルを上書きしても問題ないかどうかを確認するプロンプトを表示します。`--overwrite` CLI フラグを使用すると、このプロンプトをスキップできます。

[templates]: ../guides/templates
[remix-app-server]: ./serve
[template-flag-hash-link]: #create-remix---template
