---
title: Hydration
hidden: true
---

`HydrateFallback`の動作に関するいくつかのニュアンスに注意する価値があります。

- これは最初のドキュメントリクエストとhydrationでのみ関連し、その後のクライアントサイドナビゲーションではレンダリングされません。
- これは、特定のルートで[`clientLoader.hydrate=true`][hydrate-true]を設定している場合にのみ関連します。
- サーバー側の`loader`を持たずに`clientLoader`を持っている場合にも関連します。これは、`useLoaderData`から返すローダーデータがないため、`clientLoader.hydrate=true`を意味します。
  - この場合でも`HydrateFallback`を指定しないと、React Routerはルートコンポーネントをレンダリングせず、祖先の`HydrateFallback`コンポーネントまでバブルアップします。
  - これは`useLoaderData`を「ハッピーパス」に保つためです。
  - サーバー側の`loader`がない場合、`useLoaderData`はレンダリングされたルートコンポーネントで`undefined`を返します。
- 子ルートの祖先ローダーデータがhydration時に`clientLoader`関数を実行している場合（つまり、`useRouteLoaderData()`や`useMatches()`などのユースケース）、正しく動作する保証がないため、`HydrateFallback`内に`<Outlet/>`をレンダリングすることはできません。


[hydrate-true]: (仮のリンク。必要に応じて適切なリンクに置き換えてください)

