---
title: "@remix-run/serve"
order: 3
---

# Remix アプリケーションサーバー

Remix は、ユーザーが自身のサーバーを所有することを想定して設計されていますが、サーバーをセットアップしたくない場合は、代わりに Remix アプリケーションサーバーを使用できます。これは、Express で構築された、本番環境に対応した基本的な Node.js サーバーです。

設計上、Remix アプリケーションサーバーをカスタマイズするためのオプションは提供していません。これは、基盤となる `express` サーバーをカスタマイズする必要がある場合は、考えられるすべてのカスタマイズを処理するための抽象化を作成するのではなく、サーバーを完全に管理していただきたいからです。カスタマイズが必要な場合は、代わりに `@remix-run/express` アダプターを使用する必要があります。

基盤となる `express` サーバーの構成は、[packages/remix-serve/cli.ts][remix-serve-code] で確認できます。デフォルトでは、次の Express ミドルウェアを使用します（デフォルトの動作については、それぞれのドキュメントを参照してください）。

- [`compression`][compression]
- [`express.static`][express-static] (したがって [`serve-static`][serve-static])
- [`morgan`][morgan]

## `HOST` 環境変数

`process.env.HOST` を介して Express アプリケーションのホスト名を構成できます。この値は、サーバーの起動時に内部の [`app.listen`][express-listen] メソッドに渡されます。

```shellscript nonumber
HOST=127.0.0.1 npx remix-serve build/index.js
```

```shellscript nonumber
remix-serve <server-build-path>
# 例
remix-serve build/index.js
```

## `PORT` 環境変数

環境変数を使用してサーバーのポートを変更できます。

```shellscript nonumber
PORT=4000 npx remix-serve build/index.js
```

## 開発環境

`process.env.NODE_ENV` に応じて、サーバーは開発モードまたは本番モードで起動します。

`server-build-path` は、`remix.config.js` で定義された `serverBuildPath` を指している必要があります。

本番環境にデプロイする必要があるのはビルド成果物 (`build/`, `public/build/`) のみであるため、`remix.config.js` が本番環境で利用可能であるとは限りません。そのため、このオプションを使用して、サーバービルドの場所を Remix に伝える必要があります。

開発環境では、`remix-serve` は、リクエストごとに `require` キャッシュをパージすることで、最新のコードが実行されるようにします。これにより、コードに影響を与える可能性のあるいくつかの点に注意する必要があります。

- モジュールスコープ内の値は「リセット」されます。

  ```tsx lines=[1-3]
  // モジュールキャッシュがクリアされ、これが完全に新しく require されるため、
  // これはリクエストごとにリセットされます
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

  開発環境でキャッシュを保持するための回避策が必要な場合は、サーバーで [シングルトン][singleton] を設定できます。

- **モジュールの副作用** はそのまま残ります！これは問題を引き起こす可能性がありますが、いずれにしても避けるべきです。

  ```tsx lines=[3-6]
  import { json } from "@remix-run/node"; // または cloudflare/deno

  // これはモジュールがインポートされた瞬間に実行を開始します
  setInterval(() => {
    console.log(Date.now());
  }, 1000);

  export async function loader() {
    // ...
  }
  ```

  このようなモジュールの副作用がある方法でコードを記述する必要がある場合は、独自の [@remix-run/express][remix-run-express] サーバーと、ファイル変更時にサーバーを再起動するための pm2-dev や nodemon などの開発ツールを設定する必要があります。

本番環境では、これは発生しません。サーバーが起動したら、それで終わりです。

[remix-run-express]: ./adapter#createrequesthandler
[singleton]: ../guides/manual-mode#keeping-in-memory-server-state-across-rebuilds
[express-listen]: https://expressjs.com/en/api.html#app.listen
[remix-serve-code]: https://github.com/remix-run/remix/blob/main/packages/remix-serve/cli.ts
[compression]: https://expressjs.com/en/resources/middleware/compression.html
[express-static]: https://expressjs.com/en/4x/api.html#express.static
[serve-static]: https://expressjs.com/en/resources/middleware/serve-static.html
[morgan]: https://expressjs.com/en/resources/middleware/morgan.html

