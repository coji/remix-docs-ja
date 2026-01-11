---
title: RouterContextProvider
---

# RouterContextProvider

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/router/utils.ts
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/classes/react_router.RouterContextProvider.html)

アプリケーションコンテキスト内の値を型安全な方法で書き込み/読み込みするためのメソッドを提供します。主に [middleware](../../how-to/middleware) で使用されます。

```tsx
import {
  createContext,
  RouterContextProvider
} from "react-router";

const userContext = createContext<User | null>(null);
const contextProvider = new RouterContextProvider();
contextProvider.set(userContext, getUser());
//                               ^ Type-safe
const user = contextProvider.get(userContext);
//    ^ User
```