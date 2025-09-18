---
title: 将来のフラグ
order: 1
---

# 将来のフラグと非推奨

このガイドでは、React Router アプリで将来のフラグを採用するプロセスについて説明します。この戦略に従うことで、React Router の次のメジャーバージョンに最小限の変更でアップグレードできます。将来のフラグの詳細については、[API 開発戦略](../community/api-development-strategy)を参照してください。

各ステップの後にコミットを作成して出荷することを強くお勧めします。ほとんどのフラグは任意の順序で採用できますが、例外は下記に記載されています。

## 最新の v7.x への更新

まず、最新の将来のフラグを利用するために、v7.x の最新のマイナーバージョンに更新してください。アップグレード時にいくつかの非推奨警告が表示されるかもしれませんが、それについては後述します。

👉 最新の v7 に更新

```sh
npm install react-router@7 @react-router/{dev,node,etc.}@7
```

## `future.v8_middleware`

[MODES: framework]

<br/>
<br/>

**背景**

Middleware を使用すると、一致したパスの [`Response`][Response] 生成の前後にコードを実行できます。これにより、認証、ロギング、エラー処理、データ前処理などの一般的なパターンを再利用可能な方法で実現できます。詳細については、[ドキュメント](../how-to/middleware)を参照してください。

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

`loader` および `action` 関数で `context` パラメータを使用している場合にのみ、コードを更新する必要があります。これは、`getLoadContext` 関数を持つカスタムサーバーを使用している場合にのみ適用されます。middleware の [`getLoadContext` の変更点](../how-to/middleware#changes-to-getloadcontextapploadcontext)に関するドキュメントと、[新しい API への移行手順](../how-to/middleware#migration-from-apploadcontext)を参照してください。

[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response