---
title: useInRouterContext
---

# useInRouterContext

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

ドキュメントの改善にご協力いただきありがとうございます！

このファイルはソースコード内のJSDocコメントから自動生成されています。
そのため、以下のファイルのJSDocコメントを編集してください。
変更がマージされると、このファイルが再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useInRouterContext.html)

このコンポーネントが [`Router`](../declarative-routers/Router) の子孫である場合に `true` を返します。コンポーネントが [`Router`](../declarative-routers/Router) 内で使用されていることを確認するのに役立ちます。

## シグネチャ

```tsx
function useInRouterContext(): boolean
```

## Returns

コンポーネントが [`Router`](../declarative-routers/Router) コンテキスト内にあるかどうか。