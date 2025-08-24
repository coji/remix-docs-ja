---
title: ブラウザサポート
---

# ブラウザサポート

Remix は、[ES Modules][esm-browsers] をサポートするブラウザでのみ動作します。

通常、この質問をされる際、チームは IE11 のサポートを懸念します。Microsoft 自身が Web アプリケーションに対して [このブラウザのサポートを終了している][msie] ことに注意してください。あなたもそうする時が来たのかもしれません。

しかし、[プログレッシブエンハンスメント][pe] のファーストクラスサポートのおかげで、Remix アプリは Netscape 1.0 のような古いブラウザもサポートできます！これは、Remix が Web の基礎である HTML、HTTP、およびブラウザの動作に基づいて構築されているためです。Remix の規約に従うことで、アプリは IE11 でベースラインレベルで動作し、最新のブラウザでは高度なインタラクティブな SPA エクスペリエンスを提供できます。これを実現するために、あなた自身が多くの労力を費やす必要もありません。

仕組みは次のとおりです。Remix の `<Scripts/>` コンポーネントは、次のようなモジュールスクリプトタグをレンダリングします。

```html
<script type="module" src="..." />
```

古いブラウザは `type` を理解できないため、これを無視し、JavaScript はロードされません。リンク、ローダー、フォーム、およびアクションは、HTML、HTTP、およびブラウザの動作の基礎に基づいて構築されているため、引き続き機能します。最新のブラウザはスクリプトをロードし、より高速なトランジションとアプリケーションコードの強化された UX を備えた、強化された SPA 動作を提供します。

## Remix は CSRF 保護を実装していますか？

Remix の Cookie はデフォルトで `SameSite=Lax` に設定されています。これは CSRF に対するプラットフォーム組み込みの保護です。`SameSite=Lax` をサポートしていない古いブラウザ（IE11 以前）をサポートする必要がある場合は、自分で CSRF 保護を実装するか、それを実装するライブラリを使用する必要があります。

[pe]: https://en.wikipedia.org/wiki/Progressive_enhancement
[esm-browsers]: https://caniuse.com/es6-module
[msie]: https://techcommunity.microsoft.com/t5/microsoft-365-blog/microsoft-365-apps-say-farewell-to-internet-explorer-11-and/ba-p/1591666
