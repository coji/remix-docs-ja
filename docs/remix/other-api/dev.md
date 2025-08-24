---
title: "@remix-run/dev CLI"
order: 2
new: true
---

# Remix CLI

Remix CLIは、`@remix-run/dev` パッケージに含まれています。また、コンパイラも含まれています。サーバーにデプロイされないように、`package.json` の `devDependencies` に含まれていることを確認してください。

利用可能なコマンドとフラグの完全なリストを取得するには、以下を実行してください。

```shellscript nonumber
npx @remix-run/dev -h
```

## `remix vite:build`

[Remix Vite][remix-vite] を使用して、本番環境向けにアプリをビルドします。このコマンドは `process.env.NODE_ENV` を `production` に設定し、デプロイ用にアウトプットを最小化します。

```shellscript nonumber
remix vite:build
```

| フラグ                  | 説明                                                               | タイプ                                                | デフォルト     |
| --------------------- | ------------------------------------------------------------------ | --------------------------------------------------- | ----------- |
| `--assetsInlineLimit` | 静的アセットの base64 インライン化の閾値（バイト単位）               | `number`                                            | `4096`      |
| `--clearScreen`       | ログ出力時に画面をクリアするかどうか                                 | `boolean`                                           |             |
| `--config`, `-c`      | 指定された設定ファイルを使用                                         | `string`                                            |             |
| `--emptyOutDir`       | `root` の外にある `outDir` を強制的に空にする                         | `boolean`                                           |             |
| `--logLevel`, `-l`    | 指定されたログレベルを使用                                           | `"info" \| "warn" \| "error" \| "silent" \| string` |             |
| `--minify`            | 最小化を有効/無効にするか、使用する最小化ツールを指定する             | `boolean \| "terser" \| "esbuild"`                  | `"esbuild"` |
| `--mode`, `-m`        | 環境モードを設定する                                                 | `string`                                            |             |
| `--profile`           | ビルトインの Node.js インスペクターを開始する                         |                                                     |             |
| `--sourcemapClient`   | クライアントビルドのソースマップを出力する                           | `boolean \| "inline" \| "hidden"`                   | `false`     |
| `--sourcemapServer`   | サーバービルドのソースマップを出力する                               | `boolean \| "inline" \| "hidden"`                   | `false`     |

[remix-vite]: https://github.com/remix-run/remix/tree/main/packages/remix-vite

## `remix vite:dev`

[Remix Vite][remix-vite] を使用して、開発モードでアプリを実行します。

```shellscript nonumber
remix vite:dev
```

| フラグ               | 説明                                                    | タイプ                                                | デフォルト |
| ------------------ | ------------------------------------------------------- | --------------------------------------------------- | ------- |
| `--clearScreen`    | ログ出力時に画面をクリアするかどうかを許可/禁止します。 | `boolean`                                           |         |
| `--config`, `-c`   | 指定された設定ファイルを使用します。                    | `string`                                            |         |
| `--cors`           | CORS を有効にします。                                   | `boolean`                                           |         |
| `--force`          | オプティマイザーにキャッシュを無視させ、再バンドルさせます。 | `boolean`                                           |         |
| `--host`           | ホスト名を指定します。                                  | `string`                                            |         |
| `--logLevel`, `-l` | 指定されたログレベルを使用します。                      | `"info" \| "warn" \| "error" \| "silent" \| string` |         |
| `--mode`, `-m`     | 環境モードを設定します。                                | `string`                                            |         |
| `--open`           | 起動時にブラウザを開きます。                            | `boolean \| string`                                 |         |
| `--port`           | ポートを指定します。                                    | `number`                                            |         |
| `--profile`        | 組み込みの Node.js インスペクターを起動します。           |                                                     |         |
| `--strictPort`     | 指定されたポートが既に使用中の場合、終了します。        | `boolean`                                           |         |

## Classic Remix Compiler Commands

<docs-warning>[クラシック Remix コンパイラ][classic-remix-compiler] を使用している場合にのみ、このドキュメントは関連します。</docs-warning>

### `remix build`

