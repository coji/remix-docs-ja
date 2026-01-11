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

[リファレンスドキュメント ↗](https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html)

React Router のフレームワーク設定ファイルで、React Router アプリケーションのサーバーサイドレンダリング、ディレクトリの場所、ビルド設定などの側面をカスタマイズできます。

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

ルートディレクトリからの相対パスで、`app` ディレクトリへのパスを指定します。デフォルトは `"app"` です。

```tsx filename=react-router.config.ts
export default {
  appDirectory: "src",
} satisfies Config;
```

### `basename`

React Router アプリの basename です。デフォルトは `"/"` です。

```tsx filename=react-router.config.ts
export default {
  basename: "/my-app",
} satisfies Config;
```

### `buildDirectory`

プロジェクトからの相対パスで、ビルドディレクトリへのパスを指定します。デフォルトは `"build"` です。

```tsx filename=react-router.config.ts
export default {
  buildDirectory: "dist",
} satisfies Config;
```

### `buildEnd`

React Router のビルドが完全に完了した後で呼び出される関数です。

```tsx filename=react-router.config.ts
export default {
  buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
    // Custom build logic here
    console.log("Build completed!");
  },
} satisfies Config;
```

### `future`

今後の機能を選択的に使用できるように、将来のフラグを有効にします。

詳細については、[Future Flags][future-flags] を参照してください。

```tsx filename=react-router.config.ts
export default {
  future: {
    // Enable future flags here
  },
} satisfies Config;
```

### `prerender`

ビルド時に HTML ファイルとしてプリレンダリングする URL の配列です。URL を動的に生成するために、配列を返す関数にすることもできます。

詳細については、[Pre-Rendering][pre-rendering] を参照してください。

```tsx filename=react-router.config.ts
export default {
  // Static array
  prerender: ["/", "/about", "/contact"],

  // Or dynamic function
  prerender: async ({ getStaticPaths }) => {
    const paths = await getStaticPaths();
    return ["/", ...paths];
  },
} satisfies Config;
```

### `presets`

他のプラットフォームやツールとの統合を容易にするための、React Router プラグイン設定プリセットの配列です。

詳細については、[Presets][presets] を参照してください。

```tsx filename=react-router.config.ts
export default {
  presets: [
    // Add presets here
  ],
} satisfies Config;
```

### `routeDiscovery`

クライアントによるルートの検出とロード方法を設定します。デフォルトは `mode: "lazy"` で `manifestPath: "/__manifest"` です。

**オプション:**

- `mode: "lazy"` - ユーザーがナビゲートする際にルートが検出されます (デフォルト)
  - `manifestPath` - `lazy` モードを使用する際の manifest リクエストのカスタムパス
- `mode: "initial"` - すべてのルートが初期マニフェストに含まれます

```tsx filename=react-router.config.ts
export default {
  // Enable lazy route discovery (default)
  routeDiscovery: {
    mode: "lazy",
    manifestPath: "/__manifest",
  },

  // Use a custom manifest path
  routeDiscovery: {
    mode: "lazy",
    manifestPath: "/custom-manifest",
  },

  // Disable lazy discovery and include all routes initially
  routeDiscovery: { mode: "initial" },
} satisfies Config;
```

詳細については、[Lazy Route Discovery][lazy-route-discovery] を参照してください。

### `serverBuildFile`

サーバービルド出力のファイル名です。このファイルは `.js` 拡張子で終わり、サーバーにデプロイされるべきです。デフォルトは `"index.js"` です。

```tsx filename=react-router.config.ts
export default {
  serverBuildFile: "server.js",
} satisfies Config;
```

### `serverBundles`

ルートを異なるサーバーバンドルに割り当てるための関数です。この関数は、サーバービルドディレクトリ内のバンドルのディレクトリ名として使用されるサーバーバンドル ID を返す必要があります。

詳細については、[Server Bundles][server-bundles] を参照してください。

```tsx filename=react-router.config.ts
export default {
  serverBundles: ({ branch }) => {
    // Return bundle ID based on route branch
    return branch.some((route) => route.id === "admin")
      ? "admin"
      : "main";
  },
} satisfies Config;
```

### `serverModuleFormat`

サーバービルドの出力フォーマットです。デフォルトは `"esm"` です。

```tsx filename=react-router.config.ts
export default {
  serverModuleFormat: "cjs", // or "esm"
} satisfies Config;
```

### `ssr`

もし `true` の場合、React Router はアプリケーションをサーバーレンダリングします。

もし `false` の場合、React Router はアプリケーションをプリレンダリングし、アセットとともに `index.html` ファイルとして保存します。これにより、サーバーレンダリングなしでアプリケーションを SPA としてデプロイできます。詳細については、["SPA Mode"][spa-mode] を参照してください。

デフォルトは `true` です。

```tsx filename=react-router.config.ts
export default {
  ssr: false, // disabled server-side rendering
} satisfies Config;
```

[future-flags]: ../../upgrading/future
[presets]: ../../how-to/presets
[server-bundles]: ../../how-to/server-bundles
[pre-rendering]: ../../how-to/pre-rendering
[spa-mode]: ../../how-to/spa
[lazy-route-discovery]: ../../explanation/lazy-route-discovery