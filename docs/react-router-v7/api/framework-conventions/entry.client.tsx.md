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

このファイルはブラウザのエントリーポイントであり、あなたの[サーバーエントリーモジュール][server-entry]において、サーバーによって生成されたマークアップをハイドレーションする役割を担います。

これはブラウザで実行される最初のコードです。ここで、クライアントサイドのライブラリの初期化、クライアント専用の provider の追加など、その他のクライアントサイドコードを初期化できます。

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

## `entry.client.tsx` の生成

デフォルトでは、React Router はクライアント上であなたのアプリをハイドレーションする処理を自動で行います。以下のコマンドで、デフォルトのエントリークライアントファイルを明らかにすることができます。

```shellscript nonumber
npx react-router reveal
```

[server-entry]: ./entry.server.tsx