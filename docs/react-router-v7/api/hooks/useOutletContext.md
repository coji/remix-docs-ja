---
title: useOutletContext
---

# useOutletContext

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useOutletContext.html)

親ルートの `<Outlet context>` を返します。

## シグネチャ

```tsx
useOutletContext(): Context
```

<details>
  <summary>型宣言</summary>

```tsx
declare function useOutletContext<
  Context = unknown
>(): Context;
```

</details>

親ルートは、子ルートと共有したい状態やその他の値を管理することがよくあります。必要であれば独自の[コンテキストプロバイダー](https://react.dev/learn/passing-data-deeply-with-context)を作成することもできますが、これは非常に一般的な状況であるため、`<Outlet />` に組み込まれています。

```tsx lines=[3]
function Parent() {
  const [count, setCount] = React.useState(0);
  return <Outlet context={[count, setCount]} />;
}
```

```tsx lines=[4]
import { useOutletContext } from "react-router-dom";

function Child() {
  const [count, setCount] = useOutletContext();
  const increment = () => setCount((c) => c + 1);
  return <button onClick={increment}>{count}</button>;
}
```

TypeScriptを使用している場合、親コンポーネントがコンテキスト値にアクセスするためのカスタムフックを提供することをお勧めします。これにより、コンシューマーが適切な型付けを得やすくなり、コンシューマーを制御し、誰がコンテキスト値を使用しているかを把握しやすくなります。より現実的な例を次に示します。

```tsx filename=src/routes/dashboard.tsx lines=[13,19]
import * as React from "react";
import type { User } from "./types";
import { Outlet, useOutletContext } from "react-router-dom";

type ContextType = { user: User | null };

export default function Dashboard() {
  const [user, setUser] = React.useState<User | null>(null);

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