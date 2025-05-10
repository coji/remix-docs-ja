---
title: デプロイ
order: 10
---

# デプロイ

[MODES: framework]

## はじめに

React Router は次の2つの方法でデプロイできます。

- フルスタックホスティング
- 静的ホスティング

公式の [React Router テンプレート](https://github.com/remix-run/react-router-templates) は、アプリケーションのブートストラップに役立つか、独自のアプリケーションのリファレンスとして使用できます。

静的ホスティングにデプロイする場合、React Router は他の React シングルページアプリケーションと同様にデプロイできます。

## テンプレート

`create-react-router` コマンドを実行した後、README の指示に従ってください。

### Node.js と Docker

```
npx create-react-router@latest --template remix-run/react-router-templates/default
```

- サーバーレンダリング
- Tailwind CSS

コンテナ化されたアプリケーションは、以下を含む Docker をサポートする任意のプラットフォームにデプロイできます。

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Node と Docker (カスタムサーバー)

```
npx create-react-router@latest --template remix-run/react-router-templates/node-custom-server
```

- サーバーレンダリング
- Tailwind CSS
- より詳細な制御のためのカスタム Express サーバー

コンテナ化されたアプリケーションは、以下を含む Docker をサポートする任意のプラットフォームにデプロイできます。

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Node と Docker と Postgres

```
npx create-react-router@latest --template remix-run/react-router-templates/node-postgres
```

- サーバーレンダリング
- Drizzle を使用した Postgres データベース
- Tailwind CSS
- より詳細な制御のためのカスタム Express サーバー

コンテナ化されたアプリケーションは、以下を含む Docker をサポートする任意のプラットフォームにデプロイできます。

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Vercel

```
npx create-react-router@latest --template remix-run/react-router-templates/vercel
```

- サーバーレンダリング
- Tailwind CSS

### Cloudflare Workers と D1

```
npx create-react-router@latest --template remix-run/react-router-templates/cloudflare-d1
```

- サーバーレンダリング
- Drizzle ORM を使用した D1 データベース
- Tailwind CSS

### Cloudflare Workers

```
npx create-react-router@latest --template remix-run/react-router-templates/cloudflare
```

- サーバーレンダリング
- Tailwind CSS

### Netlify

```
npx create-react-router@latest --template remix-run/react-router-templates/netlify
```

- サーバーレンダリング
- Tailwind CSS
