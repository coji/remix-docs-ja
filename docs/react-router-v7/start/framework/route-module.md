---
title: ルートモジュール
order: 3
---

# ルートモジュール

`routes.ts`で参照されるファイルは、ルートモジュールと呼ばれます。

```tsx filename=app/routes.ts
route("teams/:teamId", "./team.tsx"),
//           ルートモジュール ^^^^^^^^
```

ルートモジュールは、React Routerのフレームワーク機能の基礎であり、以下を定義します。

- 自動コード分割
- データ読み込み
- アクション
- 再検証
- エラーバウンダリ
- その他多数

このガイドは、すべてのルートモジュール機能の概要です。残りの入門ガイドでは、これらの機能をより詳細に説明します。

## コンポーネント (`default`)

ルートが一致したときにレンダリングされるコンポーネントを定義します。

```tsx filename=app/routes/my-route.tsx
export default function MyRouteComponent() {
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

ルートローダーは、ルートコンポーネントがレンダリングされる前に、ルートコンポーネントにデータを提供します。サーバーサイドレンダリング時、またはプリレンダリングによるビルド時にのみサーバーで呼び出されます。

```tsx
export async function loader() {
  return { message: "Hello, world!" };
}

export default function MyRoute({ loaderData }) {
  return <h1>{loaderData.message}</h1>;
}
```

参照:

- [`loader` パラメータ][loader-params]

## `clientLoader`

ブラウザでのみ呼び出され、ルートクライアントローダーは、ルートローダーに追加して、またはルートローダーの代わりに、ルートコンポーネントにデータを提供します。

```tsx
export async function clientLoader({ serverLoader }) {
  // サーバーローダーを呼び出す
  const serverData = await serverLoader();
  // クライアントでデータを取得する
  const data = getDataFromClient();
  // `useLoaderData()` を介して公開するデータを返す
  return data;
}
```

クライアントローダーは、関数の`hydrate`プロパティを設定することで、サーバーレンダリングされたページの初期ページロードハイドレーションに参加できます。

```tsx
export async function clientLoader() {
  // ...
}
clientLoader.hydrate = true as const;
```

<docs-info>

`as const`を使用することで、TypeScriptは`clientLoader.hydrate`の型を`boolean`ではなく`true`として推論します。
これにより、React Routerは`clientLoader.hydrate`の値に基づいて`loaderData`の型を導き出すことができます。

</docs-info>

参照:

- [`clientLoader` パラメータ][client-loader-params]

## `action`

ルートアクションは、`<Form>`、`useFetcher`、`useSubmit`から呼び出されたときに、ページ上のすべてのローダーデータの自動再検証を使用して、サーバーサイドのデータ変更を可能にします。

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

ルートアクションに似ていますが、ブラウザでのみ呼び出されます。

```tsx
export async function clientAction({ serverAction }) {
  fakeInvalidateClientSideCache();
  // 必要に応じてサーバーアクションを呼び出すこともできます
  const data = await serverAction();
  return data;
}
```

参照:

- [`clientAction` パラメータ][client-action-params]

## `ErrorBoundary`

他のルートモジュールAPIが例外をスローした場合、ルートコンポーネントの代わりにルートモジュールの`ErrorBoundary`がレンダリングされます。

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
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
```

## `HydrateFallback`

初期ページロード時に、ルートコンポーネントはクライアントローダーが完了した後にのみレンダリングされます。エクスポートされている場合、`HydrateFallback`はルートコンポーネントの代わりにすぐにレンダリングできます。

```tsx filename=routes/client-only-route.tsx
export async function clientLoader() {
  const data = await fakeLoadLocalGameData();
  return data;
}

export function HydrateFallback() {
  return <p>Loading Game...</p>;
}

export default function Component({ loaderData }) {
  return <Game data={loaderData} />;
}
```

## `headers`

ルートヘッダーは、サーバーサイドレンダリング時にレスポンスと共に送信されるHTTPヘッダーを定義します。

```tsx
export function headers() {
  return {
    "X-Stretchy-Pants": "its for fun",
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}
```

## `handle`

ルートハンドルにより、アプリは`useMatches`でルートマッチに任意のものを追加して、抽象化（パンくずリストなど）を作成できます。

```tsx
export const handle = {
  its: "all yours",
};
```

## `links`

ルートリンクは、ドキュメントの`<head>`にレンダリングされる[`<link>` 要素][link-element]を定義します。

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

すべてのルートリンクは集約され、`<Links />`コンポーネントを介してレンダリングされます。通常はアプリのルートでレンダリングされます。

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

ルートメタは、ドキュメントの`<head>`にレンダリングされるメタタグを定義します。

```tsx
export function meta() {
  return [
    { title: "Very cool app" },
    {
      property: "og:title",
      content: "Very cool app",
    },
    {
      name: "description",
      content: "This app is the best",
    },
  ];
}
```

すべてのルートのメタは集約され、`<Meta />`コンポーネントを介してレンダリングされます。通常はアプリのルートでレンダリングされます。

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

- [`meta` パラメータ][meta-params]

## `shouldRevalidate`

デフォルトでは、すべてルートはアクション後に再検証されます。この関数は、データに影響を与えないアクションについて、ルートが再検証をオプトアウトすることを許可します。

```tsx
import type { ShouldRevalidateFunctionArgs } from "react-router";

export function shouldRevalidate(
  arg: ShouldRevalidateFunctionArgs
) {
  return true;
}
```

---

次へ: [レンダリング戦略](./rendering)

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


