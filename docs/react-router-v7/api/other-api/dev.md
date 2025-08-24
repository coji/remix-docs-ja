---
title: "@react-router/dev (CLI)"
---

# React Router CLI

React Router CLIは`@react-router/dev`パッケージに含まれています。サーバーにデプロイされないよう、`package.json`の`devDependencies`に含めるようにしてください。

利用可能なコマンドとフラグの全リストを取得するには、以下を実行します。

```shellscript nonumber
npx @react-router/dev -h
```

## `react-router build`

[Vite][vite]を使用して、本番環境向けにアプリをビルドします。このコマンドは`process.env.NODE_ENV`を`production`に設定し、デプロイ用にアウトプットをminifyします。

```shellscript nonumber
react-router build
```

| フラグ                  | 説明                                                    | 型                                                  | デフォルト  |
| --------------------- | ------------------------------------------------------- | --------------------------------------------------- | ----------- |
| `--assetsInlineLimit` | 静的アセットのbase64インライン閾値（バイト単位）        | `number`                                            | `4096`      |
| `--clearScreen`       | ログ出力時の画面クリアを許可/無効にする                 | `boolean`                                           |             |
| `--config`, `-c`      | 指定された設定ファイルを使用する                        | `string`                                            |             |
| `--emptyOutDir`       | `outDir`がルート外にある場合に強制的に空にする          | `boolean`                                           |             |
| `--logLevel`, `-l`    | 指定されたログレベルを使用する                          | `"info" \| "warn" \| "error" \| "silent" \| string` |             |
| `--minify`            | minificationを有効/無効にする、または使用するminifierを指定する | `boolean \| "terser" \| "esbuild"`                  | `"esbuild"` |
| `--mode`, `-m`        | 環境モードを設定する                                    | `string`                                            |             |
| `--profile`           | ビルトインのNode.jsインスペクターを開始する             |                                                     |             |
| `--sourcemapClient`   | クライアントビルド用のソースマップを出力する            | `boolean \| "inline" \| "hidden"`                   | `false`     |
| `--sourcemapServer`   | サーバービルド用のソースマップを出力する                | `boolean \| "inline" \| "hidden"`                   | `false`     |

## `react-router dev`

[Vite][vite]を搭載し、HMRとHot Data Revalidation (HDR) を使用して開発モードでアプリを実行します。

```shellscript nonumber
react-router dev
```

<docs-info>

「Hot Data Revalidation」とは？

HMRと同様に、HDRはページをリフレッシュすることなくアプリをホットアップデートする方法です。
これにより、編集がアプリに適用されてもアプリの状態を維持できます。
HMRは、アプリのコンポーネント、マークアップ、スタイルを変更したときのようなクライアントサイドのコード更新を処理します。
同様に、HDRはサーバーサイドのコード更新を処理します。

つまり、現在のページ（または現在のページが依存する任意のコード）に変更を加えるたびに、React Routerは[loaders][loaders]からデータを再フェッチします。
これにより、アプリはクライアントサイドまたはサーバーサイドの最新のコード変更で_常に_最新の状態に保たれます。

</docs-info>

| フラグ               | 説明                                                    | 型                                                  | デフォルト |
| ------------------ | ----------------------------------------------------- | --------------------------------------------------- | ------- |
| `--clearScreen`    | ログ出力時の画面クリアを許可/無効にする                 | `boolean`                                           |         |
| `--config`, `-c`   | 指定された設定ファイルを使用する                        | `string`                                            |         |
| `--cors`           | CORSを有効にする                                      | `boolean`                                           |         |
| `--force`          | オプティマイザーにキャッシュを無視して再バンドルさせる  | `boolean`                                           |         |
| `--host`           | ホスト名を指定する                                      | `string`                                            |         |
| `--logLevel`, `-l` | 指定されたログレベルを使用する                          | `"info" \| "warn" \| "error" \| "silent" \| string` |         |
| `--mode`, `-m`     | 環境モードを設定する                                    | `string`                                            |         |
| `--open`           | 起動時にブラウザを開く                                  | `boolean \| string`                                 |         |
| `--port`           | ポートを指定する                                        | `number`                                            |         |
| `--profile`        | ビルトインのNode.jsインスペクターを開始する             |                                                     |         |
| `--strictPort`     | 指定されたポートが既に使用されている場合に終了する      | `boolean`                                           |         |

## `react-router reveal`

React Routerは、デフォルトでアプリケーションのエントリーポイントを処理します。

これらのエントリーポイントを制御したい場合は、`npx react-router reveal`を実行して、`app`ディレクトリに[`entry.client.tsx`][entry-client]と[`entry.server.tsx`][entry-server]ファイルを生成できます。これらのファイルが存在する場合、React Routerはデフォルトの代わりにそれらを使用します。

```shellscript nonumber
npx react-router reveal
```

| フラグ              | 説明                                | 型        | デフォルト |
| ----------------- | ----------------------------------- | --------- | ------- |
| `--config`, `-c`  | 指定された設定ファイルを使用する    | `string`  |         |
| `--mode`, `-m`    | 環境モードを設定する                | `string`  |         |
| `--no-typescript` | プレーンなJavaScriptファイルを生成する | `boolean` | `false` |
| `--typescript`    | TypeScriptファイルを生成する        | `boolean` | `true`  |

## `react-router routes`

アプリのルートをターミナルに出力します。

```shellscript nonumber
react-router routes
```

ルートツリーはデフォルトでJSX形式で表示されます。`--json`フラグを使用すると、JSON形式でルートを取得することもできます。

```shellscript nonumber
react-router routes --json
```

| フラグ             | 説明                                | 型        | デフォルト |
| ---------------- | ----------------------------------- | --------- | ------- |
| `--config`, `-c` | 指定された設定ファイルを使用する    | `string`  |         |
| `--json`         | ルートをJSON形式で出力する          | `boolean` | `false` |
| `--mode`, `-m`   | 環境モードを設定する                | `string`  |         |

## `react-router typegen`

ルートのTypeScript型を生成します。これは開発中に自動的に行われますが、必要に応じて手動で実行することもできます。例えば、`tsc`を実行する前にCIで型を生成する場合などです。詳細については、[Type Safety][type-safety]を参照してください。

```shellscript nonumber
react-router typegen
```

| フラグ             | 説明                                | 型        | デフォルト |
| ---------------- | ----------------------------------- | --------- | ------- |
| `--config`, `-c` | 指定された設定ファイルを使用する    | `string`  |         |
| `--mode`, `-m`   | 環境モードを設定する                | `string`  |         |
| `--watch`        | 変更を監視する                      | `boolean` | `false` |

[loaders]: ../../start/framework/data-loading
[vite]: https://vite.dev
[entry-server]: ../framework-conventions/entry.server.tsx
[entry-client]: ../framework-conventions/entry.client.tsx
[type-safety]: ../../explanation/type-safety