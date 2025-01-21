---
title: ルートモジュールの型安全性
---

# ルートモジュールの型安全性

React Router は、URL パラメータ、ローダーデータなどの型推論を強化するために、ルート固有の型を生成します。
このガイドは、テンプレートから開始しなかった場合に、それを設定するのに役立ちます。

React Router での型安全性の仕組みについて詳しくは、[型安全性の説明](../explanation/type-safety)をご覧ください。

## 1. `.react-router/` を `.gitignore` に追加する

React Router は、アプリのルートに `.react-router/` ディレクトリに型を生成します。このディレクトリは React Router によって完全に管理されており、gitignore に含める必要があります。

```txt
.react-router/
```

## 2. 生成された型を tsconfig に含める

生成された型を TypeScript で使用するように、tsconfig を編集します。さらに、型をルートモジュールへの相対的な兄弟としてインポートできるように、`rootDirs` を構成する必要があります。

```json filename=tsconfig.json
{
  "include": [".react-router/types/**/*"],
  "compilerOptions": {
    "rootDirs": [".", "./.react-router/types"]
  }
}
```

アプリに複数の `tsconfig` ファイルを使用している場合は、アプリディレクトリを `include` するファイルでこれらの変更を行う必要があります。
たとえば、[`node-custom-server` テンプレート](https://github.com/remix-run/react-router-templates/tree/390fcec476dd336c810280479688fe893da38713/node-custom-server) には、`tsconfig.json`、`tsconfig.node.json`、および `tsconfig.vite.json` が含まれています。`tsconfig.vite.json` が [アプリディレクトリを include](https://github.com/remix-run/react-router-templates/blob/390fcec476dd336c810280479688fe893da38713/node-custom-server/tsconfig.vite.json#L4-L6) するものであるため、ルートモジュールの型安全性のために `.react-router/types` を設定するのはこのファイルです。

## 3. 型チェックの前に型を生成する

型チェックを独自のコマンドとして実行する場合（たとえば、継続的インテグレーションパイプラインの一部として）、型チェックを実行する _前に_ 型を生成する必要があります。

```json
{
  "scripts": {
    "typecheck": "react-router typegen && tsc"
  }
}
```

## 4. 型のみの自動インポート（オプション）

`Route` 型ヘルパーを自動インポートすると、TypeScript は次のように生成します。

```ts filename=app/routes/my-route.tsx
import { Route } from "./+types/my-route";
```

ただし、[verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax) を有効にすると、次のようになります。

```json filename=tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

すると、インポートに `type` 修飾子も自動的に追加されます。

```ts filename=app/routes/my-route.tsx
import type { Route } from "./+types/my-route";
//     ^^^^
```

これにより、バンドラーなどのツールが、バンドルから安全に除外できる型のみのモジュールを検出するのに役立ちます。

## 結論

React Router の Vite プラグインは、ルート構成 (`routes.ts`) を編集するたびに、`.react-router/types/` に型を自動的に生成する必要があります。
つまり、ルートで最新の型を取得するために必要なのは、`react-router dev`（またはカスタム開発サーバー）を実行することだけです。

ルートにこれらの型を取り込む方法の例については、[型安全性の説明](../explanation/type-safety)をご覧ください。

