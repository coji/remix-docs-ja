---
title: MemoryRouter
---

# MemoryRouter

[MODES: declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.MemoryRouter.html)

宣言的な [`<Router>`](../declarative-routers/Router) で、すべてのエントリをメモリに保存します。

## シグネチャ

```tsx
function MemoryRouter({
  basename,
  children,
  initialEntries,
  initialIndex,
  unstable_useTransitions,
}: MemoryRouterProps): React.ReactElement
```

## Props

### basename

アプリケーションの basename

### children

ルートツリーを記述するネストされた [`Route`](../components/Route) 要素

### initialEntries

インメモリ履歴スタックの初期エントリ

### initialIndex

アプリケーションが初期化される `initialEntries` のインデックス

### unstable_useTransitions

router state の更新が内部的に [`React.startTransition`](https://react.dev/reference/react/startTransition) でラップされるかどうかを制御します。

- `undefined` の場合、すべての router state の更新は `React.startTransition` でラップされます。
- `true` に設定すると、[`Link`](../components/Link) と [`Form`](../components/Form) のナビゲーションは `React.startTransition` でラップされ、すべての router state の更新は `React.startTransition` でラップされます。
- `false` に設定すると、router はナビゲーションや state の変更において `React.startTransition` を利用しません。

詳細については、[ドキュメント](https://reactrouter.com/explanation/react-transitions)を参照してください。