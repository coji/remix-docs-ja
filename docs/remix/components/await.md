---
title: Await
---

# `<Await>`

ストリーミングデータの利用を開始するには、[ストリーミングガイド][streaming_guide]を参照してください。

`<Await>` コンポーネントは、[`useLoaderData`][use_loader_data] からアクセスされる遅延ローダーの Promise を解決する役割を担います。

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

`resolve` プロパティは、データがストリーミングされたときに解決される [`useLoaderData`][use_loader_data] からの Promise を受け取ります。

```tsx
<Await resolve={somePromise} />
```

Promise が解決されていない場合、親の Suspense バウンダリーのフォールバックがレンダリングされます。

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <Await resolve={somePromise} />
</Suspense>
```

Promise が解決されると、`children` がレンダリングされます。

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

`errorElement` プロパティは、Promise が拒否されたときにエラーバウンダリーをレンダリングするために使用できます。

```tsx
<Await errorElement={<div>Oops!</div>} />
```

エラーは、サブツリー内の [`useAsyncError`][use_async_error] でアクセスできます。

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

