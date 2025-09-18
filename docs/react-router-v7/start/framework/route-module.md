---
title: ルートモジュール
order: 3
---

# ルートモジュール

[MODES: framework]

## はじめに

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
      <p>ローダーデータ: {JSON.stringify(loaderData)}</p>
      <p>アクションデータ: {JSON.stringify(actionData)}</p>
      <p>ルートパラメータ: {JSON.stringify(params)}</p>
      <p>一致したルート: {JSON.stringify(matches)}</p>
    </div>
  );
}
```

## `middleware`

ルート[ミドルウェア][middleware]は、ドキュメントおよびデータリクエストの前後でサーバー上で順次実行されます。これにより、ロギング、認証、レスポンスの後処理などを一箇所で行うことができます。`next` 関数はチェーンを続行し、リーフルートでは `next` 関数がナビゲーションのローダー/アクションを実行します。

以下は、サーバー上でリクエストをログに記録するミドルウェアの例です。

```tsx filename=root.tsx
async function loggingMiddleware(
  { request, context },
  next,
) {
  console.log(
    `${new Date().toISOString()} ${request.method} ${request.url}`,
  );
  const start = performance.now();
  const response = await next();
  const duration = performance.now() - start;
  console.log(
    `${new Date().toISOString()} Response ${response.status} (${duration}ms)`,
  );
  return response;
}

export const middleware = [loggingMiddleware];
```

以下は、ログインしているユーザーをチェックし、ローダーからアクセスできる `context` にユーザーを設定するミドルウェアの例です。

```tsx filename=routes/_auth.tsx
async function authMiddleware ({
  request,
  context,
}) => {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    throw redirect("/login");
  }

  const user = await getUserById(userId);
  context.set(userContext, user);
};

export const middleware = [authMiddleware];
```

<docs-warning>ルートにミドルウェアを追加する際に、アプリケーションが意図したとおりに動作するように、[ミドルウェアがいつ実行されるか][when-middleware-runs]を理解していることを確認してください。</docs-warning>

参照：

- [`middleware` params][middleware-params]
- [ミドルウェア][middleware]

## `clientMiddleware`

これは `middleware` のクライアントサイド版であり、クライアントナビゲーション中にブラウザで実行されます。サーバーミドルウェアとの唯一の違いは、クライアントミドルウェアはサーバー上のHTTPリクエストをラップしないため、レスポンスを返さないことです。

以下は、クライアント上でリクエストをログに記録するミドルウェアの例です。

```tsx filename=root.tsx
async function loggingMiddleware(
  { request, context },
  next,
) {
  console.log(
    `${new Date().toISOString()} ${request.method} ${request.url}`,
  );
  const start = performance.now();
  await next(); // 👈 No Response returned
  const duration = performance.now() - start;
  console.log(
    `${new Date().toISOString()} Response ${response.status} (${duration}ms)`,
  );
  // ✅ No need to return anything
}

export const clientMiddleware = [
  loggingMiddleware,
];
```

参照：

- [ミドルウェア][middleware]

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
        <button type="submit">Todo を作成</button>
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

参照：

- [`action` params][action-params]

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

参照：

- [`useRouteError`][use-route-error]
- [`isRouteErrorResponse`][is-route-error-response]

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

ルート `headers` 関数は、サーバーレンダリング時にレスポンスとともに送信される HTTP ヘッダーを定義します。

```tsx
export function headers() {
  return {
    "X-Stretchy-Pants": "its for fun",
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}
```

参照：

- [`Headers`][headers]

## `handle`

ルートハンドルを使用すると、アプリは `useMatches` のルート一致に何かを追加して、抽象化（パンくずリストなど）を作成できます。

```tsx
export const handle = {
  its: "all yours",
};
```

参照：

- [`useMatches`][use-matches]

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

ルートメタは、通常 `<head>` 内に配置される `<Meta />` コンポーネントにレンダリングされるメタタグを定義します。

<docs-warning>

React 19以降、ルートモジュールの`meta`エクスポートを使用するよりも、[組み込みの`<meta>`要素](https://react.dev/reference/react-dom/components/meta)を使用することが推奨されます。

以下に、その使用方法と`<title>`要素の例を示します。

```tsx
export default function MyRoute() {
  return (
    <div>
      <title>Very cool app</title>
      <meta property="og:title" content="Very cool app" />
      <meta
        name="description"
        content="This app is the best"
      />
      {/* ルートの残りのコンテンツ... */}
    </div>
  );
}
```

</docs-warning>

```tsx filename=app/product.tsx
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

```tsx filename=app/root.tsx
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

最後のマッチングルートのメタが使用され、親ルートのメタを上書きできます。メタ記述子配列全体がマージされるのではなく、置き換えられることに注意することが重要です。これにより、異なるレベルのページ間で独自のメタ構成ロジックを構築する柔軟性が得られます。

**参照**

- [`meta` params][meta-params]
- [`meta` function return types][meta-function]

## `shouldRevalidate`

SSR を使用するフレームワークモードでは、ルートローダーはすべてのナビゲーションとフォーム送信後に自動的に再検証されます（これは[データモード][data-mode-should-revalidate]とは異なります）。これにより、ミドルウェアとローダーはリクエストコンテキストを共有し、データモードの場合とは異なる方法で最適化できます。

この関数を定義すると、ナビゲーションとフォーム送信に対するルートローダーの再検証をオプトアウトできます。

```tsx
import type { ShouldRevalidateFunctionArgs } from "react-router";

export function shouldRevalidate(
  arg: ShouldRevalidateFunctionArgs,
) {
  return true;
}
```

[SPA モード][spa-mode]を使用する場合、ナビゲーション時に呼び出すサーバーローダーがないため、`shouldRevalidate` は[データモード][data-mode-should-revalidate]と同じように動作します。

[`ShouldRevalidateFunctionArgs` Reference Documentation ↗](https://api.reactrouter.com/v7/interfaces/react_router.ShouldRevalidateFunctionArgs.html)

---

次: [レンダリング戦略](./rendering)

[middleware-params]: https://api.reactrouter.com/v7/types/react_router.MiddlewareFunction.html
[middleware]: ../../how-to/middleware
[when-middleware-runs]: ../../how-to/middleware#when-middleware-runs
[loader-params]: https://api.reactrouter.com/v7/interfaces/react_router.LoaderFunctionArgs
[client-loader-params]: https://api.reactrouter.com/v7/types/react_router.ClientLoaderFunctionArgs
[action-params]: https://api.reactrouter.com/v7/interfaces/react_router.ActionFunctionArgs
[client-action-params]: https://api.reactrouter.com/v7/types/react_router.ClientActionFunctionArgs
[use-route-error]: ../../api/hooks/useRouteError
[is-route-error-response]: ../../api/utils/isRouteErrorResponse
[headers]: https://developer.mozilla.org/en-US/docs/Web/API/Response/headers
[use-matches]: ../../api/hooks/useMatches
[link-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[meta-element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
[meta-params]: https://api.reactrouter.com/v7/interfaces/react_router.MetaArgs
[meta-function]: https://api.reactrouter.com/v7/types/react_router.MetaDescriptor.html
[data-mode-should-revalidate]: ../data/route-object#shouldrevalidate
[spa-mode]: ../../how-to/spa