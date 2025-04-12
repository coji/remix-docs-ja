---
title: インストール
order: 1
---

# インストール

[MODES: declarative]

## はじめに

Vite の React テンプレートから始めて「React」を選択するか、お好みの方法でアプリケーションをブートストラップできます。

```shellscript nonumber
npx create-vite@latest
```

次に、npm から React Router をインストールします。

```shellscript nonumber
npm i react-router
```

最後に、アプリケーションを `<BrowserRouter>` で囲んでレンダリングします。

```tsx lines=[3,9-11]
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

---

次: [ルーティング](./routing)
