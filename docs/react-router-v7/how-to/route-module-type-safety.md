---
title: ルートモジュールの型安全性
---

# ルートモジュールの型安全性

React Router は、URL パラメータ、ローダーデータなどの型推論を強化するために、ルート固有の型を生成します。
このガイドは、テンプレートから開始しなかった場合に、その設定方法を説明します。

React Router での型安全性の仕組みについて詳しくは、[型安全性の説明](../explanation/type-safety)をご覧ください。

## 1. `.react-router/` を `.gitignore` に追加する

React Router は、アプリのルートに `.react-router/` ディレクトリに型を生成します。このディレクトリは React Router によって完全に管理され、gitignore に追加する必要があります。

```txt
.react-router/
```

## 2. 生成された型を tsconfig に含める

tsconfig を編集して、TypeScript が生成された型を使用するようにします。さらに、型をルートモジュールの相対的な兄弟としてインポートできるように、`rootDirs` を構成する必要があります。

```json filename=tsconfig.json
{
  "include": [".react-router/types/**/*"],
  "compilerOptions": {
    "rootDirs": [".", "./.react-router/types"]
  }
}
```

アプリに複数の `tsconfig` ファイルを使用している場合は、アプリディレクトリを `include` しているファイルでこれらの変更を行う必要があります。
たとえば、[`node-custom-server` テンプレート](https://github.com/remix-run/react-router-templates/tree/390fcec476dd336c810280479688fe893da38713/node-custom-server) には、`tsconfig.json`、`tsconfig.node.json`、`tsconfig.vite.json` が含まれています。`tsconfig.vite.json` が [アプリディレクトリを include している](https://github.com/remix-run/react-router-templates/blob/390fcec476dd336c810280479688fe893da38713/node-custom-server/tsconfig.vite.json#L4-L6) ため、それがルートモジュールの型安全のために `.react-router/types` を設定するファイルです。

## 3. 型チェックの前に型を生成する

型チェックを独自のコマンドとして実行する場合（たとえば、継続的インテグレーションパイプラインの一部として）、型チェックを実行する_前に_型を生成する必要があります。

```json
{
  "scripts": {
    "typecheck": "react-router typegen && tsc"
  }
}
```

## 4. `AppLoadContext` の型付け

## アプリの `Context` 型の拡張

アプリの `context` 型を定義するには、プロジェクト内の `.ts` または `.d.ts` ファイルに以下を追加します。

```typescript
import "react-router";
declare module "react-router" {
  interface AppLoadContext {
    // ここにコンテキストプロパティを追加します
  }
}
```

## 5. 型のみの自動インポート（オプション）

`Route` 型ヘルパーを自動インポートすると、TypeScript は以下を生成します。

```ts filename=app/routes/my-route.tsx
import { Route } from "./+types/my-route";
```

ただし、[verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax) を有効にすると：

```json filename=tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

次に、インポートに `type` 修飾子も自動的に追加されます。

```ts filename=app/routes/my-route.tsx
import type { Route } from "./+types/my-route";
//     ^^^^
```

これにより、バンドラーなどのツールが、バンドルから安全に除外できる型のみのモジュールを検出するのに役立ちます。

## 結論

React Router の Vite プラグインは、ルート構成 (`routes.ts`) を編集するたびに、自動的に `.react-router/types/` に型を生成します。
つまり、`react-router dev`（またはカスタム開発サーバー）を実行するだけで、ルートで最新の型を取得できます。

ルートにこれらの型を取り込む方法の例については、[型安全性の説明](../explanation/type-safety)をご覧ください。

