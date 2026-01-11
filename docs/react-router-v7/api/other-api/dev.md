---
title: "@react-router/dev (CLI)"
---

# React Router CLI

React Router CLI は `@react-router/dev` パッケージに含まれています。`package.json` の `devDependencies` に含まれていることを確認し、サーバーにデプロイされないようにしてください。

利用可能なコマンドとフラグの全リストを表示するには、以下を実行します。

```shellscript nonumber
npx @react-router/dev -h
```

## `react-router build`

[Vite][vite] を使用して、プロダクション用にアプリをビルドします。このコマンドは `process.env.NODE_ENV` を `production` に設定し、デプロイ用にアウトプットをミニファイします。

```shellscript nonumber
react-router build
```

| フラグ                  | 説明                                                | 型                                                  | デフォルト  |
| :---------------------- | :-------------------------------------------------- | :-------------------------------------------------- | :---------- |
| `--assetsInlineLimit`   | バイト単位での静的アセットの base64 インライン閾値  | `number`                                            | `4096`      |
| `--clearScreen`         | ログ出力時の画面クリアを許可/無効化                 | `boolean`                                           |             |
| `--config`, `-c`        | 指定された設定ファイルを使用                        | `string`                                            |             |
| `--emptyOutDir`         | ルート外にある `outDir` を強制的に空にする          | `boolean`                                           |             |
| `--logLevel`, `-l`      | 指定されたログレベルを使用                          | `"info" \| "warn" \| "error" \| "silent" \| string` |             |
| `--minify`              | ミニファイを有効/無効にするか、使用するミニファイアを指定 | `boolean \| "terser" \| "esbuild"`                  | `"esbuild"` |
| `--mode`, `-m`          | 環境モードを設定                                    | `string`                                            |             |
| `--profile`             | 組み込みの Node.js インスペクターを開始             |                                                     |             |
| `--sourcemapClient`     | クライアントビルド用のソースマップを出力            | `boolean \| "inline" \| "hidden"`                   | `false`     |
| `--sourcemapServer`     | サーバービルド用のソースマップを出力                | `boolean \| "inline" \| "hidden"`                   | `false`     |

## `react-router dev`

[Vite][vite] を使用して、HMR と Hot Data Revalidation (HDR) を備えた開発モードでアプリを実行します。

```shellscript nonumber
react-router dev
```

<docs-info>

「Hot Data Revalidation」とは？

HMR と同様に、HDR はページをリフレッシュすることなくアプリをホット更新する方法です。これにより、編集がアプリに適用されている間もアプリの state を保持できます。HMR は、アプリの component、マークアップ、またはスタイルを変更したときのような、クライアントサイドのコード更新を処理します。同様に、HDR はサーバーサイドのコード更新を処理します。

これは、現在のページ（または現在のページが依存するコード）に変更を加えるたびに、React Router が [loader][loaders] からデータを再フェッチすることを意味します。これにより、アプリはクライアントサイドまたはサーバーサイドの最新のコード変更で_常に_最新の状態に保たれます。

</docs-info>

| フラグ               | 説明                                                  | 型                                                  | デフォルト |
| :------------------- | :---------------------------------------------------- | :-------------------------------------------------- | :--------- |
| `--clearScreen`      | ログ出力時の画面クリアを許可/無効化                   | `boolean`                                           |            |
| `--config`, `-c`     | 指定された設定ファイルを使用                          | `string`                                            |            |
| `--cors`             | CORS を有効にする                                     | `boolean`                                           |            |
| `--force`            | オプティマイザーにキャッシュを無視して再バンドルするよう強制 | `boolean`                                           |            |
| `--host`             | ホスト名を指定                                        | `string`                                            |            |
| `--logLevel`, `-l`   | 指定されたログレベルを使用                            | `"info" \| "warn" \| "error" \| "silent" \| string` |            |
| `--mode`, `-m`       | 環境モードを設定                                      | `string`                                            |            |
| `--open`             | 起動時にブラウザを開く                                | `boolean \| string`                                 |            |
| `--port`             | ポートを指定                                          | `number`                                            |            |
| `--profile`          | 組み込みの Node.js インスペクターを開始               |                                                     |            |
| `--strictPort`       | 指定されたポートが既に使用中の場合、終了する          | `boolean`                                           |            |

## `react-router reveal`

React Router は、デフォルトでアプリケーションのエントリーポイントを処理します。

これらのエントリーポイントを制御したい場合は、`npx react-router reveal` を実行して、`app` ディレクトリに [`entry.client.tsx`][entry-client] と [`entry.server.tsx`][entry-server] ファイルを生成できます。これらのファイルが存在する場合、React Router はデフォルトの代わりにこれらを使用します。

```shellscript nonumber
npx react-router reveal
```

| フラグ              | 説明                            | 型        | デフォルト |
| :------------------ | :------------------------------ | :-------- | :--------- |
| `--config`, `-c`    | 指定された設定ファイルを使用    | `string`  |            |
| `--mode`, `-m`      | 環境モードを設定                | `string`  |            |
| `--no-typescript`   | プレーンな JavaScript ファイルを生成 | `boolean` | `false`    |
| `--typescript`      | TypeScript ファイルを生成       | `boolean` | `true`     |

## `react-router routes`

アプリ内の routes をターミナルに出力します。

```shellscript nonumber
react-router routes
```

デフォルトでは、routes ツリーは JSX フォーマットになります。`--json` フラグを使用して、routes を JSON フォーマットで取得することもできます。

```shellscript nonumber
react-router routes --json
```

| フラグ             | 説明                       | 型        | デフォルト |
| :----------------- | :------------------------- | :-------- | :--------- |
| `--config`, `-c`   | 指定された設定ファイルを使用 | `string`  |            |
| `--json`           | routes を JSON フォーマットで出力 | `boolean` | `false`    |
| `--mode`, `-m`     | 環境モードを設定           | `string`  |            |

## `react-router typegen`

routes の TypeScript 型を生成します。これは開発中に自動的に行われますが、必要に応じて手動で実行できます（例: CI で `tsc` を実行する前に型を生成する場合など）。詳細については、[Type Safety][type-safety] を参照してください。

```shellscript nonumber
react-router typegen
```

| フラグ             | 説明                       | 型        | デフォルト |
| :----------------- | :------------------------- | :-------- | :--------- |
| `--config`, `-c`   | 指定された設定ファイルを使用 | `string`  |            |
| `--mode`, `-m`     | 環境モードを設定           | `string`  |            |
| `--watch`          | 変更を監視                 | `boolean` | `false`    |

[loaders]: ../../start/framework/data-loading
[vite]: https://vite.dev
[entry-server]: ../framework-conventions/entry.server.tsx
[entry-client]: ../framework-conventions/entry.client.tsx
[type-safety]: ../../explanation/type-safety