---
title: 型安全
---

# 型安全

まだ行っていない場合は、新しいプロジェクトで[型安全を設定する方法][route-module-type-safety]に関するガイドをご覧ください。

React Routerは、アプリ内の各ルートの型を生成して、ルートモジュールエクスポートの型安全性を確保します。

たとえば、`products/:id`ルートが設定されているとします。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("products/:id", "./routes/product.tsx"),
] satisfies RouteConfig;
```

ルート固有の型は、次のようにインポートできます。

```tsx filename=app/routes/product.tsx
import type { Route } from "./+types/product";
// このルートのために生成された型👆

export function loader({ params }: Route.LoaderArgs) {
  //                      👆 { id: string }
  return { planet: `world #${params.id}` };
}

export default function Component({
  loaderData, // 👈 { planet: string }
}: Route.ComponentProps) {
  return <h1>Hello, {loaderData.planet}!</h1>;
}
```

## 動作方法

React Routerの型生成は、アプリのルートを決定するためにルート設定（デフォルトでは`app/routes.ts`）を実行します。
その後、特別な`.react-router/types/`ディレクトリ内に、各ルートの`+types/<route file>.d.ts`を生成します。
[`rootDirs` を設定する][route-module-type-safety]と、TypeScriptはこれらの生成されたファイルを、対応するルートモジュールに隣接しているかのようにインポートできます。

設計に関するいくつかの決定事項を詳しく知りたい場合は、[型推論に関する決定文書](https://github.com/remix-run/react-router/blob/dev/decisions/0012-type-inference.md)をご覧ください。

[route-module-type-safety]: ../how-to/route-module-type-safety

## `typegen`コマンド

`typegen`コマンドを使用して、型を手動で生成できます。

```sh
react-router typegen
```

各ルートに対して、次の型が生成されます。

- `LoaderArgs`
- `ClientLoaderArgs`
- `ActionArgs`
- `ClientActionArgs`
- `HydrateFallbackProps`
- `ComponentProps`（`default`エクスポート用）
- `ErrorBoundaryProps`

### --watch

`react-router dev`を実行する場合、またはカスタムサーバーが`vite.createServer`を呼び出す場合、React RouterのViteプラグインは既に最新の型を生成しています。
しかし、型生成を単独で実行する必要がある場合は、`--watch`を使用して、ファイルの変更時に型を自動的に再生成することもできます。

```sh
react-router typegen --watch
```

