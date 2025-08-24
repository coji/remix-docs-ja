---
title: useLinkClickHandler
---

# useLinkClickHandler

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useLinkClickHandler.html)

ルーターの[`<Link>`](../components/Link)コンポーネントのクリック動作を処理します。これは、エクスポートされた[`<Link>`](../components/Link)で使用しているのと同じクリック動作を持つカスタム[`<Link>`](../components/Link)コンポーネントを作成する必要がある場合に役立ちます。

## シグネチャ

```tsx
function useLinkClickHandler<E extends Element = HTMLAnchorElement>(
  to: To,
  {
    target,
    replace: replaceProp,
    state,
    preventScrollReset,
    relative,
    viewTransition,
  }: {
    target?: React.HTMLAttributeAnchorTarget;
    replace?: boolean;
    state?: any;
    preventScrollReset?: boolean;
    relative?: RelativeRoutingType;
    viewTransition?: boolean;
  } = ,
): (event: React.MouseEvent<E, MouseEvent>) => void {}
```

## パラメータ

### to

ナビゲート先のURL。文字列または部分的な[`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html)を指定できます。

### options.preventScrollReset

[`ScrollRestoration`](../components/ScrollRestoration)コンポーネントを使用している場合に、ナビゲーション完了時にスクロール位置がビューポートの最上部にリセットされるのを防ぐかどうか。デフォルトは`false`です。

### options.relative

リンクに使用する[相対ルーティングタイプ](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html)。デフォルトは`"route"`です。

### options.replace

新しいエントリをプッシュする代わりに、現在の[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History)エントリを置き換えるかどうか。デフォルトは`false`です。

### options.state

このナビゲーションの[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History)エントリに追加するstate。デフォルトは`undefined`です。

### options.target

リンクのtarget属性。デフォルトは`undefined`です。

### options.viewTransition

このナビゲーションで[View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)を有効にします。トランジション中に特定のスタイルを適用するには、[`useViewTransitionState`](../hooks/useViewTransitionState)を参照してください。デフォルトは`false`です。

## 戻り値

カスタム[`Link`](../components/Link)コンポーネントで使用できるクリックハンドラ関数。