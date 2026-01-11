---
title: generatePath
---

# generatePath

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

生成する元のパス。

### params

パスに補間するパラメータ。

## 戻り値

パラメータが補間された生成済みパス。