---
title: useMatches
---

# useMatches

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useMatches.html)

アクティブなルートマッチを返します。親/子ルートの `loaderData` やルートの [`handle`](../../start/framework/route-module#handle) プロパティにアクセスするのに役立ちます。

## シグネチャ

```tsx
function useMatches(): UIMatch[]
```

## 戻り値

現在のルート階層に対する [UI マッチ](https://api.reactrouter.com/v7/interfaces/react_router.UIMatch.html) の配列。