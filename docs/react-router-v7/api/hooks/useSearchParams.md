---
title: useSearchParams
---

# useSearchParams

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: framework, data, declarative]

## Summary

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.useSearchParams.html)

現在のURLの[`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)と、それらを更新する関数のタプルを返します。検索パラメータを設定すると、ナビゲーションが発生します。

```tsx
import { useSearchParams } from "react-router";

export function SomeComponent() {
  const [searchParams, setSearchParams] = useSearchParams();
  // ...
}
```

### `setSearchParams` 関数

タプルの2番目の要素は、検索パラメータを更新するために使用できる関数です。これは `defaultInit` と同じ型を受け入れ、新しいURLへのナビゲーションを引き起こします。

```tsx
let [searchParams, setSearchParams] = useSearchParams();

// a search param string
setSearchParams("?tab=1");

// a shorthand object
setSearchParams({ tab: "1" });

// object keys can be arrays for multiple values on the key
setSearchParams({ brand: ["nike", "reebok"] });

// an array of tuples
setSearchParams([["tab", "1"]]);

// a `URLSearchParams` object
setSearchParams(new URLSearchParams("?tab=1"));
```

また、React の [`setState`](https://react.dev/reference/react/useState#setstate) のような関数コールバックもサポートしています。

```tsx
setSearchParams((searchParams) => {
  searchParams.set("tab", "2");
  return searchParams;
});
```

<docs-warning>`setSearchParams` の関数コールバックバージョンは、React の `setState` が実装しているキューイングロジックをサポートしていません。同じティック内で `setSearchParams` を複数回呼び出しても、前の値に基づいて構築されることはありません。この動作が必要な場合は、`setState` を手動で使用できます。</docs-warning>

### 注意事項

`searchParams` は安定した参照であるため、React の [`useEffect`](https://react.dev/reference/react/useEffect) hooks の依存関係として信頼して使用できることに注意してください。

```tsx
useEffect(() => {
  console.log(searchParams.get("tab"));
}, [searchParams]);
```

ただし、これはミュータブルであることも意味します。`setSearchParams` を呼び出さずにオブジェクトを変更した場合、他の何らかの state がコンポーネントを再レンダーさせると、レンダー間でその値が変更され、URLにはその値が反映されません。

## Signature

```tsx
function useSearchParams(
  defaultInit?: URLSearchParamsInit,
): [URLSearchParams, SetURLSearchParams]
```

## Params

### defaultInit

検索パラメータをデフォルト値で初期化できますが、最初のレンダーでは URL を変更**しません**。

```tsx
// a search param string
useSearchParams("?tab=1");

// a shorthand object
useSearchParams({ tab: "1" });

// object keys can be arrays for multiple values on the key
useSearchParams({ brand: ["nike", "reebok"] });

// an array of tuples
useSearchParams([["tab", "1"]]);

// a `URLSearchParams` object
useSearchParams(new URLSearchParams("?tab=1"));
```

## 戻り値

現在の [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) と、それらを更新する関数のタプルを返します。