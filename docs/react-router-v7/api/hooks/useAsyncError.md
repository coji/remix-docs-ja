---
title: useAsyncError
---

# useAsyncError

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useAsyncError.html)

最も近い[`<Await>`](../components/Await)からのリジェクト値を返します。

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
function useAsyncError(): unknown
```

## 戻り値

最も近い[`Await`](../components/Await) コンポーネントでスローされたエラーです。