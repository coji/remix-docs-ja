---
title: Routes
---

# Routes

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Routes.html)

現在のロケーションに最も一致する [Route](../components/Route) のブランチをレンダリングします。これらのルートは、データローディング、アクション、コード分割、またはその他のルートモジュールの機能には関与しないことに注意してください。

```tsx
import { Routes, Route } from "react-router"

<Routes>
 <Route index element={<StepOne />} />
 <Route path="step-2" element={<StepTwo />} />
 <Route path="step-3" element={<StepThree />} />
</Routes>
```

## Props

### children

[modes: framework, data, declarative]

ネストされた [Route](../components/Route) 要素

### location

[modes: framework, data, declarative]

マッチングに使用するロケーション。デフォルトは現在のロケーションです。