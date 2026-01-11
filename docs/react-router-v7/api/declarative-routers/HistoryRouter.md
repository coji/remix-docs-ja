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

<docs-warning>このAPIは実験的であり、マイナー/パッチリリースで破壊的変更が加えられる可能性があります。ご利用には注意を払い、関連する変更についてはリリースノートに**細心の**注意を払ってください。</docs-warning>

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.unstable_HistoryRouter.html)

事前にインスタンス化された `history` オブジェクトを受け入れる宣言的な [`<Router>`](../declarative-routers/Router) です。
独自の `history` オブジェクトを使用することは強く推奨されず、React Router が内部で使用している `history` ライブラリと同じバージョンを使用しない限り、バンドルに `history` ライブラリの2つのバージョンが追加される可能性があることに注意することが重要です。

## シグネチャ

```tsx
function HistoryRouter({
  basename,
  children,
  history,
  unstable_useTransitions,
}: HistoryRouterProps)
```

## Props

### basename

アプリケーションの basename

### children

ルート設定を記述する ``<Route>`` コンポーネント

### history

router で使用するための `History` 実装

### unstable_useTransitions

router の state 更新が内部的に [`React.startTransition`](https://react.dev/reference/react/startTransition) でラップされるかどうかを制御します。

- `undefined` の場合、すべての router state 更新は `React.startTransition` でラップされます。
- `true` に設定されている場合、[`Link`](../components/Link) および [`Form`](../components/Form) によるナビゲーションは `React.startTransition` でラップされ、すべての router state 更新は `React.startTransition` でラップされます。
- `false` に設定されている場合、router はナビゲーションや state の変更で `React.startTransition` を利用しません。

詳細については、[ドキュメント](https://reactrouter.com/explanation/react-transitions)を参照してください。