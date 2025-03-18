---
title: useFormAction
---

# useFormAction

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useFormAction.html)

アプリケーションの現在の URL ではなく、コンポーネント階層内の最も近いルートへの URL を解決します。

これは内部的に [Form](../components/Form) がアクションを最も近いルートに解決するために使用されますが、汎用的に使用することもできます。

```tsx
import { useFormAction } from "react-router";

function SomeComponent() {
  // 最も近いルートの URL
  let action = useFormAction();

  // 最も近いルートの URL + "destroy"
  let destroyAction = useFormAction("destroy");
}
```

## シグネチャ

```tsx
useFormAction(action, __namedParameters): string
```

## パラメータ

### action

[modes: framework, data]

最も近いルート URL に追加するアクション。

### \_\_namedParameters

[modes: framework, data]

_ドキュメントなし_

