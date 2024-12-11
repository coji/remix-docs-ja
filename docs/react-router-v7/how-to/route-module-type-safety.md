---
title: ルートモジュールの型安全
---

# ルートモジュールの型安全

React Routerは、URLパラメータ、ローダーデータなどを型推論するために、ルート固有の型を生成します。
このガイドは、テンプレートから開始しなかった場合の設定方法を説明します。

React Routerでの型安全の仕組みの詳細については、[型安全の説明](../explanation/type-safety)を参照してください。

## 1. `.gitignore`に`.react-router/`を追加する

React Routerは、アプリのルートに`.react-router/`ディレクトリに型を生成します。このディレクトリはReact Routerによって完全に管理されており、`.gitignore`に追加する必要があります。

```txt
.react-router/
```

## 2. `tsconfig`に生成された型を含める

TypeScriptが生成された型を使用するように`tsconfig`を編集します。さらに、ルートモジュールを相対的な兄弟としてインポートできるように、`rootDirs`を設定する必要があります。

```json filename=tsconfig.json
{
  "include": [".react-router/types/**/*"],
  "compilerOptions": {
    "rootDirs": [".", "./.react-router/types"]
  }
}
```

アプリに複数の`tsconfig`ファイルを使用している場合、アプリディレクトリを`include`するファイルでこれらの変更を行う必要があります。
たとえば、[`node-custom-server`テンプレート](https://github.com/remix-run/react-router-templates/tree/390fcec476dd336c810280479688fe893da38713/node-custom-server)には、`tsconfig.json`、`tsconfig.node.json`、`tsconfig.vite.json`が含まれています。`tsconfig.vite.json`は[アプリディレクトリを含んでいる](https://github.com/remix-run/react-router-templates/blob/390fcec476dd336c810280479688fe893da38713/node-custom-server/tsconfig.vite.json#L4-L6)ため、ルートモジュールの型安全のために`.react-router/types`を設定するのはこのファイルです。


## 3. 型チェックの前に型を生成する

型チェックを独自のcommandとして実行する場合（例：CIパイプラインの一部として）、型チェックを実行する_前に_型を生成する必要があります。

```json
{
  "scripts": {
    "typecheck": "react-router typegen && tsc"
  }
}
```

## 4. 型専用の自動インポート（オプション）

`Route`型ヘルパーを自動インポートすると、TypeScriptは次のように生成します。

```ts filename=app/routes/my-route.tsx
import { Route } from "./+types/my-route";
```

しかし、[verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)を有効にすると：

```json filename=tsconfig.json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

`type`修飾子がインポートにも自動的に追加されます。

```ts filename=app/routes/my-route.tsx
import type { Route } from "./+types/my-route";
//     ^^^^
```

これは、バンドラーなどのツールが、バンドルから安全に除外できる型専用のモジュールを検出するのに役立ちます。

## まとめ

React RouterのViteプラグインは、ルート設定（`routes.ts`）を編集するたびに、`.react-router/types/`に型を自動的に生成する必要があります。
つまり、最新の状態のルートの型を取得するには、`react-router dev`（またはカスタム開発サーバー）を実行するだけです。

ルートにこれらの型を取り込む方法の例については、[型安全の説明](../explanation/type-safety)を参照してください。

