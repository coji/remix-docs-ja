---
title: インストール
order: 1
---

# インストール

ViteのReactテンプレートから始めることができ、「React」を選択するか、または好きな方法でアプリケーションをブートストラップしてください。

```shellscript nonumber
npx create-vite@latest
```

次に、npmからReact Routerをインストールします。

```shellscript nonumber
npm i react-router
```

最後に、アプリケーションの周囲に`<BrowserRouter>`をレンダリングします。

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

次へ: [ルーティング](./routing)



