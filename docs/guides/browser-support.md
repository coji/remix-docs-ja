---
title: ブラウザサポート
---

# ブラウザサポート

Remix は、[ES モジュール][esm-browsers] をサポートするブラウザでのみ動作します。

通常、チームは、この質問をする際に IE11 のサポートを懸念しています。[マイクロソフト自身も、Web アプリケーション向けのこのブラウザのサポートを終了しました][msie]。おそらく、あなたにとってもそろそろサポートを終了するべきでしょう。

しかし、[プログレッシブエンハンスメント][pe] の強力なサポートのおかげで、Remix アプリは Netscape 1.0 ほど古いブラウザもサポートできます！Remix は、HTML、HTTP、およびブラウザの動作という Web の基盤に基づいて構築されているため、これが可能になります。Remix の慣例に従うことで、アプリは IE11 で基本レベルで動作しながら、最新のブラウザでは高度にインタラクティブな SPA エクスペリエンスを提供できます。この実現には、それほど労力は必要ありません。

仕組みは次のとおりです。Remix の `<Scripts/>` コンポーネントは、次のようなモジュールスクリプトタグをレンダリングします。

```html
<script type="module" src="..." />
```

古いブラウザは `type` を理解できないため、このタグを無視します。そのため、JavaScript はロードされません。リンク、ローダー、フォーム、アクションは、HTML、HTTP、ブラウザの動作という基盤に基づいて構築されているため、引き続き動作します。最新のブラウザはスクリプトをロードし、高速な遷移やアプリケーションコードによる強化された UX を提供することで、SPA 動作を強化します。

## Remix は CSRF 保護を実装していますか？

Remix の Cookie はデフォルトで `SameSite=Lax` に設定されており、これは CSRF に対するプラットフォーム組み込みの保護です。`SameSite=Lax` をサポートしていない古いブラウザ（IE11 以前）をサポートする必要がある場合は、CSRF 保護を自分で実装するか、CSRF 保護を実装しているライブラリを使用する必要があります。

[pe]: https://en.wikipedia.org/wiki/Progressive_enhancement
[esm-browsers]: https://caniuse.com/es6-module
[msie]: https://techcommunity.microsoft.com/t5/microsoft-365-blog/microsoft-365-apps-say-farewell-to-internet-explorer-11-and/ba-p/1591666
