---
title: レンダリング戦略
order: 4
---

# レンダリング戦略

React Routerには3つのレンダリング戦略があります。

- クライアントサイドレンダリング
- サーバーサイドレンダリング
- 静的プリレンダリング

## クライアントサイドレンダリング

ユーザーがアプリ内を移動する際に、ルートは常にクライアントサイドでレンダリングされます。シングルページアプリを構築する場合は、サーバーサイドレンダリングを無効にします。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

## サーバーサイドレンダリング

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
} satisfies Config;
```

サーバーサイドレンダリングには、それをサポートするデプロイメントが必要です。グローバル設定ですが、個々のルートは静的にプリレンダリングすることもできます。ルートは`clientLoader`を使用してクライアントデータの読み込みを行うことで、UIの一部に対するサーバーサイドレンダリング/フェッチを回避することもできます。


## 静的プリレンダリング

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // ビルド時にプリレンダリングするURLのリストを返します
  async prerender() {
    return ["/", "/about", "/contact"];
  },
} satisfies Config;
```

プリレンダリングは、ビルド時の操作で、静的なHTMLとクライアントナビゲーションデータのペイロードをURLのリストに対して生成します。これは、特にサーバーサイドレンダリングがないデプロイメントにおいて、SEOとパフォーマンスに役立ちます。プリレンダリング時、ルートモジュールローダーを使用して、ビルド時にデータを取得します。

---

次へ: [データの読み込み](./data-loading)

