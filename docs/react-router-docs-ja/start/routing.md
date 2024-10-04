---
title: ルーティング
order: 2
---

# ルーティング

React Router の機能の基礎となるのはルートです。ルートは以下を定義します。

- 自動コード分割
- データ読み込み
- アクション
- 再検証
- エラー境界
- その他

このガイドでは、ルーティングの基本的な理解を説明します。その他の Getting Started ガイドでは、これらの機能について詳しく説明します。

## ルートの構成

ルートは `app/routes.ts` で構成されます。ルートは、URL と一致する URL パターンと、その動作を定義するルートモジュールのファイルパスを持ちます。

```tsx
import { route } from "@react-router/dev/routes";

export const routes = [
  route("some/path", "./some/file.tsx");
  // パターン ^           ^ モジュールファイル
]
```

以下は、より大きなサンプルルート構成です。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  index("./home.tsx"),
  route("about", "./about.tsx"),

  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  route("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
];
```

ファイル命名規則でルートを定義したい場合は、`@react-router/fs-routes` パッケージが [ファイルシステムルーティング規則を提供します。][file-route-conventions]

## ルートモジュール

`routes.ts` で参照されるファイルは、各ルートの動作を定義します。

```tsx filename=app/routes.ts
route("teams/:teamId", "./team.tsx");
//           ルートモジュール ^^^^^^^^
```

以下は、サンプルルートモジュールです。

```tsx filename=app/team.tsx
// 型の安全性/推論を提供します
import type * as Route from "./+types.team";

// コンポーネントに `loaderData` を提供します
export async function loader({ params }: Route.LoaderArgs) {
  let team = await fetchTeam(params.teamId);
  return { name: team.name };
}

// ローダーが完了した後にレンダリングされます
export default function Component({
  loaderData,
}: Route.ComponentProps) {
  return <h1>{data.name}</h1>;
}
```

ルートモジュールには、アクション、ヘッダー、エラー境界などの機能がありますが、これらは後のガイドで説明します。

## ネストされたルート

ルートは、親ルート内にネストできます。

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

親のパスは自動的に子に含まれるため、この構成では `"/dashboard"` と `"/dashboard/settings"` の両方の URL が作成されます。

子ルートは、親ルートの `<Outlet/>` を介してレンダリングされます。

```tsx filename=app/dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* home.tsx または settings.tsx のいずれかがレンダリングされます */}
      <Outlet />
    </div>
  );
}
```

## ルートルート

`routes.ts` のすべてのルートは、特別な `app/root.tsx` モジュール内にネストされます。

## レイアウトルート

`layout` を使用すると、レイアウトルートは子に対して新しいネストを作成しますが、URL にセグメントを追加しません。ルートルートに似ていますが、どのレベルにも追加できます。

```tsx filename=app/routes.ts lines=[9,15]
import {
  type RouteConfig,
  route,
  layout,
  index,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  layout("./marketing/layout.tsx", [
    index("./marketing/home.tsx"),
    route("contact", "./marketing/contact.tsx"),
  ]),
  route("projects", [
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
index(componentFile);
```

インデックスルートは、親の URL で親の [Outlet][outlet] にレンダリングされます（デフォルトの子ルートのようなものです）。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  // / で root.tsx Outlet にレンダリングされます
  index("./home.tsx"),
  route("dashboard", "./dashboard.tsx", [
    // /dashboard で dashboard.tsx Outlet にレンダリングされます
    index("./dashboard-home.tsx"),
    route("settings", "./dashboard-settings.tsx"),
  ]),
];
```

インデックスルートには子を含めることができないことに注意してください。

## 動的セグメント

パスセグメントが `:` で始まる場合、それは「動的セグメント」になります。ルートが URL と一致すると、動的セグメントは URL から解析され、他のルーター API に `params` として提供されます。

```ts filename=app/routes.ts
route("teams/:teamId", "./team.tsx");
```

```tsx filename=app/team.tsx
import type * as Route from "./+types.team";

async function loader({ params }: Route.LoaderArgs) {
  //                    ^? { teamId: string }
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
route("c/:categoryId/p/:productId", "./product.tsx");
```

```tsx filename=app/product.tsx
import type * as Route from "./+types.product";

async function loader({ params }: LoaderArgs) {
  //                    ^? { categoryId: string; productId: string }
}
```

## オプションのセグメント

セグメントの最後に `?` を追加することで、セグメントをオプションにすることができます。

```ts filename=app/routes.ts
route(":lang?/categories", "./categories.tsx");
```

静的なセグメントもオプションにすることができます。

```ts filename=app/routes.ts
route("users/:userId/edit?", "./user.tsx");
```

## スプラット

「catchall」や「star」セグメントとも呼ばれます。ルートパスパターンが `/*` で終わる場合、`/` を含む ``/` の後に続く任意の文字と一致します。

```ts filename=app/routes.ts
route("files/*", "./files.tsx");
```

```tsx filename=app/files.tsx
export async function loader({ params }: Route.LoaderArgs) {
  // params["*"] は、files/ の後の残りの URL を含みます
}
```

`*` をデストラクチャリングできます。新しい名前を割り当てるだけです。一般的な名前は `splat` です。

```tsx
const { "*": splat } = params;
```

## リンク

`Link` と `NavLink` を使用して、UI からルートにリンクします。

```tsx
import { NavLink, Link } from "react-router";

function Header() {
  return (
    <nav>
      {/* NavLink は、アクティブな状態を表示することを容易にします */}
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

コンポーネントツリー内の任意の場所に、URL と一致するコンポーネントを使用することもできます。

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

これらのルートは、データ読み込み、アクション、コード分割、またはその他のルートモジュール機能には参加しないため、ルートモジュールよりもユースケースが限定されていることに注意してください。

[file-route-conventions]: ../misc/file-route-conventions
[outlet]: ../../api/react-router/Outlet



