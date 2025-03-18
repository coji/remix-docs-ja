---
title: useAsyncError
---

# useAsyncError

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useAsyncError.html)

最も近い[Await](../components/Await)からのリジェクト値を返します。

```tsx
import { Await, useAsyncError } from "react-router";

function ErrorElement() {
  const error = useAsyncError();
  return (
    <p>おっと、何か問題が発生しました！ {error.message}</p>
  );
}

// アプリ内のどこかで
<Await
  resolve={promiseThatRejects}
  errorElement={<ErrorElement />}
/>;
```

## シグネチャ

```tsx
useAsyncError(): unknown
```
