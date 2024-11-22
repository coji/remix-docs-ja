---
title: "@remix-run/node"
---

# `@remix-run/node`

このパッケージには、Node.js 用のユーティリティとポリフィルが含まれています。

## ポリフィル

Remix は `fetch` などのブラウザ API に依存していますが、これらの API は Node.js ではまだネイティブに安定して利用できません。そのため、Jest などのツールで実行すると、これらのグローバル変数がなければユニットテストが失敗することがあります。

テストフレームワークは、グローバル変数をポリフィルしたり、API をモックアウトしたりするためのフックまたは場所を提供する必要があります。以下に示す行をテスト環境に追加して、Remix が依存するグローバル変数をインストールできます。

```ts
import { installGlobals } from "@remix-run/node";

// これにより、「fetch」、「Response」、「Request」、「Headers」などのグローバル変数がインストールされます。
installGlobals();
```

<docs-info>
  実際のアプケーションでは、これらのグローバル変数は自動的にインストールされるため、テスト環境でのみインストールする必要があります。
</docs-info>

## バージョンサポート

Remix は、いつでも **アクティブ** および **メンテナンス** の [Node LTS バージョン][node-releases] を公式にサポートしています。サポートが終了した Node バージョンのサポートは、Remix マイナーリリースで行われます。

[node-releases]: https://nodejs.org/en/about/previous-releases


