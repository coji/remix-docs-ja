---
title: useHref
---

# useHref

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useHref.html)

現在の [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) に対してURLを解決します。

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

デフォルトは`"route"`で、ルーティングはルートツリーに対して相対的に行われます。
`"path"`に設定すると、相対ルーティングがパスセグメントに対して行われます。

## 戻り値

解決された href 文字列