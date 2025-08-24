---
title: "@react-router/serve"
---

# React Router App Server

React Routerは、ユーザーが自身のサーバーを管理するように設計されていますが、サーバーをセットアップしたくない場合は、代わりにReact Router App Serverを使用できます。これは、[Express][express]で構築された、プロダクション対応の基本的なNode.jsサーバーです。

設計上、React Router App Serverをカスタマイズするオプションは提供していません。なぜなら、基盤となる`express`サーバーをカスタマイズする必要がある場合、必要な可能性のあるすべてのカスタマイズを処理するための抽象化を作成するよりも、サーバーを完全に管理することをお勧めするからです。カスタマイズしたい場合は、[`@react-router/express`アダプターに移行][migrate-to-express]できます。

基盤となる`express`サーバーの設定は、[packages/react-router-serve/cli.ts][rr-serve-code]で確認できます。デフォルトでは、以下のExpressミドルウェアを使用します（デフォルトの動作については、それぞれのドキュメントを参照してください）。

- [`compression`][compression]
- [`express.static`][express-static] (および[`serve-static`][serve-static])
- [`morgan`][morgan]

## `HOST` 環境変数

`process.env.HOST`を介してExpressアプリのホスト名を構成でき、その値はサーバー起動時に内部の[`app.listen`][express-listen]メソッドに渡されます。

```shellscript nonumber
HOST=127.0.0.1 npx react-router-serve build/index.js
```

```shellscript nonumber
react-router-serve <server-build-path>
# e.g.
react-router-serve build/index.js
```

## `PORT` 環境変数

環境変数でサーバーのポートを変更できます。

```shellscript nonumber
PORT=4000 npx react-router-serve build/index.js
```

## 開発環境

`process.env.NODE_ENV`に応じて、サーバーは開発モードまたはプロダクションモードで起動します。

`server-build-path`は、[`react-router.config.ts`][rr-config]で定義されている`serverBuildPath`を指す必要があります。

ビルド成果物（`build/`、`public/build/`）のみがプロダクションにデプロイされる必要があるため、`react-router.config.ts`がプロダクション環境で利用可能であるとは限りません。そのため、このオプションでReact Routerにサーバービルドの場所を伝える必要があります。

開発環境では、`react-router-serve`はリクエストごとに`require`キャッシュをパージすることで、最新のコードが実行されるようにします。これには、注意すべきコードへの影響がいくつかあります。

- モジュールスコープ内の値は「リセット」されます

  ```tsx lines=[1-3]
  // モジュールキャッシュがクリアされ、これが新規にrequireされるため、これはリクエストごとにリセットされます
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

  開発環境でキャッシュを保持するための回避策が必要な場合は、サーバーにシングルトンを設定できます。

- **モジュールの副作用**はそのまま残ります！これは問題を引き起こす可能性がありますが、いずれにせよ避けるべきです。

  ```tsx lines=[1-4]
  // これはモジュールがインポートされた瞬間に実行を開始します
  setInterval(() => {
    console.log(Date.now());
  }, 1000);

  export async function loader() {
    // ...
  }
  ```

  この種のモジュールの副作用を持つようにコードを記述する必要がある場合、独自の[@react-router/express][rr-express]サーバーと、代わりにファイル変更時にサーバーを再起動するための[`pm2-dev`][pm2-dev]や[`nodemon`][nodemon]のような開発ツールを使用するべきです。

プロダクション環境では、これは起こりません。サーバーが起動し、それでおしまいです。

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