---
title: インストール
order: 1
---

# インストール

[MODES: data]

## バンドラーテンプレートによるブートストラップ

Vite の React テンプレートから始めて「React」を選択するか、お好みの方法（Parcel、Webpack など）でアプリケーションをブートストラップできます。

```shellscript nonumber
npx create-vite@latest
```

## React Router のインストール

次に、npm から React Router をインストールします:

```shellscript nonumber
npm i react-router
```

## ルーターの作成とレンダリング

ルーターを作成し、`RouterProvider` に渡します:

```tsx lines=[3-4,6-11,16]
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <RouterProvider router={router} />,
);
```

---

次へ: [ルーティング](./routing)