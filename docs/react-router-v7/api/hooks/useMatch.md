---
title: useMatch
---

# useMatch

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useMatch.html)

指定されたパターンが現在のURLと一致する場合、[`PathMatch`](https://api.reactrouter.com/v7/interfaces/react_router.PathMatch.html)オブジェクトを返します。
これは、コンポーネントが「アクティブ」状態を知る必要がある場合に便利です。例えば、[`<NavLink>`](../components/NavLink)などです。

## シグネチャ

```tsx
function useMatch<ParamKey extends ParamParseKey<Path>, Path extends string>(
  pattern: PathPattern<Path> | Path,
): PathMatch<ParamKey> | null
```

## パラメータ

### pattern

現在の[`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html)と照合するパターン。

## 戻り値

パターンが一致した場合のパス一致オブジェクト。それ以外の場合は`null`。