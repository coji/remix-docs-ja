---
title: ルートモジュールの型安全
---

# ルートモジュールの型安全

React Routerは、URLパラメータ、ローダーデータなどに対する型推論を強化するために、ルート固有の型を生成します。
このガイドは、テンプレートから開始しなかった場合に、設定方法を支援します。

React Routerでの型安全性の詳細については、[型安全性の説明](../explanation/type-safety)をご覧ください。

## 1. `.gitignore`に`.react-router/`を追加

React Routerは、アプリのルートに`.react-router/`ディレクトリに型を生成します。このディレクトリはReact Routerによって完全に管理されており、`.gitignore`に追加する必要があります。

```txt
.react-router/
```

## 2. `tsconfig`に生成された型を含める

TypeScriptが生成された型を使用するように`tsconfig`を編集します。さらに、ルートモジュールに対して相対的な兄弟として型をインポートできるように、`rootDirs`を設定する必要があります。

```json filename=tsconfig.json
{
  "include": [".react-router/types/**/*"],
  "compilerOptions": {
    "rootDirs": [".", "./.react-router/types"]
  }
}
```

## 3. 型チェックの前に型を生成

型チェックを独自の命令として実行する場合（たとえば、継続的インテグレーションパイプラインの一部として）、型チェックを実行する_前に_型を生成する必要があります。

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

これは機能しますが、`type`修飾子をインポートにも自動的に追加したい場合があります。

```ts filename=app/routes/my-route.tsx
import type { Route } from "./+types/my-route";
//     ^^^^
```

たとえば、これはバンドラーなどのツールが、バンドルから安全に除外できる型専用のモジュールを検出するのに役立ちます。

### VSCode

VSCodeでは、コマンドパレットから「TypeScript › 環境設定：型専用の自動インポートを優先」を選択するか、`preferTypeOnlyAutoImports`を手動で設定することで、この動作を自動的に取得できます。

```json filename=.vscode/settings.json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true
}
```

### eslint

eslintでは、`consistent-type-imports`ルールに対して`prefer: "type-imports"`を設定することで、この動作を取得できます。

```json
{
  "@typescript-eslint/consistent-type-imports": [
    "warn",
    { "prefer": "type-imports" }
  ]
}
```

## まとめ

React RouterのViteプラグインは、ルート設定（`routes.ts`）を編集するたびに、`.react-router/types/`に型を自動的に生成する必要があります。
つまり、最新の型をルートに取得するには、`react-router dev`（またはカスタム開発サーバー）を実行するだけで済みます。

ルートにこれらの型を取り込む方法の例については、[型安全性の説明](../explanation/type-safety)をご覧ください。