[Classic Remix Compiler][classic-remix-compiler] を使用して、本番環境向けにアプリをビルドします。このコマンドは `process.env.NODE_ENV` を `production` に設定し、デプロイ用にアウトプットをminifyします。

```shellscript nonumber
remix build
```

#### オプション

| オプション                                   | フラグ          | 設定 | デフォルト |
| ---------------------------------------- | ------------- | ------ | ------- |
| 本番ビルド用のソースマップを生成する | `--sourcemap` | N/A    | `false` |

## `remix dev`

[Classic Remix Compiler][classic-remix-compiler] を監視モードで実行し、アプリサーバーを起動します。

Remix コンパイラは以下を行います。

1. `NODE_ENV` を `development` に設定
2. アプリコードの変更を監視し、リビルドをトリガー
3. リビルドが成功するたびにアプリサーバーを再起動
4. Live Reload および HMR + Hot Data Revalidation を介してコード更新をブラウザに送信

🎥 Remix における HMR と HDR の紹介と詳細については、以下の動画をご覧ください。

* [HMR and Hot Data Revalidation 🔥][hmr_and_hdr]
* [Mental model for the new dev flow 🧠][mental_model]
* [Migrating your project to v2 dev flow 🚚][migrating]

<docs-info>

「Hot Data Revalidation」とは？

HMR と同様に、HDR はページをリフレッシュする必要なくアプリをホットアップデートする方法です。
これにより、アプリで編集が適用される際にアプリの状態を維持できます。
HMR は、アプリのコンポーネント、マークアップ、スタイルを変更した場合など、クライアント側のコード更新を処理します。
同様に、HDR はサーバー側のコード更新を処理します。

つまり、現在のページの [`loader`][loader] (または `loader` が依存するコード) を変更するたびに、Remix は変更されたローダーからデータを再フェッチします。
これにより、アプリはクライアント側またはサーバー側の最新のコード変更で *常に* 最新の状態になります。

HMR と HDR がどのように連携するかについて詳しくは、[Remix Conf 2023 での Pedro の講演][legendary_dx] をご覧ください。

</docs-info>

#### カスタムアプリサーバーを使用する場合

テンプレートを使用して開始した場合、うまくいけば `remix dev` とすぐに統合されているはずです。
そうでない場合は、以下の手順に従ってプロジェクトを `remix dev` と統合できます。

1. `package.json` の開発スクリプトを置き換え、`-c` を使用してアプリサーバーのコマンドを指定します。

   ```json filename=package.json
   {
     "scripts": {
       "dev": "remix dev -c \"node ./server.js\""
     }
   }
   ```

2. アプリサーバーが起動して実行されたときに `broadcastDevReady` が呼び出されるようにします。

   ```ts filename=server.ts lines=[12,25-27]
   import path from "node:path";

   import { broadcastDevReady } from "@remix-run/node";
   import express from "express";

   const BUILD_DIR = path.resolve(__dirname, "build");
   const build = require(BUILD_DIR);

   const app = express();

   // ... express アプリをセットアップするためのコードはここに記述します ...

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

   なぜでしょうか？ `broadcastDevReady` は、[`fetch`][fetch] を使用して Remix コンパイラに準備完了メッセージを送信しますが、
   CloudFlare はリクエスト処理の外部で `fetch` のような非同期 I/O をサポートしていません。

   </docs-info>

#### オプション

オプションの優先順位は、1. フラグ、2. 設定、3. デフォルトです。

| オプション          | フラグ               | 設定    | デフォルト                           | 説明                                                     |
| --------------- | ------------------ | --------- | --------------------------------- | -------------------------------------------------------- |
| コマンド         | `-c` / `--command` | `command` | `remix-serve <サーバービルドパス>` | アプリサーバーを実行するために使用されるコマンド                      |
| 手動          | `--manual`         | `manual`  | `false`                           | [手動モードのガイド][manual_mode]を参照してください                 |
| ポート            | `--port`           | `port`    | 動的に選択されるオープンポート      | ホットアップデートのためにRemixコンパイラーが使用する内部ポート |
| TLSキー         | `--tls-key`        | `tlsKey`  | N/A                               | ローカルHTTPSを構成するためのTLSキー                      |
| TLS証明書 | `--tls-cert`       | `tlsCert` | N/A                               | ローカルHTTPSを構成するためのTLS証明書              |

例：

```js filename=remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  dev: {
    // ...ここに設定したい他のオプションを記述...
    manual: true,
    tlsKey: "./key.pem",
    tlsCert: "./cert.pem",
  },
};
```

#### カスタムポートの設定

`remix dev --port` オプションは、ホットアップデートに使用される内部ポートを設定します。
**これは、アプリが実行されるポートには影響しません。**

アプリのサーバーポートを設定するには、通常の本番環境と同じ方法で設定します。
たとえば、`server.js` ファイルにハードコードされている場合があります。

アプリサーバーとして `remix-serve` を使用している場合は、`--port` フラグを使用してアプリサーバーのポートを設定できます。

```shellscript nonumber
remix dev -c "remix-serve --port 8000 ./build/index.js"
```

対照的に、`remix dev --port` オプションは、ネットワークポートを細かく制御する必要があるユーザー向けの緊急脱出ハッチです。
ほとんどのユーザーは、`remix dev --port` を使用する必要はありません。

#### マニュアルモード

デフォルトでは、`remix dev` はリビルドが発生するたびにアプリサーバーを再起動します。
リビルド時にアプリサーバーを再起動せずに実行し続けたい場合は、[マニュアルモードのガイド][manual_mode]をご覧ください。

`remix dev` によって報告される時間を比較することで、アプリサーバーの再起動がプロジェクトのボトルネックになっているかどうかを確認できます。

* `rebuilt (Xms)` 👉 Remix コンパイラがアプリのリビルドに `X` ミリ秒かかったことを示します。
* `app server ready (Yms)` 👉 Remix がアプリサーバーを再起動し、新しいコード変更で起動するのに `Y` ミリ秒かかったことを示します。

[manual_mode]: https://remix.run/docs/en/main/guides/manual-mode

#### 他のパッケージからの変更を拾う

モノレポを使用している場合、Remix にアプリのコードが変更されたときだけでなく、アプリの依存関係のいずれかのコードを変更したときにもホットアップデートを実行させたい場合があります。

たとえば、Remix アプリ (`packages/app`) 内で使用される UI ライブラリパッケージ (`packages/ui`) があるとします。
`packages/ui` の変更を拾うには、[watchPaths][watch_paths] を設定してパッケージを含めることができます。

[watch_paths]: https://remix.run/docs/en/main/file-conventions/remix-config#watchpaths

#### MSW のセットアップ方法

開発環境で [Mock Service Worker][msw] を使用するには、次の手順が必要です。

1. アプリケーションサーバーの一部として MSW を実行する
2. Remix コンパイラーへの内部 "dev ready" メッセージをモックしないように MSW を構成する

`-c` フラグ内で *アプリケーションサーバー* のモックをセットアップしていることを確認してください。これにより、`REMIX_DEV_ORIGIN` 環境変数がモックで利用可能になります。
たとえば、`remix-serve` を実行するときに、Node の `--require` フラグを設定するために `NODE_OPTIONS` を使用できます。

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

次に、`REMIX_DEV_ORIGIN` を使用して、`/ping` 上の内部 "dev ready" メッセージを MSW に転送させることができます。

```ts
import { http, passthrough } from "msw";

const REMIX_DEV_PING = new URL(
  process.env.REMIX_DEV_ORIGIN
);
REMIX_DEV_PING.pathname = "/ping";

export const server = setupServer(
  http.post(REMIX_DEV_PING.href, () => passthrough())
  // ... 他のリクエストハンドラーはここに ...
);
```

#### リバースプロキシとの統合方法

アプリサーバーとRemixコンパイラが同じマシン上で実行されているとしましょう。

* アプリサーバー 👉 `http://localhost:1234`
* Remixコンパイラ 👉 `http://localhost:5678`

次に、アプリサーバーの前にリバースプロキシを設定します。

* リバースプロキシ 👉 `https://myhost`

しかし、ホットアップデートをサポートするための内部HTTPおよびWebSocket接続は、依然としてRemixコンパイラのプロキシされていないオリジンに接続しようとします。

