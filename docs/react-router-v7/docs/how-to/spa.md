---
title: シングルページアプリケーション (SPA)
---

# シングルページアプリケーション (SPA)

React Router を使用してシングルページアプリケーションを構築するには、2 つの方法があります。

- **ライブラリとして** - React Router のフレームワーク機能を使用する代わりに、独自の SPA アーキテクチャでライブラリとして使用できます。[React Router as a Library](../start/library/installation) のガイドを参照してください。
- **フレームワークとして** - このガイドでは、こちらに焦点を当てます。

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

サーバーサイドレンダリングが無効になっている場合でも、`clientLoader` と `clientAction` を使用してルートデータとミューテーションを管理できます。

```tsx filename=some-route.tsx
import { Route } from "./+types/some-route";

export async function clientLoader(
  _: Route.ClientLoaderArgs
) {
  let data = await fetch("/some/api/stuff");
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

ビルド時に既知の静的データを持つパスに対して、プリレンダリングを設定して、最初のページの読み込み速度を向上させることができます。設定方法については、[プリレンダリング](./pre-rendering) を参照してください。

## 4. すべての URL を index.html にリダイレクト

`react-router build` を実行した後、`build/client` ディレクトリを任意の静的ホストにデプロイします。

ほとんどの SPA のデプロイと同様に、ホストでクライアントビルドの `index.html` にすべての URL をリダイレクトするように設定する必要があります。一部のホストではデフォルトでこれが行われますが、そうでないホストもあります。例として、ホストは `_redirects` ファイルをサポートしてこれを行う場合があります。

```
/*    /index.html   200
```

アプリケーションの有効なルートで 404 エラーが発生する場合は、ホストの設定を確認する必要があります。

## 重要な注意

一般的なシングルページアプリケーションは、ほとんど空の `<div id="root"></div>` 以外のほとんど何も含まない、ほぼ空の `index.html` テンプレートを送信します。

これに対して、`react-router build`（サーバーサイドレンダリングが無効になっている場合）は、ルートとインデックスルートをプリレンダリングします。つまり、次のことができます。

- 空の div 以上を送信する
- ユーザーが最初に表示するページを生成するために React コンポーネントを使用する
- UI を変更せずに後でサーバーサイドレンダリングを有効にする

そのため、プロジェクトには `@react-router/node` の依存関係が必要なままです。

