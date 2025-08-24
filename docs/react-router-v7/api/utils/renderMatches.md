---
title: renderMatches
---

# renderMatches

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.renderMatches.html)

[`matchRoutes`](../utils/matchRoutes) の結果を React 要素としてレンダリングします。

## シグネチャ

```tsx
function renderMatches(
  matches: RouteMatch[] | null,
): React.ReactElement | null
```

## パラメータ

### matches

レンダリングする [ルートマッチ](https://api.reactrouter.com/v7/interfaces/react_router.RouteMatch.html) の配列

## 戻り値

マッチしたルートをレンダリングする React 要素、またはマッチがない場合は `null`。