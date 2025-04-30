---
title: useAsyncValue
---

# useAsyncValue

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useAsyncValue.html)

最も近い[Await](../components/Await)から解決されたPromiseの値を返します。

```tsx
function SomeDescendant() {
  const value = useAsyncValue();
  // ...
}

// アプリのどこかで
<Await resolve={somePromise}>
  <SomeDescendant />
</Await>;
```

## シグネチャ

```tsx
useAsyncValue(): unknown
```

