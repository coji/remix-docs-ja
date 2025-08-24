---
title: entry.client
toc: false
---

# entry.client

デフォルトでは、Remix はクライアントでのアプリのハイドレーションを自動的に処理します。この動作をカスタマイズしたい場合は、`npx remix reveal` を実行して、優先される `app/entry.client.tsx` (または `.jsx`) を生成できます。このファイルはブラウザのエントリーポイントであり、[サーバーエントリーモジュール][server_entry_module]でサーバーによって生成されたマークアップをハイドレートする役割を担いますが、他のクライアントサイドのコードをここで初期化することもできます。

通常、このモジュールは `ReactDOM.hydrateRoot` を使用して、[サーバーエントリーモジュール][server_entry_module]でサーバー上で既に生成されたマークアップをハイドレートします。

基本的な例を以下に示します。

```tsx filename=app/entry.client.tsx
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
```

これはブラウザで最初に実行されるコードです。クライアントサイドのライブラリを初期化したり、クライアント専用のプロバイダーを追加したりできます。

[server_entry_module]: ./entry.server
