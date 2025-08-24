---
title: useRevalidator
---

# useRevalidator

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useRevalidator.html)

[Window focus](https://developer.mozilla.org/en-US/docs/Web/API/Window/focus_event)や一定間隔でのポーリングなど、通常のデータ変更以外の理由で、ページ上のデータを再検証します。

ページデータは、アクションの後に自動的に再検証されることに注意してください。ユーザーインタラクションに応じたデータの通常のCRUD操作のためにこれを使用している場合、[`useFetcher`](../hooks/useFetcher)、[`Form`](../components/Form)、[`useSubmit`](../hooks/useSubmit)などの、これを自動的に行う他のAPIを活用できていない可能性があります。

```tsx
import { useRevalidator } from "react-router";

function WindowFocusRevalidator() {
  const revalidator = useRevalidator();

  useFakeWindowFocus(() => {
    revalidator.revalidate();
  });

  return (
    <div hidden={revalidator.state === "idle"}>
      Revalidating...
    </div>
  );
}
```

## シグネチャ

```tsx
function useRevalidator(): {
  revalidate: () => Promise<void>;
  state: DataRouter["state"]["revalidation"];
}
```

## 戻り値

`revalidate` 関数と現在の再検証 `state` を持つオブジェクト。