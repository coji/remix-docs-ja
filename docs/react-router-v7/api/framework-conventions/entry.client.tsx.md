---
title: entry.client.tsx
order: 4
---

# entry.client.tsx

[MODES: framework]

## 概要

<docs-info>
このファイルはオプションです
</docs-info>

このファイルはブラウザのエントリポイントであり、[サーバーエントリモジュール][server-entry]でサーバーによって生成されたマークアップをハイドレートする役割を担います。

これはブラウザで実行される最初のコードです。クライアントサイドライブラリの初期化、クライアント専用プロバイダの追加など、他のクライアントサイドコードをここで初期化できます。

```tsx filename=app/entry.client.tsx
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
```

## `entry.client.tsx`の生成

デフォルトでは、React Routerがクライアント側でアプリのハイドレーションを処理します。以下のコマンドでデフォルトのエントリクライアントファイルを表示できます。

```shellscript nonumber
npx react-router reveal
```

[server-entry]: ./entry.server.tsx
