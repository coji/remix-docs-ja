---
title: useBeforeUnload
---

# useBeforeUnload

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useBeforeUnload.html)

[Window の `beforeunload` イベント](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)で発火するコールバックを設定します。

## シグネチャ

```tsx
function useBeforeUnload(
  callback: (event: BeforeUnloadEvent) => any,
  options?: {
    capture?: boolean;
  },
): void
```

## パラメータ

### callback

[`beforeunload` イベント](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)が発火したときに呼び出される callback です。

### options.capture

`true` の場合、イベントはキャプチャフェーズ中に捕捉されます。デフォルトは `false` です。

## 戻り値

戻り値はありません。