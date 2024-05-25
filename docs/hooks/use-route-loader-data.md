---
title: useRouteLoaderData
toc: false
---

# `useRouteLoaderData`

ルートIDによって、特定のルートのローダーデータを取得します。

```tsx
import { useRouteLoaderData } from "@remix-run/react";

function SomeComponent() {
  const { user } = useRouteLoaderData("root");
}
```

Remixは自動的にルートIDを作成します。ルートIDは、拡張子を除いたappフォルダからの相対パスになります。

| ルートファイル名             | ルートID             |
| -------------------------- | -------------------- |
| `app/root.tsx`             | `"root"`             |
| `app/routes/teams.tsx`     | `"routes/teams"`     |
| `app/routes/teams.$id.tsx` | `"routes/teams.$id"` | 
