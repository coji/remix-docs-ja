---
title: シングルページアプリ (SPA)
---

# シングルページアプリ (SPA)

React Routerでシングルページアプリを配信する方法は2つあります。

- **ライブラリとして** - React Routerのフレームワーク機能を使用する代わりに、独自のSPAアーキテクチャでライブラリとして使用できます。[React Routerをライブラリとして](../start/library/installation)のガイドを参照してください。
- **フレームワークとして** - このガイドではこちらに焦点を当てます。

## 1. サーバーレンダリングを無効にする

サーバーレンダリングはデフォルトで有効になっています。`react-router.config.ts`で `ssr` フラグを `false` に設定して無効にします。

```ts filename=react-router.config.ts lines=[4]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

これを `false` に設定すると、サーバービルドは生成されなくなります。

## 2. クライアントローダーとクライアントアクションを使用する

サーバーレンダリングを無効にしても、`clientLoader` と `clientAction` を使用してルートデータと変更を管理できます。

```tsx filename=some-route.tsx
import { Route } from "./+types/some-route";

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
  let data = await fetch(`/some/api/stuff/${params.id}`);
  return data;
}

export async function clientAction({
  request,
}: Route.ClientActionArgs) {
  let formData = await request.formData();
  return await processPayment(formData);
}
```

## 3. プリレンダリング

初期ページ読み込みを高速化するために、ビルド時に静的データがわかっているパスに対してプリレンダリングを構成できます。[プリレンダリング](./pre-rendering) を参照して設定してください。

## 4. すべてのURLをindex.htmlにリダイレクトする

`react-router build` を実行した後、`build/client` ディレクトリを任意の静的ホストにデプロイします。

SPAをデプロイする場合によくあることですが、ホストを設定してすべてのURLをクライアントビルドの `index.html` にリダイレクトする必要があります。一部のホストはこれをデフォルトで行いますが、そうでないホストもあります。例として、ホストがこれを実行するために `_redirects` ファイルをサポートしている場合があります。

```
/*    /index.html   200
```

アプリの有効なルートで404エラーが発生する場合は、ホストの設定が必要な可能性があります。

## 重要な注意点

典型的なシングルページアプリは、ほとんど空の `index.html` テンプレートと、空の `<div id="root"></div>` 程度しか送信しません。

対照的に、`react-router build` (サーバーレンダリングを無効にした状態) は、ルートとインデックスルートをプリレンダリングします。これは、次のことができることを意味します。

- 空のdiv以上のものを送信できる
- Reactコンポーネントを使用して、ユーザーが最初に表示するページを生成できる
- UIを変更せずに後でサーバーレンダリングを再度有効にできる

React Routerは、`index.html`ファイルを生成するためにインデックスルートをサーバーレンダリングします。そのため、プロジェクトは依然として `@react-router/node` に依存する必要があり、ルートはSSRセーフである必要があります。つまり、サーバーレンダリングが無効になっている場合でも、初期レンダリング中に `window` やその他のブラウザのみのAPIを呼び出すことはできません。

