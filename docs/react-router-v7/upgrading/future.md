---
title: 将来のフラグ
order: 1
---

# 将来のフラグと非推奨

このガイドでは、React Router アプリで将来のフラグを採用するプロセスについて説明します。この戦略に従うことで、React Router の次のメジャーバージョンに最小限の変更でアップグレードできます。将来のフラグの詳細については、[API 開発戦略](../community/api-development-strategy)を参照してください。

各ステップの後にコミットを作成して出荷することを強くお勧めします。ほとんどのフラグは任意の順序で採用できますが、例外は下記に記載されています。

## 最新の v7.x へのアップデート

最新の将来のフラグを利用するために、まず v7.x の最新のマイナーバージョンにアップデートしてください。アップグレード時にいくつかの非推奨警告が表示されるかもしれませんが、それらについては以下で説明します。

👉 最新の v7 にアップデート

```sh
npm install react-router@7 @react-router/{dev,node,etc.}@7
```

## `future.v8_middleware`

[MODES: framework]

<br/>
<br/>

**背景**

middleware を使用すると、マッチした path の [`Response`][Response] 生成の前後にコードを実行できます。これにより、認証、ロギング、エラーハンドリング、データの前処理などの一般的なパターンを再利用可能な方法で実現できます。詳細については、[ドキュメント](../how-to/middleware)を参照してください。

👉 **フラグを有効にする**

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    v8_middleware: true,
  },
} satisfies Config;
```

**コードの更新**

`react-router-serve` を使用している場合、コードを更新する必要はありません。

`loader` および `action` 関数で `context` パラメーターを使用している場合にのみ、コードを更新する必要があります。これは、`getLoadContext` 関数を持つカスタムサーバーを使用している場合にのみ適用されます。middleware の [`getLoadContext` の変更点](../how-to/middleware#changes-to-getloadcontextapploadcontext)に関するドキュメントと、[新しい API への移行](../how-to/middleware#migration-from-apploadcontext)手順を参照してください。

## `future.v8_splitRouteModules`

[MODES: framework]

<br/>
<br/>

**背景**

この機能は、クライアントサイドの route exports (`clientLoader`、`clientAction`、`clientMiddleware`、`HydrateFallback`) を、route component とは独立してロードできる個別の chunk に分割することを可能にします。これにより、component コードがまだダウンロード中であってもこれらの export をフェッチして実行できるため、クライアントサイドのデータローディングのパフォーマンスが向上します。

この設定は、オプトイン動作のために `true` に設定するか、すべての route が分割可能であることを必須にするために `"enforce"` に設定できます（後者の場合、共有コードのために分割できない route ではビルドエラーが発生します）。

👉 **フラグを有効にする**

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    v8_splitRouteModules: true,
  },
} satisfies Config;
```

**コードの更新**

コードの変更は不要です。これは、有効にすると自動的に機能する最適化機能です。

## `future.v8_viteEnvironmentApi`

[MODES: framework]

<br/>
<br/>

**背景**

これは実験的な Vite Environment API のサポートを有効にします。Vite Environment API は、Vite environment をより柔軟かつ強力に設定する方法を提供します。これは Vite 6+ を使用している場合にのみ利用可能です。

👉 **フラグを有効にする**

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
```

**コードの更新**

[Environment API][vite-environment] 用に更新する必要があるカスタム Vite configuration がない限り、コードの変更は不要です。ほとんどのユーザーは変更を行う必要はありません。

[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[vite-environment]: https://vite.dev/guide/api-environment