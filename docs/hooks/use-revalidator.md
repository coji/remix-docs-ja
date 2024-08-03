---
title: useRevalidator
new: true
---

# `useRevalidator`

ページ上のデータを、ウィンドウのフォーカスや一定間隔でのポーリングなどの通常のデータ変更以外の理由で再検証します。

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

Remix は、アクションが呼び出されたときに、ページ上のデータを自動的に再検証します。ユーザーの操作に応答して、この機能を通常の CRUD 操作に使用している場合は、おそらく [`<Form>`][form-component]、[`useSubmit`][use-submit]、または [`useFetcher`][use-fetcher] などの他の API を利用していません。これらの API は、このような操作を自動的に実行します。

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

`useRevalidator` を同時に複数回レンダリングできますが、内部的にはシングルトンです。つまり、ある `revalidator.revalidate()` が呼び出されると、すべてのインスタンスが一緒に `"loading"` 状態になります（または、すべてのインスタンスがシングルトン状態を報告するように更新されます）。

再検証がすでに進行中の場合に `revalidate()` を呼び出すと、競合状態が自動的に処理されます。

再検証中にナビゲーションが発生した場合、再検証はキャンセルされ、次のページのすべてのローダーから新しいデータが要求されます。

[form-component]: ../components/form
[use-fetcher]: ./use-fetcher
[use-submit]: ./use-submit

