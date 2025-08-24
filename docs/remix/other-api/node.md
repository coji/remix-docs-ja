---
title: "@remix-run/node"
---

# `@remix-run/node`

このパッケージには、Node.js用のユーティリティとポリフィルが含まれています。

## ポリフィル

Remixは、Node.jsでネイティブかつ安定的に利用可能になっていない`fetch`などのブラウザAPIに依存しているため、Jestなどのツールで実行すると、これらのグローバル変数がないとユニットテストが失敗する可能性があります。

テストフレームワークは、グローバル変数をポリフィルしたり、APIをモックアウトしたりするためのフックまたは場所を提供する必要があります。ここで、Remixが依存するグローバル変数をインストールするために、次の行を追加できます。

```ts
import { installGlobals } from "@remix-run/node";

// これは、"fetch"、"Response"、"Request"、"Headers"などのグローバル変数をインストールします。
installGlobals();
```

<docs-info>
  実際のアプリではこれらは自動的にインストールされるため、テスト環境でのみこれを行う必要があることに注意してください。
</docs-info>

## バージョンサポート

Remixは、常に**Active**および**Maintenance**の[Node LTSバージョン][node-releases]を公式にサポートしています。サポートが終了したNodeバージョンのサポート終了は、Remixのマイナーリリースで行われます。

[node-releases]: https://nodejs.org/en/about/previous-releases
