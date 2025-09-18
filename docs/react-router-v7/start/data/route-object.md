---
title: ルートオブジェクト
order: 3
---

# ルートオブジェクト

[MODES: data]

## はじめに

`createBrowserRouter` に渡されるオブジェクトはルートオブジェクトと呼ばれます。

```tsx lines=[2-5]
createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
]);
```

ルートモジュールは React Router のデータ機能の基盤であり、以下を定義します：

- データローディング
- アクション
- 再検証
- エラー境界
- など

このガイドは、すべてのルートオブジェクト機能の簡単な概要です。

## Component

ルートオブジェクトの `Component` プロパティは、ルートが一致したときにレンダリングされるコンポーネントを定義します。

```tsx lines=[4]
createBrowserRouter([
  {
    path: "/",
    Component: MyRouteComponent,
  },
]);

function MyRouteComponent() {
  return (
    <div>
      <h1>Look ma!</h1>
      <p>
        I'm still using React Router after like 10 years.
      </p>
    </div>
  );
}
```

## `middleware`

ルート[ミドルウェア][middleware]は、ナビゲーションの前後に順次実行されます。これにより、ロギングや認証などの処理を一箇所で行うことができます。`next` 関数はチェーンを続行し、リーフルートでは `next` 関数がナビゲーションのローダー/アクションを実行します。

```tsx
createBrowserRouter([
  {
    path: "/",
    middleware: [loggingMiddleware],
    loader: rootLoader,
    Component: Root,
    children: [{
      path: 'auth',
      middleware: [authMiddleware],
      loader: authLoader,
      Component: Auth,
      children: [...]
    }]
  },
]);

async function loggingMiddleware({ request }, next) {
  let url = new URL(request.url);
  console.log(`Starting navigation: ${url.pathname}${url.search}`);
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  console.log(`Navigation completed in ${duration}ms`);
}

const userContext = createContext<User>();

async function authMiddleware ({ context }) {
  const userId = getUserId();

  if (!userId) {
    throw redirect("/login");
  }

  context.set(userContext, await getUserById(userId));
};
```

参照：

- [ミドルウェア][middleware]

## `loader`

ルートローダーは、ルートコンポーネントがレンダリングされる前にデータを提供します。

```tsx
import {
  useLoaderData,
  createBrowserRouter,
} from "react-router";

createBrowserRouter([
  {
    path: "/",
    loader: loader,
    Component: MyRoute,
  },
]);

async function loader({ params }) {
  return { message: "Hello, world!" };
}

function MyRoute() {
  let data = useLoaderData();
  return <h1>{data.message}</h1>;
}
```

参照：

- [`loader` パラメータ][loader-params]

## `action`

ルートアクションは、`<Form>`、`useFetcher`、および `useSubmit` から呼び出されたときに、ページ上のすべてのローダーデータの自動再検証を伴うサーバーサイドのデータ変更を可能にします。

```tsx
import {
  createBrowserRouter,
  useLoaderData,
  useActionData,
  Form,
} from "react-router";
import { TodoList } from "~/components/TodoList";

createBrowserRouter([
  {
    path: "/items",
    action: action,
    loader: loader,
    Component: Items,
  },
]);

async function action({ request }) {
  const data = await request.formData();
  const todo = await fakeDb.addItem({
    title: data.get("title"),
  });
  return { ok: true };
}

// このデータはアクション完了後に再検証されます...
async function loader() {
  const items = await fakeDb.getItems();
  return { items };
}

// ...そのため、ここのリストは自動的に更新されます
export default function Items() {
  let data = useLoaderData();
  return (
    <div>
      <List items={data.items} />
      <Form method="post" navigate={false}>
        <input type="text" name="title" />
        <button type="submit">Create Todo</button>
      </Form>
    </div>
  );
}
```

## `shouldRevalidate`

ローダーデータは、ナビゲーションやフォーム送信などの特定のイベントの後に自動的に再検証されます。

このフックを使用すると、デフォルトの再検証動作をオプトインまたはオプトアウトできます。デフォルトの動作は、ローダーを不必要に呼び出すことを避けるために微妙に調整されています。

ルートローダーは、次の場合に再検証されます。

- 独自のルートパラメータが変更された場合
- URL検索パラメータが変更された場合
- アクションが呼び出され、エラーではないステータスコードを返した後

この関数を定義することにより、デフォルトの動作を完全にオプトアウトし、ナビゲーションやフォーム送信に対するローダーデータの再検証をいつ行うかをを手動で制御できます。

```tsx
import type { ShouldRevalidateFunctionArgs } from "react-router";

function shouldRevalidate(
  arg: ShouldRevalidateFunctionArgs,
) {
  return true; // false
}

createBrowserRouter([
  {
    path: "/",
    shouldRevalidate: shouldRevalidate,
    Component: MyRoute,
  },
]);
```

[`ShouldRevalidateFunctionArgs` リファレンスドキュメント ↗](https://api.reactrouter.com/v7/interfaces/react_router.ShouldRevalidateFunctionArgs.html)

デフォルトの動作は [フレームワークモード](../modes) では異なることに注意してください。

## `lazy`

ほとんどのプロパティは、初期バンドルサイズを削減するために遅延インポートできます。

```tsx
createBrowserRouter([
  {
    path: "/app",
    lazy: async () => {
      // レンダリング前にコンポーネントとローダーを並行してロードする
      const [Component, loader] = await Promise.all([
        import("./app"),
        import("./app-loader"),
      ]);
      return { Component, loader };
    },
  },
]);
```

---

次へ: [データローディング](./data-loading)

[loader-params]: https://api.reactrouter.com/v7/interfaces/react_router.LoaderFunctionArgs
[middleware]: ../../how-to/middleware