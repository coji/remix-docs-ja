---
title: useResolvedPath
---

# `useResolvedPath`

指定された `to` 値の `pathname` を現在のロケーションの pathname に対して解決し、`Path` オブジェクトを返します。

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

これは、相対値からリンクを構築する場合に便利で、内部的には [`<NavLink>`][nav-link-component] で使用されます。

## スプラットパス

React Router の `useResolvedPath` フックの元のロジックは、スプラットパスに対して異なる動作をしていましたが、後から考えるとこれは不正確/バグのある動作でした。詳細な説明については、[React Router のドキュメント][rr-use-resolved-path-splat] を参照してください。これは「破壊的なバグ修正」と判断され、React Router の将来のフラグの背後で修正され、Remix の [`v3_relativeSplatPath`][remix-config-future] Future Flag を通じて公開されました。これは Remix v3 でデフォルトの動作になるため、最終的な v3 アップグレードに備えて、都合の良いときにアプリケーションを更新することをお勧めします。

これは Remix のすべての相対ルーティングの基礎となることに注意してください。したがって、これは次の相対パスコードフローにも適用されます。

- `<Link to>`
- `useNavigate()`
- `useHref()`
- `<Form action>`
- `useSubmit()`
- ローダーとアクションから返される相対パス `redirect` レスポンス

### フラグなしの動作

このフラグが有効になっていない場合、デフォルトの動作では、スプラットルート内で相対パスを解決するときに、パスのスプラット部分が無視されます。したがって、`routes/dashboard.$.tsx` ファイル内では、現在の URL が `/dashboard/teams` であっても、`useResolvedPath(".")` は `/dashboard` に解決されます。

### フラグ付きの動作

フラグを有効にすると、この「バグ」が修正され、パスの解決がすべてのルートタイプで一貫するようになり、`useResolvedPath(".")` は常にコンテキストルートの現在の pathname に解決されます。これには、動的パラメーターまたはスプラットパラメーターの値が含まれます。したがって、`routes/dashboard.$.tsx` ファイル内では、現在の URL が `/dashboard/teams` の場合、`useResolvedPath(".")` は `/dashboard/teams` に解決されます。

## 追加リソース

- [`resolvePath`][rr-resolve-path]

[nav-link-component]: ../components/nav-link
[rr-resolve-path]: https://reactrouter.com/v6/utils/resolve-path
[rr-use-resolved-path-splat]: https://reactrouter.com/v6/hooks/use-resolved-path#splat-paths
[remix-config-future]: https://remix.run/docs/en/main/file-conventions/remix-config#future

