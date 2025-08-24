---
title: useRouteLoaderData
---

# useRouteLoaderData

[MODES: framework, data]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.useRouteLoaderData.html)

指定されたルートIDによって、特定のルートの[`loader`](../../start/framework/route-module#loader)データを返します。

ルートIDは自動的に作成されます。これは単に、拡張子を除いた、アプリフォルダからのルートファイルの相対パスです。

| Route Filename               | Route ID               |
| ---------------------------- | ---------------------- |
| `app/root.tsx`               | `"root"`               |
| `app/routes/teams.tsx`       | `"routes/teams"`       |
| `app/whatever/teams.$id.tsx` | `"whatever/teams.$id"` |

```tsx
import { useRouteLoaderData } from "react-router";

function SomeComponent() {
  const { user } = useRouteLoaderData("root");
}

// routes.tsファイルで、独自のルートIDを手動で指定することもできます。
route("/", "containers/app.tsx", { id: "app" })
useRouteLoaderData("app");
```

## Signature

```tsx
function useRouteLoaderData<T = any>(
  routeId: string,
): SerializeFrom<T> | undefined
```

## Params

### routeId

ローダーデータを取得するルートのID。

## Returns

指定されたルートの[`loader`](../../start/framework/route-module#loader)関数から返されたデータ、または見つからない場合は`undefined`