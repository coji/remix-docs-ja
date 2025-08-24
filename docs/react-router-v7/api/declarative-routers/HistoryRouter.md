---
title: HistoryRouter
unstable: true
---

# unstable_HistoryRouter

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx
-->

[MODES: declarative]

<br />
<br />

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が発生する可能性があります。ご使用の際は注意し、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

[Reference Documentation ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_HistoryRouter.html)

事前にインスタンス化された `history` オブジェクトを受け入れる宣言的な [`<Router>`](../declarative-routers/Router) です。
独自の `history` オブジェクトを使用することは強く推奨されません。React Routerが内部で使用している `history` ライブラリと同じバージョンを使用しない限り、バンドルに `history` ライブラリの2つのバージョンが追加される可能性があります。

## シグネチャ

```tsx
function HistoryRouter({ basename, children, history }: HistoryRouterProps)
```

## Props

### basename

アプリケーションのベースネーム

### children

ルート設定を記述する ```<Route>``` コンポーネント

### history

ルーターが使用する `History` の実装