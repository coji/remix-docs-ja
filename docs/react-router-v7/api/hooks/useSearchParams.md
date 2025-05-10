---
title: useSearchParams
---

# useSearchParams

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useSearchParams.html)

現在のURLのURLSearchParamsと、それらを更新する関数のタプルを返します。検索パラメータを設定すると、ナビゲーションが発生します。

```tsx
import { useSearchParams } from "react-router";

export function SomeComponent() {
  const [searchParams, setSearchParams] = useSearchParams();
  // ...
}
```

## シグネチャ

```tsx
useSearchParams(defaultInit): undefined
```

## パラメータ

### defaultInit

[modes: framework, data, declarative]

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

## SetSearchParams 関数

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

`setState`のように関数コールバックもサポートしています:

```tsx
setSearchParams((searchParams) => {
  searchParams.set("tab", "2");
  return searchParams;
});
```

## 注意事項

`searchParams`は安定した参照であるため、`useEffect`フックの依存関係として確実に使用できることに注意してください。

```tsx
useEffect(() => {
  console.log(searchParams.get("tab"));
}, [searchParams]);
```

ただし、これはミュータブルであることも意味します。`setSearchParams`を呼び出さずにオブジェクトを変更すると、他の状態によってコンポーネントが再レンダリングされた場合にレンダリング間で値が変更され、URLはその値を反映しません。