---
title: パフォーマンス
---

# パフォーマンス

<docs-warning>このドキュメントはドラフト版です。近日中に実用的な情報を追加する予定ですが、早期に私たちのアプローチをお伝えしたいと考えました。</docs-warning>

Remixは、SSGのように制約の多い厳密なアーキテクチャを規定するのではなく、分散コンピューティングのパフォーマンス特性を活用することを推奨するように設計されています。

ユーザーに送信する最も速いものは、もちろん、ユーザーに近いCDN上の静的ドキュメントです。最近まで、サーバーは世界の1つの地域でしか稼働していなかったため、他の場所では応答が遅くなっていました。これが、SSGが非常に人気を博した理由の1つかもしれません。開発者は、データをHTMLドキュメントに「キャッシュ」し、世界中に配布することができました。しかし、ビルド時間、ビルドの複雑さ、翻訳用の重複したウェブサイト、認証されたユーザーエクスペリエンスには使用できない、非常に大規模で動的なデータソース（私たちのプロジェクト[unpkg.com][unpkg-com]など！）には使用できないなど、多くのトレードオフも伴います。

## エッジ

（U2のメンバーのことではありません。）

今日、「エッジ」での分散コンピューティングには、多くのエキサイティングなことが起こっています。「エッジ」でのコンピューティングとは、一般的に、1つの場所（米国東海岸など）だけでなく、ユーザーに近いサーバーでコードを実行することを意味します。私たちは、この動きが活発になっているだけでなく、分散データベースもエッジに移行しているのを目にしています。私たちは、このすべてをしばらくの間予測しており、それがRemixがこのように設計されている理由です。

エッジで実行される分散サーバーとデータベースを使用すると、静的ファイルに匹敵する速度で動的コンテンツを提供することが可能になりました。**サーバーを高速化することはできますが、ユーザーのネットワークについては何もできません**。残された唯一のことは、ブラウザバンドルからコードをサーバーに移動し、ネットワーク経由で送信するバイト数を減らし、比類のないWebパフォーマンスを提供することです。それがRemixが設計されている目的です。

## このウェブサイト + Fly.io

このウェブサイトは、ファーストバイトまでの時間が非常に短いです。世界のほとんどの人にとって、100ミリ秒未満です。ドキュメントのタイプミスを修正すると、1、2分以内に、再ビルド、再デプロイ、HTTPキャッシュなしで、サイトが世界中で更新されます。

私たちは、分散システムを使用してこれを実現しました。アプリは、世界中の[Fly][fly]の複数の地域で実行されているため、ユーザーの近くにあります。各インスタンスには、独自のSQLiteデータベースがあります。アプリが起動すると、GitHubのRemixソースリポジトリからtarballを取得し、MarkdownドキュメントをHTMLに処理してから、SQLiteデータベースに挿入します。

関連するコードは、実際には、Gatsbyサイトがビルド時に`gatsby-node.js`またはNext.jsの`getStaticProps`で行うことと非常によく似ています。アイデアは、遅い部分（GitHubからドキュメントを取得し、Markdownを処理する）を取得してキャッシュすることです（SSGはHTMLにキャッシュし、このウェブサイトはサーバー上のSQLiteにキャッシュします）。

ユーザーがページをリクエストすると、アプリはローカルのSQLiteデータベースをクエリしてページを送信します。私たちのサーバーは、これらのリクエストを数ミリ秒で完了します。このアーキテクチャで最も興味深いのは、鮮度のために速度を犠牲にする必要がないことです。GitHubでドキュメントを編集すると、GitHubアクションが最寄りのアプリインスタンスでWebhookを呼び出し、そのリクエストを世界中の他のすべてのインスタンスにリプレイします。次に、それらはすべてGitHubから新しいtarballをプルし、起動時と同じようにドキュメントでデータベースを同期します。ドキュメントは、世界中で1、2分以内に更新されます。

しかし、これは私たちが探求したかった1つのアプローチにすぎません。

## Cloudflare Workers

[Remix Cloudflare Workersデモ][remix-cloudflare-workers-demo]

Cloudflareは、しばらくの間、エッジコンピューティングの限界を押し広げており、Remixはそれを最大限に活用できるように位置付けられています。デモの応答時間は、静的ファイルを提供するのと同じですが、デモで示されている機能は間違いなく静的ではありません。

Cloudflareは、ユーザーの近くでアプリを実行するだけでなく、[KV][kv]や[Durable Objects][durable-objects]などの永続ストレージシステムも備えており、デプロイとオーダーメイドの増分ビルダーバックエンドにデータを結合するという制約なしに、SSGレベルの速度を実現できます。

近日中にサポートする予定の同様のプラットフォームが他にもあります。

## バンドル分析

<docs-warning>このドキュメントは、[Classic Remix Compiler][classic-remix-compiler]を使用している場合にのみ関連します。</docs-warning>

Remixは、バンドルサイズと構成を分析できるように、メタファイルをサーバービルドディレクトリ（デフォルトでは`build/`）に出力します。

- `metafile.css.json`：CSSバンドルのメタファイル
- `metafile.js.json`：ブラウザJSバンドルのメタファイル
- `metafile.server.json`：サーバーJSバンドルのメタファイル

Remixはesbuildのメタファイル形式を使用しているため、これらのファイルを[https://esbuild.github.io/analyze/][https-esbuild-github-io-analyze]に直接アップロードして、バンドルを視覚化できます。

## その他のテクノロジー

サーバーの高速化に役立つその他のテクノロジーを次に示します。

- [FaunaDB][fauna-db] - ユーザーの近くで実行される分散データベース
- [LRU Cache][lru-cache] - いっぱいになると自動的にスペースをクリアするインメモリキャッシュ
- [Redis][redis] - 実証済みのサーバー側キャッシュ

[unpkg-com]: https://unpkg.com
[fly]: https://fly.io
[remix-cloudflare-workers-demo]: https://remix-cloudflare-demo.jacob-ebey.workers.dev
[kv]: https://developers.cloudflare.com/workers/learning/how-kv-works
[durable-objects]: https://blog.cloudflare.com/introducing-workers-durable-objects
[fauna-db]: https://fauna.com
[lru-cache]: https://www.npmjs.com/package/lru-cache
[redis]: https://www.npmjs.com/package/redis
[https-esbuild-github-io-analyze]: https://esbuild.github.io/analyze
[classic-remix-compiler]: ./vite#classic-remix-compiler-vs-remix-vite
