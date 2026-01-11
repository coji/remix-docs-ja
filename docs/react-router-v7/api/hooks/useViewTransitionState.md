---
title: useViewTransitionState
---

# useViewTransitionState

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useViewTransitionState.html)

この hook は、指定されたロケーションへのアクティブな[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)がある場合に `true` を返します。これは、ビューのトランジションをさらにカスタマイズするために、要素にきめ細かいスタイルを適用するために使用できます。これには、[`LinkProps.viewTransition`](https://api.reactrouter.com/v7/interfaces/react_router.LinkProps.html#viewTransition)（または `Form`、`submit`、`navigate` 呼び出し）を介して、特定のナビゲーションでビューのトランジションが有効になっている必要があります。

## シグネチャ

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

## パラメータ

### to

アクティブな[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)をチェックする[`To`](https://api.reactrouter.com/v7/types/react_router.To.html)ロケーション。

### options.relative

`to` ロケーションを解決する際に使用する相対ルーティングのタイプで、デフォルトは `"route"` です。詳細については、[`RelativeRoutingType`](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html)を参照してください。

## 戻り値

指定された[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)へのアクティブな[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)がある場合は `true`、それ以外の場合は `false` を返します。