---
title: デプロイ
hidden: true
---

# デプロイ

<docs-warning>
  このドキュメントは開発中であり、デプロイガイドに移されます。
</docs-warning>

React Router は、2 つの方法でデプロイできます。

- フルスタックホスティング
- 静的ホスティング

React と React Router のメリットを最大限に活かすには、フルスタックホスティングをお勧めします。

## フルスタックホスティング

フルスタックホスティングプロバイダーにデプロイすることで、React と React Router を最大限に活用できます。

### Cloudflare

このボタンをクリックして、GitHub アカウントを使用してスタータープロジェクトを自動的にデプロイします。

[![Cloudflare にデプロイ][cloudflare_button]][cloudflare]

このテンプレートには次のものが含まれています。

- Cloudflare D1 を使用した SQL データベース
- Cloudflare KV を使用したキーバリューストレージ
- Cloudflare R2 を使用したアセットのアップロードとストレージ
- Cloudflare Images を使用した画像のアップロード、ストレージ、および最適化された `<Image/>` コンポーネント

[ライブで表示 →](https://react-router-template.pages.dev)

### Epic Stack (Fly.io)

Epic Stack テンプレートで始めて、README の手順に従ってください。

```
npx degit @epicweb-dev/template my-app
```

このマキシマリストテンプレートには、次のものなど、多くのものが含まれています。

- Fly.io でのリージョナルホスティング
- LiteFS と Prisma を使用した、複数リージョンに分散した SQLite データベース
- 画像ホスティング
- Sentry によるエラー監視
- 稼働中のアプリケーションの Grafana ダッシュボード
- GitHub Actions による CI
- 権限を使用した認証
- 完全なユニット/統合テストセットアップ
- Resend を使用したトランザクションメール

[ライブで表示 →](https://react-router-template.fly.dev)

### Ion (AWS)

ion テンプレートで始めて、README の手順に従ってください。

```
npx degit @sst/react-template my-app
```

このテンプレートには次のものが含まれています。

- DynamoDB を使用したデータ永続化
- Amazon SQS を使用した遅延ジョブ
- S3 を使用した画像のアップロード、ストレージ、および最適化された `<Image/>` コンポーネント
- S3 を使用したアセットのアップロードとストレージ

[ライブで表示 →](#TODO)

### Netlify

このボタンをクリックして、GitHub アカウントを使用してスタータープロジェクトを自動的にデプロイします。

[![Netlify にデプロイ][netlify_button]][netlify_spa]

このテンプレートには次のものが含まれています。

- Supabase との統合
- `<Image/>` と Netlify Image CDN を使用した最適化された画像変換

[ライブで表示 →](#TODO)

### Vercel

このボタンをクリックして、GitHub アカウントを使用してスタータープロジェクトを自動的にデプロイします。

[![Vercel にデプロイ][vercel_button]][vercel_spa]

このテンプレートには次のものが含まれています。

- Vercel Postgres を使用した Postgres データベース統合
- `<Image/>` と Vercel 画像を使用した最適化された画像変換
- 静的に事前レンダリングされたルートの ISR

[ライブで表示 →](#TODO)

### 手動フルスタックデプロイメント

独自のサーバーまたは別のホスティングプロバイダーにデプロイする場合は、[手動デプロイメント](../misc/manual-deployment) ガイドを参照してください。

## 静的ホスティング

React Router はサーバーを必要とせず、任意の静的ホスティングプロバイダーで実行できます。

### 人気の静的ホスティングプロバイダー

次の「今すぐデプロイ」ボタンを使用して開始できます。

[![SPA Cloudflare にデプロイ][cloudflare_button]][cloudflare_spa]

[![Netlify SPA にデプロイ][netlify_button]][netlify_spa]

[![Vercel SPA にデプロイ][vercel_button]][vercel_spa]

### 手動静的ホスティング

Vite 設定で `ssr` フラグが `false` になっていることを確認してください。

```ts
import react from "@react-router/dev/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react({ ssr: false })],
});
```

アプリケーションをビルドします。

```shellscript
npx vite build
```

次に、`build/client` フォルダーを任意の静的ホストにデプロイします。

すべてのリクエストが `index.html` にルーティングされるようにする必要があります。これはホスト/サーバーによって異なるため、ホスト/サーバーで方法を調べる必要があります。

[netlify_button]: https://www.netlify.com/img/deploy/button.svg
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify-spa
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify
[vercel_button]: https://vercel.com/button
[vercel_spa]: https://vercel.com/new/clone?repository-url=https://github.com/ryanflorence/templates/tree/main/vercel-spa
[cloudflare_button]: https://deploy.workers.cloudflare.com/button
[cloudflare_spa]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare-spa
[cloudflare]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare

