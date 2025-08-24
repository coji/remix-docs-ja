---
title: useSubmit
---

# useSubmit

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useSubmit.html)

[Form](../components/Form) の命令的なバージョンで、ユーザーの操作ではなくコードからフォームを送信できます。

```tsx
import { useSubmit } from "react-router";

function SomeComponent() {
  const submit = useSubmit();
  return (
    <Form onChange={(event) => submit(event.currentTarget)} />
  );
}
```

## シグネチャ

```tsx
function useSubmit(): SubmitFunction
```

## 戻り値

[`Form`](../components/Form) を命令的に送信するために呼び出すことができる関数です。