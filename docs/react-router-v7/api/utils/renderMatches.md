---
title: renderMatches
---

# renderMatches

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

レンダーする [route matches](https://api.reactrouter.com/v7/interfaces/react_router.RouteMatch.html) の配列。

## 戻り値

マッチした routes をレンダーする React 要素、またはマッチがない場合は `null`。