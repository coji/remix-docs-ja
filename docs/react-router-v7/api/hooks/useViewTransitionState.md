---
title: useViewTransitionState
---

# useViewTransitionState

[MODES: framework, data]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.useViewTransitionState.html)

このフックは、指定された場所へのアクティブな[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)がある場合に `true` を返します。これは、要素にきめ細かいスタイルを適用して、ビューのトランジションをさらにカスタマイズするために使用できます。これには、[`LinkProps.viewTransition`](https://api.reactrouter.com/v7/interfaces/react_router.LinkProps.html#viewTransition)（または `Form`、`submit`、`navigate` 呼び出し）を介して、特定のナビゲーションでビューのトランジションが有効になっている必要があります。

## Signature

```tsx
function useViewTransitionState(
  to: To,
  {
    relative,
  }: {
    relative?: RelativeRoutingType;
  } = ,
) {}
```

## Params

### to

アクティブな[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)を確認する[`To`](https://api.reactrouter.com/v7/types/react_router.To.html)ロケーション。

### options.relative

`to` ロケーションを解決する際に使用する相対ルーティングタイプで、デフォルトは `"route"` です。詳細については、[`RelativeRoutingType`](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html)を参照してください。

## Returns

指定された[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)へのアクティブな[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)がある場合は `true`、それ以外の場合は `false`。