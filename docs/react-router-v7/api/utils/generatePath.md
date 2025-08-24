---
title: generatePath
---

# generatePath

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.generatePath.html)

パラメータを補間したパスを返します。

```tsx
import { generatePath } from "react-router";

generatePath("/users/:id", { id: "123" }); // "/users/123"
```

## シグネチャ

```tsx
function generatePath<Path extends string>(
  originalPath: Path,
  params: {
    [key in PathParam<Path>]: string | null;
  } =  as any,
): string {}
```

## パラメータ

### originalPath

生成する元のパスです。

### params

パスに補間するパラメータです。

## 戻り値

パラメータが補間された生成済みのパスです。