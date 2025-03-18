---
title: ハイドレーション
hidden: true
---

`HydrateFallback` の動作に関して、いくつか注意すべきニュアンスがあります。

- これは、最初のドキュメントリクエストとハイドレーション時のみに関連し、その後のクライアントサイドのナビゲーションではレンダリングされません。
- これは、特定のルートで [`clientLoader.hydrate=true`][hydrate-true] を設定している場合のみに関連します。
- また、サーバーの `loader` なしに `clientLoader` を持つ場合にも関連します。これは、`useLoaderData` から返すローダーデータが他にないため、`clientLoader.hydrate=true` を意味します。
  - この場合、`HydrateFallback` を指定しなくても、React Router はルートコンポーネントをレンダリングせず、祖先の `HydrateFallback` コンポーネントまでバブルアップします。
  - これは、`useLoaderData` が「ハッピーパス」を維持することを保証するためです。
  - サーバーの `loader` がない場合、`useLoaderData` はレンダリングされたルートコンポーネントで `undefined` を返します。
- `HydrateFallback` 内で `<Outlet/>` をレンダリングすることはできません。これは、子ルートがハイドレーション時に `clientLoader` 関数を実行している場合（つまり、`useRouteLoaderData()` や `useMatches()` などのユースケース）、祖先のローダーデータがまだ利用可能でない可能性があるため、正しく動作することを保証できないためです。

[hydrate-true]: (ここにリンクを挿入)

