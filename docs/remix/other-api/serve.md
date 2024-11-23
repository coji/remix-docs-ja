---
title: "@remix-run/serve"
order: 3
---

# Remixアプリサーバー

Remixはサーバーを自分で管理することを想定していますが、サーバーをセットアップしたくない場合は、代わりにRemixアプリサーバーを使用できます。これは、Expressを使用して構築された、本番環境対応のシンプルなNode.jsサーバーです。

設計上、Remixアプリサーバーをカスタマイズするためのオプションは提供していません。基盤となる`express`サーバーをカスタマイズする必要がある場合は、すべての可能なカスタマイズを処理するための抽象化を作成するのではなく、サーバーを完全に自分で管理することをお勧めします。カスタマイズが必要な場合は、代わりに`@remix-run/express`アダプターを使用してください。

基盤となる`express`サーバーの設定は、[packages/remix-serve/cli.ts][remix-serve-code]で確認できます。デフォルトでは、以下のExpressミドルウェアを使用します（デフォルトの動作については、それぞれのドキュメントを参照してください）。

- [`compression`][compression]
- [`express.static`][express-static]（および[`serve-static`][serve-static]）
- [`morgan`][morgan]

## `HOST`環境変数

`process.env.HOST`でExpressアプリのホスト名を構成でき、その値はサーバー起動時に内部の[`app.listen`][express-listen]メソッドに渡されます。

```shellscript nonumber
HOST=127.0.0.1 npx remix-serve build/index.js
```

```shellscript nonumber
remix-serve <server-build-path>
# 例：
remix-serve build/index.js
```

## `PORT`環境変数

環境変数を使用してサーバーのポートを変更できます。

```shellscript nonumber
PORT=4000 npx remix-serve build/index.js
```

## 開発環境

`process.env.NODE_ENV`に応じて、サーバーは開発モードまたは本番モードで起動します。

`server-build-path`は、`remix.config.js`で定義された`serverBuildPath`を指している必要があります。

本番環境にデプロイする必要があるのはビルドアーティファクト(`build/`、`public/build/`)のみであるため、`remix.config.js`は本番環境で必ずしも使用できるとは限りません。そのため、このオプションを使用してRemixにサーバービルドの場所を指示する必要があります。

開発環境では、`remix-serve`は、すべてのリクエストごとに`require`キャッシュをパージすることで、最新のコードが実行されるようにします。これにより、コードにいくつかの影響があります。注意が必要な場合があります。

- モジュールのスコープ内の値は「リセット」されます。

  ```tsx lines=[1-3]
  // モジュールキャッシュがクリアされ、これが新しくrequireされるため、これはリクエストごとにリセットされます。
  const cache = new Map();

  export async function loader({
    params,
  }: LoaderFunctionArgs) {
    if (cache.has(params.foo)) {
      return json(cache.get(params.foo));
    }

    const record = await fakeDb.stuff.find(params.foo);
    cache.set(params.foo, record);
    return json(record);
  }
  ```

  開発環境でキャッシュを保持するための回避策が必要な場合は、サーバーに[シングルトン][singleton]を設定できます。

- すべての**モジュールの副作用**はそのまま残ります！これにより問題が発生する可能性がありますが、とにかく避けるべきです。

  ```tsx lines=[3-6]
  import { json } from "@remix-run/node"; // または cloudflare/deno

  // モジュールがインポートされた時点で実行が開始されます。
  setInterval(() => {
    console.log(Date.now());
  }, 1000);

  export async function loader() {
    // ...
  }
  ```

  このタイプのモジュールの副作用を持つコードを作成する必要がある場合は、独自の[@remix-run/express][remix-run-express]サーバーと、pm2-devやnodemonなどの開発ツールを設定して、ファイルの変更時にサーバーを再起動する必要があります。

本番環境ではこれは発生しません。サーバーは起動し、それで終わりです。

[remix-run-express]: ./adapter#createrequesthandler
[singleton]: ../guides/manual-mode#keeping-in-memory-server-state-across-rebuilds
[express-listen]: https://expressjs.com/en/api.html#app.listen
[remix-serve-code]: https://github.com/remix-run/remix/blob/main/packages/remix-serve/cli.ts
[compression]: https://expressjs.com/en/resources/middleware/compression.html
[express-static]: https://expressjs.com/en/4x/api.html#express.static
[serve-static]: https://expressjs.com/en/resources/middleware/serve-static.html
[morgan]: https://expressjs.com/en/resources/middleware/morgan.html

