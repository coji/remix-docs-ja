---
title: レンダリング戦略
order: 4
---

# レンダリング戦略

[MODES: framework]

## イントロダクション

React Routerには3つのレンダリング戦略があります。

- クライアントサイドレンダリング
- サーバーサイドレンダリング
- 静的プリレンダリング

## クライアントサイドレンダリング

ルートは、ユーザーがアプリ内を移動する際に常にクライアントサイドでレンダリングされます。シングルページアプリを構築する場合は、サーバーレンダリングを無効にしてください。

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

サーバーサイドレンダリングには、それをサポートするデプロイが必要です。グローバルな設定ですが、個々のルートは静的にプリレンダリングすることもできます。ルートは、UIのその部分のサーバーレンダリング/フェッチを回避するために、`clientLoader`を使用してクライアントデータローディングを使用することもできます。

## 静的プリレンダリング

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  // ビルド時にプリレンダリングするURLのリストを返す
  async prerender() {
    return ["/", "/about", "/contact"];
  },
} satisfies Config;
```

プリレンダリングは、URLのリストに対して静的なHTMLとクライアントナビゲーションデータペイロードを生成するビルド時の操作です。これは、特にサーバーレンダリングのないデプロイメントにおいて、SEOとパフォーマンスに役立ちます。プリレンダリング時、ルートモジュールローダーはビルド時にデータをフェッチするために使用されます。

---

次へ: [データローディング](./data-loading)
