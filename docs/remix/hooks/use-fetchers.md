---
title: useFetchers
toc: false
---

# `useFetchers`

すべての進行中のフェッチャーの配列を返します。これは、フェッチャーを作成していないが、楽観的なUIに参加するためにその送信を使用したいアプリケーション全体のコンポーネントに役立ちます。

```tsx
import { useFetchers } from "@remix-run/react";

function SomeComponent() {
  const fetchers = useFetchers();
  fetchers[0].formData; // FormData
  fetchers[0].state; // etc.
  // ...
}
```

フェッチャーには、[`fetcher.Form`][fetcher_form]、[`fetcher.submit`][fetcher_submit]、または [`fetcher.load`][fetcher_load] は含まれていません。[`fetcher.formData`][fetcher_form_data]、[`fetcher.state`][fetcher_state] などの状態のみが含まれています。

## 追加のリソース

**ディスカッション**

- [フォーム vs. フェッチャー][form_vs_fetcher]
- [保留中、楽観的なUI][pending_optimistic_ui]

**API**

- [`useFetcher`][use_fetcher]
- [`v3_fetcherPersist`][fetcherpersist]

[fetcher_form]: ./use-fetcher#fetcherform
[fetcher_submit]: ./use-fetcher#fetchersubmitformdata-options
[fetcher_load]: ./use-fetcher#fetcherloadhref
[fetcher_form_data]: ./use-fetcher#fetcherformdata
[fetcher_state]: ./use-fetcher#fetcherstate
[form_vs_fetcher]: ../discussion/form-vs-fetcher
[pending_optimistic_ui]: ../discussion/pending-ui
[use_fetcher]: ./use-fetcher
[fetcherpersist]: ../file-conventions/remix-config#future
