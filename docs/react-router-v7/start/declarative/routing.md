---
title: ルーティング
order: 2
---

# ルーティング

[MODES: declarative]

## ルートの設定

ルートは、URLセグメントとUI要素を関連付ける `<Routes>` と `<Route>` をレンダリングすることで設定されます。

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path=
"/" element={<App />} />
    </Routes>
  </BrowserRouter>
);
```

より大きなサンプル設定を次に示します。

```tsx
<Routes>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />

  <Route element={<AuthLayout />} >
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

ルートは、親ルート内にネストできます。

```tsx
<Routes>
  <Route path="dashboard" element={<Dashboard />} >
    <Route index element={<Home />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
```

親のパスは自動的に子に含まれるため、この設定では `"/dashboard"` と `"/dashboard/settings"` の両方のURLが作成されます。

子ルートは、親ルートの `<Outlet/>` を介してレンダリングされます。

```tsx filename=app/dashboard.tsx
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      {/* <Home/> または <Settings/> のいずれかになります */}
      <Outlet />
    </div>
  );
}
```

## レイアウトルート

`path` _なし_ のルートは、その子に対して新しいネストを作成しますが、URLにセグメントを追加しません。

```tsx lines=[2,9]
<Routes>
  <Route element={<MarketingLayout />} >
    <Route index element={<MarketingHome />} />
    <Route path="contact" element={<Contact />} />
  </Route>

  <Route path="projects">
    <Route index element={<ProjectsHome />} />
    <Route element={<ProjectsLayout />} >
      <Route path=":pid" element={<Project />} />
      <Route path=":pid/edit" element={<EditProject />} />
    </Route>
  </Route>
</Routes>
```

## インデックスルート

インデックスルートは、親のURLで親の `<Outlet/>` にレンダリングされます（デフォルトの子ルートのように）。これらは `index` プロパティで構成されます。

```tsx lines=[4,8]
<Routes>
  <Route path="/" element={<Root />} >
    {/* "/" で <Root> のアウトレットにレンダリングされます */}
    <Route index element={<Home />} />

    <Route path="dashboard" element={<Dashboard />} >
      {/* "/dashboard" で <Dashboard> のアウトレットにレンダリングされます */}
      <Route index element={<DashboardHome />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
</Routes>
```

インデックスルートには子を含めることはできません。その動作を期待している場合は、[レイアウトルート](#レイアウトルート)が必要になる可能性があります。

## ルートプレフィックス

`element` プロパティ _なし_ の `<Route path>` は、親レイアウトを導入せずに、その子ルートにパスプレフィックスを追加します。

```tsx filename=app/routes.ts lines=[1]
<Route path="projects">
  <Route index element={<ProjectsHome />} />
  <Route element={<ProjectsLayout />} >
    <Route path=":pid" element={<Project />} />
    <Route path=":pid/edit" element={<EditProject />} />
  </Route>
</Route>
```

## 動的セグメント

パスセグメントが `:` で始まる場合、それは「動的セグメント」になります。ルートがURLと一致すると、動的セグメントはURLから解析され、`useParams` などの他のルーターAPIに `params` として提供されます。

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

export default function CategoryProduct() {
  let { categoryId, productId } = useParams();
  // ...
}
```

特定のパス内のすべての動的セグメントが一意であることを確認する必要があります。そうしないと、`params` オブジェクトが入力されると、後続の動的セグメントの値が以前の値を上書きします。

## オプションのセグメント

セグメントの最後に `?` を追加すると、ルートセグメントをオプションにすることができます。

```tsx
<Route path=":lang?/categories" element={<Categories />} />
```

オプションの静的セグメントを含めることもできます。

```tsx
<Route path="users/:userId/edit?" element={<User />} />
```

## スプラット

「キャッチオール」および「スター」セグメントとも呼ばれます。ルートパスパターンが `/*` で終わる場合、他の `/` 文字を含む、`/` に続く任意の文字と一致します。

```tsx
<Route path="files/*" element={<File />} />
```

```tsx
let params = useParams();
// params[\"*\"] には、files/ の後の残りのURLが含まれます
let filePath = params[\"*\"];
```

`*` を分割できます。新しい名前を割り当てる必要があります。一般的な名前は `splat` です。

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
        ホーム
      </NavLink>

      <Link to="/concerts/salt-lake-city">コンサート</Link>
    </nav>
  );
}
```

---

次へ: [ナビゲーション](./navigating)