---
title: createMemoryRouter
---

# createMemoryRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx
-->

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createMemoryRouter.html)

インメモリの [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタックを使用してアプリケーションパスを管理する新しい [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成します。DOM API を持たない非ブラウザ環境で有用です。

## シグネチャ

```tsx
function createMemoryRouter(
  routes: RouteObject[],
  opts?: MemoryRouterOpts,
): DataRouter
```

## パラメータ

### routes

アプリケーションのルート

### opts.basename

アプリケーションのベースネームパス。

### opts.dataStrategy

ローダーを並行して実行するデフォルトのデータストラテジーを上書きします。詳細は[ドキュメント](../../how-to/data-strategy)を参照してください。

```tsx
let router = createBrowserRouter(routes, {
  async dataStrategy({
    matches,
    request,
    runClientMiddleware,
  }) {
    const matchesToLoad = matches.filter((m) =>
      m.shouldCallHandler(),
    );

    const results: Record<string, DataStrategyResult> = {};
    await runClientMiddleware(() =>
      Promise.all(
        matchesToLoad.map(async (match) => {
          results[match.route.id] = await match.resolve();
        }),
      ),
    );
    return results;
  },
});
```

### opts.future

ルーターで有効にする Future フラグ。

### opts.getContext

クライアントの [`action`](../../start/data/route-object#action)、[`loader`](../../start/data/route-object#loader)、および[ミドルウェア](../../how-to/middleware)に `context` 引数として提供される [`RouterContextProvider`](../utils/RouterContextProvider) インスタンスを返す関数です。この関数は、ナビゲーションまたはフェッチャーの呼び出しごとに新しい `context` インスタンスを生成するために呼び出されます。

### opts.hydrationData

サーバーで既にデータ読み込みを実行している場合に、ルーターを初期化するための hydration データ。

### opts.initialEntries

インメモリ history スタックの初期エントリ。

### opts.initialIndex

アプリケーションが初期化される `initialEntries` のインデックス。

### opts.unstable_instrumentations

ルーターの初期化前（および `route.lazy` または `patchRoutesOnNavigation` を介して後から追加されるルート上）に、ルーターと個々のルートを計測（instrument）することを可能にする計装（instrumentation）オブジェクトの配列。これは、ナビゲーション、フェッチ、ルートの loader/action/middleware をロギングやパフォーマンス追跡でラップするなどの可観測性（observability）に主に有用です。詳細は[ドキュメント](../../how-to/instrumentation)を参照してください。

```tsx
let router = createBrowserRouter(routes, {
  unstable_instrumentations: [logging]
});


let logging = {
  router({ instrument }) {
    instrument({
      navigate: (impl, info) => logExecution(`navigate ${info.to}`, impl),
      fetch: (impl, info) => logExecution(`fetch ${info.to}`, impl)
    });
  },
  route({ instrument, id }) {
    instrument({
      middleware: (impl, info) => logExecution(
        `middleware ${info.request.url} (route ${id})`,
        impl
      ),
      loader: (impl, info) => logExecution(
        `loader ${info.request.url} (route ${id})`,
        impl
      ),
      action: (impl, info) => logExecution(
        `action ${info.request.url} (route ${id})`,
        impl
      ),
    })
  }
};

async function logExecution(label: string, impl: () => Promise<void>) {
  let start = performance.now();
  console.log(`start ${label}`);
  await impl();
  let duration = Math.round(performance.now() - start);
  console.log(`end ${label} (${duration}ms)`);
}
```

### opts.patchRoutesOnNavigation

ナビゲーション時にルートツリーの一部を遅延定義します。

## Returns

[`<RouterProvider>`](../data-routers/RouterProvider) に渡す、初期化された [`DataRouter`](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。