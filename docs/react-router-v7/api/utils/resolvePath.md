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

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.resolvePath.html)

指定されたパス名に対する相対パスを解決した [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクトを返します。

## Signature

```tsx
function resolvePath(to: To, fromPathname = "/"): Path
```

## Params

### to

解決するパス。文字列または部分的な [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクトのいずれかです。

### fromPathname

パスを解決する元のパス名。デフォルトは `/` です。

## Returns

解決されたパス名、search、および hash を含む [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクト。