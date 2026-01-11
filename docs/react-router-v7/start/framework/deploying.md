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

公式の [React Router テンプレート](https://github.com/remix-run/react-router-templates) は、アプリケーションのブートストラップに役立ち、または自身のアプリケーションの参照として使用できます。

静的ホスティングにデプロイする場合、React Router は他の React を使用したシングルページアプリケーションと同様にデプロイできます。

## テンプレート

`create-react-router` コマンドの実行後、README の指示に従ってください。

### Node.js (Docker 使用)

```
npx create-react-router@latest --template remix-run/react-router-templates/default
```

- サーバーレンダリング
- Tailwind CSS

コンテナ化されたアプリケーションは、Docker をサポートするあらゆるプラットフォームにデプロイできます。具体的には以下の通りです。

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Node.js (Docker とカスタムサーバー使用)

```
npx create-react-router@latest --template remix-run/react-router-templates/node-custom-server
```

- サーバーレンダリング
- Tailwind CSS
- より詳細な制御のためのカスタム Express サーバー

コンテナ化されたアプリケーションは、Docker をサポートするあらゆるプラットフォームにデプロイできます。具体的には以下の通りです。

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Node.js (Docker と Postgres 使用)

```
npx create-react-router@latest --template remix-run/react-router-templates/node-postgres
```

- サーバーレンダリング
- Drizzle を使用した Postgres データベース
- Tailwind CSS
- より詳細な制御のためのカスタム Express サーバー

コンテナ化されたアプリケーションは、Docker をサポートするあらゆるプラットフォームにデプロイできます。具体的には以下の通りです。

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Vercel

Vercel は React Router 用の独自のテンプレートを維持しています。詳細については、[Vercel ガイド](https://vercel.com/templates/react-router/react-router-boilerplate) を参照してください。

### Cloudflare Workers

Cloudflare は React Router 用の独自のテンプレートを維持しています。詳細については、[Cloudflare ガイド](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/) を参照してください。

### Netlify

Netlify は React Router 用の独自のテンプレートを維持しています。詳細については、[Netlify ガイド](https://docs.netlify.com/build/frameworks/framework-setup-guides/react-router/) を参照してください。