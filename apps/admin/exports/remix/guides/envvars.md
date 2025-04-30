---
title: 環境変数
---

# 環境変数

Remix は（ローカル開発時を除き）環境変数を直接扱うことはありませんが、このガイドでは、私たちが便利だと考えているいくつかのパターンを紹介します。

環境変数とは、アプリケーションが使用できるサーバー上に存在する値のことです。おそらく、ユビキタスな `NODE_ENV` には馴染みがあるでしょう。デプロイサーバーは、おそらくそれを自動的に "production" に設定します。

<docs-warning> `remix build` を実行すると、`process.env.NODE_ENV` の値が "production"、"development"、"test" のいずれかの有効なモードに対応する場合、その値を使用してコンパイルされます。`process.env.NODE_ENV` の値が無効な場合は、デフォルトとして "production" が使用されます。</docs-warning>

以下は、よく見られる環境変数の例です。

- `DATABASE_URL`: Postgres データベースの URL
- `STRIPE_PRIVATE_KEY`: サーバー上でチェックアウトワークフローが使用するキー
- `STRIPE_PUBLIC_KEY`: ブラウザ上でチェックアウトワークフローが使用するキー

もしあなたがここ数年の JS フレームワークでの Web 開発経験が主であるなら、これらをビルドで使用するものと考えるかもしれません。これらはコードのバンドルに役立つこともありますが、伝統的には環境変数ではなく「ビルド引数」です。環境変数は、_サーバーでの実行時_に最も役立ちます。たとえば、環境変数を変更することで、リビルドや再デプロイなしにアプリの動作を変更できます。

## サーバー環境変数

### ローカル開発

`remix dev` サーバーを使用してプロジェクトをローカルで実行している場合、[dotenv][dotenv] の組み込みサポートがあります。

まず、プロジェクトのルートに `.env` ファイルを作成します。

```sh
touch .env
```

<docs-error><code>.env</code> ファイルを git にコミットしないでください。重要なのは、機密情報が含まれているということです！</docs-error>

`.env` ファイルを編集します。

```
SOME_SECRET=super-secret
```

次に、`remix dev` を実行すると、ローダー/アクションでこれらの値にアクセスできるようになります。

```tsx
export async function loader() {
  console.log(process.env.SOME_SECRET);
}
```

`@remix-run/cloudflare-pages` または `@remix-run/cloudflare` アダプターを使用している場合、環境変数の動作が少し異なります。ローカル環境変数を [`.dev.vars`][dev-vars] ファイルで定義する必要があります。これは、上記の `.env` ファイルと同じ構文です。

次に、`loader`/`action` 関数で Remix の `context.cloudflare.env` を介して利用できるようになります。

```tsx
export const loader = async ({
  context,
}: LoaderFunctionArgs) => {
  console.log(context.cloudflare.env.SOME_SECRET);
};
```

`.env` および `.dev.vars` ファイルは開発専用です。本番環境では使用しないでください。そのため、Remix は `remix serve` の実行時にそれらをロードしません。以下のリンクから、ホストのガイドに従って、本番サーバーにシークレットを追加する必要があります。

### 本番環境

本番環境にデプロイされたときの環境変数は、ホストによって処理されます。例：

- [Netlify][netlify]
- [Fly.io][fly-io]
- [Cloudflare Pages][cloudflare-pages]
- [Cloudflare Workers][cloudflare-workers]
- [Vercel][vercel]
- [Architect][architect]

## ブラウザ環境変数

Remix で環境変数をブラウザバンドルに入れることができるかどうかを尋ねる人がいます。これは、ビルド重視のフレームワークでは一般的な戦略です。ただし、このアプローチにはいくつかの問題があります。

1. これは実際には環境変数ではありません。ビルド時にどのサーバーにデプロイするかを知っている必要があります。
2. リビルドと再デプロイなしに値を変更することはできません。
3. 機密情報を誤って公開ファイルに漏洩させやすい！

代わりに、すべての環境変数（サーバーのシークレットとブラウザの JavaScript が必要とするもの）をサーバーに保持し、`window.ENV` を介してブラウザコードに公開することをお勧めします。常にサーバーがあるため、この情報をバンドルに入れる必要はありません。サーバーはローダーでクライアント側の環境変数を提供できます。

1. **ルートローダーからクライアント用の `ENV` を返す** - ローダー内では、サーバーの環境変数にアクセスできます。ローダーはサーバーでのみ実行され、クライアント側の JavaScript にバンドルされることはありません。

   ```tsx lines=[3-6]
   export async function loader() {
     return json({
       ENV: {
         STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
         FAUNA_DB_URL: process.env.FAUNA_DB_URL,
       },
     });
   }

   export function Root() {
     return (
       <html lang="en">
         <head>
           <Meta />
           <Links />
         </head>
         <body>
           <Outlet />
           <Scripts />
         </body>
       </html>
     );
   }
   ```

2. **`ENV` を window に配置する** - これは、サーバーからクライアントに値を渡す方法です。必ず `<Scripts/>` の前に配置してください。

   ```tsx lines=[10,19-25]
   export async function loader() {
     return json({
       ENV: {
         STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
       },
     });
   }

   export function Root() {
     const data = useLoaderData<typeof loader>();
     return (
       <html lang="en">
         <head>
           <Meta />
           <Links />
         </head>
         <body>
           <Outlet />
           <script
             dangerouslySetInnerHTML={{
               __html: `window.ENV = ${JSON.stringify(
                 data.ENV
               )}`,
             }}
           />
           <Scripts />
         </body>
       </html>
     );
   }
   ```

3. **値にアクセスする**

   ```tsx lines=[6-8]
   import { loadStripe } from "@stripe/stripe-js";

   export async function redirectToStripeCheckout(
     sessionId
   ) {
     const stripe = await loadStripe(
       window.ENV.STRIPE_PUBLIC_KEY
     );
     return stripe.redirectToCheckout({ sessionId });
   }
   ```

[dotenv]: https://www.npmjs.com/package/dotenv
[netlify]: https://docs.netlify.com/configure-builds/environment-variables
[fly-io]: https://fly.io/docs/reference/secrets
[cloudflare-pages]: https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
[cloudflare-workers]: https://developers.cloudflare.com/workers/platform/environment-variables
[vercel]: https://vercel.com/docs/environment-variables
[architect]: https://arc.codes/docs/en/reference/cli/env
[dev-vars]: https://developers.cloudflare.com/pages/functions/bindings/#interact-with-your-environment-variables-locally

