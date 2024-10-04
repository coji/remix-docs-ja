---
title: Remix からのアップグレード
hidden: true
---

# Remix からのアップグレード

<docs-warning>このガイドはまだ開発中です</docs-warning>

React Router v7 の最終リリース後、変更された API に将来のフラグを追加するために Remix に戻ります。

今すぐ不安定な移行を試す場合は、次の表が役に立ちます。

| Remix v2 パッケージ        |     | React Router v7 パッケージ    |
| ----------------------- | --- | -------------------------- |
| `@remix-run/react`      | ➡️  | `react-router`             |
| `@remix-run/dev`        | ➡️  | `@react-router/dev`        |
| `@remix-run/node`       | ➡️  | `@react-router/node`       |
| `@remix-run/cloudflare` | ➡️  | `@react-router/cloudflare` |

また、アプリに必要なほとんどのモジュールは、`@remix-run/node` や `@remix-run/cloudflare` ではなく、`react-router` から取得されるようになったため、まずはそこからインポートしてみてください。

```diff
-import { redirect } from "@react-router/node";
+import { redirect } from "react-router";
```

