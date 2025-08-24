---
title: 依存関係の最適化
---

<docs-info>この機能は開発環境にのみ影響します。本番ビルドには影響しません。</docs-info>

# 依存関係の最適化

Remix は、開発環境における依存関係の自動最適化を `future.unstable_optimizeDeps` [Future Flag][future-flags] の背後で導入しました。これにより、この動作をオプトインできます。これは、Remix の将来のバージョン（つまり、React Router ([1][rr-v7], [2][rr-v7-2])）で最終的にデフォルトになる予定です。このフラグは、バンドル関連の追加作業が予定されており、フラグの採用が容易になるため、React Router v7 まで「不安定」な状態を維持する予定です。v7 でその作業が完了したら、フラグを安定化する予定です。

開発環境では、Vite はオンデマンドで依存関係を効率的に提供できるように、[依存関係をプリバンドル][prebundle-dependencies]することを目指しています。
これを行うために、Vite は依存関係を探すためにアプリのモジュールグラフのクロールを開始する場所を知る必要があります。

以前は、Remix は Vite にルートモジュールやクライアントエントリで依存関係の検出を開始するように指示していませんでした。
つまり、開発環境では、アプリ内を移動するにつれて Vite が新しい依存関係に遭遇し、`504 Outdated Dependency` エラーが発生していました。
その結果、これらのエラーによって HMR が中断したり、リンクナビゲーションが中止されたりする可能性があるため、開発エクスペリエンスが時々ぎこちなく感じられることがありました。
また、依存関係をインタラクティブに処理すると遅くなる場合があるため、ナビゲーションが遅く感じることもありました。

詳細については、[Vite の依存関係最適化オプション][vite-s-dep-optimization-options]を参照してください。

## トラブルシューティング

### `Failed to resolve entry for package`

```txt
✘ [ERROR] Failed to resolve entry for package "<package>". The package may have incorrect main/module/exports specified in its package.json. [plugin vite:dep-pre-bundle]
```

これは通常、構成が誤った依存関係によって発生します。
[publint][publint] を使用して、問題のあるパッケージの構成が誤っているかどうかを確認できます。
問題を解決するには、`npm why` または `pnpm why` を使用して、`optimizeDeps.exclude` に追加する直接の依存関係を特定する必要があります。

たとえば、アプリで次のエラーが発生しているとします。

```txt
✘ [ERROR] Failed to resolve entry for package "jimp". The package may have incorrect main/module/exports specified in its package.json. [plugin vite:dep-pre-bundle]
```

案の定、`publint` は [`jimp` パッケージの構成が誤っている][jimp-package-is-misconfigured]と報告しています。
次に、`jimp` が `svg2img` 直接依存関係によってプルインされている間接的な依存関係であることを特定します。

```sh
❯ npm why jimp
jimp@0.16.13
node_modules/jimp
  jimp@"^0.16.1" from svg2img@1.0.0-beta.2
  node_modules/svg2img
    svg2img@"^1.0.0-beta.2" from the root project
```

最後に、`svg2img` を `optimizeDeps.exclude` に追加すると、問題が解決するはずです。

```ts filename=vite.config.ts
export default defineConfig({
  optimizeDeps: {
    exclude: ["svg2img"],
  },
});
```

[future-flags]: ../guides/api-development-strategy
[rr-v7]: https://remix.run/blog/merging-remix-and-react-router
[rr-v7-2]: https://remix.run/blog/incremental-path-to-react-19
[prebundle-dependencies]: https://vitejs.dev/guide/dep-pre-bundling.html
[vite-s-dep-optimization-options]: https://vitejs.dev/config/dep-optimization-options#dep-optimization-options
[publint]: https://publint.dev
[jimp-package-is-misconfigured]: https://publint.dev/jimp@0.22.12
