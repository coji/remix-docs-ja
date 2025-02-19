---
title: ルートモジュール
order: 3
---

# ルートモジュール

`routes.ts` で参照されるファイルは、ルートモジュールと呼ばれます。

```tsx filename=app/routes.ts
route("teams/:teamId", "./team.tsx"),
//           ルートモジュール ^^^^^^^^
```

ルートモジュールは、React Router のフレームワーク機能の基礎であり、以下を定義します。

- 自動コード分割
- データローディング
- アクション
- 再検証
- エラー境界
- その他

このガイドは、すべてのルートモジュールの機能の簡単な概要です。残りの入門ガイドでは、これらの機能についてより詳しく説明します。

## コンポーネント (`default`)

ルートモジュールの `default` エクスポートは、ルートが一致したときにレンダリングされるコンポーネントを定義します。

```tsx filename=app/routes/my-route.tsx
export default function MyRouteComponent() {
  return (
    <div>
      <h1>見て！</h1>
      <p>
        10 年経っても React Router を使ってるよ。
      </p>
    </div>
  );
}
```

### コンポーネントに渡される Props

コンポーネントがレンダリングされるとき、React Router が自動的に生成する `Route.ComponentProps` で定義された props が提供されます。これらの props には以下が含まれます。

1. `loaderData`: このルートモジュールの `loader` 関数から返されるデータ
2. `actionData`: このルートモジュールの `action` 関数から返されるデータ
3. `params`: ルートパラメータを含むオブジェクト（存在する場合）。
4. `matches`: 現在のルートツリー内のすべての一致の配列。

`useLoaderData` や `useParams` のようなフックの代わりにこれらの props を使用できます。これらはルートに対して自動的に型付けされるため、こちらの方が望ましい場合があります。

### Props の使用

```tsx filename=app/routes/my-route-with-default-params.tsx
import type { Route } from "./+types/route-name";

export default function MyRouteComponent({
  loaderData,
  actionData,
  params,
  matches,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>Props 付きのマイルートへようこそ！</h1>
      <p>Loader Data: {JSON.stringify(loaderData)}</p>
      <p>Action Data: {JSON.stringify(actionData)}</p>
      <p>ルートパラメータ: {JSON.stringify(params)}</p>
      <p>一致したルート: {JSON.stringify(matches)}</p>
    </div>
  );
}
```

## `loader`

ルートローダーは、ルートコンポーネントがレンダリングされる前に、ルートコンポーネントにデータを提供します。サーバーレンダリング時、またはプリレンダリングによるビルド時にのみサーバー上で呼び出されます。

```tsx
export async function loader() {
  return { message: "Hello, world!" };
}

export default function MyRoute({ loaderData }) {
  return <h1>{loaderData.message}</h1>;
}
```

参照：

- [`loader` params][loader-params]

## `clientLoader`

ブラウザでのみ呼び出されるルートクライアントローダーは、ルートローダーに加えて、またはルートローダーの代わりに、ルートコンポーネントにデータを提供します。

```tsx
export async function clientLoader({ serverLoader }) {
  // サーバーローダーを呼び出す
  const serverData = await serverLoader();
  // および/またはクライアントでデータをフェッチする
  const data = getDataFromClient();
  // useLoaderData() を通して公開するデータを返す
  return data;
}
```

クライアントローダーは、関数の `hydrate` プロパティを設定することで、サーバーレンダリングされたページの初期ページロードハイドレーションに参加できます。

```tsx
export async function clientLoader() {
  // ...
}
clientLoader.hydrate = true as const;
```

<docs-info>

`as const` を使用すると、TypeScript は `clientLoader.hydrate` の型を `boolean` ではなく `true` と推論します。
これにより、React Router は `clientLoader.hydrate` の値に基づいて `loaderData` の型を導出できます。

</docs-info>

参照：

- [`clientLoader` params][client-loader-params]

## `action`

ルートアクションを使用すると、`<Form>`、`useFetcher`、および `useSubmit` から呼び出されたときに、ページ上のすべてのローダーデータの自動再検証によるサーバー側のデータ変更が可能になります。

```tsx
// route("/list", "./list.tsx")
import { Form } from "react-router";
import { TodoList } from "~/components/TodoList";

// このデータはアクションが完了した後にロードされます...
export async function loader() {
  const items = await fakeDb.getItems();
  return { items };
}

// ...そのため、ここのリストは自動的に更新されます
export default function Items({ loaderData }) {
  return (
    <div>
      <List items={loaderData.items} />
      <Form method="post" navigate={false} action="/list">
        <input type="text" name="title" />
        <button type="submit">Create Todo</button>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const data = await request.formData();
  const todo = await fakeDb.addItem({
    title: data.get("title"),
  });
  return { ok: true };
}
```

