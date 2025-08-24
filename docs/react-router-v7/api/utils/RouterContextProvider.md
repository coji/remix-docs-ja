---
title: RouterContextProvider
unstable: true
---

# unstable_RouterContextProvider

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が行われる可能性があります。ご使用の際はご注意いただき、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/classes/react_router.unstable_RouterContextProvider.html)

アプリケーションコンテキスト内の値を型安全な方法で書き込み/読み取りするためのメソッドを提供します。主に[ミドルウェア](../../how-to/middleware)での使用を想定しています。

```tsx
import {
  unstable_createContext,
  unstable_RouterContextProvider
} from "react-router";

const userContext = unstable_createContext<User | null>(null);
const contextProvider = new unstable_RouterContextProvider();
contextProvider.set(userContext, getUser());
//                               ^ Type-safe
const user = contextProvider.get(userContext);
//    ^ User
```