---
title: useFormAction
---

# `useFormAction`

アプリの現在の URL ではなく、コンポーネント階層内で最も近いルートの URL を解決します。

これは内部的に [`<Form>`][form_component] によって、アクションを最も近いルートに解決するために使用されますが、汎用的に使用することもできます。

```tsx
import { useFormAction } from "@remix-run/react";

function SomeComponent() {
  // 最も近いルートの URL
  const action = useFormAction();

  // 最も近いルートの URL + "destroy"
  const destroyAction = useFormAction("destroy");
}
```

## シグネチャ

```
useFormAction(action, options)
```

### `action`

オプション。最も近いルートの URL に追加するアクション。

### `options`

唯一のオプションは `{ relative: "route" | "path"}` です。

- **route** デフォルト - URL ではなく、ルート階層に対する相対パス
- **path** - アクションを URL パスに対する相対パスにするため、`..` は URL セグメントを 1 つ削除します。

[form_component]: ../components/form
