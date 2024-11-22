---
title: デプロイ
hidden: true
---

# デプロイ

<docs-warning>
  このドキュメントは現在作成中です。デプロイガイドに移動されます。
</docs-warning>

React Routerは2つの方法でデプロイできます。

- フルスタックホスティング
- スタティックホスティング

ReactとReact Routerのメリットを最大限に活かすには、フルスタックホスティングをお勧めします。

## フルスタックホスティング

フルスタックホスティングプロバイダーにデプロイすることで、ReactとReact Routerを最大限に活用できます。

### Cloudflare

このボタンをクリックして、GitHubアカウントを使用してスタータープロジェクトを自動的にデプロイします。

[![Deploy to Cloudflare][cloudflare_button]][cloudflare]

このテンプレートには以下が含まれています。

- Cloudflare D1を使用したSQLデータベース
- Cloudflare KVを使用したキーバリューストレージ
- Cloudflare R2を使用したアセットのアップロードとストレージ
- Cloudflare Imagesを使用した画像のアップロード、ストレージ、最適化された`<Image/>`コンポーネント

[ライブで確認 →](https://react-router-template.pages.dev)

### Epic Stack (Fly.io)

Epic Stackテンプレートから開始し、READMEの手順に従ってください。

```
npx degit @epicweb-dev/template my-app
```

この最大限のテンプレートには、以下を含む多くのものが含まれています（これらに限定されません）。

- Fly.ioでのリージョンホスティング
- LiteFSとPrismaを使用したマルチリージョン、分散型SQLiteデータベース
- 画像ホスティング
- Sentryを使用したエラー監視
- 実行中のアプリのGrafanaダッシュボード
- GitHub Actionsを使用したCI
- 権限付き認証
- 完全なユニット/統合テスト設定
- Resendを使用したトランザクションメール

[ライブで確認 →](https://react-router-template.fly.dev)

### Ion (AWS)

ionテンプレートから開始し、READMEの手順に従ってください。

```
npx degit @sst/react-template my-app
```

このテンプレートには以下が含まれています。

- DynamoDBを使用したデータ永続化
- Amazon SQSを使用した遅延ジョブ
- S3を使用した画像のアップロード、ストレージ、最適化された`<Image/>`コンポーネント
- S3を使用したアセットのアップロードとストレージ

[ライブで確認 →](#TODO)

### Netlify

このボタンをクリックして、GitHubアカウントを使用してスタータープロジェクトを自動的にデプロイします。

[![Deploy to Netlify][netlify_button]][netlify_spa]

このテンプレートには以下が含まれています。

- Supabaseとの統合
- `<Image/>`とNetlify Image CDNを使用した最適化された画像変換

[ライブで確認 →](#TODO)

### Vercel

このボタンをクリックして、GitHubアカウントを使用してスタータープロジェクトを自動的にデプロイします。

[![Deploy to Vercel][vercel_button]][vercel_spa]

このテンプレートには以下が含まれています。

- Vercel Postgresを使用したPostgresデータベース統合
- `<Image/>`とVercel Imagesを使用した最適化された画像変換
- 静的にプリレンダリングされたルートのISR

[ライブで確認 →](#TODO)

### 手動によるフルスタックデプロイ

独自のサーバーまたは別のホスティングプロバイダーにデプロイする場合は、[手動デプロイ](../how-to/manual-deployment)ガイドを参照してください。

## スタティックホスティング

React Routerはサーバーを必要とせず、任意のスタティックホスティングプロバイダーで実行できます。

### 一般的なスタティックホスティングプロバイダー

次の「今すぐデプロイ」ボタンを使用して開始できます。

[![Deploy SPA Cloudflare][cloudflare_button]][cloudflare_spa]

[![Deploy Netlify SPA][netlify_button]][netlify_spa]

[![Deploy Vercel SPA][vercel_button]][vercel_spa]

### 手動によるスタティックホスティング

Vite設定で`ssr`フラグが`false`であることを確認します。

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

その後、`build/client`フォルダーを任意のスタティックホストにデプロイします。

すべてのリクエストが`index.html`にルーティングされるようにする必要があります。これはホスト/サーバーによって異なるため、ホスト/サーバーで方法を確認する必要があります。

[netlify_button]: https://www.netlify.com/img/deploy/button.svg
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify-spa
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify
[vercel_button]: https://vercel.com/button
[vercel_spa]: https://vercel.com/new/clone?repository-url=https://github.com/ryanflorence/templates/tree/main/vercel-spa
[cloudflare_button]: https://deploy.workers.cloudflare.com/button
[cloudflare_spa]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare-spa
[cloudflare]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare


