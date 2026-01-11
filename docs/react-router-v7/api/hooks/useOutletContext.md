---
title: useOutletContext
---

# useOutletContext

[MODES: framework, data, declarative]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.useOutletContext.html)

親ルートの [`<Outlet context>`](../components/Outlet) を返します。

親ルートが、子ルートと共有したい state や他の値を管理することはよくあります。必要であれば独自の [context provider](https://react.dev/learn/passing-data-deeply-with-context) を作成することもできますが、これはよくある状況であるため、[`<Outlet>`](../components/Outlet) に組み込まれています。

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

TypeScript を使用している場合、親コンポーネントが context の値にアクセスするためのカスタム hook を提供することをお勧めします。これにより、コンシューマーが適切な型付けを得やすくなり、コンシューマーを制御し、誰が context の値を使用しているかを把握しやすくなります。

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

## Signature

```tsx
function useOutletContext<Context = unknown>(): Context
```

## Returns

親 [`Outlet`](../components/Outlet) コンポーネントに渡された context の値