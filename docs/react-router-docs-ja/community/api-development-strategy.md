---
title: API 開発戦略
---

# API 開発戦略

React Router は、アプリケーションの基盤となります。新しいメジャーバージョンへのアップグレードが可能な限りスムーズに行えるように、React エコシステムの進化に合わせて動作と API を調整および強化できるようにしたいと考えています。

当社の戦略と動機については、[Future Flags][future-flags-blog-post] ブログ記事で詳しく説明しています。

## Future Flags

API が破壊的な方法で変更された場合、Future Flag で導入されます。これにより、次のメジャーバージョンでデフォルトになる前に、一度に 1 つの変更を選択することができます。

- Future Flag を有効にしないと、アプリは何も変更されません
- Flag を有効にすると、その機能の動作が変わります

すべての現在の Future Flag は、[Future Flags ガイド](../upgrading/future) に記載されているので、最新の状態を保つことができます。

## Unstable Flags

Unstable Flag は、まだ設計と開発中の機能であり、ユーザーに提供することで、正しい機能を実現するのに役立ちます。

Unstable Flag は、本番環境では推奨されません。

- 警告なしに、アップグレードパスなしに変更されます
- バグが含まれる可能性があります
- ドキュメント化されていません
- 完全に破棄される可能性があります

Unstable Flag を有効にすると、ユーザーではなく、プロジェクトの貢献者になります。ご協力に感謝いたしますが、新しい役割にご注意ください。

現在の Unstable Flag については、[CHANGELOG](../start/changelog) をご確認ください。

### 新機能の例

新機能の決定フローは以下のようになります（この図は Remix v1/v2 に関連していますが、React Router v6/v7 にも適用されます）。

![新機能の導入方法に関する意思決定プロセスのフローチャート][feature-flowchart]

[future-flags-blog-post]: https://remix.run/blog/future-flags
[feature-flowchart]: https://remix.run/docs-images/feature-flowchart.png
[picking-a-router]: ../routers/picking-a-router

