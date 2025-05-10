---
title: useViewTransitionState
---

# useViewTransitionState

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useViewTransitionState.html)

このフックは、指定された場所へのアクティブな[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)がある場合に `true` を返します。これは、要素にきめ細かいスタイルを適用して、ビューのトランジションをさらにカスタマイズするために使用できます。これには、LinkProps.viewTransition（または `Form`、`submit`、`navigate` 呼び出し）を介して、特定のナビゲーションでビューのトランジションが有効になっている必要があります。

## シグネチャ

```tsx
useViewTransitionState(to, opts): boolean
```

## パラメータ

### to

[modes: framework, data, declarative]

_ドキュメントなし_

### opts

[modes: framework, data, declarative]

_ドキュメントなし_