---
title: Routes
---

# Routes

[MODES: framework, data, declarative]

## 概要

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.Routes.html)

現在のロケーションに最も一致する [`<Route>`s](../components/Route) のブランチをレンダリングします。これらのルートは、[データローディング](../../start/framework/route-module#loader)、[`action`](../../start/framework/route-module#action)、コード分割、またはその他の[ルートモジュール](../../start/framework/route-module)の機能には関与しないことに注意してください。

```tsx
import { Route, Routes } from "react-router";

<Routes>
  <Route index element={<StepOne />} />
  <Route path="step-2" element={<StepTwo />} />
  <Route path="step-3" element={<StepThree />} />
</Routes>
```

## シグネチャ

```tsx
function Routes({
  children,
  location,
}: RoutesProps): React.ReactElement | null
```

## Props

### children

ネストされた [`Route`](../components/Route) 要素

### location

マッチングに使用する [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)。デフォルトは現在のロケーションです。