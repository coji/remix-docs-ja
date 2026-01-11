---
title: useResolvedPath
---

# useResolvedPath

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useResolvedPath.html)

指定された `to` 値のパス名を現在の [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) に対して解決します。[useHref](../hooks/useHref) と似ていますが、文字列ではなく [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) を返します。

```tsx
import { useResolvedPath } from "react-router";

function SomeComponent() {
  // ユーザーが /dashboard/profile にいる場合
  let path = useResolvedPath("../accounts");
  path.pathname; // "/dashboard/accounts"
  path.search; // ""
  path.hash; // ""
}
```

## シグネチャ

```tsx
function useResolvedPath(
  to: To,
  {
    relative,
  }: {
    relative?: RelativeRoutingType;
  } = {},
): Path {}
```

## パラメータ

### to

解決するパス

### options.relative

デフォルトは `"route"` で、ルーティングがルートツリーに対して相対的になります。相対ルーティングがパスセグメントに対して機能するように、`"path"` に設定します。

## 戻り値

`pathname`、`search`、および `hash` を含む、解決された [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクト。