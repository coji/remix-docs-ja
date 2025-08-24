---
title: ServerRouter
---

# ServerRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/ssr/server.tsx
-->

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.ServerRouter.html)

Framework ModeにおけるReact Routerアプリのサーバーエントリーポイントです。このコンポーネントは、サーバーからのレスポンスでHTMLを生成するために使用されます。[`entry.server.tsx`](../framework-conventions/entry.server.tsx)を参照してください。

## シグネチャ

```tsx
function ServerRouter({
  context,
  url,
  nonce,
}: ServerRouterProps): ReactElement
```

## Props

### context

レンダリングに必要なmanifest、route modules、その他のデータを含むエントリーコンテキストです。

### nonce

[Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)に準拠するためのオプションの`nonce`です。インラインスクリプトを安全に実行できるようにするために使用されます。

### url

処理されているリクエストのURLです。