---
title: useHref
---

# `useHref`

現在の場所に対して完全な URL を解決し、[`リンク`][anchor_element] の [`href`][anchor_element_href_attribute] として使用します。相対パスが指定された場合、完全な URL に解決されます。

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

<docs-info>相対 `useHref()` の動作に関する `future.v3_relativeSplatPath` 未来フラグの動作については、`useResolvedPath` ドキュメントの [スプラットパス][relativesplatpath] セクションを参照してください。</docs-info>

### `options`

唯一のオプションは `{ relative: "route" | "path"}` で、相対 URL を解決するときの動作を定義します。

- **route** デフォルト - URL ではなく、ルート階層に対する相対
- **path** - アクションを URL パスに対する相対にするため、`..` は URL セグメントを 1 つ削除します。

[anchor_element_href_attribute]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#href
[anchor_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
[relativesplatpath]: ./use-resolved-path#splat-paths
