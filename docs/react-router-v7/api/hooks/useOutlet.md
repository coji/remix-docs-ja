---
title: useOutlet
---

# useOutlet

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useOutlet.html)

ルート階層のこのレベルの子ルートの要素を返します。子ルートをレンダリングするために、内部的に [`<Outlet>`](../components/Outlet) によって使用されます。

## シグネチャ

```tsx
function useOutlet(context?: unknown): React.ReactElement | null
```

## パラメータ

### context

outlet に渡す context

## 戻り値

子ルートの要素。一致する子ルートがない場合は `null`。