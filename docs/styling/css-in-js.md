---
title: CSS in JS
---

# CSS in JS ライブラリ

Styled Components や Emotion などの CSS-in-JS ライブラリを使用できます。これらのライブラリの中には、サーバー側のレンダリング中にコンポーネントツリーからスタイルを抽出するために、"ダブルレンダリング" を必要とするものがあります。

各ライブラリは異なる方法で統合されるため、最も人気のある CSS-in-JS ライブラリの使用方法については、[例リポジトリ][examples] を参照してください。うまく機能するライブラリがまだカバーされていない場合は、[例を追加してください][examples]！

<docs-warning>
ほとんどの CSS-in-JS アプローチは、Remix での使用は推奨されません。なぜなら、これらのアプローチは、スタイルが何であるかを認識する前にアプリを完全にレンダリングする必要があるからです。これはパフォーマンス上の問題であり、defer などのストリーミング機能を妨げます。
</docs-warning>

[examples]: https://github.com/remix-run/examples
