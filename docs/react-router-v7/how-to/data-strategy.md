---
title: データ戦略
---

# データ戦略

[MODES: data]

<br />
<br />

<docs-warning>これは高度なユースケース向けの低レベル API です。React Router の `action`/`loader` 実行の内部的な処理をオーバーライドするものであり、誤って使用するとアプリのコードが破損します。注意して使用し、適切なテストを実施してください。</docs-warning>

## 概要

デフォルトでは、React Router はデータのロード/送信方法について意見を持っています。そして最も注目すべきは、最適なデータフェッチのために、すべての [`loader`][loader] 関数を並行して実行することです。これはほとんどのユースケースで正しい動作であると考えていますが、多様なアプリケーション要件に対応するデータフェッチにおいて、「万能な」解決策はないことを認識しています。

[`dataStrategy`][data-strategy] オプションは、[`action`][action]/[`loader`][loader] 関数がどのように実行されるかを完全に制御し、middleware、context、キャッシングレイヤーなどのより高度な API を構築するための基盤を提供します。将来的には、React Router によりファーストクラスの API を提供するために、この API を内部的に活用する予定ですが、それまでは（そしてその後も）、これはアプリケーションのデータ要件に対してより高度な機能を追加する方法となります。

## 使用法

カスタムの `dataStrategy` は、`loader`/`action` の引数（`request`、`params`、`context`）に加えて、アプリケーションの実行をどのように制御するかを決定できるいくつかの引数を受け取ります。

- `matches`: 現在の `request` にマッチしたルートの `DataStrategyMatch` インスタンスの配列
- `runClientMiddleware`: マッチしたルートの `middleware` を実行するためのヘルパー関数
- `fetcherKey`: これがナビゲーションではなく `fetcher` リクエストの場合の `fetcher` キー

`DataStrategyMatch` は、通常のルートマッチに加えて、いくつかの追加フィールドを持っています。

- `shouldCallHandler`: このルートのハンドラーをこの `request` で呼び出すべきかどうかを知らせる関数
- `shouldRevalidateArgs`: この `request` に対してルートの `shouldRevalidate` に渡される引数
- ~~`shouldLoad`~~: このルートのハンドラーをこの `request` で実行すべきかどうかを示す boolean フィールド
  - より強力な `shouldCallHandler` API の代わりに非推奨となりました
- `resolve`: ルートハンドラーを呼び出し、ハンドラーのカスタム実行を可能にする関数

ハンドラーの実行の周囲にログを追加する基本的な例を以下に示します。

```tsx
let router = createBrowserRouter(routes, {
  async dataStrategy({
    matches,
    request,
    runClientMiddleware,
  }) {
    // Determine which matches are expected to be executed for this request.
    // - For loading navigations, this will return true for new routes + existing
    //   routes requiring revalidation
    // - For submission navigations, this will only return true for the action route
    // - For fetcher calls, this will only return true for the fetcher route
    const matchesToLoad = matches.filter((m) =>
      m.shouldCallHandler(),
    );

    // For each match that we want to execute, call match.resolve() to execute
    // the handler and store the result
    const results: Record<string, DataStrategyResult> = {};
    await runClientMiddleware(() =>
      Promise.all(
        matchesToLoad.map(async (match) => {
          console.log(`Processing ${match.route.id}`);
          // The resolve function calls through to the route handler
          results[match.route.id] = await match.resolve();
        }),
      ),
    );
    return results;
  },
});
```

`dataStrategy` 関数は、実行された各ハンドラーの結果を含む `Record<string, DataStrategyResult>` を返す必要があります。`DataStrategyResult` は、ハンドラーが値を返したか、エラーをスローしたかを示す単なるラッパーオブジェクトです。

```ts
interface DataStrategyResult {
  type: "data" | "error";
  result: unknown; // data, Error, Response, data()
}
```

### ルートミドルウェアの呼び出し

ルートで `middleware` を使用している場合は、ハンドラーの周囲で `middleware` を実行するために `callClientMiddleware` ヘルパー関数を活用する必要があります。

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

    // Run middleware and execute handlers at the end of the middleware chain
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

`runClientMiddleware` は `dataStrategy` と同じ引数を取るため、スタンドアロンの `dataStrategy` 実装と簡単に組み合わせることもできます。

```tsx
const loggingDataStrategy: DataStrategyFunction = () => {
  /* ... */
};

let router = createBrowserRouter(routes, {
  async dataStrategy({ runClientMiddleware }) {
    let results = await runClientMiddleware(
      loggingDataStrategy,
    );
    return results;
  },
});
```

### 高度なハンドラー実行

ハンドラーの実行をより細かく制御したい場合は、`match.resolve()` にコールバックを渡すことができます。

```tsx
// Assume a loader shape such as
function loader({ request }, customContext) {...}

// In your dataStrategy, you can pass this context from inside a resolve callback
await Promise.all(
  matchesToLoad.map((match, i) =>
    match.resolve((handler) => {
      let customContext = getCustomContext();
      // Call the handler and p[ass a custom parameter as the handler's second argument
      return handler(customContext);
    }),
  ),
);
```

### カスタム再検証動作

再検証の動作を変更したい場合は、独自の `defaultShouldRevalidate` を `match.shouldCallHandler()` に渡すことができます。これはルートレベルの `shouldRevalidate` 関数に引き渡されます。ルートレベルの `shouldRevalidate` に渡される引数は `match.shouldRevalidateArgs` で利用できます。

```tsx
const matchesToLoad = matches.filter((match) => {
  let defaultShouldRevalidate = customShouldRevalidate(
    match.shouldRevalidateArgs,
  );
  return m.shouldCallHandler(defaultShouldRevalidate);
});
```

## `shouldLoad` からの移行

新しい `match.shouldCallHandler()`/`match.shouldRevalidateArgs` フィールドが安定したため、現在は非推奨である `match.shouldLoad` API から移行することが推奨されます。以前の boolean によるアプローチでは、カスタム `dataStrategy` 関数がデフォルトの再検証動作を変更できなかったため、それを可能にするために新しい関数ベースの API が作成されました。

これら2つの API の主な違いは、`shouldLoad` を使用している場合、`resolve()` を呼び出すと、`shouldLoad` が `true` の場合に_のみ_ハンドラーが呼び出された点です。サブセットのみがハンドラーを実行する必要がある場合でも、すべてのマッチに対して安全に呼び出すことができました。

`shouldCallHandler` を使用する場合、どのハンドラーを呼び出すかはユーザーが責任を持つため、`resolve` を呼び出すと自動的にハンドラーが呼び出されます。ハンドラーを実行したいマッチのセットに対してのみ `resolve` を呼び出すべきです。

以前の API から新しい API への変更例を以下に示します。`resolve()` を呼び出す前に `matchesToLoad` を事前にフィルタリングしている点に注目してください。

```diff
let results = {};
+let matchesToLoad = matches.filter(m => m.shouldCallHandler());
await Promise.all(() =>
-  matches.map((m) => {
+  matchesToLoad.map((m) => {
    results[m.route.id] = await m.resolve();
  }),
);
return results;
```

## 高度なユースケース

### カスタムミドルウェア

<docs-info>React Router に `middleware` が組み込まれた現在では、これはあまり起こりそうにないユースケースですが、カスタム `middleware` を使用したい場合は `dataStrategy` でそれを行うことができます。</docs-info>

各ルートで [`handle`](../../start/data/route-object#handle) を介して `middleware` を定義し、最初に `middleware` を順次呼び出し、次にすべての [`loader`](../../start/data/route-object#loader) を並行して呼び出す方法を定義しましょう。これにより、`middleware` を介して利用可能になったデータが提供されます。

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
          context,
        );
      }
    }

    // Run loaders in parallel with the `context` value
    let matchesToLoad = matches.filter((m) =>
      m.shouldCallHandler(),
    );
    let results = await Promise.all(
      matchesToLoad.map((match, i) =>
        match.resolve((handler) => {
          // Whatever you pass to `handler` will be passed as the 2nd parameter
          // to your loader/action
          return handler(context);
        }),
      ),
    );
    return results.reduce(
      (acc, result, i) =>
        Object.assign(acc, {
          [matchesToLoad[i].route.id]: result,
        }),
      {},
    );
  },
});
```

### カスタムハンドラー

ルートレベルで [`loader`](../../start/daoute-object#loader) の実装を定義したくない場合も考えられます。たとえば、ルートを決定し、すべてのデータに対して単一の GraphQL リクエストを発行したい場合などです。そのためには、`route.loader=true` を設定して「`loader` を持つ」ものとして認定し、`GQL` フラグメントを `route.handle` に格納します。

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
    const matchesToLoad = matches.filter((m) =>
      m.shouldCallHandler(),
    );
    // Compose route fragments into a single GQL payload
    let gql = getFragmentsFromRouteHandles(matchesToLoad);
    let data = await fetchGql(gql);
    // Parse results back out into individual route level `DataStrategyResult`'s
    // keyed by `routeId`
    let results = parseResultsFromGql(matchesToLoad, data);
    return results;
  },
});
```

このシナリオでは、ルートに定義されたハンドラーを呼び出したくないため、実際には `match.resolve()` を呼び出しません。代わりに、単一の GQL 呼び出しを行い、結果のデータを `results` 内の適切なルートに分割して戻します。

[loader]: ../start/data/route-object#loader
[action]: ../start/data/route-object#action
[data-strategy]: ../api/data-routers/createBrowserRouter#optsdatastrategy