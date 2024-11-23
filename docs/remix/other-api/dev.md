---
title: "@remix-run/dev CLI"
order: 2
new: true
---

# Remix CLI

`@remix-run/dev` パッケージから提供される Remix CLI には、コンパイラも含まれています。サーバーにデプロイされないように、`package.json`の `devDependencies` に追加してください。

使用可能なコマンドとフラグの完全なリストについては、以下を実行してください。

```shellscript nonumber
npx @remix-run/dev -h
```

## `remix vite:build`

[Remix Vite][remix-vite] を使用して、アプリを本番環境用にビルドします。このコマンドは `process.env.NODE_ENV` を `production` に設定し、デプロイ用に出力結果を縮小します。

```shellscript nonumber
remix vite:build
```

| フラグ                  | 説明                                             | タイプ                                                | デフォルト     |
| --------------------- | ------------------------------------------------------- | --------------------------------------------------- | ----------- |
| `--assetsInlineLimit` | 静的アセットのベース64インラインしきい値（バイト単位） | `number`                                            | `4096`      |
| `--clearScreen`       | ログ出力時に画面をクリアするかどうか                  | `boolean`                                           |             |
| `--config`, `-c`      | 指定された設定ファイルを使用する                       | `string`                                            |             |
| `--emptyOutDir`       | ルート外の outDir を強制的に空にする                | `boolean`                                           |             |
| `--logLevel`, `-l`    | 指定されたログレベルを使用する                         | `"info" \| "warn" \| "error" \| "silent" \| string` |             |
| `--minify`            | 縮小を有効/無効にする、または使用する縮小器を指定する | `boolean \| "terser" \| "esbuild"`                  | `"esbuild"` |
| `--mode`, `-m`        | 環境モードを設定する                               | `string`                                            |             |
| `--profile`           | 組み込みの Node.js インスペクターを起動する        |                                                     |             |
| `--sourcemapClient`   | クライアントビルド用のソースマップを出力する          | `boolean \| "inline" \| "hidden"`                   | `false`     |
| `--sourcemapServer`   | サーバービルド用のソースマップを出力する          | `boolean \| "inline" \| "hidden"`                   | `false`     |

## `remix vite:dev`

[Remix Vite][remix-vite] を使用して、アプリを開発モードで実行します。

```shellscript nonumber
remix vite:dev
```

| フラグ               | 説明                                           | タイプ                                                | デフォルト |
| ------------------ | ----------------------------------------------------- | --------------------------------------------------- | ------- |
| `--clearScreen`    | ログ出力時に画面をクリアするかどうか               | `boolean`                                           |         |
| `--config`, `-c`   | 指定された設定ファイルを使用する                             | `string`                                            |         |
| `--cors`           | CORS を有効にする                                           | `boolean`                                           |         |
| `--force`          | オプティマイザーにキャッシュを無視して再バンドルさせる | `boolean`                                           |         |
| `--host`           | ホスト名を指定する                                      | `string`                                            |         |
| `--logLevel`, `-l` | 指定されたログレベルを使用する                               | `"info" \| "warn" \| "error" \| "silent" \| string` |         |
| `--mode`, `-m`     | 環境モードを設定する                                          | `string`                                            |         |
| `--open`           | 起動時にブラウザを開く                               | `boolean \| string`                                 |         |
| `--port`           | ポートを指定する                                          | `number`                                            |         |
| `--profile`        | 組み込みの Node.js インスペクターを起動する                      |                                                     |         |
| `--strictPort`     | 指定されたポートが既に使用されている場合、終了する | `boolean`                                           |         |

## Classic Remix Compiler コマンド

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。</docs-warning>

### `remix build`

[Classic Remix Compiler][classic-remix-compiler] を使用して、アプリを本番環境用にビルドします。このコマンドは `process.env.NODE_ENV` を `production` に設定し、デプロイ用に出力結果を縮小します。

```shellscript nonumber
remix build
```

#### オプション

| オプション                                   | フラグ          | 設定 | デフォルト |
| ---------------------------------------- | ------------- | ------ | ------- |
| 本番環境用ビルドでソースマップを生成する | `--sourcemap` | N/A    | `false` |

## `remix dev`

[Classic Remix Compiler][classic-remix-compiler] を監視モードで実行し、アプリサーバーを起動します。

Remix コンパイラは、以下を実行します。

