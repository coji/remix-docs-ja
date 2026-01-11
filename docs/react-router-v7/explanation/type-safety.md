---
title: 型安全性
---

# 型安全性

[MODES: framework]

<br/>
<br/>

まだお済みでない場合は、新しいプロジェクトで[型安全性を設定する][route-module-type-safety]ためのガイドをご確認ください。

React Router は、アプリ内の各ルートの型を生成し、ルートモジュールのエクスポートに型安全性を提供します。

たとえば、`products/:id` ルートが構成されているとしましょう。

```ts filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("products/:id", "./routes/product.tsx"),
] satisfies RouteConfig;
```

次のように、ルート固有の型をインポートできます。

```tsx filename=app/routes/product.tsx
import type { Route } from "./+types/product";
// このルート用に生成された型 👆

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

## 仕組み

React Router の型生成は、アプリのルートを決定するためにルート構成 (`app/routes.ts` がデフォルト) を実行します。
次に、特別な `.react-router/types/` ディレクトリ内に、各ルートの `+types/<ルートファイル>.d.ts` を生成します。
[`rootDirs` が構成されている][route-module-type-safety]場合、TypeScript は、これらの生成されたファイルを、対応するルートモジュールのすぐ隣にあるかのようにインポートできます。

設計上の決定事項の詳細については、[型推論に関する決定ドキュメント](https://github.com/remix-run/react-router/blob/dev/decisions/0012-type-inference.md) をご確認ください。

[route-module-type-safety]: ../how-to/route-module-type-safety

## `typegen` コマンド

`typegen` コマンドを使用して、手動で型を生成できます。

```sh
react-router typegen
```

次の型が各ルートに対して生成されます。

- `LoaderArgs`
- `ClientLoaderArgs`
- `ActionArgs`
- `ClientActionArgs`
- `HydrateFallbackProps`
- `ComponentProps` (`default` エクスポート用)
- `ErrorBoundaryProps`

### --watch

`react-router dev` を実行する場合、またはカスタムサーバーが `vite.createServer` を呼び出す場合、React Router の Vite プラグインはすでに最新の型を生成しています。
ただし、型生成を単独で実行する必要がある場合は、`--watch` を使用して、ファイルの変更に応じて型を自動的に再生成することもできます。

```sh
react-router typegen --watch
```