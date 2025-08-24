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

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createBrowserRouter.html)

アプリケーションのパスを [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) および [`history.replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) を介して管理する、新しい [データルーター](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html) を作成します。

## シグネチャ

```tsx
function createBrowserRouter(
  routes: RouteObject[],
  opts?: DOMRouterOpts,
): DataRouter
```

## パラメータ

### routes

アプリケーションのルート。

### opts.basename

アプリケーションのベースパス。

### opts.dataStrategy

ロードを並行して実行するデフォルトのデータ戦略を上書きします。[`DataStrategyFunction`](https://api.reactrouter.com/v7/interfaces/react_router.DataStrategyFunction.html) を参照してください。

<docs-warning>これは高度なユースケースを想定した低レベルAPIです。React Routerの内部的な [`action`](../../start/data/route-object#action)/[`loader`](../../start/data/route-object#loader) 実行処理を上書きするため、誤って使用するとアプリケーションコードが破損する可能性があります。注意して使用し、適切なテストを実施してください。</docs-warning>

デフォルトでは、React Routerはデータのロード/送信方法について独自の考えを持っており、特に、最適なデータフェッチのためにすべての [`loader`](../../start/data/route-object#loader) を並行して実行します。これはほとんどのユースケースで正しい動作だと考えていますが、幅広いアプリケーション要件に対応するデータフェッチにおいて「万能な」解決策はないことも認識しています。

`dataStrategy` オプションを使用すると、[`action`](../../start/data/route-object#action) と [`loader`](../../start/data/route-object#loader) の実行方法を完全に制御でき、ミドルウェア、コンテキスト、キャッシュ層などのより高度なAPIを構築するための基盤を築きます。将来的には、このAPIを内部的に活用して、React Routerにさらに多くのファーストクラスAPIをもたらすことを期待していますが、それまでは（そしてその後も）、これはアプリケーションのデータニーズに合わせたより高度な機能を追加する方法となります。

`dataStrategy` 関数は、`routeId` -> [`DataStrategyResult`](https://api.reactrouter.com/v7/interfaces/react_router.DataStrategyResult.html) のキー/値オブジェクトを返し、ハンドラーが実行されたすべてのルートのエントリを含める必要があります。`DataStrategyResult` は、`DataStrategyResult.type` フィールドに基づいてハンドラーが成功したかどうかを示します。返された `DataStrategyResult.result` が [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) の場合、React Routerはそれを（[`res.json`](https://developer.mozilla.org/en-US/docs/Web/API/Response/json) または [`res.text`](https://developer.mozilla.org/en-US/docs/Web/API/Response/text) を介して）アンラップします。[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) のカスタムデコードを行う必要があるが、ステータスコードを保持したい場合は、`data` ユーティリティを使用して、デコードされたデータと `ResponseInit` を一緒に返すことができます。

<details>
<summary><b>`dataStrategy` の使用例</b></summary>

**ロギングの追加**

最も単純なケースとして、このAPIにフックして、ルートの [`action`](../../start/data/route-object#action) や [`loader`](../../start/data/route-object#loader) が実行されるときにロギングを追加する方法を見てみましょう。

```tsx
let router = createBrowserRouter(routes, {
  async dataStrategy({ matches, request }) {
    const matchesToLoad = matches.filter((m) => m.shouldLoad);
    const results: Record<string, DataStrategyResult> = {};
    await Promise.all(
      matchesToLoad.map(async (match) => {
        console.log(`Processing ${match.route.id}`);
        results[match.route.id] = await match.resolve();;
      })
    );
    return results;
  },
});
```

**ミドルウェア**

各ルートに [`handle`](../../start/data/route-object#handle) を介してミドルウェアを定義し、まずミドルウェアを順次呼び出し、次にすべての [`loader`](../../start/data/route-object#loader) を並行して呼び出します。ミドルウェアを介して利用可能になったデータを提供します。

```ts
const routes = [
  {
    id: "parent",
    path: "/parent",
    loader({ request }, context) {
       // ...
    },
    handle: {
      async middleware({ request }, context) {
        context.parent = "PARENT MIDDLEWARE";
      },
    },
    children: [
      {
        id: "child",
        path: "child",
        loader({ request }, context) {
          // ...
        },
        handle: {
          async middleware({ request }, context) {
            context.child = "CHILD MIDDLEWARE";
          },
        },
      },
    ],
  },
];

let router = createBrowserRouter(routes, {
  async dataStrategy({ matches, params, request }) {
    // Run middleware sequentially and let them add data to `context`
    let context = {};
    for (const match of matches) {
      if (match.route.handle?.middleware) {
        await match.route.handle.middleware(
          { request, params },
          context
        );
      }
    }

    // Run loaders in parallel with the `context` value
    let matchesToLoad = matches.filter((m) => m.shouldLoad);
    let results = await Promise.all(
      matchesToLoad.map((match, i) =>
        match.resolve((handler) => {
          // Whatever you pass to `handler` will be passed as the 2nd parameter
          // to your loader/action
          return handler(context);
        })
      )
    );
    return results.reduce(
      (acc, result, i) =>
        Object.assign(acc, {
          [matchesToLoad[i].route.id]: result,
        }),
      {}
    );
  },
});
```

**カスタムハンドラー**

ルートレベルで [`loader`](../../start/data/route-object#loader) の実装を定義したくない場合もあります。ルートを決定し、すべてのデータに対して単一のGraphQLリクエストを発行したいだけかもしれません。これは、`route.loader=true` を設定して「ローダーを持つ」と認定させ、GQLフラグメントを `route.handle` に保存することで実現できます。

```ts
const routes = [
  {
    id: "parent",
    path: "/parent",
    loader: true,
    handle: {
      gql: gql`
        fragment Parent on Whatever {
          parentField
        }
      `,
    },
    children: [
      {
        id: "child",
        path: "child",
        loader: true,
        handle: {
          gql: gql`
            fragment Child on Whatever {
              childField
            }
          `,
        },
      },
    ],
  },
];

let router = createBrowserRouter(routes, {
  async dataStrategy({ matches, params, request }) {
    // Compose route fragments into a single GQL payload
    let gql = getFragmentsFromRouteHandles(matches);
    let data = await fetchGql(gql);
    // Parse results back out into individual route level `DataStrategyResult`'s
    // keyed by `routeId`
    let results = parseResultsFromGql(data);
    return results;
  },
});
```
</details>

### opts.future

ルーターで有効にする将来のフラグ。

### opts.unstable_getContext

クライアントの [`action`](../../start/data/route-object#action)、[`loader`](../../start/data/route-object#loader)、および [ミドルウェア](../../how-to/middleware) の `context` 引数として提供される [`unstable_RouterContextProvider`](../utils/RouterContextProvider) インスタンスを返す関数です。この関数は、ナビゲーションまたはフェッチャー呼び出しごとに新しい `context` インスタンスを生成するために呼び出されます。

```tsx
import {
  unstable_createContext,
  unstable_RouterContextProvider,
} from "react-router";

const apiClientContext = unstable_createContext<APIClient>();

function createBrowserRouter(routes, {
  unstable_getContext() {
    let context = new unstable_RouterContextProvider();
    context.set(apiClientContext, getApiClient());
    return context;
  }
})
```

### opts.hydrationData

サーバーレンダリングを行い、自動ハイドレーションをオプトアウトする場合、`hydrationData` オプションを使用すると、サーバーレンダリングからのハイドレーションデータを渡すことができます。これはほとんどの場合、[`StaticHandler`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandler.html) の `query` メソッドから返される [`StaticHandlerContext`](https://api.reactrouter.com/v7/interfaces/react_router.StaticHandlerContext.html) 値のデータの一部となります。

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

サーバーレンダリングされたアプリをハイドレートするために、ほとんどの場合、完全な `loaderData` セットを含めます。しかし、高度なユースケース（Framework Modeの [`clientLoader`](../../start/framework/route-module#clientLoader) など）では、サーバーでロード/レンダリングされた一部のルートのみに `loaderData` を含めたい場合があります。これにより、一部のルート（アプリのレイアウト/シェルなど）をハイドレートしつつ、`HydrateFallback` コンポーネントを表示し、ハイドレーション中に他のルートの [`loader`](../../start/data/route-object#loader) を実行することができます。

ルートの [`loader`](../../start/data/route-object#loader) は、ハイドレーション中に次の2つのシナリオで実行されます。

 1. ハイドレーションデータが提供されていない場合
    これらの場合、`HydrateFallback` コンポーネントは初期ハイドレーション時にレンダリングされます。
 2. `loader.hydrate` プロパティが `true` に設定されている場合
    これにより、初期ハイドレーション時にフォールバックをレンダリングしなかった場合でも、[`loader`](../../start/data/route-object#loader) を実行できます（つまり、ハイドレーションデータでキャッシュをプライミングするため）。

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

### opts.patchRoutesOnNavigation

ナビゲーション時にルートツリーの一部を遅延定義します。[`PatchRoutesOnNavigationFunction`](https://api.reactrouter.com/v7/types/react_router.PatchRoutesOnNavigationFunction.html) を参照してください。

デフォルトでは、React Routerは `createBrowserRouter(routes)` を介して完全なルートツリーを事前に提供することを想定しています。これにより、React Routerは同期的なルートマッチングを実行し、ローダーを実行し、ウォーターフォールを発生させることなく、最も楽観的な方法でルートコンポーネントをレンダリングできます。トレードオフとして、初期JSバンドルは定義上大きくなり、アプリケーションの成長とともに起動時間が遅くなる可能性があります。

これに対処するため、[v6.9.0](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v690) で [`route.lazy`](../../start/data/route-object#lazy) を導入しました。これにより、ルートの _定義_ の側面（`path`、`index` など）を事前に提供しつつ、ルートの _実装_（[`loader`](../../start/data/route-object#loader)、[`Component`](../../start/data/route-object#Component) など）を遅延ロードできます。これは良い中間策です。React Routerはルート定義（軽量な部分）を事前に認識し、同期的なルートマッチングを実行できますが、ルートの実装側面（重い部分）のロードは、実際にそのルートにナビゲートされるまで遅延させることができます。

場合によっては、これだけでは不十分です。大規模なアプリケーションでは、すべてのルート定義を事前に提供することが非常にコスト高になる可能性があります。さらに、特定のマイクロフロントエンドやモジュールフェデレーションアーキテクチャでは、すべてのルート定義を事前に提供すること自体が不可能かもしれません。

ここで `patchRoutesOnNavigation` が登場します（[RFC](https://github.com/remix-run/react-router/discussions/11113)）。このAPIは、完全なルートツリーを事前に提供できず、実行時にルートツリーの一部を遅延的に「発見」する方法が必要な高度なユースケース向けです。この機能は、ビデオゲームが移動するにつれて「世界」を拡大するのと同様に、ユーザーがアプリ内をナビゲートするにつれてルーターがルーティングツリーを拡大するが、ユーザーが訪れたツリーの部分のみをロードすることから、「[Fog of War](https://en.wikipedia.org/wiki/Fog_of_war)」と呼ばれることがあります。

`patchRoutesOnNavigation` は、React Routerが `path` に一致できない場合にいつでも呼び出されます。引数には `path`、部分的な `matches`、および特定の場所に新しいルートをツリーにパッチするために呼び出すことができる `patch` 関数が含まれます。このメソッドは、`GET` リクエストのナビゲーションの `loading` フェーズ中、および非 `GET` リクエストのナビゲーションの `submitting` フェーズ中に実行されます。

<details>
  <summary><b>`patchRoutesOnNavigation` の使用例</b></summary>

  **既存のルートに子をパッチする**

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

  上記の例では、ユーザーが `/a` へのリンクをクリックすると、React Routerは最初はどのルートにも一致せず、`path = "/a"` とルートルートの一致を含む `matches` 配列で `patchRoutesOnNavigation` を呼び出します。`patch('root', [route])` を呼び出すことで、新しいルートは `root` ルートの子としてルートツリーに追加され、React Routerは更新されたルートに対してマッチングを実行します。今回は `/a` パスに正常に一致し、ナビゲーションは正常に完了します。

  **新しいルートレベルのルートをパッチする**

  ツリーの最上位に新しいルートをパッチする必要がある場合（つまり、親がない場合）、`routeId` として `null` を渡すことができます。

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

  **サブツリーを非同期にパッチする**

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

  <docs-info>`patchRoutesOnNavigation` の実行中に、後続のナビゲーションによって中断された場合、中断された実行における残りの `patch` 呼び出しは、操作がキャンセルされたためルートツリーを更新しません。</docs-info>

  **ルート定義とルート発見の併置**

  独自の擬似マッチングを実行したくない場合は、部分的な `matches` 配列とルート上の [`handle`](../../start/data/route-object#handle) フィールドを活用して、子定義を併置することができます。

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

  **パラメータを持つルートに関する注意**

  React Routerは、与えられたパスに最適な一致を見つけるためにランク付けされたルートを使用するため、特定の時点で部分的なルートツリーしか知られていない場合に興味深い曖昧さが生じます。`path: "/about/contact-us"` のような完全に静的なルートに一致する場合、それが完全に静的なURLセグメントで構成されているため、正しい一致を見つけたとわかります。したがって、他の潜在的にスコアの高いルートをわざわざ探す必要はありません。

  しかし、パラメータ（動的またはスプラット）を持つルートは、まだ発見されていない、よりスコアの高いルートが存在する可能性があるため、この仮定をすることはできません。次のような完全なルートツリーを考えてみましょう。

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

  そして、ユーザーがナビゲートする際に `patchRoutesOnNavigation` を使用してこれを埋めたいと仮定します。

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

  ユーザーが最初にブログ投稿（例：`/blog/my-post`）にアクセスした場合、`:slug` ルートをパッチします。その後、ユーザーが新しい投稿を作成するために `/blog/new` にナビゲートした場合、`/blog/:slug` に一致しますが、それは _正しい_ 一致ではありません！まだ発見されていない、よりスコアの高いルートが存在する可能性に備えて `patchRoutesOnNavigation` を呼び出す必要があります。このケースでは実際に存在します。

  したがって、React Routerが少なくとも1つのパラメータを含むパスに一致するたびに、`patchRoutesOnNavigation` を呼び出し、最適な一致を見つけたことを確認するために再度ルートをマッチングします。

  `patchRoutesOnNavigation` の実装が高価であるか、バックエンドサーバーへの副作用のある [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) 呼び出しを行っている場合、適切なルートが既に見つかっていることがわかっているケースでの過剰なフェッチを避けるために、以前に見たルートを追跡することを検討してください。これは通常、適切なルートを既にパッチした以前の `path` 値の小さなキャッシュを維持するのと同じくらい簡単です。

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

[`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) オブジェクトのオーバーライド。デフォルトはグローバルな `window` インスタンスです。

## 戻り値

[`<RouterProvider>`](../data-routers/RouterProvider) に渡す、初期化された [データルーター](https://api.reactrouter.com/v7/interfaces/react_router.DataRouter.html)。