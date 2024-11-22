---
title: ルーティング
order: 2
---

# ルーティング

React Router の機能の基礎となるのはルートです。ルートは以下を定義します。

- 自動コード分割
- データの読み込み
- アクション
- 再検証
- エラー境界
- その他

このガイドでは、ルーティングの基本的な理解を説明します。その他のガイドでは、これらの機能について詳しく説明します。

## ルートの構成

ルートは `app/routes.ts` で構成されます。ルートは、URL に一致する URL パターンと、その動作を定義するルートモジュールへのファイルパスを持ちます。

```tsx
import { route } from "@react-router/dev/routes";

export const routes = [
  route("some/path", "./some/file.tsx"),
  // パターン ^           ^ モジュールファイル
];
```

以下は、より大きなルート構成のサンプルです。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
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
];
```

構成ではなくファイル命名規則でルートを定義する方が良い場合は、`@react-router/fs-routes` パッケージが [ファイルシステムルーティング規則を提供します。][file-route-conventions]

## ルートモジュール

`routes.ts` で参照されるファイルは、各ルートの動作を定義します。

```tsx filename=app/routes.ts
route("teams/:teamId", "./team.tsx"),
//           ルートモジュール ^^^^^^^^
```

以下は、ルートモジュールのサンプルです。

```tsx filename=app/team.tsx
// 型安全/推論を提供します
import type * as Route from "./+types.team";

// コンポーネントに `loaderData` を提供します
export async function loader({ params }: Route.LoaderArgs) {
  let team = await fetchTeam(params.teamId);
  return { name: team.name };
}

// ローダーが完了後にレンダリングされます
export default function Component({
  loaderData,
}: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>;
}
```

ルートモジュールには、アクション、ヘッダー、エラー境界などの機能が他にもありますが、これらは後のガイドで説明します。

## ネストされたルート

ルートは、親ルート内にネストすることができます。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  // 親ルート
  route("dashboard", "./dashboard.tsx", [
    // 子ルート
    index("./home.tsx"),
    route("settings", "./settings.tsx"),
  ]),
];
```

親のパスは子に自動的に含まれるため、この構成では `"/dashboard"` と `"/dashboard/settings"` の両方の URL が作成されます。

子ルートは、親ルートの `<Outlet/>` を介してレンダリングされます。

```tsx filename=app/dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* home.tsx または settings.tsx のいずれかになります */}
      <Outlet />
    </div>
  );
}
```

## ルートルート

`routes.ts` のすべてのルートは、特別な `app/root.tsx` モジュール内にネストされています。

## レイアウトルート

`layout` を使用すると、レイアウトルートは子ルートに対して新しいネストを作成しますが、URL にセグメントを追加しません。ルートルートに似ていますが、どのレベルにも追加できます。

```tsx filename=app/routes.ts lines=[10,16]
import {
  type RouteConfig,
  route,
  layout,
  index,
  prefix,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
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
];
```

## インデックスルート

```ts
index(componentFile),
```

インデックスルートは、親の URL にある親の [Outlet][outlet] にレンダリングされます（デフォルトの子ルートのようなもの）。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  // / のルート.tsx Outlet にレンダリングされます
  index("./home.tsx"),
  route("dashboard", "./dashboard.tsx", [
    // /dashboard の dashboard.tsx Outlet にレンダリングされます
    index("./dashboard-home.tsx"),
    route("settings", "./dashboard-settings.tsx"),
  ]),
];
```

インデックスルートには子を含めることができないことに注意してください。

## ルートプレフィックス

`prefix` を使用すると、親ルートファイルを導入することなく、ルートセットにパスプレフィックスを追加できます。

```tsx filename=app/routes.ts lines=[14]
import {
  type RouteConfig,
  route,
  layout,
  index,
  prefix,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
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
];
```

## 動的セグメント

パスセグメントが `:` で始まる場合、それは「動的セグメント」になります。ルートが URL に一致すると、動的セグメントは URL から解析され、その他のルーター API に `params` として提供されます。

```ts filename=app/routes.ts
route("teams/:teamId", "./team.tsx"),
```

```tsx filename=app/team.tsx
import type * as Route from "./+types.team";

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
import type * as Route from "./+types.product";

async function loader({ params }: LoaderArgs) {
  //                    ^? { categoryId: string; productId: string }
}
```

## オプションのセグメント

セグメントの末尾に `?` を追加することで、ルートセグメントをオプションにすることができます。

```ts filename=app/routes.ts
route(":lang?/categories", "./categories.tsx"),
```

静的セグメントをオプションにすることもできます。

```ts filename=app/routes.ts
route("users/:userId/edit?", "./user.tsx");
```

## スプラット

「キャッチオール」や「スター」セグメントとしても知られています。ルートパスパターンが `/*` で終わる場合、 `/` に続く文字はすべて（他の `/` 文字を含む）に一致します。

```ts filename=app/routes.ts
route("files/*", "./files.tsx"),
```

```tsx filename=app/files.tsx
export async function loader({ params }: Route.LoaderArgs) {
  // params["*"] には、files/ の後の残りの URL が含まれます
}
```

`*` をデストラクチャリングできます。名前を変更するだけです。一般的な名前は `splat` です。

```tsx
const { "*": splat } = params;
```

## リンク

`Link` と `NavLink` を使用して、UI からルートにリンクします

```tsx
import { NavLink, Link } from "react-router";

function Header() {
  return (
    <nav>
      {/* NavLink を使用すると、アクティブな状態を簡単に表示できます */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
      >
        Home
      </NavLink>

      <Link to="/concerts/salt-lake-city">Concerts</Link>
    </nav>
  );
}
```

## コンポーネントルート

URL に一致するコンポーネントをコンポーネントツリー内の任意の要素に使用することもできます。

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

これらのルートは、データの読み込み、アクション、コード分割、その他のルートモジュールの機能には参加しないため、ルートモジュールのものよりもユースケースが制限されていることに注意してください。

[file-route-conventions]: ../misc/file-route-conventions
[outlet]: ../../api/react-router/Outlet



