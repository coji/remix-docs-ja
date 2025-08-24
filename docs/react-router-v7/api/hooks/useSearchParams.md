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

タプルの2番目の要素は、検索パラメータを更新するために使用できる関数です。これは`defaultInit`と同じ型を受け入れ、新しいURLへのナビゲーションを引き起こします。

```tsx
let [searchParams, setSearchParams] = useSearchParams();

// 検索パラメータ文字列
setSearchParams("?tab=1");

// 短縮オブジェクト
setSearchParams({ tab: "1" });

// オブジェクトキーは、キーに対して複数の値を持つ配列にできます
setSearchParams({ brand: ["nike", "reebok"] });

// タプルの配列
setSearchParams([["tab", "1"]]);

// URLSearchParams オブジェクト
setSearchParams(new URLSearchParams("?tab=1"));
```

Reactの[`setState`](https://react.dev/reference/react/useState#setstate)のように関数コールバックもサポートしています:

```tsx
setSearchParams((searchParams) => {
  searchParams.set("tab", "2");
  return searchParams;
});
```

<docs-warning>`setSearchParams`の関数コールバックバージョンは、Reactの`setState`が実装している[キューイング](https://react.dev/reference/react/useState#setstate-parameters)ロジックをサポートしていません。同じティック内で`setSearchParams`を複数回呼び出しても、以前の値に基づいて構築されることはありません。この動作が必要な場合は、`setState`を手動で使用できます。</docs-warning>

### 注意事項

`searchParams`は安定した参照であるため、Reactの[`useEffect`](https://react.dev/reference/react/useEffect)フックの依存関係として確実に使用できることに注意してください。

```tsx
useEffect(() => {
  console.log(searchParams.get("tab"));
}, [searchParams]);
```

ただし、これはミュータブルであることも意味します。`setSearchParams`を呼び出さずにオブジェクトを変更すると、他の状態によってコンポーネントが再レンダリングされた場合にレンダリング間で値が変更され、URLはその値を反映しません。

## Signature

```tsx
function useSearchParams(
  defaultInit?: URLSearchParamsInit,
): [URLSearchParams, SetURLSearchParams]
```

## Params

### defaultInit

検索パラメータをデフォルト値で初期化できますが、最初のレンダリングではURLは変更**されません**。

```tsx
// 検索パラメータ文字列
useSearchParams("?tab=1");

// 短縮オブジェクト
useSearchParams({ tab: "1" });

// オブジェクトキーは、キーに対して複数の値を持つ配列にできます
useSearchParams({ brand: ["nike", "reebok"] });

// タプルの配列
useSearchParams([["tab", "1"]]);

// URLSearchParams オブジェクト
useSearchParams(new URLSearchParams("?tab=1"));
```

## 戻り値

現在の[`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)と、それらを更新する関数のタプルを返します。