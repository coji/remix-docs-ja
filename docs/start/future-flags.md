---
title: Future Flags
order: 5
---

# Future Flagsを使用した段階的な機能導入

Remixの開発では、主要なリリースに対して以下の目標を達成することを目指しています。

1. **段階的な機能導入:** 開発者は、現在のメジャーバージョンで利用可能になった新しい機能や変更を、個別に選択して統合できます。これは、すべての変更を1つの新しいメジャーリリースにまとめる従来の方法とは異なります。
2. **シームレスなバージョンアップグレード:** 開発者は、新しい機能を事前に選択的に組み込むことで、既存のアプリケーションコードを変更することなく、新しいメジャーバージョンにスムーズに移行できます。

## 不安定なAPIとFuture Flags

新しい機能を現在のリリースに導入する際に、`unstable_someFeature`のようなFuture Flagsを使用します。これらのフラグは、[`vite.config.ts`][vite-config-future]ファイルのRemix Vite Plugin `future`オプションで指定できます。

```ts filename=vite.config.ts lines=[7-9]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      future: {
        unstable_someFeature: true,
      },
    }),
  ],
});
```

<docs-info>Viteをまだ使用していない場合は、[`remix.config.js` `future`][remix-config-future]オプションを使用してFuture Flagsを指定できます。</docs-info>

- 不安定な機能が安定状態に達したら、特別なプレフィックスを削除し、次のマイナーリリースに機能を含めます。この時点で、APIの構造は、その後のマイナーリリース全体で一貫性を保ちます。

- このアプローチにより、アーリーアダプターと協力してAPIを洗練し、不安定な段階での必要な変更をすべてのユーザーに影響を与えることなく組み込むことができます。安定したリリースは、中断することなくこれらの改善の恩恵を受けます。

- `unstable_*`フラグでラベル付けされた機能を使用している場合は、各マイナーリリースのリリースノートを確認することが重要です。これは、これらの機能の動作または構造が進化する可能性があるためです。この段階でのあなたのフィードバックは、最終リリース前の機能を強化するために非常に重要です。

## Future Flagsを使用した破壊的変更の管理

破壊的変更を導入する場合、現在のメジャーバージョン内で実行し、Future Flagsの背後に隠します。たとえば、`v2`にいる場合、破壊的変更は`v3_somethingDifferent`というFuture Flagsの下に配置される場合があります。

```ts filename=vite.config.ts lines=[7-9]
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_someFeature: true,
      },
    }),
  ],
});
```

- 既存の`v2`の動作と新しい`v3_somethingDifferent`の動作は、同時に共存します。
- アプリケーションは、次のメジャーリリースですべての変更を一括して調整するのではなく、段階的に1ステップずつ変更を導入できます。
- すべての`v3_*` Future Flagsが有効になっている場合、`v3`への移行は、理想的にはコードベースに変更を加える必要がないはずです。
- 破壊的変更をもたらす一部のFuture Flagsは、最初は`unstable_*`フラグとして開始されます。これらは、マイナーリリース中に変更される場合があります。`v3_*` Future Flagsになると、対応するAPIは設定され、さらに変更されません。

## 現在のFuture Flags

現在、Remix v2に存在する次のFuture Flagsは、Remix v3のデフォルトの動作になります。

- **`v3_fetcherPersist`**: 2つの方法でフェッチャーの永続性/クリーンアップの動作を変更します([RFC][fetcherpersist-rfc]):
  - フェッチャーは、アンマウント時に削除されなくなり、`idle`状態に戻るまで[`useFetchers`][use-fetchers]を通じて公開され続けます。
  - マウントされたまま完了したフェッチャーは、[`useFetchers`][use-fetchers]に永続的に保存されなくなりました。これは、[`useFetcher`][use-fetcher]を介してこれらのフェッチャーにアクセスできるためです。
- **`v3_relativeSplatPath`**: スプラットルートでのバグのある相対パス解決を修正します。詳細については、[React Routerのドキュメント][relativesplatpath]を参照してください。
- **`v3_throwAbortReason`**: サーバー側のリクエストが中止されると、Remixは`new Error("query() call aborted...")`などのエラーではなく、`request.signal.reason`をスローします。
- **`unstable_singleFetch`**: [Single Fetch][single-fetch]の動作をオプトインします。

## まとめ

私たちの開発戦略は、主要なリリースの段階的な機能導入とシームレスなバージョンアップグレードに焦点を当てています。これにより、開発者は新しい機能を選択的に統合し、バージョン移行中に大規模なコード調整を行う必要がなくなります。`unstable_*`フラグを通じて機能を導入することで、アーリーアダプターと協力してAPIを洗練し、安定したリリースが強化された機能の恩恵を受けるようにします。`v3_*`フラグを使用した破壊的変更の慎重な管理を通じて、段階的に変更を採用し、メジャーバージョン間の移行をよりスムーズにする柔軟性を提供しています。これにより、Remixフレームワークの開発は複雑になりますが、この開発者中心のアプローチにより、Remixを使用したアプリケーション開発が大幅に簡素化され、最終的にはソフトウェア品質の向上と（願わくは！）開発者の満足度に繋がります。

[vite-config-future]: ../file-conventions/vite-config#future
[remix-config-future]: ../file-conventions/remix-config#future
[fetcherpersist-rfc]: https://github.com/remix-run/remix/discussions/7698
[use-fetchers]: ../hooks/use-fetchers
[use-fetcher]: ../hooks/use-fetcher
[relativesplatpath]: https://reactrouter.com/en/main/hooks/use-resolved-path#splat-paths
[single-fetch]: ../guides/single-fetch


