---
title: matchRoutes
---

# matchRoutes

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

マッチ対象となるルートオブジェクトの配列。

### locationArg

マッチ対象となるロケーション。文字列パスまたは部分的な [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) オブジェクトのいずれかです。

### basename

マッチング前にロケーションから削除するオプションのベースパス。デフォルトは `/` です。

## 戻り値

マッチしたルートの配列、またはマッチが見つからなかった場合は `null`。