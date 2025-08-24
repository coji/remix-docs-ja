---
title: "create-remix (CLI)"
---

# `create-remix`

<docs-warning>Remixを使い始めたばかりですか？Remixの最新バージョンは[React Router v7][remix-now-react-router]になりました。最新のフレームワーク機能を使用したい場合は、[`create-react-router` CLIを使用して新しいプロジェクトを開始][create-react-router]する必要があります。</docs-warning>

`create-remix` CLI は、新しい Remix プロジェクトを作成します。引数を渡さずにこのコマンドを実行すると、新しいプロジェクトを構成し、指定されたディレクトリにセットアップするためのインタラクティブな CLI が起動します。

```sh
npx create-remix@latest
```

オプションで、目的のディレクトリパスを引数として渡すことができます。

```sh
npx create-remix@latest <projectDir>
```

デフォルトのアプリケーションは、組み込みの [Remix App Server][remix-app-server] を使用した TypeScript アプリです。異なるセットアップに基づいてアプリケーションを作成したい場合は、[`--template`][template-flag-hash-link] フラグを使用できます。

```sh
npx create-remix@latest --template <templateUrl>
```

利用可能なコマンドとフラグの完全なリストを取得するには、以下を実行します。

```sh
npx create-remix@latest --help
```

### パッケージマネージャー

`create-remix` は、さまざまなパッケージマネージャーを使用して呼び出すこともでき、インストールプロセスを管理するために npm、Yarn、pnpm、および Bun から選択できます。

```sh
npm create remix@latest <projectDir>
# または
yarn create remix@latest <projectDir>
# または
pnpm create remix@latest <projectDir>
# または
bunx create-remix@latest <projectDir>
```

### `create-remix --template`

利用可能なテンプレートの詳細なガイドについては、[テンプレートページ][templates] を参照してください。

有効なテンプレートは次のとおりです。

- GitHub リポジトリの短縮形 — `:username/:repo` または `:username/:repo/:directory`
- GitHub リポジリ（またはその中のディレクトリ）の URL — `https://github.com/:username/:repo` または `https://github.com/:username/:repo/tree/:branch/:directory`
  - この形式を使用する場合、ブランチ名（`:branch`）に `/` を含めることはできません。これは、`create-remix` がブランチ名とディレクトリパスを区別できないためです。
- リモート tarball の URL — `https://example.com/remix-template.tar.gz`
- ファイルのディレクトリへのローカルファイルパス — `./path/to/remix-template`
- tarball へのローカルファイルパス — `./path/to/remix-template.tar.gz`

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

プライベート GitHub リポジトリのテンプレートから新しいプロジェクトを作成するには、そのリポジトリへのアクセス権を持つ個人アクセストークンを `--token` フラグに渡します。

</docs-info>
</aside>

### `create-remix --overwrite`

`create-remix` がテンプレートとアプリを作成するディレクトリの間でファイルの衝突を検出した場合、それらのファイルをテンプレートバージョンで上書きしてもよいかどうかの確認を求められます。`--overwrite` CLI フラグを使用すると、このプロンプトをスキップできます。

[templates]: ../guides/templates
[remix-app-server]: ./serve
[template-flag-hash-link]: #create-remix---template
[remix-now-react-router]: https://remix.run/blog/incremental-path-to-react-19
[create-react-router]: https://reactrouter.com/start/framework/installation