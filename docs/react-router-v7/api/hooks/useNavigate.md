---
title: useNavigate
---

# useNavigate

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useNavigate.html)

ユーザーのインタラクションやエフェクトに応じて、ブラウザ内でプログラム的にナビゲートできる関数を返します。

```tsx
import { useNavigate } from "react-router";

function SomeComponent() {
  let navigate = useNavigate();
  return (
    <button
      onClick={() => {
        navigate(-1);
      }}
    />
  );
}
```

このフックよりも、[ActionFunction](../Other/ActionFunction) および [LoaderFunction](../Other/LoaderFunction) で [redirect](../Utils/redirect) を使用する方が良い場合が多いです。

## シグネチャ

```tsx
useNavigate(): NavigateFunction
```

