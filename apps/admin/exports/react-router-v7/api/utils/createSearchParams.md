---
title: createSearchParams
---

# createSearchParams

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.createSearchParams.html)

与えられたイニシャライザを使用して URLSearchParams オブジェクトを作成します。

これは `new URLSearchParams(init)` と同じですが、イニシャライザのオブジェクト形式で、文字列だけでなく配列も値としてサポートします。 これは、特定のキーに複数の値が必要な場合に、配列イニシャライザを使用せずに済むため便利です。

たとえば、次の代わりに：

```tsx
let searchParams = new URLSearchParams([
  ["sort", "name"],
  ["sort", "price"],
]);
```

次のようにできます：

```
let searchParams = createSearchParams({
  sort: ['name', 'price']
});
```

## シグネチャ

```tsx
createSearchParams(init): URLSearchParams
```

## パラメータ

### init

[modes: framework, data, declarative]

_ドキュメントはありません_