1. `NODE_ENV` を `development` に設定します
2. アプリコードの変更を監視し、再ビルドをトリガーします
3. 再ビルドが成功すると、アプリサーバーを再起動します
4. ライブリロードと HMR + ホットデータ再検証を使用して、コードの更新をブラウザに送信します

🎥 Remix の HMR と HDR の紹介と詳細については、以下のビデオをご覧ください。

- [HMR and Hot Data Revalidation 🔥][hmr_and_hdr]
- [Mental model for the new dev flow 🧠][mental_model]
- [Migrating your project to v2 dev flow 🚚][migrating]

<docs-info>

ホットデータ再検証とは何ですか？

HMR と同様に、HDR は、ページをリフレッシュしなくてもアプリをホットアップデートする方法です。
これにより、編集がアプリに適用されても、アプリの状態を保持できます。
HMR は、アプリのコンポーネント、マークアップ、またはスタイルを変更する場合など、クライアント側のコードの更新を処理します。
同様に、HDR はサーバー側のコードの更新を処理します。

つまり、現在のページの [`loader`][loader]（または `loader` が依存するコード）を変更するたびに、Remix は変更されたローダーからデータを再取得します。
これにより、アプリはクライアント側とサーバー側の両方の最新のコード変更で常に最新の状態になります。

HMR と HDR がどのように連携しているかについては、[Pedro の Remix Conf 2023 での講演][legendary_dx]をご覧ください。

</docs-info>

#### カスタムアプリサーバーを使用する場合

テンプレートを使用して開始した場合、おそらくテンプレートは `remix dev` とすでに統合されています。
そうでない場合は、以下の手順に従って、プロジェクトを `remix dev` と統合できます。

1. `package.json` の開発スクリプトを置き換え、`-c` を使用してアプリサーバーコマンドを指定します。

   ```json filename=package.json
   {
     "scripts": {
       "dev": "remix dev -c \"node ./server.js\""
     }
   }
   ```

2. アプリサーバーが実行中のときに、`broadcastDevReady` が呼び出されるようにします。

   ```ts filename=server.ts lines=[12,25-27]
   import path from "node:path";

   import { broadcastDevReady } from "@remix-run/node";
   import express from "express";

   const BUILD_DIR = path.resolve(__dirname, "build");
   const build = require(BUILD_DIR);

   const app = express();

   // ... express アプリの設定コードをここに記述します ...

   app.all("*", createRequestHandler({ build }));

   const port = 3000;
   app.listen(port, () => {
     console.log(`👉 http://localhost:${port}`);

     if (process.env.NODE_ENV === "development") {
       broadcastDevReady(build);
     }
   });
   ```

   <docs-info>

   CloudFlare の場合は、`broadcastDevReady` の代わりに `logDevReady` を使用してください。

   なぜですか？ `broadcastDevReady` は [`fetch`][fetch] を使用して、Remix コンパイラに準備完了メッセージを送信しますが、CloudFlare はリクエスト処理以外の `fetch` などの非同期 I/O をサポートしていません。

   </docs-info>

#### オプション

オプションの優先順位は、1. フラグ、2. 設定、3. デフォルトです。

| オプション          | フラグ               | 設定    | デフォルト                           | 説明                                              |
| --------------- | ------------------ | --------- | --------------------------------- | -------------------------------------------------------- |
| コマンド         | `-c` / `--command` | `command` | `remix-serve <server build path>` | アプリサーバーを実行するために使用されるコマンド       |
| 手動          | `--manual`         | `manual`  | `false`                           | [手動モードに関するガイド][manual_mode] を参照してください |
| ポート            | `--port`           | `port`    | 動的に選択された空いているポート      | ホットアップデートのために Remix コンパイラが使用する内部ポート |
| TLS キー         | `--tls-key`        | `tlsKey`  | N/A                               | ローカル HTTPS を設定するための TLS キー              |
| TLS 証明書 | `--tls-cert`       | `tlsCert` | N/A                               | ローカル HTTPS を設定するための TLS 証明書            |

たとえば、

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  dev: {
    // ...設定する他のオプションはここに記述します ...
    manual: true,
    tlsKey: "./key.pem",
    tlsCert: "./cert.pem",
  },
};
```

#### カスタムポートの設定

`remix dev --port` オプションは、ホットアップデートに使用される内部ポートを設定します。
**アプリが実行されるポートには影響しません。**

アプリサーバーのポートを設定するには、本番環境と同じ方法で設定します。
たとえば、`server.js` ファイルにハードコードされている場合があります。

