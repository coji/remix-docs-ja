---
title: createHashRouter
---

# createHashRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createHashRouter.html)

URL の [`hash`](https://developer.mozilla.org/en-US/docs/Web/API/URL/hash) を介してアプリケーションのパスを管理する新しい [data router](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成します。

## シグネチャ

```tsx
function createHashRouter(
  routes: RouteObject[],
  opts?: DOMRouterOpts,
): DataRouter
```

## パラメータ

### routes

アプリケーションの routes

### opts.basename

アプリケーションのベース名パス。

### opts.future

router で有効にする Future フラグ。

### opts.getContext

client の [`action`](../../start/data/route-object#action)、[`loader`](../../start/data/route-object#loader)、および [middleware](../../how-to/middleware) に `context` 引数として提供される [`RouterContextProvider`](../utils/RouterContextProvider) インスタンスを返す関数。この関数は、ナビゲーションまたはフェッチャー呼び出しごとに新しい `context` インスタンスを生成するために呼び出されます。

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

Server-Rendering 時、自動ハイドレーションをオプトアウトすると、`hydrationData` オプションを使用することで、サーバーレンダリングからハイドレーションデータを渡すことができます。これは、[`StaticHandler`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html) の `query` メソッドから返される [`StaticHandlerContext`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandlerContext.html) の値のデータのサブセットであることがほとんどです。

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

**部分的なハイドレーションデータ**

通常、サーバーレンダリングされたアプリをハイドレートするために、完全な `loaderData` のセットを含めます。しかし、高度なユースケース (Framework Mode の [`clientLoader`](../../start/framework/route-module#clientLoader) など) では、サーバーでロード/レンダリングされた一部の routes に対してのみ `loaderData` を含めたい場合があります。これにより、一部の routes (アプリのレイアウト/シェルなど) をハイドレートしつつ、ハイドレーション中に `HydrateFallback` コンポーネントを表示し、他の routes の [`loader`](../../start/data/route-object#loader) を実行することができます。

route の [`loader`](../../start/data/route-object#loader) は、以下の2つのシナリオでハイドレーション中に実行されます。

 1. ハイドレーションデータが提供されていない場合
    これらの場合、初期ハイドレーション時に `HydrateFallback` コンポーネントがレンダーされます。
 2. `loader.hydrate` プロパティが `true` に設定されている場合
    これにより、初期ハイドレーション時にフォールバックをレンダーしなかった場合でも [`loader`](../../start/data/route-object#loader) を実行できます (つまり、ハイドレーションデータでキャッシュをプライミングするため)。

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

router の初期化前 (および `route.lazy` または `patchRoutesOnNavigation` を介してその後追加される routes) に router と個々の routes を計測できるようにする、計測オブジェクトの配列です。これは、ナビゲーション、フェッチ、および route の loader/action/middleware をログ記録やパフォーマンス追跡でラップするなど、オブザーバビリティに主に役立ちます。詳細については、[ドキュメント](../../how-to/instrumentation) を参照してください。

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

### opts.dataStrategy

loaders を並行して実行するというデフォルトのデータ戦略を上書きします。詳細については、[ドキュメント](../../how-to/data-strategy) を参照してください。

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

### opts.patchRoutesOnNavigation

ナビゲーション時に route ツリーの一部を遅延定義します。[`PatchRoutesOnNavigationFunction`](https://api.reactrouter.com/v7/types/react_router.PatchRoutesOnNavigationFunction.html) を参照してください。

デフォルトでは、React Router は `createBrowserRouter(routes)` を介して完全な route ツリーを事前に提供することを想定しています。これにより、React Router は同期的な route マッチングを実行し、loaders を実行し、waterfall を発生させることなく、最も楽観的な方法で route component をレンダーできます。トレードオフとして、初期の JS バンドルは定義上大きくなり、アプリケーションの成長とともに起動時間が遅くなる可能性があります。

これに対処するため、[v6.9.0](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v690) で [`route.lazy`](../../start/data/route-object#lazy) を導入しました。これにより、route の _定義_ の側面 (`path`, `index` など) を事前に提供しながら、route の _実装_ ([`loader`](../../start/data/route-object#loader), [`Component`](../../start/data/route-object#Component) など) を遅延ロードできます。これは良い中間点です。React Router は依然として route 定義 (軽量な部分) を事前に認識し、同期的な route マッチングを実行できますが、route 実装の側面 (重い部分) のロードは、実際に route がナビゲートされるまで遅延させます。

場合によっては、これだけでは不十分です。大規模なアプリケーションでは、すべての route 定義を事前に提供することが非常にコスト高になる可能性があります。さらに、特定の Micro-Frontend または Module-Federation アーキテクチャでは、すべての route 定義を事前に提供することすら不可能な場合があります。

ここで `patchRoutesOnNavigation` が登場します ([RFC](https://github.com/remix-run/react-router/discussions/11113))。この API は、完全な route ツリーを事前に提供できず、実行時に route ツリーの一部を遅延的に「発見」する必要がある高度なユースケース向けです。この機能は、ビデオゲームが移動に応じて「世界」を広げるのと同様に、ユーザーがアプリ内をナビゲートするにつれて router がルーティングツリーを拡張しますが、ユーザーが訪れたツリーの一部のみをロードすることになるため、しばしば ["Fog of War"](https://en.wikipedia.org/wiki/Fog_of_war) と呼ばれます。

React Router が `path` にマッチできない場合、常に `patchRoutesOnNavigation` が呼び出されます。引数には、`path`、部分的な `matches`、およびツリーの特定の場所に新しい routes をパッチするために呼び出すことができる `patch` 関数が含まれます。このメソッドは、`GET` リクエストのナビゲーションの `loading` 部分と、非 `GET` リクエストのナビゲーションの `submitting` 部分で実行されます。

<details>
  <summary><b><code>patchRoutesOnNavigation</code> の使用例</b></summary>

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

  上記の例で、ユーザーが `/a` へのリンクをクリックすると、React Router は最初はどの routes にもマッチせず、`path = "/a"` と root route のマッチを含む `matches` 配列を伴って `patchRoutesOnNavigation` を呼び出します。`patch('root', [route])` を呼び出すことで、新しい route が `root` route の子として route ツリーに追加され、React Router は更新された routes に対してマッチングを実行します。今回は `/a` パスに正常にマッチし、ナビゲーションは成功裏に完了します。

  **新しい root レベルの routes をパッチする**

  ツリーの最上位に新しい route をパッチする必要がある場合 (つまり、親を持たない場合)、`routeId` として `null` を渡すことができます。

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

  アプリケーションのセクション全体を遅延的にフェッチするために、非同期マッチングを実行することもできます。

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

  <docs-info>
  `patchRoutesOnNavigation` の実行が、その後のナビゲーションによって中断された場合、中断された実行における残りの `patch` 呼び出しは、操作がキャンセルされたため route ツリーを更新しません。
  </docs-info>

  **route の発見を route 定義と併置する**

  独自の疑似マッチングを実行したくない場合は、部分的な `matches` 配列と route の [`handle`](../../start/data/route-object#handle) フィールドを活用して、children の定義を併置することができます。

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

  **パラメータを持つ routes について**

  React Router は与えられたパスに最適なマッチを見つけるためにランク付けされた routes を使用するため、特定の時点で部分的な route ツリーのみが知られている場合に興味深い曖昧さが生じます。例えば `path: "/about/contact-us"` のような完全に静的な route にマッチする場合、それは完全に静的な URL セグメントで構成されているため、正しいマッチを見つけたとわかります。したがって、他の潜在的によりスコアの高い routes を探す必要はありません。

  しかし、パラメータ (動的またはスプラット) を持つ routes はこの仮定を置くことができません。なぜなら、まだ発見されていない、よりスコアの高い route が存在する可能性があるからです。例えば、以下のような完全な route ツリーを考えてみましょう。

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

  そして、ユーザーがナビゲートする際にこれを埋めるために `patchRoutesOnNavigation` を使用したいと仮定します。

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

  ユーザーが最初にブログ投稿 (例えば `/blog/my-post`) にアクセスした場合、`:slug` route がパッチされます。その後、ユーザーが新しい投稿を作成するために `/blog/new` にナビゲートした場合、`"/blog/:slug"` にマッチしますが、それは _正しい_ マッチではありません！まだ発見されていない、よりスコアの高い route が存在する可能性に備えて `patchRoutesOnNavigation` を呼び出す必要があります。このケースでは実際に存在します。

  そのため、React Router が少なくとも1つのパラメータを含むパスにマッチするたびに、`patchRoutesOnNavigation` が呼び出され、最適なマッチを見つけたことを確認するためにもう一度 routes のマッチングが行われます。

  `patchRoutesOnNavigation` の実装がコスト高であったり、バックエンドサーバーへの副作用のある [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) 呼び出しを行ったりする場合、適切な route が既に見つかっていることがわかっているケースでの過剰なフェッチを避けるために、以前に確認された routes を追跡することを検討すると良いでしょう。これは通常、正しい routes を既にパッチした以前の `path` 値の小さなキャッシュを維持するだけで簡単に行えます。

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

[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) オブジェクトの上書き。デフォルトはグローバルの `window` インスタンスです。

## 戻り値

[`<RouterProvider>`](../data-routers/RouterProvider) に渡す初期化された [data router](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。