---
title: Remix からのアップグレード
new: true
---

# Remix からのアップグレード

React Router v7 は Remix "v3" です。そのため、Remix v2 のすべての将来のフラグが最新の状態になっている場合は、インポートの変更を除いて、v7 へのアップグレードは破壊的ではありません。

## 将来のフラグ

まず、Remix v2 の最新マイナーバージョンに更新し、その後、コンソールは有効にしていないフラグについて警告します。

```tsx
export interface FutureConfig {
  // TODO: 将来のフラグを文書化する
}
```

## React Router v7 をインストールする

### コードモッド

次のコマンドを使用すると、自動的に次のことができます。

- Remix の依存関係を対応する React Router v7 の依存関係に更新します。
- アプリ内のそれらのパッケージのすべてのインポートを新しいパッケージを使用するように更新します。

プロジェクトのルートから次のコマンドを実行します。

```shellscript nonumber
npx upgrade-remix v7
```

### 手動

手動で行う方が良い場合は、同等のパッケージを以下に示します。

| Remix v2 パッケージ         |     | React Router v7 パッケージ    |
| ------------------------ | --- | -------------------------- |
| `@remix-run/react`       | ➡️  | `react-router-dom`         |
| `@remix-run/dev`         | ➡️  | `@react-router/dev`        |
| `@remix-run/node`        | ➡️  | `@react-router/node`       |
| `@remix-run/cloudflare`  | ➡️  | `@react-router/cloudflare` |
| TODO: リスト全体を取得 |

また、アプリに必要なほとんどのモジュールは、`@remix-run/node` および `@remix-run/cloudflare` ではなく `react-router-dom` から取得できるため、最初にそこからインポートしてみてください。

```diff
-import { redirect } from "@react-router/node";
+import { redirect } from "react-router";
```



