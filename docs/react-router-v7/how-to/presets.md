---
title: プリセット
---

# プリセット

[MODES: framework]

<br/>
<br/>

[React Router config][react-router-config]は、他のツールやホスティングプロバイダーとの統合を容易にするために、`presets`オプションをサポートしています。

[プリセット][preset-type]は、以下の2つのことしかできません。

- あなたに代わってReact Routerの設定オプションを構成する
- 解決された設定を検証する

各プリセットによって返される設定は、プリセットが定義された順序でマージされます。React Routerの設定で直接指定された設定は、最後にマージされます。これは、あなたの設定が常にプリセットよりも優先されることを意味します。

## プリセット設定の定義

基本的な例として、[サーバーバンドル関数][server-bundles]を構成するプリセットを作成してみましょう。

```ts filename=my-cool-preset.ts
import type { Preset } from "@react-router/dev/config";

export function myCoolPreset(): Preset {
  return {
    name: "my-cool-preset",
    reactRouterConfig: () => ({
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

## 設定の検証

他のプリセットやユーザー設定が、あなたのプリセットから返された値を上書きする可能性があることに注意してください。

私たちの例のプリセットでは、`serverBundles`関数は、異なる競合する実装で上書きされる可能性があります。最終的に解決された設定に私たちのプリセットからの`serverBundles`関数が含まれていることを検証したい場合は、`reactRouterConfigResolved`フックを使用できます。

```ts filename=my-cool-preset.ts lines=[22-27]
import type {
  Preset,
  ServerBundlesFunction,
} from "@react-router/dev/config";

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
    reactRouterConfig: () => ({ serverBundles }),
    reactRouterConfigResolved: ({ reactRouterConfig }) => {
      if (
        reactRouterConfig.serverBundles !== serverBundles
      ) {
        throw new Error("`serverBundles` was overridden!");
      }
    },
  };
}
```

`reactRouterConfigResolved`フックは、プリセットの設定をマージまたは上書きすることがエラーとなる場合にのみ使用すべきです。

## プリセットの使用

プリセットは、npmに公開され、React Routerの設定内で使用されるように設計されています。

```ts filename=react-router.config.ts lines=[6]
import type { Config } from "@react-router/dev/config";
import { myCoolPreset } from "react-router-preset-cool";

export default {
  // ...
  presets: [myCoolPreset()],
} satisfies Config;
```

[react-router-config]: https://api.reactrouter.com/v7/types/_react_router_dev.config.Config.html
[preset-type]: https://api.reactrouter.com/v7/types/_react_router_dev.config.Preset.html
[server-bundles]: ./server-bundles