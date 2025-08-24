---
title: Navigate
---

# Navigate

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.Navigate.html)

フックが使用できない [`React.Component` class](https://react.dev/reference/react/Component) で使用する、[`useNavigate`](../hooks/useNavigate) のコンポーネントベースのバージョンです。

[`useNavigate`](../hooks/useNavigate) の代わりにこのコンポーネントを使用することは推奨されません。

```tsx
<Navigate to="/tasks" />
```

## シグネチャ

```tsx
function Navigate({ to, replace, state, relative }: NavigateProps): null
```

## Props

### relative

`to` propにおける相対ルーティングの解釈方法。
[`RelativeRoutingType`](https://api.reactrouter.com/v7/types/react_router.RelativeRoutingType.html) を参照してください。

### replace

[`History`](https://developer.mozilla.org/en-US/docs/Web/API/History) スタック内の現在のエントリを置き換えるかどうか。

### state

新しい [`Location`](https://api.reactrouter.com/v7/interfaces/react_router.Location.html) に渡して [`history.state`](https://developer.mozilla.org/en-US/docs/Web/API/History/state) に保存する state。

### to

ナビゲート先のパス。これは文字列または [`Path`](https://api.reactrouter.com/v7/interfaces/react_router.Path.html) オブジェクトです。