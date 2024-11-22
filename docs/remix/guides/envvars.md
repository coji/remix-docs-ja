---
title: 環境変数
---

# 環境変数

Remix は環境変数に対して直接何もしません (ローカル開発中は除く)。ただし、このガイドでは、私たちが役立つと考えているいくつかのパターンを紹介します。

環境変数は、アプリケーションが使用できるサーバー上に存在する値です。あなたは、いたるところにある `NODE_ENV` を知っているかもしれません。デプロイサーバーはおそらく自動的にそれを "production" に設定します。

<docs-warning> `remix build` を実行すると、`process.env.NODE_ENV` の値が有効なモード ("production"、"development"、"test") に対応している場合、その値を使用してコンパイルされます。`process.env.NODE_ENV` の値が無効な場合は、デフォルトとして "production" が使用されます。</docs-warning>

以下は、実際に使用されている環境変数の例です。

- `DATABASE_URL`: Postgres データベースの URL
- `STRIPE_PRIVATE_KEY`: サーバーでチェックアウトワークフローが使用するキー
- `STRIPE_PUBLIC_KEY`: ブラウザでチェックアウトワークフローが使用するキー

Web 開発の経験が、ここ数年の JS フレームワークを主にしている場合、あなたはこれらをビルドで使用するものと考えているかもしれません。ビルドコードをバンドルするために役立つ場合もありますが、伝統的にこれらは環境変数ではなく "ビルド引数" です。環境変数は、_サーバーでの実行時に_最も役立ちます。たとえば、環境変数を変更して、アプリケーションの動作をリビルドや再デプロイなしに変更できます。

## サーバー側の環境変数

### ローカル開発

`remix dev` サーバーを使用してローカルでプロジェクトを実行している場合、[dotenv][dotenv] に対する組み込みサポートがあります。

まず、プロジェクトのルートに `.env` ファイルを作成します。

```sh
touch .env
```

<docs-error><code>.env</code> ファイルを git にコミットしないでください。ポイントは、それが秘密情報を含むことです!</docs-error>

`.env` ファイルを編集します。

```
SOME_SECRET=super-secret
```

次に、`remix dev` を実行すると、ローダー/アクションでこれらの値にアクセスできます。

```tsx
export async function loader() {
  console.log(process.env.SOME_SECRET);
}
```

`@remix-run/cloudflare-pages` または `@remix-run/cloudflare` アダプターを使用している場合、環境変数の動作が少し異なります。[`.dev.vars`][dev-vars] ファイルでローカルの環境変数を定義する必要があります。これは、上記の `.env` ファイルの例と同じ構文です。

次に、ローダー/アクション関数で Remix の `context.cloudflare.env` を介して利用できます。

```tsx
export const loader = async ({
  context,
}: LoaderFunctionArgs) => {
  console.log(context.cloudflare.env.SOME_SECRET);
};
```

`.env` と `.dev.vars` ファイルは開発用のみです。本番環境では使用しないでください。そのため、Remix は `remix serve` を実行してもこれらをロードしません。以下のリンクから、ホストのガイドに従って、本番環境のサーバーに秘密情報を追加する必要があります。

### 本番環境

本番環境にデプロイした場合の環境変数は、ホストによって処理されます。たとえば、以下があります。

- [Netlify][netlify]
- [Fly.io][fly-io]
- [Cloudflare Pages][cloudflare-pages]
- [Cloudflare Workers][cloudflare-workers]
- [Vercel][vercel]
- [Architect][architect]

## ブラウザ側の環境変数

Remix で環境変数をブラウザバンドルに含めることができるかどうか尋ねる人がいます。これは、ビルド中心のフレームワークでは一般的な戦略です。しかし、このアプローチにはいくつかの理由で問題があります。

1. 実際には環境変数ではありません。ビルド時にどのサーバーにデプロイしているかを知らなければなりません。
2. 再ビルドと再デプロイをしなければ値を変更できません。
3. 秘密情報を、公開可能なファイルに誤って漏らす可能性があります!

代わりに、すべての環境変数をサーバー上に保持し (サーバーのすべての秘密情報とブラウザの JavaScript が必要とするものを含めて)、`window.ENV` を通じてブラウザコードに公開することをお勧めします。常にサーバーがあるため、バンドルにこの情報を入れる必要はなく、サーバーはローダーでクライアント側の環境変数を提供できます。

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

2. **`ENV` を window に入れる** - これがサーバーからクライアントへの値の渡し方です。`<Scripts/>` の前にこれを置くようにしてください。

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



