---
title: 依存関係の最適化
---

<docs-info>この機能は開発にのみ影響し、本番ビルドには影響しません。</docs-info>

# 依存関係の最適化

Remixは開発環境で、`future.unstable_optimizeDeps` [将来の機能フラグ][future-flags] によって自動的な依存関係の最適化を導入しました。
これにより、この動作を選択することができます。これは、Remixの次のメジャーバージョン（別名React Router v7 ([1][rr-v7]、[2][rr-v7-2]）でデフォルトになります。

開発では、Viteは[依存関係を事前にバンドルする][prebundle-dependencies]ことを目指しており、それにより、それらの依存関係をオンデマンドで効率的に提供することができます。
そのためには、Viteはアプリのモジュールグラフのどこから依存関係を探索するかを知る必要があります。

以前は、RemixはViteに、ルートモジュールやクライアントエントリで依存関係の検出を開始するように指示していませんでした。
つまり、開発では、アプリ内を移動するとViteは新しい依存関係に出くわし、`504 Outdated Dependency`エラーが発生していました。
その結果、開発体験は、これらのエラーがHMRを壊したり、リンクナビゲーションを中止させたりすることがあるため、時折ぎくしゃくしているように感じられる可能性がありました。
また、依存関係をインタラクティブに処理することが遅くなる場合があり、ナビゲーションも遅くなる可能性がありました。

詳細については、[Viteの依存関係最適化オプション][vite-s-dep-optimization-options]を参照してください。

## トラブルシューティング

### `Failed to resolve entry for package`

```txt
✘ [ERROR] Failed to resolve entry for package "<package>". The package may have incorrect main/module/exports specified in its package.json. [plugin vite:dep-pre-bundle]
```

これは通常、依存関係の構成ミスが原因です。
[publint][publint]を使用して、問題の依存関係が誤って構成されているかどうかを確認できます。
この問題を解決するには、`npm why`または`pnpm why`を使用して、どの直接依存関係を`optimizeDeps.exclude`に追加するかを判断する必要があります。

たとえば、アプリが次のエラーを発生しているとします。

```txt
✘ [ERROR] Failed to resolve entry for package "jimp". The package may have incorrect main/module/exports specified in its package.json. [plugin vite:dep-pre-bundle]
```

確かに、`publint`は[`jimp`パッケージが誤って構成されていると報告しています][jimp-package-is-misconfigured]。
次に、`jimp`が`svg2img`の直接依存関係によって引き込まれている間接的な依存関係であると判断します。

```sh
❯ npm why jimp
jimp@0.16.13
node_modules/jimp
  jimp@"^0.16.1" from svg2img@1.0.0-beta.2
  node_modules/svg2img
    svg2img@"^1.0.0-beta.2" from the root project
```

最後に、`optimizeDeps.exclude`に`svg2img`を追加すると、この問題が解決されます。

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



