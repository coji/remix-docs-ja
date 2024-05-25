---
title: 手動開発サーバー
---

# 手動モード

<docs-warning>このガイドは、[従来の Remix コンパイラ][classic-remix-compiler] を使用する場合にのみ関連します。</docs-warning>

デフォルトでは、`remix dev` は自動運転のように動作します。
アプリコード内のファイルの変更が検出されるたびにアプリサーバーを自動的に再起動することで、アプリサーバーを最新のコード変更と同期状態に保ちます。
これは、邪魔にならず、ほとんどのアプリでうまく機能すると考えられるシンプルなアプローチです。

しかし、アプリサーバーの再起動が遅くなっている場合は、ハンドルを握って `remix dev` を手動で運転することができます。

```shellscript nonumber
remix dev --manual -c "node ./server.js"
```

つまり、クラッチを使ってギアを変える方法を学ぶ必要があるということです。
また、方向感覚を失うとエンストすることもあります。
学習には少し時間がかかり、維持するコードも増えます。

> 偉大な力には偉大な責任が伴う。

デフォルトの自動モードで何かしらの問題が発生していない限り、これを行う価値はないと考えています。
しかし、問題が発生している場合は、Remix が対応します。

## `remix dev` のメンタルモデル

ドラッグレースを始める前に、Remix がどのように動作するかを理解しておくと役立ちます。
特に重要なのは、`remix dev` が _1 つではなく 2 つのプロセス_、つまり Remix コンパイラとアプリサーバーを起動することです。

詳細については、動画「新しい開発フローのメンタルモデル 🧠」[mental_model] をご覧ください。

<docs-info>

以前は、Remix コンパイラを「新しい開発サーバー」または「v2 開発サーバー」と呼んでいました。
技術的には、`remix dev` は Remix コンパイラの薄いレイヤーであり、ホットアップデートを調整するための単一のエンドポイント (`/ping`) を持つ小さなサーバーが含まれています。
しかし、`remix dev` を「開発サーバー」と考えるのは役に立たず、開発中のアプリサーバーを置き換えていると誤解される可能性があります。
`remix dev` はアプリサーバーを置き換えるのではなく、_Remix コンパイラと共に_ アプリサーバーを実行するため、両方の長所を兼ね備えています。

- Remix コンパイラによって管理されるホットアップデート
- アプリサーバー内で開発中に実行される実際の運用コードパス

</docs-info>

## `remix-serve`

Remix App Server (`remix-serve`) には、手動モードが標準でサポートされています。

```sh
remix dev --manual
```

<docs-info>

`-c` フラグなしで `remix dev` を実行している場合は、暗黙的に `remix-serve` をアプリサーバーとして使用しています。

</docs-info>

`remix-serve` には、より高い RPM でより積極的に自動的にギアをシフトする、組み込みのスポーツモードがあるため、マニュアルの運転を学ぶ必要はありません。
ええ、この車のメタファーを伸ばしすぎていると思います。😅

言い換えれば、`remix-serve` は、サーバーコードの変更を再インポートする方法を知っており、_自身を再起動する必要はありません_。
しかし、`-c` を使用して独自のアプリサーバーを実行している場合は、読み進めてください。

## マニュアルの運転を学ぶ

`--manual` で手動モードに切り替えると、新しい責任を負うことになります。

1. サーバーコードの変更が利用可能になったときに検出する
2. アプリサーバーを稼働させたままコード変更を再インポートする
3. それらの変更が反映された _後_ に Remix コンパイラに「準備完了」メッセージを送信する

再インポートするコードの変更は、JS インポートがキャッシュされるため、実際には難しいことが判明しました。

```js
import fs from "node:fs";

const original = await import("./build/index.js");
fs.writeFileSync("./build/index.js", someCode);
const changed = await import("./build/index.js");
//    ^^^^^^^ これにより、コードの変更が反映されていない、インポートキャッシュからの元のモジュールが返されます
```

コードの変更を伴うモジュールを再インポートする際には、インポートキャッシュをクリアする必要があります。
また、モジュールのインポートは、CommonJS (`require`) と ESM (`import`) で異なるため、さらに複雑になります。

<docs-warning>

`tsx` または `ts-node` を使用して `server.ts` を実行している場合は、これらのツールが ESM タイプスクリプトコードを CJS JavaScript コードに変換している可能性があります。
この場合、サーバーコードの残りの部分が `import` を使用していても、`server.ts` で CJS キャッシュクリアを使用する必要があります。

ここでは、サーバーコードが _どのように実行されるか_ が重要であり、_どのように記述されるか_ は重要ではありません。

</docs-warning>

### 1.a CJS: `require` キャッシュクリア

CommonJS はインポートに `require` を使用しており、`require` キャッシュに直接アクセスできます。
これにより、再構築時にサーバーコードのキャッシュのみをクリアできます。

たとえば、Remix サーバービルドの `require` キャッシュをクリアする方法は次のとおりです。

```js
const path = require("node:path");

/** @typedef {import('@remix-run/node').ServerBuild} ServerBuild */

const BUILD_PATH = path.resolve("./build/index.js");
const VERSION_PATH = path.resolve("./build/version.txt");
const initialBuild = reimportServer();

/**
 * @returns {ServerBuild}
 */
function reimportServer() {
  // 1. 手動でサーバービルドを `require` キャッシュから削除する
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(BUILD_PATH)) {
      delete require.cache[key];
    }
  });

  // 2. サーバービルドを再インポートする
  return require(BUILD_PATH);
}
```

