---
title: useRouteLoaderData
toc: false
---

# `useRouteLoaderData`

指定されたルートのIDに基づいて、ローダーデータを返します。

```tsx
import { useRouteLoaderData } from "@remix-run/react";

function SomeComponent() {
  const { user } = useRouteLoaderData("root");
}
```

RemixはルートIDを自動的に作成します。これらは単に、拡張子を除いた、アプリフォルダに対するルートファイルの相対パスです。

| ルートファイル名             | ルートID             |
| -------------------------- | -------------------- |
| `app/root.tsx`             | `"root"`             |
| `app/routes/teams.tsx`     | `"routes/teams"`     |
| `app/routes/teams.$id.tsx` | `"routes/teams.$id"` |

