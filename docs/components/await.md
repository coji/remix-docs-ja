---
title: Await
---

# `<Await>`

ストリーミングデータの使用方法については、[ストリーミングガイド][streaming_guide] をご参照ください。

`<Await>` コンポーネントは、[`useLoaderData`][use_loader_data] からアクセスされる延期されたローダープロミスを解決する役割を担います。

```tsx
import { Await } from "@remix-run/react";

<Suspense fallback={<div>Loading...</div>}>
  <Await resolve={somePromise}>
    {(resolvedValue) => <p>{resolvedValue}</p>}
  </Await>
</Suspense>;
```

## Props

### `resolve`

`resolve` プロパティは、[`useLoaderData`][use_loader_data] から取得したプロミスを受け取り、データがストリーミングされたときに解決します。

```tsx
<Await resolve={somePromise} />
```

プロミスが解決されない場合、親のサスペンス境界のフォールバックがレンダリングされます。

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <Await resolve={somePromise} />
</Suspense>
```

プロミスが解決されると、`children` がレンダリングされます。

### `children`

`children` は、レンダリングコールバックまたは React 要素にすることができます。

```tsx
<Await resolve={somePromise}>
  {(resolvedValue) => <p>{resolvedValue}</p>}
</Await>
```

`children` プロパティが React 要素の場合、解決された値はサブツリー内の [`useAsyncValue`][use_async_value] を介してアクセスできます。

```tsx
<Await resolve={somePromise}>
  <SomeChild />
</Await>
```

```tsx
import { useAsyncValue } from "@remix-run/react";

function SomeChild() {
  const value = useAsyncValue();
  return <p>{value}</p>;
}
```

### `errorElement`

`errorElement` プロパティは、プロミスが拒否されたときにエラー境界をレンダリングするために使用できます。

```tsx
<Await errorElement={<div>Oops!</div>} />
```

エラーは、サブツリー内の [`useAsyncError`][use_async_error] を使用してアクセスできます。

```tsx
<Await errorElement={<SomeChild />} />
```

```tsx
import { useAsyncError } from "@remix-run/react";

function SomeChild() {
  const error = useAsyncError();
  return <p>{error.message}</p>;
}
```

[streaming_guide]: ../guides/streaming
[use_loader_data]: ../hooks/use-loader-data
[use_async_value]: ../hooks/use-async-value
[use_async_error]: ../hooks/use-async-error
