---
title: デプロイ
order: 8
new: true
---

# デプロイ

React Router は、2 つの方法でデプロイできます。

- フルスタックホスティング
- 静的ホスティング

React と React Router を最大限に活用するには、フルスタックホスティングをお勧めします。

## フルスタックホスティング

フルスタックホスティングプロバイダーにデプロイすると、React と React Router を最大限に活用できます。

### Cloudflare

このボタンをクリックして、GitHub アカウントでスタータープロジェクトを自動的にデプロイします。

[![Cloudflare にデプロイ][cloudflare_button]][cloudflare]

このテンプレートには、次のものが含まれています。

- Cloudflare D1 を使用した SQL データベース
- Cloudflare KV を使用したキーバリューストレージ
- Cloudflare R2 を使用したアセットのアップロードとストレージ
- Cloudflare Images を使用した画像のアップロード、ストレージ、および最適化された `<Image/>` コンポーネント

[ライブで見る →](https://react-router-template.pages.dev)

### Epic Stack (Fly.io)

Epic Stack テンプレートから開始し、README の手順に従ってください。

```
npx degit @epicweb-dev/template my-app
```

この極大主義的なテンプレートには、次のものが含まれていますが、これらに限定されません。

- Fly.io でのリージョナルホスティング
- LiteFS と Prisma を使用した、複数リージョンに分散された SQLite データベース
- 画像ホスティング
- Sentry を使用したエラー監視
- 実行中のアプリケーションの Grafana ダッシュボード
- GitHub アクションを使用した CI
- 権限を使用した認証
- 完全なユニット/統合テストセットアップ
- Resend を使用したトランザクションメール

[ライブで見る →](https://react-router-template.fly.dev)

### Ion (AWS)

ion テンプレートから開始し、README の手順に従ってください。

```
npx degit @sst/react-template my-app
```

このテンプレートには、次のものが含まれています。

- DynamoDB を使用したデータ永続化
- Amazon SQS を使用した遅延ジョブ
- S3 を使用した画像のアップロード、ストレージ、および最適化された `<Image/>` コンポーネント
- S3 を使用したアセットのアップロードとストレージ

[ライブで見る →](#TODO)

### Netlify

このボタンをクリックして、GitHub アカウントでスタータープロジェクトを自動的にデプロイします。

[![Netlify にデプロイ][netlify_button]][netlify_spa]

このテンプレートには、次のものが含まれています。

- Supabase との統合
- `<Image/>` と Netlify Image CDN を使用した最適化された画像変換

[ライブで見る →](#TODO)

### Vercel

このボタンをクリックして、GitHub アカウントでスタータープロジェクトを自動的にデプロイします。

[![Vercel にデプロイ][vercel_button]][vercel_spa]

このテンプレートには、次のものが含まれています。

- Vercel Postgres を使用した Postgres データベース統合
- `<Image/>` と Vercel イメージを使用した最適化された画像変換
- 静的に事前レンダリングされたルートの ISR

[ライブで見る →](#TODO)

### 手動でのフルスタックデプロイ

独自のサーバーまたは別のホスティングプロバイダーにデプロイする場合は、[手動デプロイ](../guides/manual-deployment.md) ガイドを参照してください。

## 静的ホスティング

React Router はサーバーを必要とせず、どの静的ホスティングプロバイダーでも実行できます。

### よく使われる静的ホスティングプロバイダー

次の「今すぐデプロイ」ボタンから開始できます。

[![Cloudflare で SPA をデプロイ][cloudflare_button]][cloudflare_spa]

[![Netlify で SPA をデプロイ][netlify_button]][netlify_spa]

[![Vercel で SPA をデプロイ][vercel_button]][vercel_spa]

### 手動での静的ホスティング

Vite 構成で `ssr` フラグが `false` になっていることを確認してください。

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

すべてのリクエストが `index.html` にルーティングされるようにする必要があります。これはホスト/サーバーによって異なるため、ホスト/サーバーで確認する必要があります。

[netlify_button]: https://www.netlify.com/img/deploy/button.svg
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify-spa
[netlify_spa]: https://app.netlify.com/start/deploy?repository=https://github.com/ryanflorence/templates&create_from_path=netlify
[vercel_button]: https://vercel.com/button
[vercel_spa]: https://vercel.com/new/clone?repository-url=https://github.com/ryanflorence/templates/tree/main/vercel-spa
[cloudflare_button]: https://deploy.workers.cloudflare.com/button
[cloudflare_spa]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare-spa
[cloudflare]: https://deploy.workers.cloudflare.com/?url=https://github.com/ryanflorence/templates/tree/main/cloudflare

