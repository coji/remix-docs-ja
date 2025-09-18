---
title: react-router.config.ts
order: 3
---

# react-router.config.ts

[MODES: framework]

## 概要

<docs-info>
このファイルはオプションです
</docs-info>

[参照ドキュメント ↗](https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html)

React Routerアプリケーションのサーバーサイドレンダリング、ディレクトリの場所、ビルド設定などの側面をカスタマイズできるReact Routerフレームワーク設定ファイルです。

```tsx filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  buildDirectory: "build",
  ssr: true,
  prerender: ["/", "/about"],
} satisfies Config;
```

## オプション

### `appDirectory`

ルートディレクトリからの相対パスで、`app`ディレクトリへのパスを指定します。デフォルトは`"app"`です。

```tsx filename=react-router.config.ts
export default {
  appDirectory: "src",
} satisfies Config;
```

### `basename`

React Routerアプリケーションのベース名。デフォルトは`"/"`です。

```tsx filename=react-router.config.ts
export default {
  basename: "/my-app",
} satisfies Config;
```

### `buildDirectory`

プロジェクトからの相対パスで、ビルドディレクトリへのパスを指定します。デフォルトは`"build"`です。

```tsx filename=react-router.config.ts
export default {
  buildDirectory: "dist",
} satisfies Config;
```

### `buildEnd`

React Routerの完全なビルドが完了した後に呼び出される関数です。

```tsx filename=react-router.config.ts
export default {
  buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
    // ここにカスタムビルドロジックを記述
    console.log("ビルドが完了しました！");
  },
} satisfies Config;
```

### `future`

今後の機能を選択するための将来のフラグを有効にします。

詳細については、[将来のフラグ][future-flags]を参照してください。

```tsx filename=react-router.config.ts
export default {
  future: {
    // ここで将来のフラグを有効にする
  },
} satisfies Config;
```

### `prerender`

ビルド時にHTMLファイルにプリレンダリングするURLの配列。動的にURLを生成するために配列を返す関数にすることもできます。

詳細については、[プリレンダリング][pre-rendering]を参照してください。

```tsx filename=react-router.config.ts
export default {
  // 静的配列
  prerender: ["/", "/about", "/contact"],

  // または動的関数
  prerender: async ({ getStaticPaths }) => {
    const paths = await getStaticPaths();
    return ["/", ...paths];
  },
} satisfies Config;
```

### `presets`

他のプラットフォームやツールとの統合を容易にするためのReact Routerプラグイン設定プリセットの配列。

詳細については、[プリセット][presets]を参照してください。

```tsx filename=react-router.config.ts
export default {
  presets: [
    // ここにプリセットを追加
  ],
} satisfies Config;
```

### `routeDiscovery`

クライアントがルートを検出してロードする方法を設定します。デフォルトは`mode: "lazy"`で`manifestPath: "/__manifest"`です。

**オプション:**

- `mode: "lazy"` - ユーザーがナビゲートする際にルートが検出されます（デフォルト）
  - `manifestPath` - `lazy`モードを使用する際のmanifestリクエストのカスタムパス
- `mode: "initial"` - すべてのルートが初期マニフェストに含まれます

```tsx filename=react-router.config.ts
export default {
  // 遅延ルート検出を有効にする（デフォルト）
  routeDiscovery: {
    mode: "lazy",
    manifestPath: "/__manifest",
  },

  // カスタムマニフェストパスを使用する
  routeDiscovery: {
    mode: "lazy",
    manifestPath: "/custom-manifest",
  },

  // 遅延検出を無効にし、すべてのルートを最初から含める
  routeDiscovery: { mode: "initial" },
} satisfies Config;
```

詳細については、[遅延ルート検出][lazy-route-discovery]を参照してください。

### `serverBuildFile`

サーバービルド出力のファイル名。このファイルは`.js`拡張子で終わる必要があり、サーバーにデプロイする必要があります。デフォルトは`"index.js"`です。

```tsx filename=react-router.config.ts
export default {
  serverBuildFile: "server.js",
} satisfies Config;
```

### `serverBundles`

ルートを異なるサーバーバンドルに割り当てるための関数。この関数は、サーバービルドディレクトリ内のバンドルのディレクトリ名として使用されるサーバーバンドルIDを返す必要があります。

詳細については、[サーバーバンドル][server-bundles]を参照してください。

```tsx filename=react-router.config.ts
export default {
  serverBundles: ({ branch }) => {
    // ルートブランチに基づいてバンドルIDを返す
    return branch.some((route) => route.id === "admin")
      ? "admin"
      : "main";
  },
} satisfies Config;
```

### `serverModuleFormat`

サーバービルドの出力形式。デフォルトは`"esm"`です。

```tsx filename=react-router.config.ts
export default {
  serverModuleFormat: "cjs", // または "esm"
} satisfies Config;
```

### `ssr`

`true`の場合、React Routerはアプリケーションをサーバーレンダリングします。

`false`の場合、React Routerはアプリケーションをプリレンダリングし、アセットとともに`index.html`ファイルとして保存するため、サーバーレンダリングなしでSPAとしてアプリケーションをデプロイできます。詳細については、["SPAモード"][spa-mode]を参照してください。

デフォルトは`true`です。

```tsx filename=react-router.config.ts
export default {
  ssr: false, // サーバーサイドレンダリングを無効にする
} satisfies Config;
```

[future-flags]: ../../upgrading/future
[presets]: ../../how-to/presets
[server-bundles]: ../../how-to/server-bundles
[pre-rendering]: ../../how-to/pre-rendering
[spa-mode]: ../../how-to/spa
[lazy-route-discovery]: ../../explanation/lazy-route-discovery