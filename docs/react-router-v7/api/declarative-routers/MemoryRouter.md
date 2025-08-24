---
title: MemoryRouter
---

# MemoryRouter

[MODES: declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.MemoryRouter.html)

すべてのエントリをメモリに保存する宣言的な[`<Router>`](../declarative-routers/Router)です。

## シグネチャ

```tsx
function MemoryRouter({
  basename,
  children,
  initialEntries,
  initialIndex,
}: MemoryRouterProps): React.ReactElement
```

## Props

### basename

アプリケーションのベース名

### children

ルートツリーを記述するネストされた[`Route`](../components/Route)要素

### initialEntries

メモリ内の履歴スタックの初期エントリ

### initialIndex

アプリケーションが初期化されるべき`initialEntries`のインデックス