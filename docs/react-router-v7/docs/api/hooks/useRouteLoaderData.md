---
title: useRouteLoaderData
---

# useRouteLoaderData

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useRouteLoaderData.html)

指定されたルートIDによって、特定のルートのローダーデータを返します。

```tsx
import { useRouteLoaderData } from "react-router";

function SomeComponent() {
  const { user } = useRouteLoaderData("root");
}
```

ルートIDは自動的に作成されます。これは単に、拡張子を除いた、アプリフォルダからのルートファイルの相対パスです。

| ルートファイル名               | ルートID               |
| ---------------------------- | ---------------------- |
| `app/root.tsx`               | `"root"`               |
| `app/routes/teams.tsx`       | `"routes/teams"`       |
| `app/whatever/teams.$id.tsx` | `"whatever/teams.$id"` |

IDを手動で作成した場合は、代わりにそれを使用できます。

```tsx
route("/", "containers/app.tsx", { id: "app" }})
```

## シグネチャ

```tsx
useRouteLoaderData(routeId): undefined
```

## パラメータ

### routeId

[modes: framework, data]

_ドキュメントはありません_

