---
title: useNavigationType
---

# useNavigationType

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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useNavigationType.html)

現在の [`Navigation`](https://api.reactrouter.com/v7/types/react_router.Navigation.html) アクションを返します。これは、ルーターが現在の [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) にどのように到達したかを記述するもので、[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタック上での pop、push、または replace のいずれかによってです。

## シグネチャ

```tsx
function useNavigationType(): NavigationType
```

## 戻り値

現在の [`NavigationType`](https://api.reactrouter.com/v7/enums/react_router.NavigationType.html) (`"POP"`, `"PUSH"`, または `"REPLACE"`)