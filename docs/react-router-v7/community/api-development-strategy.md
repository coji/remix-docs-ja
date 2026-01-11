---
title: API 開発戦略
---

# API 開発戦略

React Router はアプリケーションの基盤です。React エコシステムが進歩するにつれて、動作や API を調整および強化できるようにしながら、新しいメジャーバージョンへのアップグレードが可能な限りスムーズになるようにしたいと考えています。

私たちの戦略と動機については、[Future Flags][future-flags-blog-post] のブログ記事と [Open Governance Model][governance] で詳しく説明されています。

## Future Flags

API が破壊的な方法で変更される場合、Future Flag で導入されます。これにより、次のメジャーバージョンでデフォルトになる前に、一度に 1 つの変更を選択できます。

- Future Flag を有効にしない場合、アプリは何も変更されません
- フラグを有効にすると、その機能の動作が変更されます

現在のすべての Future Flag は、最新の状態を維持できるように、[Future Flags Guide](../upgrading/future) に記載されています。

## Unstable Flags

Unstable Flags は、まだ設計および開発中の機能であり、ユーザーが正しく理解できるようにするために提供されています。

Unstable Flags は本番環境では推奨されません。

- 警告なしに、アップグレードパスなしに変更されます
- バグがあります
- ドキュメント化されていません
- 完全に破棄される可能性があります

Unstable Flags を選択すると、ユーザーではなく、プロジェクトの貢献者になります。ご協力ありがとうございますが、新しい役割にご注意ください。

Unstable Flags は実験的なものであり、存続が保証されていないため、SemVer パッチリリースで提供されます。これは、新しい _安定版_/_ドキュメント化された_ API ではないためです。Unstable Flags が Future Flag に安定化すると、SemVer マイナーリリースでリリースされ、適切にドキュメント化され、[Future Flags Guide](../upgrading/future) に追加されます。

現在の Unstable Flags については、[CHANGELOG](../start/changelog) に注目してください。

### 新機能のフローの例

新機能の決定フローは次のようになります。

<img width="400" src="https://reactrouter.com/_docs/feature-flowchart.png" alt="新機能を導入する方法の決定プロセスのフローチャート" />

[future-flags-blog-post]: https://remix.run/blog/future-flags
[governance]: https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#new-feature-process