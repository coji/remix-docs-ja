---
title: createBrowserRouter
---

# createBrowserRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: data]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.createBrowserRouter.html)

[`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) および [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) を介してアプリケーションパスを管理する新しい [data router](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成します。

## Signature

```tsx
function createBrowserRouter(
  routes: RouteObject[],
  opts?: DOMRouterOpts,
): DataRouter
```

## Params

### routes

アプリケーションの routes

### opts.basename

アプリケーションの basename パス。

### opts.dataStrategy

loaders を並行して実行するデフォルトの data strategy をオーバーライドします。詳細は [ドキュメント](../../how-to/data-strategy) を参照してください。

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

router で有効にする Future フラグ。

### opts.getContext

クライアントの [`action`](../../start/data/route-object#action)、[`loader`](../../start/data/route-object#loader)、および [middleware](../../how-to/middleware) に `context` 引数として提供される [`RouterContextProvider`](../utils/RouterContextProvider) インスタンスを返す関数です。この関数は、各 navigation または fetcher 呼び出しのたびに新しい `context` インスタンスを生成するために呼び出されます。

```tsx
import {
  createContext,
  RouterContextProvider,
} from "react-router";

const apiClientContext = createContext<APIClient>();

function createBrowserRouter(routes, {
  getContext() {
    let context = new RouterContextProvider();
    context.set(apiClientContext, getApiClient());
    return context;
  }
})
```

### opts.hydrationData

サーバーレンダリング時に自動 hydration をオプトアウトする場合、`hydrationData` オプションを使用すると、サーバーレンダリングからの hydration データを渡すことができます。これはほとんどの場合、[`StaticHandler`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html) の `query` メソッドから取得する [`StaticHandlerContext`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html) 値のデータの一部となります。

```tsx
const router = createBrowserRouter(routes, {
  hydrationData: {
    loaderData: {
      // [routeId]: serverLoaderData
    },
    // may also include `errors` and/or `actionData`
  },
});
```

**部分的な Hydration Data**

サーバーレンダリングされたアプリを hydrate するために、ほとんどの場合、完全な `loaderData` を含めます。しかし、高度なユースケース (Framework Mode の [`clientLoader`](../../start/framework/route-module#clientLoader) など) では、サーバーでロード/レンダリングされた一部の routes の `loaderData` のみを含めることができます。これにより、一部の routes (アプリのレイアウト/シェルなど) を hydrate しながら、`HydrateFallback` component を表示し、hydration 中に他の routes の [`loader`](../../start/data/route-object#loader) を実行できます。

route の [`loader`](../../start/data/route-object#loader) は、次の2つのシナリオで hydration 中に実行されます。

 1. hydration データが提供されていない場合
    これらの場合、`HydrateFallback` component は最初の hydration 時にレンダリングされます。
 2. `loader.hydrate` プロパティが `true` に設定されている場合
    これは、最初の hydration 時にフォールバックをレンダリングしなかった場合でも [`loader`](../../start/data/route-object#loader) を実行できるようにします (つまり、hydration データでキャッシュを事前にロードするため)。

```tsx
const router = createBrowserRouter(
  [
    {
      id: "root",
      loader: rootLoader,
      Component: Root,
      children: [
        {
          id: "index",
          loader: indexLoader,
          HydrateFallback: IndexSkeleton,
          Component: Index,
        },
      ],
    },
  ],
  {
    hydrationData: {
      loaderData: {
        root: "ROOT DATA",
        // No index data provided
      },
    },
  }
);
```

### opts.unstable_instrumentations

router 初期化前 (および `route.lazy` または `patchRoutesOnNavigation` を介して後から追加される routes) に router および個々の routes を計測できる instrumentation オブジェクトの配列です。これは主に、navigations、fetches、および route の loaders/actions/middlewares をロギングやパフォーマンス追跡でラップするなど、可観測性に役立ちます。詳細は [ドキュメント](../../how-to/instrumentation) を参照してください。

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

navigations 時に route ツリーの一部を遅延定義します。[`PatchRoutesOnNavigationFunction`](https://api.reactrouter.com/v7/types/react_router.PatchRoutesOnNavigationFunction.html) を参照してください。

デフォルトでは、React Router は `createBrowserRouter(routes)` を介して完全な route ツリーを事前に提供することを求めています。これにより、React Router は同期的な route マッチング、loader の実行、そしてウォーターフォールを導入することなく最も楽観的な方法で route components のレンダリングを実行できます。トレードオフとして、JS バンドルは定義上大きくなり、アプリケーションが成長するにつれて起動時間が遅くなる可能性があります。

これに対処するため、[v6.9.0](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v690) で [`route.lazy`](../../start/data/route-object#lazy) を導入しました。これにより、route の _定義_ 側面 (`path`、`index` など) を事前に提供しながら、route の _実装_ (`loader`、`Component` など) を遅延ロードできます。これは良い中間点です。React Router は依然として route 定義 (軽量な部分) を事前に認識し、同期的な route マッチングを実行できますが、route の実装側面 (重い部分) のロードは、実際に route が navigate されるまで遅らせることができます。

場合によっては、これだけでは不十分です。巨大なアプリケーションでは、すべての route 定義を事前に提供することは法外なコストがかかる可能性があります。さらに、特定の Micro-Frontend や Module-Federation アーキテクチャでは、すべての route 定義を事前に提供することすら不可能かもしれません。

ここで `patchRoutesOnNavigation` が登場します ([RFC](https://github.com/remix-run/react-router/discussions/11113))。この API は、完全な route ツリーを事前に提供できず、実行時に route ツリーの一部を遅延的に「発見」する方法が必要な高度なユースケース向けです。この機能はしばしば ["Fog of War"](https://en.wikipedia.org/wiki/Fog_of_war) と呼ばれます。これは、ビデオゲームが移動するにつれて「世界」を拡大するのと同様に、router がユーザーがアプリ内を navigate するにつれてルーティングツリーを拡大しますが、ユーザーが訪れたツリーの部分のみをロードすることになるためです。

`patchRoutesOnNavigation` は、React Router が `path` を match できない場合に常に呼び出されます。引数には `path`、部分的な `matches`、および新しい routes を特定の場所にツリーにパッチする `patch` 関数が含まれます。このメソッドは、`GET` リクエストの navigation の `loading` 部分、および `GET` 以外のリクエストの navigation の `submitting` 部分で実行されます。

<details>
  <summary><b><code>patchRoutesOnNavigation</code> のユースケース例</b></summary>

  **既存の route に children をパッチする**

  ```tsx
  const router = createBrowserRouter(
    [
      {
        id: "root",
        path: "/",
        Component: RootComponent,
      },
    ],
    {
      async patchRoutesOnNavigation({ patch, path }) {
        if (path === "/a") {
          // Load/patch the `a` route as a child of the route with id `root`
          let route = await getARoute();
          //  ^ { path: 'a', Component: A }
          patch("root", [route]);
        }
      },
    }
  );
  ```

  上記の例では、ユーザーが `/a` へのリンクをクリックすると、React Router は最初にどの routes も match せず、`patchRoutesOnNavigation` を `path = "/a"` と root route match を含む `matches` 配列で呼び出します。`patch('root', [route])` を呼び出すことで、新しい route は `root` route の子として route ツリーに追加され、React Router は更新された routes に対してマッチングを実行します。今回は `/a` パスを正常に match し、navigation は正常に完了します。

  **新しい root レベルの routes をパッチする**

  ツリーの最上位に新しい route をパッチする必要がある場合 (つまり、親がない場合)、`null` を `routeId` として渡すことができます。

  ```tsx
  const router = createBrowserRouter(
    [
      {
        id: "root",
        path: "/",
        Component: RootComponent,
      },
    ],
    {
      async patchRoutesOnNavigation({ patch, path }) {
        if (path === "/root-sibling") {
          // Load/patch the `/root-sibling` route as a sibling of the root route
          let route = await getRootSiblingRoute();
          //  ^ { path: '/root-sibling', Component: RootSibling }
          patch(null, [route]);
        }
      },
    }
  );
  ```

  **サブツリーを非同期的にパッチする**

  非同期マッチングを実行して、アプリケーション全体のセクションを遅延的にフェッチすることもできます。

  ```tsx
  let router = createBrowserRouter(
    [
      {
        path: "/",
        Component: Home,
      },
    ],
    {
      async patchRoutesOnNavigation({ patch, path }) {
        if (path.startsWith("/dashboard")) {
          let children = await import("./dashboard");
          patch(null, children);
        }
        if (path.startsWith("/account")) {
          let children = await import("./account");
          patch(null, children);
        }
      },
    }
  );
  ```

  <docs-info>`patchRoutesOnNavigation` の進行中の実行が後の navigation によって中断された場合、中断された実行に残っている `patch` 呼び出しは、操作がキャンセルされたため route ツリーを更新しません。</docs-info>

  **route 定義と route 探索を併置する**

  独自の擬似マッチングを実行したくない場合は、部分的な `matches` 配列と route の [`handle`](../../start/data/route-object#handle) フィールドを活用して、children 定義を併置することができます。

  ```tsx
  let router = createBrowserRouter(
    [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "/dashboard",
        children: [
          {
            // If we want to include /dashboard in the critical routes, we need to
            // also include it's index route since patchRoutesOnNavigation will not be
            // called on a navigation to `/dashboard` because it will have successfully
            // matched the `/dashboard` parent route
            index: true,
            // ...
          },
        ],
        handle: {
          lazyChildren: () => import("./dashboard"),
        },
      },
      {
        path: "/account",
        children: [
          {
            index: true,
            // ...
          },
        ],
        handle: {
          lazyChildren: () => import("./account"),
        },
      },
    ],
    {
      async patchRoutesOnNavigation({ matches, patch }) {
        let leafRoute = matches[matches.length - 1]?.route;
        if (leafRoute?.handle?.lazyChildren) {
          let children =
            await leafRoute.handle.lazyChildren();
          patch(leafRoute.id, children);
        }
      },
    }
  );
  ```

  **パラメーターを持つ routes に関する注意**

  React Router は、特定のパスに対して最適な match を見つけるためにランク付けされた routes を使用するため、特定の時点である程度の route ツリーしか知られていない場合に興味深い曖昧さが生じます。`path: "/about/contact-us"` のような完全に静的な route を match する場合、それが完全に静的な URL セグメントで構成されているため、正しい match を見つけたとわかります。したがって、他の潜在的にスコアの高い routes を探す必要はありません。

  しかし、パラメーターを持つ routes (動的またはスプラット) は、まだ発見されていない、よりスコアの高い route が存在する可能性があるため、この仮定をすることはできません。以下のような完全な route ツリーを考えてみましょう。

  ```tsx
  // Assume this is the full route tree for your app
  const routes = [
    {
      path: "/",
      Component: Home,
    },
    {
      id: "blog",
      path: "/blog",
      Component: BlogLayout,
      children: [
        { path: "new", Component: NewPost },
        { path: ":slug", Component: BlogPost },
      ],
    },
  ];
  ```

  そして、ユーザーが navigate するにつれてこれを埋めるために `patchRoutesOnNavigation` を使用すると仮定します。

  ```tsx
  // Start with only the index route
  const router = createBrowserRouter(
    [
      {
        path: "/",
        Component: Home,
      },
    ],
    {
      async patchRoutesOnNavigation({ patch, path }) {
        if (path === "/blog/new") {
          patch("blog", [
            {
              path: "new",
              Component: NewPost,
            },
          ]);
        } else if (path.startsWith("/blog")) {
          patch("blog", [
            {
              path: ":slug",
              Component: BlogPost,
            },
          ]);
        }
      },
    }
  );
  ```

  ユーザーが最初にブログ投稿 (つまり `/blog/my-post`) にアクセスした場合、`:slug` route をパッチします。その後、ユーザーが新しい投稿を作成するために `/blog/new` に navigate した場合、`/blog/:slug` に match しますが、それは _正しい_ match ではありません！まだ発見されていない、よりスコアの高い route が存在する可能性に備えて `patchRoutesOnNavigation` を呼び出す必要があります。このケースでは存在します。

  したがって、React Router が少なくとも1つの param を含む path に match する場合、常に `patchRoutesOnNavigation` を呼び出し、最適な match を見つけたことを確認するために再度 routes を match します。

  `patchRoutesOnNavigation` の実装が高コストであるか、またはバックエンドサーバーへの副作用のある [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) 呼び出しを行っている場合、適切な route が既に見つかっていることがわかっているケースでの過剰なフェッチを避けるために、以前に表示された routes を追跡することを検討してください。これは通常、適切な routes を既にパッチした以前の `path` 値の小さなキャッシュを維持するだけで済みます。

  ```tsx
  let discoveredRoutes = new Set();

  const router = createBrowserRouter(routes, {
    async patchRoutesOnNavigation({ patch, path }) {
      if (discoveredRoutes.has(path)) {
        // We've seen this before so nothing to patch in and we can let the router
        // use the routes it already knows about
        return;
      }

      discoveredRoutes.add(path);

      // ... patch routes in accordingly
    },
  });
  ```
</details>

### opts.window

[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) オブジェクトのオーバーライド。デフォルトはグローバルの `window` インスタンスです。

## Returns

[`<RouterProvider>`](../data-routers/RouterProvider) に渡す、初期化された [data router](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。