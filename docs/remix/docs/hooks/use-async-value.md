---
title: useAsyncValue
new: true
---

# `useAsyncValue`

最も近い [`<Await>`][await_component] 親コンポーネントから解決されたデータを取得します。

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

## 関連リソース

**ガイド**

- [ストリーミング][streaming_guide]

**API**

- [`<Await/>`][await_component]
- [`useAsyncError`][use_async_error]

[await_component]: ../components/await
[streaming_guide]: ../guides/streaming
[use_async_error]: ../hooks/use-async-error 
