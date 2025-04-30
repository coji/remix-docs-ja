---
title: useSearchParams
---

# useSearchParams

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useSearchParams.html)

現在のURLのURLSearchParamsと、それらを更新する関数のタプルを返します。検索パラメータを設定すると、ナビゲーションが発生します。

```tsx
import { useSearchParams } from "react-router";

export function SomeComponent() {
  const [searchParams, setSearchParams] = useSearchParams();
  // ...
}
```

## シグネチャ

```tsx
useSearchParams(defaultInit): undefined
```

## パラメータ

### defaultInit

[modes: framework, data, declarative]

_ドキュメントはありません_

