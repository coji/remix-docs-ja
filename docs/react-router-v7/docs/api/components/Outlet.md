---
title: Outlet
---

# Outlet

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Outlet.html)

親ルートにマッチする子ルートをレンダリングします。子ルートがマッチしない場合は何もレンダリングしません。

```tsx
import { Outlet } from "react-router";

export default function SomeParent() {
  return (
    <div>
      <h1>親コンテンツ</h1>
      <Outlet />
    </div>
  );
}
```

## Props

### context

[modes: framework, data, declarative]

Outlet の下の要素ツリーにコンテキスト値を提供します。親ルートが子ルートに値を提供する必要がある場合に使用します。

```tsx
<Outlet context={myContextValue} />
```

コンテキストには [useOutletContext](../hooks/useOutletContext) でアクセスします。

