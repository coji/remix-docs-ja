---
title: useAsyncError
new: true
---

# `useAsyncError`

最も近い [`<Await>`][await_component] コンポーネントからの拒否値を返します。

```tsx lines[4,12]
import { Await, useAsyncError } from "@remix-run/react";

function ErrorElement() {
  const error = useAsyncError();
  return (
    <p>Uh Oh, something went wrong! {error.message}</p>
  );
}

<Await
  resolve={promiseThatRejects}
  errorElement={<ErrorElement />}
/>;
```

## さらなるリソース

**ガイド**

- [ストリーミング][streaming_guide]

**API**

- [`<Await/>`][await_component]
- [`useAsyncValue()`][use_async_value]

[await_component]: ../components/await
[streaming_guide]: ../guides/streaming
[use_async_value]: ../hooks/use-async-value
