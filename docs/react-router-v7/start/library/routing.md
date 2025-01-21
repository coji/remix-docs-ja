---
title: ルーティング
order: 2
---

# ルーティング

## ルートの設定

ルートは、URLセグメントをUI要素に結びつける `<Routes>` と `<Route>` をレンダリングすることで設定します。

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>
);
```

以下は、より大きな設定例です。

```tsx
<Routes>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />

  <Route element={<AuthLayout />}>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
  </Route>

  <Route path="concerts">
    <Route index element={<ConcertsHome />} />
    <Route path=":city" element={<City />} />
    <Route path="trending" element={<Trending />} />
  </Route>
</Routes>
```

## ネストされたルート

ルートは、親ルートの中にネストすることができます。

```tsx
<Routes>
  <Route path="dashboard" element={<Dashboard />}>
    <Route index element={<Home />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
```

親のパスは自動的に子に含まれるため、この設定では `"/dashboard"` と `"/dashboard/settings"` の両方のURLが作成されます。

子ルートは、親ルートの `<Outlet/>` を通してレンダリングされます。

```tsx filename=app/dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* <Home/> または <Settings/> のいずれかになります */}
      <Outlet />
    </div>
  );
}
```

## レイアウトルート

`path` _のない_ ルートは、子に対して新しいネストを作成しますが、URLにセグメントを追加しません。

```tsx lines=[2,9]
<Routes>
  <Route element={<MarketingLayout />}>
    <Route index element={<MarketingHome />} />
    <Route path="contact" element={<Contact />} />
  </Route>

  <Route path="projects">
    <Route index element={<ProjectsHome />} />
    <Route element={<ProjectsLayout />}>
      <Route path=":pid" element={<Project />} />
      <Route path=":pid/edit" element={<EditProject />} />
    </Route>
  </Route>
</Routes>
```

## インデックスルート

インデックスルートは、親のURLで親の `<Outlet/>` にレンダリングされます（デフォルトの子ルートのように）。これらは `index` プロパティで設定されます。

```tsx lines=[4,8]
<Routes>
  <Route path="/" element={<Root />}>
    {/* "/" で <Root> のアウトレットにレンダリングされます */}
    <Route index element={<Home />} />

    <Route path="dashboard" element={<Dashboard />}>
      {/* "/dashboard" で <Dashboard> のアウトレットにレンダリングされます */}
      <Route index element={<DashboardHome />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
</Routes>
```

インデックスルートには子を持たせることができないことに注意してください。その動作を期待している場合は、おそらく[レイアウトルート](#layout-routes)が必要でしょう。

## ルートプレフィックス

`element` プロパティ _のない_ `<Route path>` は、親レイアウトを導入することなく、子ルートにパスプレフィックスを追加します。

```tsx filename=app/routes.ts lines=[1]
<Route path="projects">
  <Route index element={<ProjectsHome />} />
  <Route element={<ProjectsLayout />}>
    <Route path=":pid" element={<Project />} />
    <Route path=":pid/edit" element={<EditProject />} />
  </Route>
</Route>
```

## 動的セグメント

パスセグメントが `:` で始まる場合、それは「動的セグメント」になります。ルートがURLに一致すると、動的セグメントはURLから解析され、`useParams` のような他のルーターAPIに `params` として提供されます。

```tsx
<Route path="teams/:teamId" element={<Team />} />
```

```tsx filename=app/team.tsx
import { useParams } from "react-router";

export default function Team() {
  let params = useParams();
  // params.teamId
}
```

1つのルートパスに複数の動的セグメントを含めることができます。

```tsx
<Route
  path="/c/:categoryId/p/:productId"
  element={<Product />}
/>
```

```tsx filename=app/category-product.tsx
import { useParams } from "react-router";

export default function Team() {
  let { categoryId, productId } = useParams();
  // ...
}
```

特定のパス内のすべての動的セグメントが一意であることを確認する必要があります。そうしないと、`params` オブジェクトが設定されるにつれて、後続の動的セグメントの値が以前の値を上書きします。

## オプションセグメント

セグメントの末尾に `?` を追加することで、ルートセグメントをオプションにすることができます。

```tsx
<Route path=":lang?/categories" element={<Categories />} />
```

オプションの静的セグメントも使用できます。

```tsx
<Route path="users/:userId/edit?" component={<User />} />
```

## スプラット

「キャッチオール」または「スター」セグメントとも呼ばれます。ルートパスパターンが `/*` で終わる場合、他の `/` 文字を含む、`/` に続く任意の文字に一致します。

```tsx
<Route path="files/*" element={<File />} />
```

```tsx
let params = useParams();
// params["*"] には files/ の後の残りのURLが含まれます
let filePath = params["*"];
```

`*` を分割代入できますが、新しい名前を割り当てる必要があります。一般的な名前は `splat` です。

```tsx
let { "*": splat } = useParams();
```

## リンク

`Link` と `NavLink` を使用して、UIからルートにリンクします。

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

