---
title: プリセット
---

# プリセット

[Remix Vite プラグイン][remix-vite] は、他のツールやホスティングプロバイダーとの統合を容易にするための `presets` オプションをサポートしています。

プリセットは、次の 2 つのことしかできません。

- あなたの代わりに Remix Vite プラグインを設定します。
- 解決された設定を検証します。

各プリセットから返される設定は、定義された順序でマージされます。Remix Vite プラグインに直接渡された設定は、最後にマージされます。これは、ユーザー設定が常にプリセットよりも優先されることを意味します。

## プリセットの作成

プリセットは、次の `Preset` 型に準拠します。

```ts
type Preset = {
  name: string;

  remixConfig?: (args: {
    remixUserConfig: VitePluginConfig;
  }) => RemixConfigPreset | Promise<RemixConfigPreset>;

  remixConfigResolved?: (args: {
    remixConfig: ResolvedVitePluginConfig;
  }) => void | Promise<void>;
};
```

### プリセット設定の定義

基本的な例として、[サーバーバンドル関数][server-bundles]を設定するプリセットを作成してみましょう。

```ts filename=my-cool-preset.ts
import type { Preset } from "@remix-run/dev";

export function myCoolPreset(): Preset {
  return {
    name: "my-cool-preset",
    remixConfig: () => ({
      serverBundles: ({ branch }) => {
        const isAuthenticatedRoute = branch.some((route) =>
          route.id.split("/").includes("_authenticated")
        );

        return isAuthenticatedRoute
          ? "authenticated"
          : "unauthenticated";
      },
    }),
  };
}
```

### 設定の検証

他のプリセットやユーザー設定が、プリセットから返された値を上書きできることを覚えておくことが重要です。

例のプリセットでは、`serverBundles` 関数が別の競合する実装で上書きされる可能性があります。最終的に解決された設定にプリセットの `serverBundles` 関数が含まれていることを検証したい場合は、`remixConfigResolved` フックを使用してこれを行うことができます。

```ts filename=my-cool-preset.ts lines=[22-26]
import type {
  Preset,
  ServerBundlesFunction,
} from "@remix-run/dev";

const serverBundles: ServerBundlesFunction = ({
  branch,
}) => {
  const isAuthenticatedRoute = branch.some((route) =>
    route.id.split("/").includes("_authenticated")
  );

  return isAuthenticatedRoute
    ? "authenticated"
    : "unauthenticated";
};

export function myCoolPreset(): Preset {
  return {
    name: "my-cool-preset",
    remixConfig: () => ({ serverBundles }),
    remixConfigResolved: ({ remixConfig }) => {
      if (remixConfig.serverBundles !== serverBundles) {
        throw new Error("`serverBundles` was overridden!");
      }
    },
  };
}
```

`remixConfigResolved` フックは、プリセットの設定をマージまたは上書きすることがエラーになる場合にのみ使用する必要があります。

## プリセットの使用

プリセットは、npm に公開され、Vite 設定内で使用されるように設計されています。

```ts filename=vite.config.ts lines=[3,8]
import { vitePlugin as remix } from "@remix-run/dev";
import { myCoolPreset } from "remix-preset-cool";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      presets: [myCoolPreset()],
    }),
  ],
});
```

[remix-vite]: ./vite
[server-bundles]: ./server-bundles

