---
title: useBeforeUnload
---

# useBeforeUnload

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

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

[`beforeunload` イベント](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)が発火したときに呼び出されるコールバックです。

### options.capture

`true` の場合、イベントはキャプチャフェーズ中に捕捉されます。デフォルトは `false` です。

## 戻り値

戻り値はありません。