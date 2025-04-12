---
title: ルーティング
order: 2
---

# ルーティング

[MODES: data]

## ルートの設定

ルートは `createBrowserRouter` の最初の引数として設定されます。最低限、パスとコンポーネントが必要です:

```tsx
import { createBrowserRouter } from "react-router";

function Root() {
  return <h1>Hello world</h1>;
}

const router = createBrowserRouter([
  { path: "/", Component: Root },
]);
```

以下は、より大きなルート設定のサンプルです:

```ts filename=app/routes.ts
createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      {
        path: "auth",
        Component: AuthLayout,
        children: [
          { path: "login", Component: Login },
          { path: "register", Component: Register },
        ],
      },
      {
        path: "concerts",
        children: [
          { index: true, Component: ConcertsHome },
          { path: ":city", Component: ConcertsCity },
          { path: "trending", Component: ConcertsTrending },
        ],
      },
    ],
  },
]);
```

## ルートオブジェクト

ルートオブジェクトは、パスとコンポーネントだけでなく、データローディングやアクションなど、ルートの動作を定義します。[ルートオブジェクトガイド](./route-objects)で詳細を説明しますが、ここではローダーの簡単な例を示します。

```tsx filename=app/team.tsx
import {
  createBrowserRouter,
  useLoaderData,
} from "react-router";

createBrowserRouter([
  {
    path: "/teams/:teamId",
    loader: async ({ params }) => {
      let team = await fetchTeam(params.teamId);
      return { name: team.name };
    },
    Component: Team,
  },
]);

function Team() {
  let data = useLoaderData();
  return <h1>{data.name}</h1>;
}
```

## ネストされたルート

ルートは `children` を通じて親ルート内にネストできます。

```ts filename=app/routes.ts
createBrowserRouter([
  {
    path: "/dashboard",
    Component: Dashboard,
    children: [
      { index: true, Component: Home },
      { path: "settings", Component: Settings },
    ],
  },
]);
```

親のパスは自動的に子に含まれるため、この設定は `"/dashboard"` と `"/dashboard/settings"` の両方の URL を作成します。

子ルートは親ルートの `<Outlet/>` を通じてレンダリングされます。

```tsx filename=app/dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* <Home> または <Settings> のいずれかになります */}
      <Outlet />
    </div>
  );
}
```

## レイアウトルート

ルートで `path` を省略すると、URL にセグメントを追加せずに、その子ルートのための新しい[ネストされたルート](#nested-routes)が作成されます。

```tsx lines=[3,16]
createBrowserRouter([
  {
    // この親ルートにはパスはなく、コンポーネントのみ
    Component: MarketingLayout,
    children: [
      { index: true, Component: Home },
      { path: "contact", Component: Contact },
    ],
  },

  {
    path: "projects",
    children: [
      { index: true, Component: ProjectsHome },
      {
        // 再び、パスはなく、レイアウト用のコンポーネントのみ
        Component: ProjectLayout,
        children: [
          { path: ":pid", Component: Project },
          { path: ":pid/edit", Component: EditProject },
        ],
      },
    ],
  },
]);
```

注意点:

- `Home` と `Contact` は `MarketingLayout` のアウトレットにレンダリングされます。
- `Project` と `EditProject` は `ProjectLayout` のアウトレットにレンダリングされますが、`ProjectsHome` はレンダリングされません。

## インデックスルート

インデックスルートは、パスを持たないルートオブジェクトに `index: true` を設定することで定義されます。

```ts
{ index: true, Component: Home }
```

インデックスルートは、親の URL で親の[Outlet][outlet]にレンダリングされます（デフォルトの子ルートのようなものです）。

```ts lines=[4,5,10,11]
import { createBrowserRouter } from "react-router";

createBrowserRouter([
  // "/" でレンダリングされる
  { index: true, Component: Home },
  {
    Component: Dashboard,
    path: "/dashboard",
    children: [
      // "/dashboard" でレンダリングされる
      { index: true, Component: DashboardHome },
      { path: "settings", Component: DashboardSettings },
    ],
  },
]);
```

インデックスルートは子を持つことができないことに注意してください。

## プレフィックスルート

パスのみを持ちコンポーネントを持たないルートは、パスプレフィックスを持つルートのグループを作成します。

```tsx lines=[3]
createBrowserRouter([
  {
    // コンポーネントはなく、パスのみ
    path: "/projects",
    children: [
      { index: true, Component: ProjectsHome },
      { path: ":pid", Component: Project },
      { path: ":pid/edit", Component: EditProject },
    ],
  },
]);
```

これにより、レイアウトコンポーネントを導入することなく、`/projects`、`/projects/:pid`、および `/projects/:pid/edit` というルートが作成されます。

## 動的セグメント

パスセグメントが `:` で始まる場合、それは「動的セグメント」になります。ルートが URL に一致すると、動的セグメントは URL から解析され、他のルーター API に `params` として提供されます。

```ts lines=[2]
{
  path: "teams/:teamId",
  loader: async ({ params }) => {
    // params は loader/action で利用可能
    let team = await fetchTeam(params.teamId);
    return { name: team.name };
  },
  Component: Team,
}
```

```tsx
import { useParams } from "react-router";

function Team() {
  // params はコンポーネント内で useParams を通じて利用可能
  let params = useParams();
  // ...
}
```

1つのルートパスに複数の動的セグメントを含めることができます:

```ts
{
  path: "c/:categoryId/p/:productId";
}
```

## オプショナルセグメント

セグメントの末尾に `?` を追加することで、ルートセグメントをオプショナルにすることができます。

```ts
{
  path: ":lang?/categories";
}
```

静的なセグメントもオプショナルにできます:

```ts
{
  path: "users/:userId/edit?";
}
```

## スプラット

「キャッチオール」や「スター」セグメントとも呼ばれます。ルートパスターンが `/*` で終わる場合、`/` に続く任意の文字（他の `/` 文字を含む）に一致します。

```ts
{
  path: "files/*";
  loader: async ({ params }) => {
    params["*"]; // files/ の後の残りの URL が含まれます
  };
}
```

`*` を分割代入できますが、新しい名前を割り当てる必要があります。一般的な名前は `splat` です:

```tsx
const { "*": splat } = params;
```

---

次へ: [ルートオブジェクト](./route-object)

[outlet]: https://api.reactrouter.com/v7/functions/react_router.Outlet.html
