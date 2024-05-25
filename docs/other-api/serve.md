---
title: "@remix-run/serve"
order: 3
---

# Remix アプリサーバー

Remix は、サーバーを所有することを想定して設計されていますが、サーバーをセットアップしたくない場合は、代わりに Remix アプリサーバーを使用できます。これは、Express で構築された、本番環境対応の、しかし基本的な Node.js サーバーです。カスタマイズしたい場合は、代わりに `@remix-run/express` アダプターを使用してください。

## `HOST` 環境変数

`process.env.HOST` を介して Express アプリのホスト名を構成できます。その値は、サーバーを起動するときに、内部の [`app.listen`][express-listen] メソッドに渡されます。

```shellscript nonumber
HOST=127.0.0.1 npx remix-serve build/index.js
```

```shellscript nonumber
remix-serve <サーバービルドパス>
# 例
remix-serve build/index.js
```

## `PORT` 環境変数

環境変数を使用してサーバーのポートを変更できます。

```shellscript nonumber
PORT=4000 npx remix-serve build/index.js
```

## 開発環境

`process.env.NODE_ENV` によって、サーバーは開発モードまたは本番モードで起動します。

`server-build-path` は、`remix.config.js` で定義されている `serverBuildPath` を指す必要があります。

ビルドアーティファクト (`build/`, `public/build/`) だけを本番環境にデプロイする必要があるため、`remix.config.js` は本番環境では利用できない可能性があります。そのため、このオプションでサーバービルドの場所を Remix に知らせる必要があります。

開発では、`remix-serve` は、各リクエストに対して `require` キャッシュをパージすることで、最新のコードが実行されるようにします。これは、コードに影響を与える可能性があるため、注意が必要です。

- モジュールスコープの値は「リセット」されます。

  ```tsx lines=[1-3]
  // モジュールキャッシュがクリアされ、このファイルが新しく必要になるため、これは各リクエストでリセットされます。
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

  開発中のキャッシュを維持するための回避策として、サーバーに [シングルトン][singleton] を設定できます。

- **モジュールの副作用** はすべてそのまま残ります！これは問題になる可能性がありますが、そもそも回避するべきでしょう。

  ```tsx lines=[3-6]
  import { json } from "@remix-run/node"; // または cloudflare/deno

  // モジュールがインポートされた時点で実行を開始します。
  setInterval(() => {
    console.log(Date.now());
  }, 1000);

  export async function loader() {
    // ...
  }
  ```

  このようなモジュールの副作用を含む方法でコードを記述する必要がある場合は、独自の [@remix-run/express][remix-run-express] サーバーと、pm2-dev や nodemon などの開発用ツールを設定して、ファイルの変更時にサーバーを再起動する必要があります。

本番環境では、これは発生しません。サーバーは起動し、それでおしまいです。

[remix-run-express]: ./adapter#createrequesthandler
[singleton]: ../guides/manual-mode#keeping-in-memory-server-state-across-rebuilds
[express-listen]: https://expressjs.com/en/api.html#app.listen


