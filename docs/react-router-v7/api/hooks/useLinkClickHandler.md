---
title: useLinkClickHandler
---

# useLinkClickHandler

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useLinkClickHandler.html)

ルーターの [`<Link>`](../components/Link) コンポーネントのクリック動作を処理します。これは、エクスポートされた [`<Link>`](../components/Link) で使用しているのと同じクリック動作を持つカスタム [`<Link>`](../components/Link) コンポーネントを作成する必要がある場合に役立ちます。

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
    unstable_defaultShouldRevalidate,
    unstable_useTransitions,
  }: {
    target?: React.HTMLAttributeAnchorTarget;
    replace?: boolean;
    state?: any;
    preventScrollReset?: boolean;
    relative?: RelativeRoutingType;
    viewTransition?: boolean;
    unstable_defaultShouldRevalidate?: boolean;
    unstable_useTransitions?: boolean;
  } = ,
): (event: React.MouseEvent<E, MouseEvent>) => void {}
```

## パラメータ

### to

ナビゲートする URL。文字列または部分的な [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) にすることができます。

### options.preventScrollReset

[`ScrollRestoration`](../components/ScrollRestoration) コンポーネントを使用している場合に、ナビゲーション完了時にスクロール位置がビューポートの最上部にリセットされるのを防ぐかどうか。デフォルトは `false` です。

### options.relative

リンクに使用する [相対ルーティングタイプ](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html)。デフォルトは `"route"` です。

### options.replace

新しいエントリをプッシュする代わりに、現在の [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) エントリを置き換えるかどうか。デフォルトは `false` です。

### options.state

このナビゲーションの [`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) エントリに追加する state。デフォルトは `undefined` です。

### options.target

リンクの target 属性。デフォルトは `undefined` です。

### options.viewTransition

このナビゲーションで [View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) を有効にします。トランジション中に特定のスタイルを適用するには、[`useViewTransitionState`](../hooks/useViewTransitionState) を参照してください。デフォルトは `false` です。

### options.unstable_defaultShouldRevalidate

ナビゲーションのデフォルトの再検証動作を指定します。デフォルトは `true` です。

### options.unstable_useTransitions

同時レンダリングのために、ナビゲーションを [`React.startTransition`](https://react.dev/reference/react/startTransition) でラップします。デフォルトは `false` です。

## 戻り値

カスタム [`Link`](../components/Link) コンポーネントで使用できるクリックハンドラー関数です。