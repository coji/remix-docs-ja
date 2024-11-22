---
title: ルーティング
order: 2
---

# ルーティング

## ルートの構成

ルートは、URLセグメントとUI要素を組み合わせた`<Routes>`と`<Route>`をレンダリングすることで構成されます。

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

より大規模なサンプル構成を以下に示します。

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

ルートは親ルートの中にネストすることができます。

```tsx
<Routes>
  <Route path="dashboard" element={<Dashboard />}>
    <Route index element={<Home />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
```

親のパスは子に自動的に含まれるため、この構成では`"/dashboard"`と`"/dashboard/settings"`の両方のURLが作成されます。

子ルートは、親ルートの`<Outlet/>`を通してレンダリングされます。

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

`path`を持たないルートは、その子に対して新しいネストを作成しますが、URLにセグメントを追加しません。

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

インデックスルートは、親のURL（デフォルトの子ルートのようなもの）で親の`<Outlet/>`にレンダリングされます。`index`プロパティで設定されます。

```tsx lines=[4,8]
<Routes>
  <Route path="/" element={<Root />}>
    {/* "/" で <Root> の outlet にレンダリングされます */}
    <Route index element={<Home />} />

    <Route path="dashboard" element={<Dashboard />}>
      {/* "/dashboard" で <Dashboard> の outlet にレンダリングされます */}
      <Route index element={<DashboardHome />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
</Routes>
```

インデックスルートには子を持たせることができないことに注意してください。そのような動作を期待している場合は、おそらく[レイアウトルート](#layout-routes)を使用する必要があります。


## ルートプレフィックス

`element`プロパティのない`<Route path>`は、親レイアウトを導入することなく、その子ルートにパスプレフィックスを追加します。

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

パスセグメントが`:`で始まる場合、「動的セグメント」になります。ルートがURLと一致すると、動的セグメントはURLから解析され、`useParams`などの他のルーターAPIに`params`として提供されます。

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

## オプションセグメント

セグメントの最後に`?`を追加することで、ルートセグメントをオプションにすることができます。

```tsx
<Route path=":lang?/categories" element={<Categories />} />
```

オプションの静的セグメントも持つことができます。

```tsx
<Route path="users/:userId/edit?" component={<User />} />
```

## スプラット

「キャッチオール」や「スター」セグメントとも呼ばれます。ルートパスパターンが`/*`で終わる場合、`/`を含む`/`以降の文字と一致します。

```tsx
<Route path="files/*" element={<File />} />
```

```tsx
let params = useParams();
// params["*"] は files/ の後のURL残りを含みます
let filePath = params["*"];
```

`*`をデストラクチャリングできますが、新しい名前を付ける必要があります。一般的な名前は`splat`です。

```tsx
let { "*": splat } = useParams();
```

## リンク

`Link`と`NavLink`を使用して、UIからルートにリンクします。

```tsx
import { NavLink, Link } from "react-router";

function Header() {
  return (
    <nav>
      {/* NavLink はアクティブ状態を表示する簡単な方法です */}
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
