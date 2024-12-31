---
title: useRevalidator
new: true
---

# `useRevalidator`

ウィンドウフォーカスや一定間隔でのポーリングなど、通常のデータ変更以外の理由でページ上のデータを再検証します。

```tsx
import { useRevalidator } from "@remix-run/react";

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

Remix は、アクションが呼び出されたときに、ページ上のデータを自動的に再検証します。ユーザーインタラクションに応じたデータの通常の CRUD 操作にこれを使用している場合は、[`<Form>`][form-component]、[`useSubmit`][use-submit]、または [`useFetcher`][use-fetcher] のような、これを自動的に行う他の API を活用していない可能性があります。

## プロパティ

### `revalidator.state`

再検証の状態。`"idle"` または `"loading"` のいずれかです。

### `revalidator.revalidate()`

再検証を開始します。

```tsx
function useLivePageData() {
  const revalidator = useRevalidator();
  const interval = useInterval(5000);

  useEffect(() => {
    if (revalidator.state === "idle") {
      revalidator.revalidate();
    }
  }, [interval, revalidator]);
}
```

## 注意点

同時に `useRevalidator` を複数回レンダリングできますが、内部的にはシングルトンです。つまり、1 つの `revalidator.revalidate()` が呼び出されると、すべてのインスタンスが一緒に `"loading"` 状態になります（または、すべてがシングルトン状態を報告するように更新されます）。

他の理由で再検証がすでに進行中の場合に `revalidate()` を呼び出すと、競合状態は自動的に処理されます。

再検証が進行中にナビゲーションが発生した場合、再検証はキャンセルされ、次のページのすべてのローダーから新しいデータが要求されます。

[form-component]: ../components/form
[use-fetcher]: ./use-fetcher
[use-submit]: ./use-submit

