---
title: useOutlet
---

# useOutlet

<!--
⚠️ ⚠️ 重要 ⚠️ ⚠️

ドキュメントの改善にご協力いただきありがとうございます！

このファイルはソースコード内のJSDocコメントから自動生成されています。
そのため、以下のファイルのJSDocコメントを編集してください。
変更がマージされると、このファイルは再生成されます。

https://github.com/remix-run/react-router/blob/main/packages/react-router/lib/hooks.tsx
-->

[MODES: framework, data, declarative]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.useOutlet.html)

ルート階層のこのレベルの子ルートの要素を返します。子ルートをレンダリングするために、内部的に [`<Outlet>`](../components/Outlet) によって使用されます。

## シグネチャ

```tsx
function useOutlet(context?: unknown): React.ReactElement | null
```

## パラメータ

### context

アウトレットに渡すコンテキスト。

## 戻り値

子ルートの要素、または一致する子ルートがない場合は `null`。