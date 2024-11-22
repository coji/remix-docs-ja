---
title: プリセット
---

# プリセット

[Remix Vite プラグイン][remix-vite] は、他のツールやホスティングプロバイダーとの統合を容易にするために `presets` オプションをサポートしています。

プリセットは、次の 2 つの動作のみを行うことができます。

- あなたに代わって Remix Vite プラグインを設定する
- 解決された設定を検証する

各プリセットから返される設定は、定義された順にマージされます。Remix Vite プラグインに直接渡された設定は最後にマージされます。つまり、ユーザー設定は常にプリセットよりも優先されます。

## プリセットの作成

プリセットは、次の `Preset` タイプに準拠します。

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

基本的な例として、[サーバーバンドル関数][server-bundles] を設定するプリセットを作成してみましょう。

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

他のプリセットとユーザー設定は、プリセットから返される値を上書きできることに注意することが重要です。

私たちの例では、`serverBundles` 関数は、異なる、競合する実装で上書きされる可能性があります。プリセットの `serverBundles` 関数が最終的に解決された設定に含まれていることを検証したい場合は、`remixConfigResolved` フックを使用できます。

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

`remixConfigResolved` フックは、プリセットの設定をマージまたは上書きすることがエラーとなる場合にのみ使用してください。

## プリセットの使用

プリセットは、npm に公開して、Vite 設定内で使用できるように設計されています。

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

