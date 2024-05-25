---
title: useResolvedPath
---

# `useResolvedPath`

現在のロケーションのパス名に対して、与えられた`to`値の`pathname`を解決し、`Path`オブジェクトを返します。

```tsx
import { useResolvedPath } from "@remix-run/react";

function SomeComponent() {
  const path = useResolvedPath("../some/where");
  path.pathname;
  path.search;
  path.hash;
  // ...
}
```

これは、相対値からリンクを作成する場合に役立ち、内部的に[`<NavLink>`][nav-link-component]で使用されます。

## スプラットパス

React Routerの`useResolvedPath`フックの元のロジックは、スプラットパスに対しては異なる動作をしていましたが、後になって不正確/バグのある動作であることがわかりました。より詳細な説明については、[React Router Docs][rr-use-resolved-path-splat]を参照してください。これは、「バグ修正」であると判断され、React Routerでは将来のフラグの背後で修正され、Remixの[`v3_relativeSplatPath`][remix-config-future] Future Flagを通じて公開されました。これは、Remix v3でデフォルトの動作になるため、v3へのアップグレードに備えて、アプリケーションを適宜更新することをお勧めします。

これは、Remixのすべての相対ルーティングの基礎となるため、以下の相対パスコードフローにも適用されます。

- `<Link to>`
- `useNavigate()`
- `useHref()`
- `<Form action>`
- `useSubmit()`
- ローダーとアクションから返される相対パスの`redirect`レスポンス

### フラグが有効になっていない場合の動作

このフラグが有効になっていない場合、デフォルトの動作は、スプラットルート内の相対パスを解決する場合、パスのスプラット部分は無視されます。そのため、`routes/dashboard.$.tsx`ファイル内では、`useResolvedPath(".")`は、現在のURLが`/dashboard/teams`であっても`/dashboard`に解決されます。

### フラグが有効になっている場合の動作

フラグを有効にすると、この「バグ」が修正されるため、パスの解決はすべてのルートタイプで一貫性があり、`useResolvedPath(".")`は、コンテキストルートの現在のパス名に常に解決されます。これには、ダイナミックパラメーターまたはスプラットパラメーターの値も含まれます。そのため、`routes/dashboard.$.tsx`ファイル内では、`useResolvedPath(".")`は、現在のURLが`/dashboard/teams`の場合、`/dashboard/teams`に解決されます。

## 追加のリソース

- [`resolvePath`][rr-resolve-path]

[nav-link-component]: ../components/nav-link
[rr-resolve-path]: https://reactrouter.com/utils/resolve-path
[rr-use-resolved-path-splat]: https://reactrouter.com/hooks/use-resolved-path#splat-paths
[remix-config-future]: https://remix.run/docs/en/main/file-conventions/remix-config#future