`remix-serve` をアプリサーバーとして使用している場合は、`--port` フラグを使用してアプリサーバーのポートを設定できます。

```shellscript nonumber
remix dev -c "remix-serve --port 8000 ./build/index.js"
```

一方、`remix dev --port` オプションは、ネットワークポートを細かく制御する必要があるユーザーのための回避策です。
ほとんどのユーザーは、`remix dev --port` を使用する必要はありません。

#### 手動モード

デフォルトでは、`remix dev` は、再ビルドが発生するたびにアプリサーバーを再起動します。
再ビルド間でアプリサーバーを再起動せずに実行し続ける場合は、[手動モードに関するガイド][manual_mode]をご覧ください。

`remix dev` によって報告される時間を比較することで、アプリサーバーの再起動がプロジェクトのボトルネックになっているかどうかを確認できます。

- `rebuilt (Xms)` 👉 Remix コンパイラがアプリの再ビルドに `X` ミリ秒かかりました
- `app server ready (Yms)` 👉 Remix がアプリサーバーを再起動し、新しいコード変更で起動するまでに `Y` ミリ秒かかりました

#### 他のパッケージの変更を拾う

モノレポを使用している場合は、アプリコードが変更されたときだけでなく、アプリの依存関係のコードが変更されたときにも、Remix がホットアップデートを実行するようにしたい場合があります。

たとえば、Remix アプリ (`packages/app`) 内で使用される UI ライブラリパッケージ (`packages/ui`) があるとします。
`packages/ui` の変更を拾うには、[watchPaths][watch_paths] を構成してパッケージを含めることができます。

#### MSW の統合方法

開発で [Mock Service Worker][msw] を使用するには、以下を行う必要があります。

1. MSW をアプリサーバーの一部として実行する
2. MSW が Remix コンパイラへの内部の「開発準備完了」メッセージを模倣しないように構成する

`REMIX_DEV_ORIGIN` 環境変数がモックで使用できるように、`-c` フラグ内でアプリサーバーのモックを設定していることを確認してください。
たとえば、`NODE_OPTIONS` を使用して、`remix-serve` を実行するときに Node の `--require` フラグを設定できます。

```json filename=package.json
{
  "scripts": {
    "dev": "remix dev -c \"npm run dev:app\"",
    "dev:app": "cross-env NODE_OPTIONS=\"--require ./mocks\" remix-serve ./build"
  }
}
```

ESM をデフォルトのモジュールシステムとして使用している場合は、`--require` の代わりに `--import` フラグを設定する必要があります。

```json filename=package.json
{
  "scripts": {
    "dev": "remix dev -c \"npm run dev:app\"",
    "dev:app": "cross-env NODE_OPTIONS=\"--import ./mocks/index.js\" remix-serve ./build/index.js"
  }
}
```

次に、`REMIX_DEV_ORIGIN` を使用して、MSW が `/ping` で内部の「開発準備完了」メッセージを転送できるようにします。

```ts
import { http, passthrough } from "msw";

const REMIX_DEV_PING = new URL(
  process.env.REMIX_DEV_ORIGIN
);
REMIX_DEV_PING.pathname = "/ping";

export const server = setupServer(
  http.post(REMIX_DEV_PING.href, () => passthrough())
  // ... 他のリクエストハンドラーをここに記述します ...
);
```

#### リバースプロキシとの統合方法

アプリサーバーと Remix コンパイラの両方が同じマシンで実行されているとします。

- アプリサーバー 👉 `http://localhost:1234`
- Remix コンパイラ 👉 `http://localhost:5678`

次に、アプリサーバーの前にリバースプロキシを設定します。

- リバースプロキシ 👉 `https://myhost`

しかし、ホットアップデートをサポートするための内部の HTTP および WebSocket 接続は、引き続きプロキシされていない Remix コンパイラのオリジンに到達しようとします。

- ホットアップデート 👉 `http://localhost:5678` / `ws://localhost:5678` ❌

内部接続がリバースプロキシを指すようにするには、`REMIX_DEV_ORIGIN` 環境変数を使用できます。

```shellscript nonumber
REMIX_DEV_ORIGIN=https://myhost remix dev
```

これで、ホットアップデートがプロキシに正しく送信されるようになります。

- ホットアップデート 👉 `https://myhost` / `wss://myhost` ✅

#### パフォーマンスチューニングとデバッグ

##### パスインポート

