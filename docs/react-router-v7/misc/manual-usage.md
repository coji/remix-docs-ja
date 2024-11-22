---
title: 手動使用
---

# 手動使用

React Routerは、フル機能セットへのより簡単なアクセスを可能にするViteプラグインを備えていますが、"ライブラリ"としても使用できます。

React Router上に独自のフレームワークを構築している場合は、[API ドキュメント](https://api.reactrouter.com)を参照して、API全体のドキュメントを確認してください。

## セットアップ

ViteからReactテンプレートを開始し、「React」を選択できます。

```shellscript nonumber
npx create-vite@latest
```

次に、React Routerをインストールします。

```shellscript nonumber
npm i react-router
```

## ルーターコンポーネント

`<BrowserRouter>`をレンダリングすると、ルーターコンテキストが作成され、URLの変更を購読します。次に、URLを要素にマッチングさせるために、その下にどこかに`<Routes>`をレンダリングします。

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./home";
import Dashboard from "./dashboard";
import RecentActivity from "./recent-activity";
import Project from "./project";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="dashboard" element={<Dashboard />}>
        <Route index element={<RecentActivity />} />
        <Route path="project/:id" element={<Project />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
```

## データルーター

データルーターは、データの読み込みとアクションをルーターに追加します。ローダーはコンポーネントがレンダリングされる前に呼び出され、データはアクションが呼び出された後にローダーから再検証されます。これは、React Router ViteプラグインがReact Routerにフレームワーク機能を追加する方法です。

`createDataRouter`関数を使用して、独自のものと`<RouterProvider />`を作成できます。

```tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

import Root, { rootLoader } from "./routes/root";
import Team, { teamLoader } from "./routes/team";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: "team",
        element: <Team />,
        loader: teamLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
```



