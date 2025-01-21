---
title: デプロイ
hidden: true
---

# デプロイ

<docs-warning>
  このドキュメントは作成中のものであり、デプロイガイドに移動されます。
</docs-warning>

React Router は次の2つの方法でデプロイできます。

- フルスタックホスティング
- 静的ホスティング

React と React Router のメリットを最大限に活用するには、フルスタックホスティングをお勧めします。

## フルスタックホスティング

フルスタックホスティングプロバイダーにデプロイすることで、React と React Router を最大限に活用できます。

### Cloudflare

このボタンをクリックして、GitHubアカウントでスタータープロジェクトを自動的にデプロイします。

[![Cloudflare にデプロイ][cloudflare_button]][cloudflare]

このテンプレートには以下が含まれます。

- Cloudflare D1 を使用した SQL データベース
- Cloudflare KV を使用したキーバリューストレージ
- Cloudflare R2 を使用したアセットのアップロードとストレージ
- Cloudflare Images を使用した画像のアップロード、ストレージ、最適化された `<Image/>` コンポーネント

[ライブで見る →](https://react-router-template.pages.dev)

### Epic Stack (Fly.io)

Epic Stack テンプレートから開始し、README の指示に従ってください。

```
npx degit @epicweb-dev/template my-app
```

このマキシマリストテンプレートには、以下を含む多くのものが含まれています。

- Fly.io でのリージョンホスティング
- LiteFS と Prisma を使用したマルチリージョン分散 SQLite データベース
- 画像ホスティング
- Sentry によるエラー監視
- 実行中のアプリの Grafana ダッシュボード
- GitHub actions を使用した CI
- 権限による認証
- 完全なユニット/統合テスト設定
- Resend を使用したトランザクションメール

[ライブで見る →](https://react-router-template.fly.dev)

### Ion (AWS)

ion テンプレートから開始し、README の指示に従ってください。

```
npx degit @sst/react-template my-app
```

このテンプレートには以下が含まれます。

- DynamoDB を使用したデータ永続化
- Amazon SQS を使用した遅延ジョブ
- S3 を使用した画像のアップロード、ストレージ、最適化された `<Image/>` コンポーネント
- S3 を使用したアセットのアップロードとストレージ

[ライブで見る →](#TODO)

### Netlify

このボタンをクリックして、GitHubアカウントでスタータープロジェクトを自動的にデプロイします。

[![Netlify にデプロイ][netlify_button]][netlify_spa]

このテンプレートには以下が含まれます。

- Supabase との統合
- `<Image/>` と Netlify Image CDN を使用した最適化された画像変換

[ライブで見る →](#TODO)

### Vercel

このボタンをクリックして、GitHubアカウントでスタータープロジェクトを自動的にデプロイします。

[![Vercel にデプロイ][vercel_button]][vercel_spa]

このテンプレートには以下が含まれます。

- Vercel Postgres を使用した Postgres データベース統合
- `<Image/>` と Vercel images を使用した最適化された画像変換
- 静的に事前レンダリングされたルートの ISR

[ライブで見る →](#TODO)

### 手動フルスタックデプロイ

独自のサーバーまたは別のホスティングプロバイダーにデプロイする場合は、[手動デプロイ](../how-to/manual-deployment)ガイドを参照してください。

## 静的ホスティング

React Router はサーバーを必要とせず、任意の静的ホスティングプロバイダーで実行できます。

### 人気のある静的ホスティングプロバイダー

次の「今すぐデプロイ」ボタンから開始できます。

[![SPA Cloudflare にデプロイ][cloudflare_button]][cloudflare_spa]

[![Netlify SPA にデプロイ][netlify_button]][netlify_spa]

[![Vercel SPA にデプロイ][vercel_button]][vercel_spa]

### 手動静的ホスティング

Vite 設定で `ssr` フラグが `false` であることを確認してください。

```ts
import react from "@react-router/dev/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react({ ssr: false })],
});
```

アプリをビルドします。

```shellscript
npx vite build
```

次に、`build/client` フォルダーを任意の静的ホストにデプロイします。

すべてのリクエストが `index.html` にルーティングされるようにする必要があります。これはホスト/サーバーごとに異なるため、ホスト/サーバーでその方法を見つける必要があります。

[netlify_button]: https://www.netlify.com/img/deploy/button.svg
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify-spa
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify
[vercel_button]: https://vercel.com/button
[vercel_spa]: https://vercel.com/new/clone?repository-url=https://github.com/ryanflorence/templates/tree/main/vercel-spa
[cloudflare_button]: https://deploy.workers.cloudflare.com/button
[cloudflare_spa]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare-spa
[cloudflare]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare

