---
title: useSubmit
---

# useSubmit

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useSubmit.html)

[Form](../components/Form) の命令的なバージョンで、ユーザーの操作ではなくコードからフォームを送信できます。

```tsx
import { useSubmit } from "react-router";

function SomeComponent() {
  const submit = useSubmit();
  return (
    <Form
      onChange={(event) => {
        submit(event.currentTarget);
      }}
    />
  );
}
```

## シグネチャ

```tsx
useSubmit(): SubmitFunction
```
