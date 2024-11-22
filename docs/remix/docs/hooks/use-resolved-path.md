---
title: useResolvedPath
---

# `useResolvedPath`

現在のロケーションのパスネームに対して、指定された `to` 値の `pathname` を解決し、`Path` オブジェクトを返します。

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

これは、相対値からリンクを構築する場合に役立ち、[`<NavLink>`][nav-link-component] で内部的に使用されます。

## スプラットパス

React Router の `useResolvedPath` フックの元のロジックは、スプラットパスに対しては異なる動作をしていましたが、後になってみるとこれは正しくない/バグのある動作でした。詳細については、[React Router ドキュメント][rr-use-resolved-path-splat] を参照してください。これは「破壊的なバグ修正」であると判断され、React Router で将来のフラグを立てて修正され、Remix の [`v3_relativeSplatPath`][remix-config-future] 未来フラグを通して公開されました。これは Remix v3 でデフォルトの動作になるため、アプリケーションを適宜更新して、最終的に v3 にアップグレードしたときに備えることをお勧めします。

これは、Remix のすべての相対ルーティングの基礎であるため、次の相対パスのコードフローにも適用されることに注意してください。

- `<Link to>`
- `useNavigate()`
- `useHref()`
- `<Form action>`
- `useSubmit()`
- ローダーとアクションから返される相対パスの `redirect` レスポンス

### フラグを有効化しない場合の動作

このフラグを有効化しない場合、デフォルトの動作は、スプラットルート内で相対パスを解決する場合、パスのスプラット部分が無視されることです。そのため、`routes/dashboard.$.tsx` ファイル内では、現在の URL が `/dashboard/teams` であっても、`useResolvedPath(".")` は `/dashboard` に解決されます。

### フラグを有効化した場合の動作

フラグを有効化すると、この「バグ」が修正されるため、すべてのルートタイプでパス解決が一貫して実行され、`useResolvedPath(".")` は、コンテキストルートの現在のパスネームに常に解決されます。これには、ダイナミックパラメータやスプラットパラメータの値も含まれます。そのため、`routes/dashboard.$.tsx` ファイル内では、現在の URL が `/dashboard/teams` であっても、`useResolvedPath(".")` は `/dashboard/teams` に解決されます。

## 追加のリソース

- [`resolvePath`][rr-resolve-path]

[nav-link-component]: ../components/nav-link
[rr-resolve-path]: https://reactrouter.com/v6/utils/resolve-path
[rr-use-resolved-path-splat]: https://reactrouter.com/v6/hooks/use-resolved-path#splat-paths
[remix-config-future]: https://remix.run/docs/en/main/file-conventions/remix-config#future

