---
title: アクセシビリティ
---

# アクセシビリティ

React Routerアプリにおけるアクセシビリティは、一般的なウェブにおけるアクセシビリティと非常によく似ています。適切なセマンティックマークアップを使用し、[ウェブコンテンツアクセシビリティガイドライン (WCAG)][wcag]に従うことで、ほとんどの要件を満たすことができます。

React Routerは、可能な限り特定のアクセシビリティプラクティスをデフォルトとし、そうでない場合には役立つAPIを提供します。

## リンク

[MODES: framework, data, declarative]

<br/>
<br/>

[`<Link>`コンポーネント][link]は標準のアンカータグをレンダリングするため、そのアクセシビリティ動作はブラウザから無料で得られます！

React Routerは[`<NavLink/>`][navlink]も提供しており、これは`<Link>`と同じように動作しますが、リンクが現在のページを指している場合に支援技術にコンテキストを提供します。これはナビゲーションメニューやパンくずリストを構築するのに役立ちます。

## ルーティング

[MODES: framework]

<br/>
<br/>

アプリで[`<Scripts>`][scripts]をレンダリングしている場合、クライアントサイドルーティングをユーザーにとってよりアクセスしやすくするために考慮すべき重要な点がいくつかあります。

従来のマルチページウェブサイトでは、ルートの変更についてあまり考える必要はありません。アプリがアンカータグをレンダリングし、残りはブラウザが処理します。ユーザーがJavaScriptを無効にしている場合、React Routerアプリはデフォルトでこの方法で動作するはずです！

React Routerのクライアントスクリプトがロードされると、React Routerがルーティングを制御し、ブラウザのデフォルトの動作を阻止します。React Routerは、ルートが変更されたときのUIについて何の仮定も置きません。その結果、考慮すべき重要な機能がいくつかあります。これには以下が含まれます。

- **フォーカス管理:** ルートが変更されたときにどの要素がフォーカスを受け取るか？これはキーボードユーザーにとって重要であり、スクリーンリーダーユーザーにとっても役立ちます。
- **ライブリージョンアナウンス:** スクリーンリーダーユーザーは、ルートが変更されたときのアナウンスからも恩恵を受けます。変更の性質やロードにかかる予想時間によっては、特定の遷移状態中にも通知したい場合があります。

2019年、[Marcy Suttonはユーザー調査を主導し、その結果を公開しました][marcy-sutton-led-and-published-findings-from-user-research]。これは開発者がアクセスしやすいクライアントサイドルーティング体験を構築するのに役立ちます。

[link]: ../api/components/Link
[navlink]: ../api/components/NavLink
[scripts]: ../api/components/Scripts
[wcag]: https://www.w3.org/WAI/standards-guidelines/wcag/
[marcy-sutton-led-and-published-findings-from-user-research]: https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing