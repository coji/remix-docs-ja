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

デフォルトでは、アクションの後、すべてのルートが再検証されます。この関数を使用すると、ルートはそのデータに影響を与えないアクションの再検証をオプトアウトできます。

```tsx
import type { ShouldRevalidateFunctionArgs } from "react-router";

function shouldRevalidate(
  arg: ShouldRevalidateFunctionArgs
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

次へ: [レンダリング戦略](./rendering)

[loader-params]: https://api.reactrouter.com/v7/interfaces/react_router.LoaderFunctionArgs
