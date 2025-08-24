---
title: CSS in JS
---

# CSS in JS ライブラリ

Styled Components や Emotion のような CSS-in-JS ライブラリを使用できます。これらのライブラリの中には、サーバーレンダリング中にコンポーネントツリーからスタイルを抽出するために「二重レンダリング」を必要とするものがあります。

各ライブラリの統合方法は異なるため、最も人気のある CSS-in-JS ライブラリの使用方法については、[examples リポジトリ][examples] を参照してください。もし、まだカバーされていないライブラリでうまく動作するものがあれば、ぜひ[例を貢献してください][examples]！

<docs-warning>
ほとんどの CSS-in-JS のアプローチは、スタイルが何であるかを知る前にアプリを完全にレンダリングする必要があるため、Remix での使用は推奨されません。これはパフォーマンス上の問題であり、defer のようなストリーミング機能を妨げます。
</docs-warning>

[examples]: https://github.com/remix-run/examples
