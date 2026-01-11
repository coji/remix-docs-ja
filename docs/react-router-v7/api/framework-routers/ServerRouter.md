---
title: ServerRouter
---

# ServerRouter

<!--
⚠️ ⚠️ 重要 ⚠️ ⚠️ 

ドキュメントの改善にご協力いただきありがとうございます！

このファイルはソースコード内の JSDoc コメントから自動生成されます。
そのため、以下のファイルの JSDoc コメントを編集してください。
変更がマージされると、このファイルは再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/ssr/server.tsx
-->

[MODES: framework]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.ServerRouter.html)

Framework Mode の React Router アプリケーションにおけるサーバーのエントリーポイントです。このコンポーネントは、サーバーからのレスポンスで HTML を生成するために使用されます。[`entry.server.tsx`](../framework-conventions/entry.server.tsx) を参照してください。

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

マニフェスト、route module、およびレンダリングに必要なその他のデータを含むエントリーコンテキスト。

### nonce

[Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) に準拠するためのオプションの `nonce` で、インラインスクリプトを安全に実行できるようにするために使用されます。

### url

処理されているリクエストの URL。