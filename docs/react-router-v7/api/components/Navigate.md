---
title: Navigate
---

# Navigate

<!--
⚠️ ⚠️ IMPORTANT ⚠️ ⚠️ 

Thank you for helping improve our documentation!

This file is auto-generated from the JSDoc comments in the source
code, so please edit the JSDoc comments in the file below and this
file will be re-generated once those changes are merged.

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/components.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Navigate.html)

[`React.Component` クラス](https://react.dev/reference/react/Component) でフックが使用できない場合に使用する、[useNavigate](../hooks/useNavigate) のコンポーネントベースのバージョンです。

[useNavigate](../hooks/useNavigate) の代わりにこのコンポーネントを使用することは推奨されません。

```tsx
<Navigate to="/tasks" />
```

## シグネチャ

```tsx
function Navigate({ to, replace, state, relative }: NavigateProps): null
```

## Props

### relative

[modes: framework, data, declarative]

`to` prop における相対ルーティングをどのように解釈するか。[`RelativeRoutingType`](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html) を参照してください。

### replace

[modes: framework, data, declarative]

[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタック内の現在のエントリを置き換えるかどうか。

### state

[modes: framework, data, declarative]

新しい [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) に渡す state で、[`history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state) に格納されます。

### to

[modes: framework, data, declarative]

ナビゲート先のパス。これは文字列または [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクトのいずれかです。