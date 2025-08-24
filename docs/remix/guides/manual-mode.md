---
title: Manual Dev Server
---

# マニュアルモード

<docs-warning>このガイドは、[Classic Remix Compiler][classic-remix-compiler] を使用している場合にのみ関連します。</docs-warning>

デフォルトでは、`remix dev` はオートマチック車のように動作します。
アプリのコードでファイルの変更が検出されるたびに、アプリサーバーを自動的に再起動することで、アプリサーバーを最新のコード変更に追従させます。
これは、邪魔にならないシンプルなアプローチであり、ほとんどのアプリでうまく機能すると考えています。

しかし、アプリサーバーの再起動が遅く感じられる場合は、ハンドルを握って `remix dev` をマニュアル車のように操作できます。

```shellscript nonumber
remix dev --manual -c "node ./server.js"
```

つまり、ギアチェンジのためにクラッチの使い方を学ぶ必要があります。
また、慣れるまではエンストするかもしれません。
習得には少し時間がかかり、メンテナンスするコードも増えます。

> 大いなる力には、大いなる責任が伴います。

デフォルトのオートマチックモードで何らかの不便さを感じない限り、それだけの価値はないと考えています。
しかし、もしそうであれば、Remix が対応します。

## `remix dev` のメンタルモデル

ドラッグレースを始める前に、Remix が内部でどのように動作するかを理解しておくと役立ちます。
特に、`remix dev` が *1つではなく、2つのプロセス* を起動することを理解することが重要です。それは、Remix コンパイラとあなたのアプリサーバーです。

詳細については、私たちのビデオ ["新しい開発フローのメンタルモデル 🧠"][mental_model] をご覧ください。

<docs-info>

以前は、Remix コンパイラを「新しい開発サーバー」または「v2 開発サーバー」と呼んでいました。
技術的には、`remix dev` は、ホットアップデートを調整するための単一のエンドポイント (`/ping`) を持つ小さなサーバーを含む Remix コンパイラの薄いレイヤーです。
しかし、`remix dev` を「開発サーバー」と考えるのは役に立たず、開発時にアプリサーバーを置き換えているという誤った印象を与えます。
`remix dev` はアプリサーバーを置き換えるのではなく、Remix コンパイラ *と並行して* アプリサーバーを実行するため、両方の長所が得られます。

* Remix コンパイラによって管理されるホットアップデート
* アプリサーバー内で開発中に実行される実際のプロダクションコードパス

</docs-info>

## `remix-serve`

Remixアプリサーバー (`remix-serve`) は、マニュアルモードをすぐにサポートしています。

```sh
remix dev --manual
```

<docs-info>

`-c` フラグなしで `remix dev` を実行している場合、暗黙的に `remix-serve` をアプリサーバーとして使用しています。

</docs-info>

`remix-serve` には、高回転時に自動的にギアをよりアグレッシブにシフトするスポーツモードが組み込まれているため、マニュアル運転を学ぶ必要はありません。
さて、この車の比喩は少し無理があるかもしれません。😅

言い換えれば、`remix-serve` は、自身を再起動することなく、サーバーコードの変更を再インポートする方法を知っています。
ただし、`-c` を使用して独自のアプリサーバーを実行している場合は、読み進めてください。

## マニュアル運転を学ぶ

`--manual` でマニュアルモードをオンにすると、いくつかの新しい責任を負うことになります。

1. サーバーコードの変更が利用可能になったことを検出する
2. アプリケーションサーバーを稼働させたままコードの変更を再インポートする
3. これらの変更が取り込まれた*後*に、Remixコンパイラーに「準備完了」メッセージを送信する

コードの変更を再インポートすることは、JSのインポートがキャッシュされるため、難しいことがわかります。

```js
import fs from "node:fs";

const original = await import("./build/index.js");
fs.writeFileSync("./build/index.js", someCode);
const changed = await import("./build/index.js");
//    ^^^^^^^ これは、コードの変更なしにインポートキャッシュから元のモジュールを返します
```

コードの変更でモジュールを再インポートしたい場合は、インポートキャッシュを破棄する方法が必要です。
また、モジュールのインポートはCommonJS (`require`) とESM (`import`) で異なるため、さらに複雑になります。

<docs-warning>

`server.ts` を実行するために `tsx` または `ts-node` を使用している場合、これらのツールはESM TypescriptコードをCJS Javascriptコードにトランスパイルしている可能性があります。
この場合、サーバーコードの残りの部分が `import` を使用していても、`server.ts` でCJSキャッシュの破棄を使用する必要があります。

ここで重要なのは、サーバーコードがどのように*実行されるか*であり、どのように*記述されるか*ではありません。

</docs-warning>

### 1.a CJS: `require` キャッシュの破棄

CommonJS はインポートに `require` を使用し、`require` キャッシュへの直接アクセスを提供します。これにより、リビルドが発生したときに *サーバーコードのみ* のキャッシュを破棄できます。

