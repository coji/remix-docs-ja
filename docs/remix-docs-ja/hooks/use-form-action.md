---
title: useFormAction
---

# `useFormAction`

コンポーネント階層内で最も近いルートへのURLを解決します。アプリの現在のURLではありません。

これは、[`<Form>`][form_component]で最も近いルートへのアクションを解決するために内部的に使用されますが、汎用的に使用することもできます。

```tsx
import { useFormAction } from "@remix-run/react";

function SomeComponent() {
  // 最も近いルートのURL
  const action = useFormAction();

  // 最も近いルートのURL + "destroy"
  const destroyAction = useFormAction("destroy");
}
```

## シグネチャ

```
useFormAction(action, options)
```

### `action`

オプション。最も近いルートURLに追加するアクション。

### `options`

唯一のオプションは`{ relative: "route" | "path"}`です。

- **route** デフォルト - URL階層ではなく、ルート階層に対する相対パス
- **path** - アクションをURLパスの相対パスにします。そのため、`..`はURLセグメントを1つ削除します。

[form_component]: ../components/form
