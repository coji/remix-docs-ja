---
title: useSearchParams
---

# `useSearchParams`

現在のURLの[`searchParams`][search-params]と、それらを更新する関数のタプルを返します。検索パラメータを設定すると、ナビゲーションが発生します。

```tsx
import { useSearchParams } from "@remix-run/react";

export function SomeComponent() {
  const [searchParams, setSearchParams] = useSearchParams();
  // ...
}
```

## シグネチャ

<!-- eslint-disable -->

```tsx
const [searchParams, setSearchParams] = useSearchParams();
```

### `searchParams`

返される最初の値は、Web [URLSearchParams][url-search-params]オブジェクトです。

### `setSearchParams(params, navigateOptions)`

返される2番目の値は、新しい検索パラメータを設定し、呼び出されるとナビゲーションを引き起こす関数です。オプションの2番目の引数として、ナビゲーションを構成するための[ナビゲーションオプション][navigateoptions]を渡すことができます。

```tsx
<button
  onClick={() => {
    const params = new URLSearchParams();
    params.set("someKey", "someValue");
    setSearchParams(params, {
      preventScrollReset: true,
    });
  }}
/>
```

### `setSearchParams((prevParams) => newParams, navigateOptions)`

セッター関数は、新しい検索パラメータを設定するための関数もサポートしています。

```tsx
<button
  onClick={() => {
    setSearchParams((prev) => {
      prev.set("someKey", "someValue");
      return prev;
    });
  }}
/>
```

[search-params]: https://developer.mozilla.org/ja/docs/Web/API/URL/searchParams
[url-search-params]: https://developer.mozilla.org/ja/docs/Web/API/URLSearchParams
[navigateoptions]: ./use-navigate#options