たとえば、Remix サーバービルドの `require` キャッシュを破棄する方法は次のとおりです。

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
  // 1. require キャッシュからサーバービルドを手動で削除します
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(BUILD_PATH)) {
      delete require.cache[key];
    }
  });

  // 2. サーバービルドを再インポートします
  return require(BUILD_PATH);
}
```

<docs-info>

`require` キャッシュのキーは *絶対パス* であるため、サーバービルドのパスを絶対パスに解決するようにしてください！

</docs-info>

### 1.b ESM: `import` キャッシュの破棄

CJS とは異なり、ESM ではインポートキャッシュに直接アクセスすることはできません。
この問題を回避するために、タイムスタンプのクエリパラメータを使用して、ESM にインポートを新しいモジュールとして扱うように強制することができます。

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

  // Windows での動的な `import` との互換性のために、ビルドパスを URL に変換します
  const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

  // タイムスタンプのクエリパラメータを使用して、インポートキャッシュを破棄します
  return import(BUILD_URL + "?t=" + stat.mtimeMs);
}
```

<docs-warning>

ESM では、`import` キャッシュからエントリを削除する方法はありません。
タイムスタンプによる回避策は有効ですが、`import` キャッシュが時間とともに増大し、最終的にメモリ不足エラーを引き起こす可能性があります。

この問題が発生した場合は、`remix dev` を再起動して、新しいインポートキャッシュで再開できます。
将来的には、Remix はインポートキャッシュを小さく保つために、依存関係を事前にバンドルする可能性があります。

</docs-warning>

### 2. サーバーコードの変更を検出する

CJSまたはESMのインポートキャッシュを破棄する方法ができたので、それを利用してアプリサーバー内でサーバービルドを動的に更新する時が来ました。
サーバーコードの変更を検出するには、[chokidar][chokidar]のようなファイルウォッチャーを使用できます。

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

### 3. "ready" メッセージの送信

ここで、アプリサーバーが最初に起動したときに、Remixコンパイラに "ready" メッセージを送信していることを再確認する良い機会です。

```js filename=server.js lines=[5-7]
const port = 3000;
app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(initialBuild);
  }
});
```

手動モードでは、サーバービルドを再インポートするたびに "ready" メッセージを送信する必要もあります。

```js lines=[4-5]
async function handleServerUpdate() {
  // 1. サーバービルドを再インポートする
  build = await reimportServer();
  // 2. このアプリサーバーが最新の状態になり、準備ができたことをRemixに伝える
  broadcastDevReady(build);
}
```

### 4. 開発対応リクエストハンドラー

最後のステップは、これらすべてを開発モードのリクエストハンドラーにまとめることです。

```js
/**
 * @param {ServerBuild} initialBuild
 */
function createDevRequestHandler(initialBuild) {
  let build = initialBuild;
  async function handleServerUpdate() {
    // 1. サーバービルドを再インポートする
    build = await reimportServer();
    // 2. このアプリサーバーが最新であり、準備ができたことをRemixに伝える
    broadcastDevReady(build);
  }

  chokidar
    .watch(VERSION_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  // リクエストごとに最新のビルドで再作成されるようにリクエストハンドラーをラップする
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
開発モードで実行するときに、新しいマニュアルトランスミッションをプラグインしましょう。

```js filename=server.js
app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler(initialBuild)
    : createRequestHandler({ build: initialBuild })
);
```

完全なアプリサーバーコードの例については、[テンプレート][templates]または[コミュニティの例][community_examples]を確認してください。

## リビルドをまたいでインメモリのサーバー状態を保持する

サーバーコードが再インポートされると、サーバー側のインメモリ状態はすべて失われます。
これには、データベース接続、キャッシュ、インメモリデータ構造などが含まれます。

リビルドをまたいで保持したいインメモリの値を記憶するユーティリティを以下に示します。

```ts filename=app/utils/singleton.server.ts
// https://github.com/jenseng/abuse-the-platform/blob/main/app/utils/singleton.ts から借用・修正
// @jenseng に感謝！

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

たとえば、リビルドをまたいで Prisma クライアントを再利用するには、次のようにします。

```ts filename=app/db.server.ts
import { PrismaClient } from "@prisma/client";

import { singleton } from "~/utils/singleton.server";

// このモジュールが再インポートされたときにクライアントを検索できるように、一意のキーをハードコードします
export const db = singleton(
  "prisma",
  () => new PrismaClient()
);
```

また、[`remember` ユーティリティ][remember] も便利で、こちらを使用することもできます。

[mental_model]: https://www.youtube.com/watch?v=zTrjaUt9hLo

[chokidar]: https://github.com/paulmillr/chokidar

[templates]: https://github.com/remix-run/remix/blob/main/templates

[community_examples]: https://github.com/xHomu/remix-v2-server

[remember]: https://npm.im/@epic-web/remember

[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite
