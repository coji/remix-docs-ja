---
title: RouterProvider
---

# RouterProvider

[MODES: data]

## 概要

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/functions/react_router.RouterProvider.html)

データルーターを受け入れ、その変更をサブスクライブし、一致するコンポーネントをレンダリングします。通常、アプリの要素ツリーの最上位に配置する必要があります。

```tsx
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

let router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
```

## Props

### flushSync

[modes: data]

<docs-warning>これは実装の詳細であり、アプリケーションで使用する必要はありません。</docs-warning>

このプロパティは、DOM環境で`RouterProvider`を実行する際に、`flushSync`が有効なルーティング操作（例：[useNavigate](../hooks/useNavigate#signature)）で使用するために、`react-dom`の`flushSync`実装を注入する方法を提供します。

- メモリ環境（ユニットテストなど）で`RouterProvider`を実行している場合、`react-router`からインポートし、このプロパティを省略できます。
- DOM環境で`RouterProvider`を実行している場合、`react-router/dom`からインポートする必要があります。これにより、`react-dom`の`flushSync`実装が自動的に渡されます。

### router

[modes: data]

アプリケーション用に初期化されたデータルーターです。
