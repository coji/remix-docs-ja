---
title: シングルページアプリケーション (SPA)
---

# シングルページアプリケーション (SPA)

React Router を使用してシングルページアプリケーションを配信する方法は2つあります。

- **ライブラリとして** - React Router のフレームワーク機能を使用する代わりに、独自の SPA アーキテクチャでライブラリとして使用できます。[React Router をライブラリとして](../start/library/installation)のガイドを参照してください。
- **フレームワークとして** - このガイドではこちらに焦点を当てます。

## 1. サーバーレンダリングを無効にする

サーバーレンダリングはデフォルトで有効になっています。`react-router.config.ts` で `ssr` フラグを `false` に設定して無効にします。

```ts filename=react-router.config.ts lines=[4]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

これを `false` に設定すると、サーバービルドは生成されなくなります。

## 2. クライアントローダーとクライアントアクションを使用する

サーバーレンダリングが無効になっている場合でも、`clientLoader` と `clientAction` を使用してルートデータとミューテーションを管理できます。

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

ビルド時に静的データが既知のパスに対してプリレンダリングを設定することで、初期ページ読み込みを高速化できます。[プリレンダリング](./pre-rendering)を参照して設定してください。

## 4. すべての URL を index.html にリダイレクトする

`react-router build` を実行した後、`build/client` ディレクトリを任意の静的ホストにデプロイします。

どの SPA をデプロイする場合にも共通して、ホストがすべての URL をクライアントビルドの `index.html` にリダイレクトするように構成する必要があります。一部のホストはデフォルトでこれを行いますが、そうでないホストもあります。例として、ホストがこれを実行するために `_redirects` ファイルをサポートしている場合があります。

```
/*    /index.html   200
```

アプリの有効なルートで 404 エラーが発生する場合は、ホストを構成する必要がある可能性があります。

## 重要な注意点

一般的なシングルページアプリケーションは、ほとんど空の `index.html` テンプレートを、空の `<div id="root"></div>` 程度しか含めずに送信します。

対照的に、`react-router build` (サーバーレンダリングが無効) は、ルートとインデックスルートをプリレンダリングします。これは、次のことを意味します。

- 空の div 以上のものを送信できる
- React コンポーネントを使用して、ユーザーが最初に表示するページを生成できる
- UI を変更せずに後でサーバーレンダリングを再度有効にできる

React Router は、その `index.html` ファイルを生成するために、インデックスルートをサーバーレンダリングします。これが、プロジェクトが `@react-router/node` に依存する必要があり、ルートが SSR セーフである必要がある理由です。つまり、サーバーレンダリングが無効になっている場合でも、初期レンダリング中に `window` やその他のブラウザ専用 API を呼び出すことはできません。

