---
title: useFetchers
toc: false
---

# `useFetchers`

現在実行中のすべてのフェッチャーの配列を返します。これは、フェッチャーを作成しなかったが、楽観的 UI に参加するためにそれらの送信を使用したいアプリ全体のコンポーネントに役立ちます。

```tsx
import { useFetchers } from "@remix-run/react";

function SomeComponent() {
  const fetchers = useFetchers();
  fetchers[0].formData; // FormData
  fetchers[0].state; // etc.
  // ...
}
```

フェッチャーには、[`fetcher.Form`][fetcher_form]、[`fetcher.submit`][fetcher_submit]、または [`fetcher.load`][fetcher_load] は含まれておらず、[`fetcher.formData`][fetcher_form_data]、[`fetcher.state`][fetcher_state] などの状態のみが含まれています。

## 追加リソース

**ディスカッション**

- [Form vs. Fetcher][form_vs_fetcher]
- [Pending, Optimistic UI][pending_optimistic_ui]

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
