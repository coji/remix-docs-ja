---
title: resolvePath
---

# resolvePath

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.resolvePath.html)

指定されたパス名に対する相対パスを解決した [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクトを返します。

## シグネチャ

```tsx
function resolvePath(to: To, fromPathname = "/"): Path
```

## パラメータ

### to

解決するパス。文字列、または部分的な [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクトです。

### fromPathname

パスを解決する際の基準となる pathname。デフォルトは `/` です。

## 戻り値

解決された pathname、search、および hash を含む [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクト。