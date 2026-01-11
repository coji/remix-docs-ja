---
title: routes.ts
order: 2
---

# routes.ts

[MODES: framework]

## 概要

<docs-info>
このファイルは必須です
</docs-info>

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/interfaces/_react_router_dev.routes.RouteConfigEntry.html)

アプリケーション内の URL パターンを route module にマッピングする設定ファイルです。

詳細については、[ルーティングガイド][routing]を参照してください。

## 例

### 基本

routes をオブジェクトの配列として設定します。

```tsx filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("some/path", "./some/file.tsx"),
  // pattern ^           ^ module file
] satisfies RouteConfig;
```

route config エントリを作成するには、以下のヘルパーを使用できます。

- [`route`][route] — route config エントリを作成するためのヘルパー関数
- [`index`][index] — index route の route config エントリを作成するためのヘルパー関数
- [`layout`][layout] — layout route の route config エントリを作成するためのヘルパー関数
- [`prefix`][prefix] — 親 route を導入することなく、一連の routes にパスプレフィックスを追加するためのヘルパー関数
- [`relative`][relative] — 指定されたディレクトリを基準にファイルパスを解決する route config ヘルパーのセットを作成します。route config を異なるディレクトリ内の複数のファイルに分割することをサポートするように設計されています

### ファイルベースルーティング

設定ではなくファイル命名規約によって routes を定義したい場合、`@react-router/fs-routes` パッケージは [ファイルシステムルーティング規約][file-route-conventions]を提供します。

```ts filename=app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;
```

### ルートヘルパー

[routing]: ../../start/framework/routing
[route]: https://api.reactrouter.com/v7/functions/_react_router_dev.routes.route.html
[index]: https://api.reactrouter.com/v7/functions/_react_router_dev.routes.index.html
[layout]: https://api.reactrouter.com/v7/functions/_react_router_dev.routes.layout.html
[prefix]: https://api.reactrouter.com/v7/functions/_react_router_dev.routes.prefix.html
[relative]: https://api.reactrouter.com/v7/functions/_react_router_dev.routes.relative.html
[file-route-conventions]: ../../how-to/file-route-conventions