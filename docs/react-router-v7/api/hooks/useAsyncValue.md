---
title: useAsyncValue
---

# useAsyncValue

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useAsyncValue.html)

最も近い[`<Await>`](../components/Await)から解決されたPromiseの値を返します。

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
function useAsyncValue(): unknown
```

## 戻り値

最も近い[`Await`](../components/Await)コンポーネントから解決された値