---
title: matchRoutes
---

# matchRoutes

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.matchRoutes.html)

指定されたルートをロケーションにマッチさせ、マッチデータを返します。

```tsx
import { matchRoutes } from "react-router";

let routes = [{
  path: "/",
  Component: Root,
  children: [{
    path: "dashboard",
    Component: Dashboard,
  }]
}];

matchRoutes(routes, "/dashboard"); // [rootMatch, dashboardMatch]
```

## シグネチャ

```tsx
function matchRoutes<
  RouteObjectType extends AgnosticRouteObject = AgnosticRouteObject,
>(
  routes: RouteObjectType[],
  locationArg: Partial<Location> | string,
  basename = "/",
): AgnosticRouteMatch<string, RouteObjectType>[] | null
```

## パラメータ

### routes

マッチング対象となるルートオブジェクトの配列。

### locationArg

マッチング対象となるロケーション。文字列パスまたは部分的な [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) オブジェクトのいずれか。

### basename

マッチング前にロケーションから取り除くオプションのベースパス。デフォルトは `/` です。

## 戻り値

マッチしたルートの配列、またはマッチが見つからなかった場合は `null`。