---
title: ルーティング
order: 2
---

# ルーティング

## ルートの設定

ルートは `app/routes.ts` で設定します。各ルートには、URL にマッチする URL パターンと、その動作を定義するルートモジュールへのファイルパスという、2 つの必須部分があります。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("some/path", "./some/file.tsx"),
  // pattern ^           ^ module file
] satisfies RouteConfig;
```

以下は、より大きなサンプルルート設定です。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("about", "./about.tsx"),

  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;
```

設定ではなくファイル命名規則でルートを定義したい場合は、`@react-router/fs-routes` パッケージが [ファイルシステムルーティング規則][file-route-conventions] を提供します。

## ルートモジュール

`routes.ts` で参照されるファイルは、各ルートの動作を定義します。

```tsx filename=app/routes.ts
route("teams/:teamId", "./team.tsx"),
//           ルートモジュール ^^^^^^^^
```

以下は、ルートモジュールのサンプルです。

```tsx filename=app/team.tsx
// 型安全性/推論を提供
import type { Route } from "./+types/team";

// コンポーネントに `loaderData` を提供
export async function loader({ params }: Route.LoaderArgs) {
  let team = await fetchTeam(params.teamId);
  return { name: team.name };
}

// ローダーが完了した後にレンダリング
export default function Component({
  loaderData,
}: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>;
}
```

ルートモジュールには、アクション、ヘッダー、エラー境界などの機能がさらにありますが、これらについては次のガイド [ルートモジュール](./route-module) で説明します。

## ネストされたルート

ルートは、親ルートの中にネストできます。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  // 親ルート
  route("dashboard", "./dashboard.tsx", [
    // 子ルート
    index("./home.tsx"),
    route("settings", "./settings.tsx"),
  ]),
] satisfies RouteConfig;
```

親のパスは自動的に子に含まれるため、この設定では `"/dashboard"` と `"/dashboard/settings"` の両方の URL が作成されます。

子ルートは、親ルートの `<Outlet/>` を介してレンダリングされます。

```tsx filename=app/dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      {/* home.tsx または settings.tsx のいずれか */}
      <Outlet />
    </div>
  );
}
```

## ルートルート

`routes.ts` のすべてのルートは、特別な `app/root.tsx` モジュールの中にネストされます。

## レイアウトルート

`layout` を使用すると、レイアウトルートは子に対して新しいネストを作成しますが、URL にセグメントを追加しません。これはルートルートのようなものですが、任意のレベルで追加できます。

```tsx filename=app/routes.ts lines=[10,16]
import {
  type RouteConfig,
  route,
  layout,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  layout("./marketing/layout.tsx", [
    index("./marketing/home.tsx"),
    route("contact", "./marketing/contact.tsx"),
  ]),
  ...prefix("projects", [
    index("./projects/home.tsx"),
    layout("./projects/project-layout.tsx", [
      route(":pid", "./projects/project.tsx"),
      route(":pid/edit", "./projects/edit-project.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
```

`projects/home.tsx` がレイアウトに表示されるようにするには、アウトレットが必要です。

```tsx filename=./projects/project-layout.tsx lines=[8]
import { Outlet } from "react-router";

export default function ProjectLayout() {
  return (
    <div>
      <aside>例のサイドバー</aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

## インデックスルート

```ts
index(componentFile),
```

インデックスルートは、親の URL で親の [Outlet][outlet] にレンダリングされます（デフォルトの子ルートのように）。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  // / の root.tsx Outlet にレンダリング
  index("./home.tsx"),
  route("dashboard", "./dashboard.tsx", [
    // /dashboard の dashboard.tsx Outlet にレンダリング
    index("./dashboard-home.tsx"),
    route("settings", "./dashboard-settings.tsx"),
  ]),
] satisfies RouteConfig;
```

インデックスルートには子を含めることはできません。

## ルートプレフィックス

`prefix` を使用すると、親ルートファイルを追加することなく、ルートのセットにパスプレフィックスを追加できます。

```tsx filename=app/routes.ts lines=[14]
import {
  type RouteConfig,
  route,
  layout,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  layout("./marketing/layout.tsx", [
    index("./marketing/home.tsx"),
    route("contact", "./marketing/contact.tsx"),
  ]),
  ...prefix("projects", [
    index("./projects/home.tsx"),
    layout("./projects/project-layout.tsx", [
      route(":pid", "./projects/project.tsx"),
      route(":pid/edit", "./projects/edit-project.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
```

## 動的セグメント

パスセグメントが `:` で始まる場合、それは「動的セグメント」になります。ルートが URL と一致すると、動的セグメントは URL から解析され、他のルーター API に `params` として提供されます。

```ts filename=app/routes.ts
route("teams/:teamId", "./team.tsx"),
```

```tsx filename=app/team.tsx
import type { Route } from "./+types/team";

export async function loader({ params }: Route.LoaderArgs) {
  //                           ^? { teamId: string }
}

export default function Component({
  params,
}: Route.ComponentProps) {
  params.teamId;
  //        ^ string
}
```

1 つのルートパスに複数の動的セグメントを含めることができます。

```ts filename=app/routes.ts
route("c/:categoryId/p/:productId", "./product.tsx"),
```

```tsx filename=app/product.tsx
import type { Route } from "./+types/product";

async function loader({ params }: LoaderArgs) {
  //                    ^? { categoryId: string; productId: string }
}
```

## オプションセグメント

セグメントの最後に `?` を追加すると、ルートセグメントをオプションにすることができます。

```ts filename=app/routes.ts
route(":lang?/categories", "./categories.tsx"),
```

オプションの静的セグメントを持つこともできます。

```ts filename=app/routes.ts
route("users/:userId/edit?", "./user.tsx");
```

## スプラット

「キャッチオール」や「スター」セグメントとしても知られています。ルートパスパターンが `/*` で終わる場合、他の `/` 文字を含む、`/` に続く任意の文字に一致します。

```ts filename=app/routes.ts
route("files/*", "./files.tsx"),
```

```tsx filename=app/files.tsx
export async function loader({ params }: Route.LoaderArgs) {
  // params["*"] には、files/ の後の残りの URL が含まれます
}
```

`*` を分割構造化できますが、新しい名前を割り当てる必要があります。一般的な名前は `splat` です。

```tsx
const { "*": splat } = params;
```

## コンポーネントルート

コンポーネントツリー内の任意の要素に URL と一致するコンポーネントを使用することもできます。

```tsx
import { Routes, Route } from "react-router";

function Wizard() {
  return (
    <div>
      <h1>ステップを含むウィザード</h1>
      <Routes>
        <Route index element={<StepOne />} />
        <Route path="step-2" element={<StepTwo />} />
        <Route path="step-3" element={<StepThree />} />
      </Routes>
    </div>
  );
}
```

これらのルートは、データローディング、アクション、コード分割、またはその他のルートモジュール機能に参加しないため、そのユースケースはルートモジュールのユースケースよりも制限されることに注意してください。

---

次へ: [ルートモジュール](./route-module)

[file-route-conventions]: ../../how-to/file-route-conventions
[outlet]: https://api.reactrouter.com/v7/functions/react_router.Outlet.html

