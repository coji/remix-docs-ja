---
title: useOutletContext
---

# useOutletContext

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useOutletContext.html)

親ルートの [`<Outlet context>`](../components/Outlet) を返します。

親ルートは、子ルートと共有したい状態やその他の値を管理することがよくあります。必要であれば独自の[コンテキストプロバイダー](https://react.dev/learn/passing-data-deeply-with-context)を作成することもできますが、これは非常に一般的な状況であるため、[`<Outlet>`](../components/Outlet) に組み込まれています。

```tsx
// Parent route
function Parent() {
  const [count, setCount] = React.useState(0);
  return <Outlet context={[count, setCount]} />;
}
```

```tsx
// Child route
import { useOutletContext } from "react-router";

function Child() {
  const [count, setCount] = useOutletContext();
  const increment = () => setCount((c) => c + 1);
  return <button onClick={increment}>{count}</button>;
}
```

TypeScriptを使用している場合、親コンポーネントがコンテキスト値にアクセスするためのカスタムフックを提供することをお勧めします。これにより、コンシューマーが適切な型付けを得やすくなり、コンシューマーを制御し、誰がコンテキスト値を使用しているかを把握しやすくなります。

より現実的な例を次に示します。

```tsx filename=src/routes/dashboard.tsx lines=[14,20]
import { useState } from "react";
import { Outlet, useOutletContext } from "react-router";

import type { User } from "./types";

type ContextType = { user: User | null };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet context={{ user } satisfies ContextType} />
    </div>
  );
}

export function useUser() {
  return useOutletContext<ContextType>();
}
```

```tsx filename=src/routes/dashboard/messages.tsx lines=[1,4]
import { useUser } from "../dashboard";

export default function DashboardMessages() {
  const { user } = useUser();
  return (
    <div>
      <h2>Messages</h2>
      <p>Hello, {user.name}!</p>
    </div>
  );
}
```

## シグネチャ

```tsx
function useOutletContext<Context = unknown>(): Context
```

## 戻り値

親の [`Outlet`](../components/Outlet) コンポーネントに渡されたコンテキスト値を返します。