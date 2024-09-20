---
title: ルーティング
order: 2
---

# ルーティング

## ルート設定ファイル

ルートは `app/routes.ts` で設定されます。Vite プラグインは、このファイルを使用して各ルートのバンドルを作成します。

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

## ファイルシステムルート

構成ではなくファイル命名規則でルートを定義することを好む場合は、`@react-router/fs-routes` パッケージは [ファイルシステムルーティング規則を提供します。][file-route-conventions]

```tsx filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = flatRoutes();
```

ルーティング規則を単一のルート配列に混在させることもできます。

```tsx filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export const routes: RouteConfig = [
  // ファイルシステムルートを提供する
  ...(await flatRoutes()),

  // さらに構成ルートを提供する
  route("/can/still/add/more", "./more.tsx"),
];
```

## リンク

`Link` を使用して、UI からルートにリンクします。

```tsx
import { Link } from "react-router";

function Header() {
  return (
    <nav>
      <Link to="/">ホーム</Link>
      <Link to="/about">概要</Link>
      <Link
        to="/concerts/:id"
        params={{ id: "salt-lake-city" }}
      >
        コンサート
      </Link>
    </nav>
  );
}
```

## ネストされたルート

ルートは、親ルート内にネストできます。ネストされたルートは、親の [Outlet][outlet] にレンダリングされます。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  route("dashboard", "./dashboard.tsx", [
    index("./home.tsx"),
    route("settings", "./settings.tsx"),
  ]),
];
```

```tsx filename=app/dashboard.tsx
import { defineRoute$, Outlet } from "react-router";

export default defineRoute$({
  component: function Dashboard() {
    return (
      <div>
        <h1>ダッシュボード</h1>
        {/* home.tsx または settings.tsx のいずれかになります */}
        <Outlet />
      </div>
    );
  },
});
```

## レイアウトルート

`layout` を使用すると、レイアウトルートは子要素に対して新しいネストを作成しますが、URL にセグメントを追加しません。どのレベルに追加することもできます。

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

インデックスルートは、親の [Outlet][outlet] に、親の URL でレンダリングされます（デフォルトの子ルートのようなもの）。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
  index,
} from "@react-router/dev/routes";

export const routes: RouteConfig = [
  // ルートの Outlet に / でレンダリングされます
  index("./home.tsx"),
  route("dashboard", "./dashboard.tsx", [
    // dashboard.tsx の Outlet に /dashboard でレンダリングされます
    index("./dashboard-home.tsx"),
    route("settings", "./dashboard-settings.tsx"),
  ]),
];
```

インデックスルートには子を持つことができません。

## 動的セグメント

パスセグメントが `:` で始まる場合、それは「動的セグメント」になります。ルートが URL と一致すると、動的セグメントは URL から解析され、他のルーター API に `params` として提供されます。

```ts filename=app/routes.ts
route("teams/:teamId", "./team.tsx");
```

```tsx filename=app/team.tsx
import { defineRoute$ } from "react-router";

export default defineRoute$({
  // このルートが routes.ts で正しく設定されていることを保証します
  // また、このルートの残りの部分の型ヒントを提供します
  params: ["teamId"],

  async loader({ params }) {
    // params.teamId は使用できます
  },

  async action({ params }) {
    // params.teamId は使用できます
  },

  Component({ params }) {
    console.log(params.teamId); // "hotspur"
  },
});
```

1 つのルートパスに複数の動的セグメントを含めることができます。

```ts filename=app/routes.ts
route("c/:categoryId/p/:productId", "./product.tsx");
```

```tsx filename=app/product.tsx
export default defineRoute$({
  params: ["categoryId", "productId"],

  async loader({ params }) {
    // params.categoryId と params.productId は使用できます
  },
});
```

## オプションセグメント

セグメントの最後に `?` を追加することで、ルートセグメントをオプションにすることができます。

```ts filename=app/routes.ts
route(":lang?/categories", "./categories.tsx");
```

オプションの静的セグメントを持つこともできます。

```ts filename=app/routes.ts
route("users/:userId/edit?", "./user.tsx");
```

## スプラット

「キャッチオール」や「スター」セグメントとも呼ばれます。ルートパスパターンが `/*` で終わる場合、それは `/` の後に続く文字（他の `/` 文字を含む）と一致します。

```ts filename=app/routes.ts
route("files/*", "./files.tsx");
```

```tsx filename=app/files.tsx
export async function loader({ params }) {
  // params["*"] には、files/ の後の残りの URL が含まれます
}
```

`*` を分解できます。名前を新しく付ける必要があります。一般的な名前は `splat` です。

```tsx
const { "*": splat } = params;
```

## コンポーネントルート

コンポーネントツリー内のどこでも URL に一致するコンポーネントを使用することもできます。

```tsx
import { Routes, Route } from "react-router";

function Wizard() {
  return (
    <div>
      <h1>いくつかのステップを持つウィザード</h1>
      <Routes>
        <Route index element={<StepOne />} />
        <Route path="step-2" element={<StepTwo />} />
        <Route path="step-3" element={<StepThree />}>
      </Routes>
    </div>
  );
}
```

これらのルートは、データのロード、アクション、コード分割、その他のルートモジュール機能には参加しないため、ルートモジュールほど用途は広くありません。

[file-route-conventions]: ../guides/file-route-conventions
[outlet]: ../components/outlet
[code_splitting]: ../discussion/code-splitting



