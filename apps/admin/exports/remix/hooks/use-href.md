---
title: useHref
---

# `useHref`

現在のロケーションに対して完全な URL を解決し、[`link`][anchor_element] への [`href`][anchor_element_href_attribute] として使用できるようにします。相対パスが指定された場合、完全な URL に解決されます。

```tsx
import { useHref } from "@remix-run/react";

function SomeComponent() {
  const href = useHref("some/where");

  return <a href={href}>Link</a>;
}
```

## シグネチャ

```
useHref(to, options)
```

### `to`

オプション。解決された URL に追加するパス。

<docs-info>スプラットルート内の相対的な `useHref()` の動作に関する `future.v3_relativeSplatPath` future フラグの動作については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

### `options`

唯一のオプションは `{ relative: "route" | "path" }` で、相対 URL を解決する際の動作を定義します。

- **route** デフォルト - URL ではなく、ルート階層に対して相対的
- **path** - アクションを URL パスに対して相対的にします。したがって、`..` は URL セグメントを 1 つ削除します。

[anchor_element_href_attribute]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#href
[anchor_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[relativesplatpath]: ./use-resolved-path#splat-paths