<docs-info>

`require` キャッシュキーは _絶対パス_ なので、サーバービルドパスを絶対パスに解決してください！

</docs-info>

### 1.b ESM: `import` キャッシュクリア

CJS とは異なり、ESM はインポートキャッシュへの直接アクセスを提供しません。
この問題を回避するために、タイムスタンプクエリパラメーターを使用して、ESM にインポートを新しいモジュールとして扱うように指示することができます。

```js
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

/** @typedef {import('@remix-run/node').ServerBuild} ServerBuild */

const BUILD_PATH = path.resolve("./build/index.js");
const VERSION_PATH = path.resolve("./build/version.txt");
const initialBuild = await reimportServer();

/**
 * @returns {Promise<ServerBuild>}
 */
async function reimportServer() {
  const stat = fs.statSync(BUILD_PATH);

  // Windows での動的 `import` との互換性のために、ビルドパスを URL に変換する
  const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

  // タイムスタンプクエリパラメーターを使用して、インポートキャッシュをクリアする
  return import(BUILD_URL + "?t=" + stat.mtimeMs);
}
```

<docs-warning>

ESM では、`import` キャッシュからエントリを削除する方法はありません。
タイムスタンプの回避策は有効ですが、`import` キャッシュが時間の経過とともに大きくなり、最終的にメモリ不足エラーが発生する可能性があります。

この問題が発生した場合は、`remix dev` を再起動して、インポートキャッシュをリフレッシュすることができます。
将来的には、Remix で依存関係を事前にバンドルして、インポートキャッシュを小さくすることができるようになるかもしれません。

</docs-warning>

### 2. サーバーコードの変更を検出する

CJS または ESM のインポートキャッシュをクリアする方法がわかったところで、アプリサーバー内でサーバービルドを動的に更新してみましょう。
サーバーコードの変更を検出するには、[chokidar][chokidar] などのファイルウォッチャーを使用することができます。

```js
import chokidar from "chokidar";

async function handleServerUpdate() {
  build = await reimportServer();
}

chokidar
  .watch(VERSION_PATH, { ignoreInitial: true })
  .on("add", handleServerUpdate)
  .on("change", handleServerUpdate);
```

### 3. 「準備完了」メッセージを送信する

アプリサーバーが最初に起動したときに、Remix コンパイラに「準備完了」メッセージを送信しているかどうかを確認する必要があります。

```js filename=server.js lines=[5-7]
const port = 3000;
app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(initialBuild);
  }
});
```

手動モードでは、サーバービルドを再インポートするたびに、「準備完了」メッセージを送信する必要があります。

```js lines=[4-5]
async function handleServerUpdate() {
  // 1. サーバービルドを再インポートする
  build = await reimportServer();
  // 2. Remix に、このアプリサーバーが最新の状態であり、準備が整っていることを伝える
  broadcastDevReady(build);
}
```

### 4. 開発対応の要求ハンドラー

最後に、これらをすべて開発モードの要求ハンドラーにまとめます。

```js
/**
 * @param {ServerBuild} initialBuild
 */
function createDevRequestHandler(initialBuild) {
  let build = initialBuild;
  async function handleServerUpdate() {
    // 1. サーバービルドを再インポートする
    build = await reimportServer();
    // 2. Remix に、このアプリサーバーが最新の状態であり、準備が整っていることを伝える
    broadcastDevReady(build);
  }

  chokidar
    .watch(VERSION_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  // すべての要求に対して、最新のビルドを使用して再作成されるように、要求ハンドラーをラップする
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
```

素晴らしい！
これで、開発モードで実行するときに、新しいマニュアルトランスミッションを接続できます。

```js filename=server.js
app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler(initialBuild)
    : createRequestHandler({ build: initialBuild })
);
```

アプリサーバーコードの完全な例については、[テンプレート][templates] または [コミュニティの例][community_examples] をご覧ください。

## 再構築間でメモリ内のサーバー状態を保持する

サーバーコードを再インポートすると、サーバー側のメモリ内状態がすべて失われます。
これには、データベース接続、キャッシュ、メモリ内データ構造などが含まれます。

再構築間で保持する必要があるメモリ内値を記憶するためのユーティリティを以下に示します。

```ts filename=app/utils/singleton.server.ts
// https://github.com/jenseng/abuse-the-platform/blob/main/app/utils/singleton.ts から借りて修正しました
// @jenseng ありがとうございます！

export const singleton = <Value>(
  name: string,
  valueFactory: () => Value
): Value => {
  const g = global as any;
  g.__singletons ??= {};
  g.__singletons[name] ??= valueFactory();
  return g.__singletons[name];
};
```

たとえば、再構築間で Prisma クライアントを再利用するには、次のようにします。

```ts filename=app/db.server.ts
import { PrismaClient } from "@prisma/client";

import { singleton } from "~/utils/singleton.server";

// このモジュールが再インポートされたときにクライアントを検索できるように、一意のキーをハードコードする
export const db = singleton(
  "prisma",
  () => new PrismaClient()
);
```

[`remember` ユーティリティ][remember] を使用したい場合は、これにも役立ちます。

[mental_model]: https://www.youtube.com/watch?v=zTrjaUt9hLo
[chokidar]: https://github.com/paulmillr/chokidar
[templates]: https://github.com/remix-run/remix/blob/main/templates
[community_examples]: https://github.com/xHomu/remix-v2-server
[remember]: https://npm.im/@epic-web/remember
[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite


