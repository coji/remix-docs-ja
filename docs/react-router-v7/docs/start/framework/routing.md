---
title: ルーティング
order: 2
---

# ルーティング

## ルートの構成

ルートは`app/routes.ts`で構成されます。各ルートには、URLと一致させるURLパターンと、その動作を定義するルートモジュールのファイルパスの2つの必須部分があります。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("some/path", "./some/file.tsx"),
  // パターン ^           ^ モジュールファイル
] satisfies RouteConfig;
```

より大規模なルート構成の例を以下に示します。

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

構成ではなくファイル命名規則でルートを定義する方が良い場合は、`@react-router/fs-routes`パッケージが[ファイルシステムルーティング規則を提供します。][file-route-conventions]


## ルートモジュール

`routes.ts`で参照されるファイルは、各ルートの動作を定義します。

```tsx filename=app/routes.ts
route("teams/:teamId", "./team.tsx"),
//           ルートモジュール ^^^^^^^^
```

ルートモジュールの例を以下に示します。

```tsx filename=app/team.tsx
// 型の安全性/推論を提供します
import type { Route } from "./+types/team";

// コンポーネントに`loaderData`を提供します
export async function loader({ params }: Route.LoaderArgs) {
  let team = await fetchTeam(params.teamId);
  return { name: team.name };
}

// ローダーが完了した後にレンダリングされます
export default function Component({
  loaderData,
}: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>;
}
```

ルートモジュールには、アクション、ヘッダー、エラーバウンダリなどの機能が他にもありますが、それらは次のガイドで説明します。[ルートモジュール](./route-module)


## ネストされたルート

ルートは親ルート内にネストできます。

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

親のパスは子に自動的に含まれるため、この構成では`"/dashboard"`と`"/dashboard/settings"`の両方のURLが作成されます。

子ルートは、親ルートの`<Outlet/>`を通じてレンダリングされます。

```tsx filename=app/dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* home.tsxまたはsettings.tsxのいずれかになります */}
      <Outlet />
    </div>
  );
}
```

## ルートルート

`routes.ts`内のすべてのルートは、特別な`app/root.tsx`モジュール内にネストされています。


## レイアウトルート

`layout`を使用すると、レイアウトルートは子に対して新しいネストを作成しますが、URLにセグメントを追加しません。ルートルートに似ていますが、任意のレベルに追加できます。

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

## インデックスルート

```ts
index(componentFile),
```

インデックスルートは、親のURLで親の[Outlet][outlet]にレンダリングされます（デフォルトの子ルートのようなもの）。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export default [
  // /でroot.tsx Outletにレンダリングされます
  index("./home.tsx"),
  route("dashboard", "./dashboard.tsx", [
    // /dashboardでdashboard.tsx Outletにレンダリングされます
    index("./dashboard-home.tsx"),
    route("settings", "./dashboard-settings.tsx"),
  ]),
] satisfies RouteConfig;
```

インデックスルートには子を含めることができないことに注意してください。


## ルートプレフィックス

`prefix`を使用すると、親ルートファイルを追加する必要なく、一連のルートにパスのプレフィックスを追加できます。

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

パスセグメントが`:`で始まる場合、それは「動的セグメント」になります。ルートがURLと一致すると、動的セグメントはURLから解析され、他のルーターAPIに`params`として提供されます。

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

1つのルートパスに複数の動的セグメントを含めることができます。

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

セグメントの最後に`?`を追加することで、ルートセグメントをオプションにすることができます。

```ts filename=app/routes.ts
route(":lang?/categories", "./categories.tsx"),
```

オプションの静的セグメントも使用できます。

```ts filename=app/routes.ts
route("users/:userId/edit?", "./user.tsx");
```


## スプラット

「キャッチオール」や「スター」セグメントとも呼ばれます。ルートパスパターンが`/*`で終わる場合、`/`を含む`/`以降の文字と一致します。

```ts filename=app/routes.ts
route("files/*", "./files.tsx"),
```

```tsx filename=app/files.tsx
export async function loader({ params }: Route.LoaderArgs) {
  // params["*"]には、files/の後の残りのURLが含まれます
}
```

`*`を分解できますが、新しい名前を割り当てる必要があります。一般的な名前は`splat`です。

```tsx
const { "*": splat } = params;
```


## コンポーネントルート

URLと一致するコンポーネントをコンポーネントツリー内の任意の要素に使用することもできます。

```tsx
import { Routes, Route } from "react-router";

function Wizard() {
  return (
    <div>
      <h1>Some Wizard with Steps</h1>
      <Routes>
        <Route index element={<StepOne />} />
        <Route path="step-2" element={<StepTwo />} />
        <Route path="step-3" element={<StepThree />}>
      </Routes>
    </div>
  );
}
```

これらのルートは、データの読み込み、アクション、コード分割、その他のルートモジュールの機能には参加しないため、使用例はルートモジュールのものよりも制限されます。

---

次へ：[ルートモジュール](./route-module)

[file-route-conventions]: ../../how-to/file-route-conventions
[outlet]: ../../api/react-router/Outlet

