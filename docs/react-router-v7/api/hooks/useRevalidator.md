---
title: useRevalidator
---

# useRevalidator

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useRevalidator.html)

ウィンドウのフォーカスや一定間隔でのポーリングなど、通常のデータ変更以外の理由で、ページ上のデータを再検証します。

```tsx
import { useRevalidator } from "react-router";

function WindowFocusRevalidator() {
  const revalidator = useRevalidator();

  useFakeWindowFocus(() => {
    revalidator.revalidate();
  });

  return (
    <div hidden={revalidator.state === "idle"}>
      再検証中...
    </div>
  );
}
```

ページデータは、アクションの後に自動的に再検証されることに注意してください。ユーザーインタラクションに応じたデータの通常のCRUD操作のためにこれを使用している場合は、[useFetcher](../hooks/useFetcher)、[Form](../components/Form)、[useSubmit](../hooks/useSubmit)などの他のAPIを十分に活用できていない可能性があります。これらのAPIは自動的にこれを行います。

## シグネチャ

```tsx
useRevalidator(): undefined
```

