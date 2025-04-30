---
title: useAsyncError
new: true
---

# `useAsyncError`

最も近い[`<Await>`][await_component]コンポーネントからのリジェクション値を返します。

```tsx lines[4,12]
import { Await, useAsyncError } from "@remix-run/react";

function ErrorElement() {
  const error = useAsyncError();
  return (
    <p>おっと、何か問題が発生しました！ {error.message}</p>
  );
}

<Await
  resolve={promiseThatRejects}
  errorElement={<ErrorElement />}
/>;
```

## 追加リソース

**ガイド**

- [ストリーミング][streaming_guide]

**API**

- [`<Await/>`][await_component]
- [`useAsyncValue()`][use_async_value]

[await_component]: ../components/await
[streaming_guide]: ../guides/streaming
[use_async_value]: ../hooks/use-async-value

