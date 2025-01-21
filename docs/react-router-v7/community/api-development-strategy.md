---
title: API開発戦略
---

# API開発戦略

React Routerはアプリケーションの基盤です。Reactのエコシステムが進化するにつれて、動作やAPIを調整・強化しながら、新しいメジャーバージョンへのアップグレードをできるだけスムーズに行えるようにしたいと考えています。

私たちの戦略と動機については、[Future Flags][future-flags-blog-post]のブログ記事で詳しく説明しています。

## Future Flags

APIが破壊的な方法で変更される場合、それはfuture flagで導入されます。これにより、次のメジャーバージョンでデフォルトになる前に、一度に1つの変更をオプトインできます。

- future flagを有効にしない場合、アプリに変更はありません
- flagを有効にすると、その機能の動作が変更されます

現在のすべてのfuture flagは、[Future Flagsガイド](../upgrading/future)に文書化されており、最新情報を把握するのに役立ちます。

## Unstable Flags

Unstable flagは、まだ設計および開発中の機能であり、ユーザーが正しく理解できるようにするために提供されています。

Unstable flagは本番環境での使用は推奨されません。

- 予告なしに、アップグレードパスなしに変更されます
- バグが含まれます
- ドキュメント化されていません
- 完全に破棄される可能性があります

unstable flagをオプトインすると、ユーザーではなく、プロジェクトの貢献者になります。ご協力に感謝しますが、新しい役割にご注意ください。

現在のunstable flagについては、[CHANGELOG](../start/changelog)に注目してください。

### 新機能のフロー例

新機能の決定フローは次のようになります（この図はRemix v1/v2に関連していますが、React Router v6/v7にも適用されます）。

![新機能を導入する方法の決定プロセスのフローチャート][feature-flowchart]

[future-flags-blog-post]: https://remix.run/blog/future-flags
[feature-flowchart]: https://remix.run/docs-images/feature-flowchart.png
[picking-a-router]: ../routers/picking-a-router

