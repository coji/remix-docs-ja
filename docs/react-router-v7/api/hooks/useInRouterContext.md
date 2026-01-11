---
title: useInRouterContext
---

# useInRouterContext

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useInRouterContext.html)

このコンポーネントが [`Router`](../declarative-routers/Router) の子孫である場合に `true` を返します。これは、コンポーネントが [`Router`](../declarative-routers/Router) 内で使用されていることを確認するのに役立ちます。

## シグネチャ

```tsx
function useInRouterContext(): boolean
```

## 戻り値

コンポーネントが [`Router`](../declarative-routers/Router) のコンテキスト内にあるかどうか。