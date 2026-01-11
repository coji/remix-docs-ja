---
title: アクセシビリティ
---

# アクセシビリティ

React Router アプリにおけるアクセシビリティは、一般的なウェブにおけるアクセシビリティとよく似ています。適切なセマンティックマークアップを使用し、[Web Content Accessibility Guidelines (WCAG)][wcag] に従うことで、ほとんどの目標を達成できます。

React Router は、可能な限り特定のアクセシビリティプラクティスをデフォルトとし、そうでない場合には役立つ API を提供します。

## リンク

[MODES: framework, data, declarative]

<br/>
<br/>

[\`<Link>\` component][link] は標準的なアンカータグをレンダリングします。つまり、そのアクセシビリティ動作はブラウザから無料で得られます！

React Router はまた、[\`<NavLink/>\`][navlink] を提供します。これは \`<Link>\` と同じように動作しますが、リンクが現在のページを指している場合に、支援技術にコンテキストを提供します。これはナビゲーションメニューやパンくずリストを構築するのに役立ちます。

## ルーティング

[MODES: framework]

<br/>
<br/>

アプリで [\`<Scripts>\`][scripts] をレンダリングしている場合、クライアントサイドルーティングをユーザーにとってよりアクセシブルにするために、考慮すべきいくつかの重要な点があります。

従来のマルチページウェブサイトでは、ルート変更についてそれほど考える必要はありません。アプリはアンカータグをレンダリングし、ブラウザが残りを処理します。ユーザーが JavaScript を無効にした場合、React Router アプリはデフォルトでこの方法で動作するはずです！

React Router のクライアントスクリプトが読み込まれると、React Router はルーティングを制御し、ブラウザのデフォルトの動作を防ぎます。ルートが変更されても、React Router は UI について何も仮定しません。その結果、考慮すべきいくつかの重要な機能があります。それらは以下の通りです：

- **フォーカスの管理:** ルートが変更されたときに、どの要素がフォーカスを受け取るべきか？これはキーボードユーザーにとって重要であり、スクリーンリーダーユーザーにも役立ちます。
- **ライブリージョンによるアナウンス:** スクリーンリーダーユーザーは、ルートが変更されたときのアナウンスからも恩恵を受けます。変更の性質や読み込みにかかる時間の予想に応じて、特定のトランジション状態中にも通知したい場合があります。

2019年、[Marcy Sutton はユーザー調査を主導し、その結果を発表しました][marcy-sutton-led-and-published-findings-from-user-research]。これは、開発者がアクセシブルなクライアントサイドルーティングエクスペリエンスを構築するのに役立てるためです。

[link]: ../api/components/Link
[navlink]: ../api/components/NavLink
[scripts]: ../api/components/Scripts
[wcag]: https://www.w3.org/WAI/standards-guidelines/wcag/
[marcy-sutton-led-and-published-findings-from-user-research]: https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing