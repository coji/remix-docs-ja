---
title: プリセット
---

# プリセット

[MODES: framework]

<br/>
<br/>

[React Router config][react-router-config]は、他のツールやホスティングプロバイダーとの統合を容易にするため、`presets`オプションをサポートしています。

[Presets][preset-type]は以下の2つのことだけを行うことができます。

- React Router config オプションを代理で設定する
- 解決された config を検証する

各`preset`によって返される`config`は、`preset`が定義された順序でマージされます。React Router config で直接指定された`config`は、最後にマージされます。これは、あなたの`config`が常に`preset`よりも優先されることを意味します。

## preset config を定義する

基本的な例として、[server bundles function][server-bundles]を設定する`preset`を作成してみましょう。

```ts filename=my-cool-preset.ts
import type { Preset } from "@react-router/dev/config";

export function myCoolPreset(): Preset {
  return {
    name: "my-cool-preset",
    reactRouterConfig: () => ({
      serverBundles: ({ branch }) => {
        const isAuthenticatedRoute = branch.some((route) =>
          route.id.split("/").includes("_authenticated"),
        );

        return isAuthenticatedRoute
          ? "authenticated"
          : "unauthenticated";
      },
    }),
  };
}
```

## config を検証する

他の`preset`やユーザー`config`は、あなたの`preset`から返された値をまだオーバーライドできるということに留意してください。

私たちの`preset`の例では、`serverBundles`関数は、異なる、競合する実装でオーバーライドされる可能性があります。最終的に解決された`config`に、私たちの`preset`からの`serverBundles`関数が含まれていることを検証したい場合は、`reactRouterConfigResolved` hookを使用できます。

```ts filename=my-cool-preset.ts lines=[22-27]
import type {
  Preset,
  ServerBundlesFunction,
} from "@react-router/dev/config";

const serverBundles: ServerBundlesFunction = ({
  branch,
}) => {
  const isAuthenticatedRoute = branch.some((route) =>
    route.id.split("/").includes("_authenticated"),
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

`reactRouterConfigResolved` hookは、あなたの`preset`の`config`をマージしたりオーバーライドしたりすることがエラーとなる場合にのみ使用されるべきです。

## preset を使用する

Presetは、npmに公開され、React Router config 内で使用されるように設計されています。

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