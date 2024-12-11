---
title: シングルページアプリケーション (SPA)
---

# シングルページアプリケーション (SPA)

React Router を使用してシングルページアプリケーションを配信するには、2 つの方法があります。

- **ライブラリとして** - React Router のフレームワーク機能を使用する代わりに、独自の SPA アーキテクチャでライブラリとして使用できます。[React Router をライブラリとして](../start/library/installation)使用するガイドを参照してください。
- **フレームワークとして** - このガイドではこちらに焦点を当てます。

## 1. サーバーサイドレンダリングの無効化

サーバーサイドレンダリングはデフォルトで有効になっています。`react-router.config.ts` で `ssr` フラグを `false` に設定して無効にします。

```ts filename=react-router.config.ts lines=[4]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

これを `false` に設定すると、サーバー側のビルドは生成されなくなります。

## 2. クライアントローダーとクライアントアクションの使用

サーバーサイドレンダリングが無効になっている場合でも、`clientLoader` と `clientAction` を使用して、ルートデータとミューテーションを管理できます。

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

ビルド時に既知の静的データを持つパスに対して、プリレンダリングを設定して、初期ページの読み込み速度を向上させることができます。設定方法については、[プリレンダリング](./pre-rendering)を参照してください。

## 4. すべてのURLをindex.htmlにリダイレクト

`react-router build` を実行した後、`build/client` ディレクトリを任意の静的ホストにデプロイします。

任意の SPA をデプロイする場合と同様に、すべての URL をクライアントビルドの `index.html` にリダイレクトするようにホストを構成する必要があります。一部のホストではデフォルトでこれを実行しますが、そうでないホストもあります。例として、ホストは `_redirects` ファイルをサポートしてこれを実行する場合があります。

```
/*    /index.html   200
```

アプリケーションの有効なルートで 404 エラーが発生する場合は、ホストを構成する必要がある可能性があります。

## 重要な注意

一般的なシングルページアプリケーションは、ほとんど空の `<div id="root"></div>` 以上のものがない、ほとんど空白の `index.html` テンプレートを送信します。

これとは対照的に、`react-router build`（サーバーサイドレンダリングが無効になっている場合）はルートとインデックスルートをプリレンダリングします。つまり、次のことができます。

- 空の div 以上のものを送信する
- ユーザーが表示する最初のページを生成するために React コンポーネントを使用する
- UI を変更せずにサーバーサイドレンダリングを後で再度有効にする

これが、プロジェクトで `@react-router/node` の依存関係が必要な理由でもあります。

