---
title: useHref
---

# useHref

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useHref.html)

現在の[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)に対してURLを解決します。

```tsx
import { useHref } from "react-router";

function SomeComponent() {
  let href = useHref("some/where");
  // "/resolved/some/where"
}
```

## シグネチャ

```tsx
function useHref(
  to: To,
  {
    relative,
  }: {
    relative?: RelativeRoutingType;
  } = ,
): string {}
```

## パラメータ

### to

解決するパス

### options.relative

デフォルトは`"route"`で、ルーティングはルートツリーに対して相対的になります。
`"path"`に設定すると、相対ルーティングがパスセグメントに対して動作するようになります。

## 戻り値

解決されたhref文字列