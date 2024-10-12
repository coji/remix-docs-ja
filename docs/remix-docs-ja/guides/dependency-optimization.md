---
title: 依存関係の最適化
---

<docs-info>この機能は開発にのみ影響します。本番ビルドには影響しません。</docs-info>

# 依存関係の最適化

Remix は、`future.unstable_optimizeDeps` [将来のフラグ][future-flags] の背後にある開発時に自動依存関係の最適化を導入しました。これにより、将来的に Remix のあるバージョンでデフォルトになるこの動作を選択できます。つまり、React Router ([1][rr-v7]、[2][rr-v7-2]) になります。このフラグは、React Router v7 では「不安定」なままにすることを意図しています。これは、フラグの採用を容易にするために、追加のバインディング関連の作業がいくつか予定されているためです。v7 でその作業が完了したら、フラグを安定化させる予定です。

開発時、Vite は [依存関係を事前にバンドルする][prebundle-dependencies] ことを目指しています。これにより、それらの依存関係をオンデマンドで効率的に提供できます。
そのため、Vite はアプリのモジュールグラフをクロールして依存関係を探す開始点を認識する必要があります。

以前は、Remix は Vite にルートモジュールやクライアントエントリで依存関係の検出を開始するように指示していませんでした。
つまり、開発では、アプリ内を移動するたびに Vite は新しい依存関係に遭遇し、`504 Outdated Dependency` エラーが発生しました。
その結果、開発エクスペリエンスは時折ぎこちなく感じる可能性がありました。これらのエラーが HMR の破損やリンクナビゲーションの中断を引き起こす可能性があったためです。
依存関係を対話的に処理することが遅くなることもあったため、ナビゲーションが遅くなることもありました。

詳細については、[Vite の依存関係の最適化オプション][vite-s-dep-optimization-options] を参照してください。

## トラブルシューティング

### `パッケージのエントリを解決できませんでした`

```txt
✘ [ERROR] パッケージ "<package>" のエントリを解決できませんでした。パッケージの package.json には、正しくない main/module/exports が指定されている可能性があります。 [plugin vite:dep-pre-bundle]
```

これは通常、構成が誤った依存関係が原因です。
[publint][publint] を使用して、問題のあるパッケージの構成が誤っているかどうかを確認します。
問題を解決するには、`npm why` または `pnpm why` を使用して、`optimizeDeps.exclude` に追加する直接依存関係を特定する必要があります。

たとえば、アプリで次のエラーが発生しているとします。

```txt
✘ [ERROR] パッケージ "jimp" のエントリを解決できませんでした。パッケージの package.json には、正しくない main/module/exports が指定されている可能性があります。 [plugin vite:dep-pre-bundle]
```

確かに、`publint` は [`jimp` パッケージの構成が誤っている][jimp-package-is-misconfigured] ことを報告しています。
次に、`jimp` は `svg2img` 直接依存関係によって引き込まれている間接依存関係であることを確認します。

```sh
❯ npm why jimp
jimp@0.16.13
node_modules/jimp
  jimp@"^0.16.1" from svg2img@1.0.0-beta.2
  node_modules/svg2img
    svg2img@"^1.0.0-beta.2" from the root project
```

最後に、`optimizeDeps.exclude` に `svg2img` を追加すると、問題が解決するはずです。

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


