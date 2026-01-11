---
title: "@react-router/serve"
---

# React Router アプリサーバー

React Router は、ユーザーが自身のサーバーを所有することを前提に設計されていますが、設定したくない場合は、代わりに React Router アプリサーバーを使用できます。これは、[Express][express] で構築された、本番環境対応の基本的な Node.js サーバーです。

設計上、React Router アプリサーバーをカスタマイズするオプションは提供していません。これは、基盤となる `express` サーバーをカスタマイズする必要がある場合、必要なすべてのカスタマイズを処理するための抽象化を作成するよりも、サーバーを完全に管理していただくことを推奨しているためです。カスタマイズしたい場合は、[\`@react-router/express\` adapter へ移行できます][migrate-to-express]。

基盤となる `express` サーバーの設定は、[packages/react-router-serve/cli.ts][rr-serve-code] で確認できます。デフォルトでは、以下の Express middleware を使用しています (デフォルトの動作については、各ドキュメントを参照してください)。

- [`compression`][compression]
- [`express.static`][express-static] (および [`serve-static`][serve-static])
- [`morgan`][morgan]

## `HOST` 環境変数

Express アプリのホスト名は `process.env.HOST` を介して設定でき、この値はサーバー起動時に内部の [`app.listen`][express-listen] メソッドに渡されます。

```shellscript nonumber
HOST=127.0.0.1 npx react-router-serve build/index.js
```

```shellscript nonumber
react-router-serve <server-build-path>
# e.g.
react-router-serve build/index.js
```

## `PORT` 環境変数

環境変数を使用してサーバーのポートを変更できます。

```shellscript nonumber
PORT=4000 npx react-router-serve build/index.js
```

## 開発環境

`process.env.NODE_ENV` に応じて、サーバーは開発モードまたは本番モードで起動します。

`server-build-path` は、[\`react-router.config.ts\`][rr-config] で定義されている `serverBuildPath` を指す必要があります。

ビルド成果物 (`build/`, `public/build/`) のみが本番環境にデプロイされる必要があるため、`react-router.config.ts` が本番環境で利用可能である保証はありません。そのため、このオプションを使用して、サーバービルドがどこにあるかを React Router に伝える必要があります。

開発環境では、`react-router-serve` はリクエストごとに `require` キャッシュをパージすることで、最新のコードが実行されるようにします。これにより、コードにいくつかの影響が出ることがあり、注意が必要です。

- モジュールスコープ内のすべての値が「リセット」されます

  ```tsx lines=[1-3]
  // モジュールキャッシュがクリアされ、このモジュールが新たにrequireされるため、
  // 各リクエストでリセットされます。
  const cache = new Map();

  export async function loader({
    params,
  }: Route.LoaderArgs) {
    if (cache.has(params.foo)) {
      return cache.get(params.foo);
    }

    const record = await fakeDb.stuff.find(params.foo);
    cache.set(params.foo, record);
    return record;
  }
  ```

  開発環境でキャッシュを保持するための回避策が必要な場合は、サーバーでシングルトンを設定できます。

- あらゆる **モジュールの副作用** はそのまま残ります！これは問題を引き起こす可能性がありますが、いずれにせよ避けるべきでしょう。

  ```tsx lines=[1-4]
  // このモジュールがインポートされた瞬間に実行が開始されます
  setInterval(() => {
    console.log(Date.now());
  }, 1000);

  export async function loader() {
    // ...
  }
  ```

  このような種類のモジュールの副作用を伴う方法でコードを記述する必要がある場合は、独自の [@react-router/express][rr-express] サーバーと、ファイル変更時にサーバーを再起動する [\`pm2-dev\`][pm2-dev] や [\`nodemon\`][nodemon] のような開発ツールを設定する必要があります。

本番環境では、これは発生しません。サーバーが起動すれば、それで終わりです。

[rr-express]: ./adapter#react-routerexpress
[express-listen]: https://expressjs.com/en/api.html#app.listen
[rr-config]: ../framework-conventions/react-router.config.ts
[rr-serve-code]: https://github.com/remix-run/react-router/blob/main/packages/react-router-serve/cli.ts
[compression]: https://expressjs.com/en/resources/middleware/compression.html
[express-static]: https://expressjs.com/en/4x/api.html#express.static
[serve-static]: https://expressjs.com/en/resources/middleware/serve-static.html
[morgan]: https://expressjs.com/en/resources/middleware/morgan.html
[express]: https://expressjs.com
[migrate-to-express]: ./adapter#migrating-from-the-react-router-app-server
[pm2-dev]: https://npm.im/pm2-dev
[nodemon]: https://npm.im/nodemon