* ホットアップデート 👉 `http://localhost:5678` / `ws://localhost:5678` ❌

内部接続をリバースプロキシに向けるには、`REMIX_DEV_ORIGIN` 環境変数を使用できます。

```shellscript nonumber
REMIX_DEV_ORIGIN=https://myhost remix dev
```

これで、ホットアップデートは正しくプロキシに送信されます。

* ホットアップデート 👉 `https://myhost` / `wss://myhost` ✅

#### パフォーマンスチューニングとデバッグ

##### パスインポート

現在、Remixがアプリをリビルドする際、コンパイラはアプリのコードと依存関係にあるすべてのコードを処理する必要があります。
コンパイラは、未使用のコードをアプリからツリーシェイクして、未使用のコードがブラウザに送信されないようにし、サーバーをできるだけスリムに保ちます。
しかし、コンパイラは、何を保持し、何をツリーシェイクするかを知るために、すべてのコードを*クロール*する必要があります。

つまり、インポートとエクスポートの方法は、アプリのリビルドにかかる時間に大きな影響を与える可能性があります。
たとえば、Material UIやAntDのようなライブラリを使用している場合、[パスインポート][path_imports]を使用することでビルドを高速化できる可能性があります。

```diff
- import { Button, TextField } from '@mui/material';
+ import Button from '@mui/material/Button';
+ import TextField from '@mui/material/TextField';
```

将来的には、Remixは開発中に依存関係を事前にバンドルして、この問題を完全に回避できる可能性があります。
しかし、現時点では、パスインポートを使用することでコンパイラを助けることができます。

[path_imports]: https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping

##### バンドルのデバッグ

アプリと依存関係によっては、アプリに必要なコードよりもはるかに多くのコードを処理している可能性があります。
詳細については、[バンドル分析ガイド][bundle_analysis]をご覧ください。

[bundle_analysis]: ../guides/performance

#### トラブルシューティング

##### HMR

ホットアップデートを期待しているのに、ページ全体のリロードが発生する場合は、
[ホットモジュールリプレースメントに関する議論][hmr]を参照して、React Fast Refreshの制限事項や、一般的な問題の回避策について詳しく学んでください。

##### HDR: すべてのコード変更がHDRをトリガーする

ホットデータ再検証（Hot Data Revalidation: HDR）は、各ローダーをバンドルし、それぞれのコンテンツのフィンガープリントを作成することで、ローダーの変更を検出します。
これは、ツリーシェイキングを利用して、変更が各ローダーに影響を与えるかどうかを判断します。

ツリーシェイキングがローダーへの変更を確実に検出できるようにするには、アプリのパッケージが副作用がないことを宣言してください。

```json filename=package.json
{
  "sideEffects": false
}
```

##### HDR: ローダーデータ削除時の無害なコンソールエラー

ローダーを削除したり、そのローダーから返されるデータの一部を削除したりすると、アプリは正しくホットアップデートされるはずです。
しかし、ブラウザにコンソールエラーが記録されることに気づくかもしれません。

React の strict-mode と React Suspense は、ホットアップデートが適用されると複数回のレンダリングを引き起こす可能性があります。
これらのレンダリングのほとんどは、表示される最終的なレンダリングを含め、正しく行われます。
しかし、中間的なレンダリングでは、新しいローダーデータが古い React コンポーネントで使用されることがあり、それがエラーの原因となります。

この根本的な競合状態を調査し、改善できるかどうかを検討しています。
それまでの間、これらのコンソールエラーが気になる場合は、エラーが発生するたびにページをリフレッシュしてください。

##### HDR: パフォーマンス

Remixコンパイラがアプリをビルド（およびリビルド）する際、コンパイラが各ローダーの依存関係をクロールする必要があるため、わずかな速度低下に気づくかもしれません。
そうすることで、Remixはリビルド時にローダーの変更を検出できます。

初期ビルドの速度低下はHDRのコストとして本質的に発生するものですが、リビルドを最適化して、HDRリビルドで知覚できる速度低下がないようにする予定です。

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
