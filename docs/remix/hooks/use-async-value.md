---
title: useAsyncValue
new: true
---

# `useAsyncValue`

最も近い祖先の [`<Await>`][await_component] コンポーネントから解決されたデータを返します。

```tsx
function SomeDescendant() {
  const value = useAsyncValue();
  // ...
}
```

```tsx
<Await resolve={somePromise}>
  <SomeDescendant />
</Await>
```

## 追加リソース

**ガイド**

- [ストリーミング][streaming_guide]

**API**

- [`<Await/>`][await_component]
- [`useAsyncError`][use_async_error]

[await_component]: ../components/await
[streaming_guide]: ../guides/streaming
[use_async_error]: ../hooks/use-async-error