## `clientAction`

ルートアクションと同様ですが、ブラウザでのみ呼び出されます。

```tsx
export async function clientAction({ serverAction }) {
  fakeInvalidateClientSideCache();
  // 必要に応じてサーバーアクションを呼び出すこともできます
  const data = await serverAction();
  return data;
}
```

参照：

- [`clientAction` params][client-action-params]

## `ErrorBoundary`

他のルートモジュール API が例外をスローすると、ルートコンポーネントの代わりにルートモジュールの `ErrorBoundary` がレンダリングされます。

```tsx
import {
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>エラー</h1>
        <p>{error.message}</p>
        <p>スタックトレースは次のとおりです:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>不明なエラー</h1>;
  }
}
```

## `HydrateFallback`

初期ページロードでは、ルートコンポーネントはクライアントローダーが完了した後にのみレンダリングされます。エクスポートされている場合、`HydrateFallback` はルートコンポーネントの代わりにすぐにレンダリングできます。

```tsx filename=routes/client-only-route.tsx
export async function clientLoader() {
  const data = await fakeLoadLocalGameData();
  return data;
}

export function HydrateFallback() {
  return <p>ゲームをロード中...</p>;
}

export default function Component({ loaderData }) {
  return <Game data={loaderData} />;
}
```

## `headers`

ルートヘッダーは、サーバーレンダリング時にレスポンスとともに送信される HTTP ヘッダーを定義します。

```tsx
export function headers() {
  return {
    "X-Stretchy-Pants": "its for fun",
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}
```

## `handle`

ルートハンドルを使用すると、アプリは `useMatches` のルート一致に何かを追加して、抽象化（パンくずリストなど）を作成できます。

```tsx
export const handle = {
  its: "all yours",
};
```

## `links`

ルートリンクは、ドキュメントの `<head>` にレンダリングされる [`<link>` 要素][link-element] を定義します。

```tsx
export function links() {
  return [
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
    },
    {
      rel: "stylesheet",
      href: "https://example.com/some/styles.css",
    },
    {
      rel: "preload",
      href: "/images/banner.jpg",
      as: "image",
    },
  ];
}
```

すべてのルートリンクが集約され、通常はアプリのルートでレンダリングされる `<Links />` コンポーネントを介してレンダリングされます。

```tsx
import { Links } from "react-router";

export default function Root() {
  return (
    <html>
      <head>
        <Links />
      </head>

      <body />
    </html>
  );
}
```

## `meta`

ルートメタは、ドキュメントの `<head>` にレンダリングされるメタタグを定義します。

```tsx
export function meta() {
  return [
    { title: "非常にクールなアプリ" },
    {
      property: "og:title",
      content: "非常にクールなアプリ",
    },
    {
      name: "description",
      content: "このアプリは最高です",
    },
  ];
}
```

すべてのルートのメタが集約され、通常はアプリのルートでレンダリングされる `<Meta />` コンポーネントを介してレンダリングされます。

```tsx
import { Meta } from "react-router";

export default function Root() {
  return (
    <html>
      <head>
        <Meta />
      </head>

      <body />
    </html>
  );
}
```

**参照**

- [`meta` params][meta-params]

## `shouldRevalidate`

デフォルトでは、すべてのアクションの後にすべてのルートが再検証されます。この関数を使用すると、ルートはデータに影響を与えないアクションの再検証をオプトアウトできます。

```tsx
import type { ShouldRevalidateFunctionArgs } from "react-router";

export function shouldRevalidate(
  arg: ShouldRevalidateFunctionArgs
) {
  return true;
}
```

---

次: [レンダリング戦略](./rendering)

[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[loader-params]: https://api.reactrouter.com/v7/interfaces/react_router.LoaderFunctionArgs
[client-loader-params]: https://api.reactrouter.com/v7/types/react_router.ClientLoaderFunctionArgs
[action-params]: https://api.reactrouter.com/v7/interfaces/react_router.ActionFunctionArgs
[client-action-params]: https://api.reactrouter.com/v7/types/react_router.ClientActionFunctionArgs
[error-boundaries]: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
[use-route-error]: https://api.reactrouter.com/v7/functions/react_router.useRouteError
[is-route-error-response]: https://api.reactrouter.com/v7/functions/react_router.isRouteErrorResponse
[cache-control-header]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[headers]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[use-matches]: https://api.reactrouter.com/v7/functions/react_router.useMatches
[link-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[meta-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
[meta-params]: https://api.reactrouter.com/v7/interfaces/react_router.MetaArgs
[use-revalidator]: https://api.reactrouter.com/v7/functions/react_router.useRevalidator.html