現在、Remix がアプリを再ビルドすると、コンパイラはアプリコードとその依存関係を処理する必要があります。
コンパイラは、使用されていないコードをアプリからツリーシェイクするため、ブラウザに不要なコードを送信せず、サーバーを可能な限りスリムに保ちます。
しかし、コンパイラは、どのコードを保持し、どのコードをツリーシェイクするかを知るために、すべてのコードを _クロール_ する必要があります。

簡単に言えば、これはインポートとエクスポートの方法が、アプリの再ビルドにかかる時間に大きく影響することを意味します。
たとえば、Material UI や AntD などのライブラリを使用している場合は、[パスインポート][path_imports] を使用することで、ビルドを高速化できる可能性があります。

```diff
- import { Button, TextField } from '@mui/material';
+ import Button from '@mui/material/Button';
+ import TextField from '@mui/material/TextField';
```

将来的には、Remix は開発時に依存関係を事前にバンドルして、この問題を完全に回避できる可能性があります。
しかし現在では、パスインポートを使用することで、コンパイラを支援できます。

##### バンドルのデバッグ

アプリと依存関係によっては、アプリに必要な量よりもはるかに多くのコードを処理している可能性があります。
詳細については、[バンドル分析ガイド][bundle_analysis]をご覧ください。

#### トラブルシューティング

##### HMR

ホットアップデートを期待しているのに、ページ全体がリロードされる場合は、[Hot Module Replacement に関する議論][hmr]で、React Fast Refresh の制限と一般的な問題の回避策について詳しくご覧ください。

##### HDR: すべてのコード変更で HDR がトリガーされる

ホットデータ再検証は、各ローダーをバンドルし、そのコンテンツのフィンガープリントを作成することで、ローダーの変更を検出します。
ツリーシェイクを使用して、変更が各ローダーに影響するかどうかの判断を行います。

ツリーシェイクがローダーの変更を確実に検出できるようにするには、アプリのパッケージが副作用がないことを宣言する必要があります。

```json filename=package.json
{
  "sideEffects": false
}
```

##### HDR: ローダーデータが削除されたときの無害なコンソールエラー

ローダーを削除したり、そのローダーが返すデータを削除したりすると、アプリは正しくホットアップデートされるはずです。
しかし、ブラウザにコンソールエラーが記録されている場合があります。

React の strict モードと React Suspense は、ホットアップデートが適用されるときに複数のレンダリングを引き起こす可能性があります。
これらのレンダリングのほとんどは、最終的なレンダリング（あなたに表示されるレンダリング）を含む、正しくレンダリングされます。
しかし、中間レンダリングでは、新しいローダーデータと古い React コンポーネントを組み合わせる場合があり、これがエラーの原因となります。

根本的な競合状態を調査して、これを解消できるかどうかを調べています。
今のところ、これらのコンソールエラーが気になる場合は、エラーが発生するたびにページをリフレッシュしてください。

##### HDR: パフォーマンス

Remix コンパイラがアプリをビルド（および再ビルド）すると、コンパイラが各ローダーの依存関係をクロールする必要があるため、わずかに速度が低下することがあります。
これにより、Remix は再ビルド時にローダーの変更を検出できます。

初期のビルドの速度低下は、本質的に HDR のコストですが、HDR の再ビルドの速度低下が認識できるレベルにならないように、再ビルドを最適化する予定です。

[hmr_and_hdr]: https://www.youtube.com/watch?v=2c2OeqOX72s
[mental_model]: https://www.youtube.com/watch?v=zTrjaUt9hLo
[migrating]: https://www.youtube.com/watch?v=6jTL8GGbIuc
[legendary_dx]: https://www.youtube.com/watch?v=79M4vYZi-po
[loader]: ../route/loader
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[watch_paths]: ../file-conventions/remix-config#watchpaths
[react_keys]: https://react.dev/learn/rendering-lists#why-does-react-need-keys
[use_loader_data]: ../hooks/use-loader-data
[react_refresh]: https://github.com/facebook/react/tree/main/packages/react-refresh
[msw]: https://mswjs.io
[path_imports]: https://mui.com/material-ui/guides/minimizing-bundle-size/#option-one-use-path-imports
[bundle_analysis]: ../guides/performance
[manual_mode]: ../guides/manual-mode
[hmr]: ../discussion/hot-module-replacement
[remix-vite]: ../guides/vite
[classic-remix-compiler]: ../guides/vite#classic-remix-compiler-vs-remix-vite


