---
title: 環境変数
---

# 環境変数

Remix は環境変数に対して直接操作を行いません（ローカル開発時を除く）が、このガイドでは、役立つパターンをいくつか紹介します。

環境変数は、アプリケーションで使用できるサーバー上に存在する値です。よく知られている `NODE_ENV` をご存知かもしれません。展開サーバーは、通常、これを自動的に "production" に設定します。

<docs-warning> `remix build` を実行すると、有効なモード "production"、"development"、または "test" に対応している場合、`process.env.NODE_ENV` の値を使用してコンパイルされます。`process.env.NODE_ENV` の値が無効な場合は、デフォルトとして "production" が使用されます。</docs-warning>

以下は、一般的に使用される環境変数の例です。

- `DATABASE_URL`: Postgres データベースの URL
- `STRIPE_PRIVATE_KEY`: サーバーでチェックアウトワークフローが使用するキー
- `STRIPE_PUBLIC_KEY`: ブラウザでチェックアウトワークフローが使用するキー

ウェブ開発経験が、ここ数年の JS フレームワーク中心であれば、環境変数はビルドで使用されるものだと考えるかもしれません。環境変数はビルドのための「ビルド引数」としても役立ちますが、伝統的には環境変数は _サーバーでの実行時に_ 最も役立ちます。たとえば、環境変数を変更すると、再構築や再展開を行わなくてもアプリケーションの動作を変更できます。

## サーバー環境変数

### ローカル開発

プロジェクトをローカルで実行するために `remix dev` サーバーを使用している場合は、[dotenv][dotenv] に対する組み込みのサポートがあります。

まず、プロジェクトのルートに `.env` ファイルを作成します。

```sh
touch .env
```

<docs-error> `.env` ファイルを git にコミットしないでください。このファイルには秘密情報が含まれているからです！</docs-error>

`.env` ファイルを編集します。

```
SOME_SECRET=super-secret
```

その後、`remix dev` を実行すると、ローダー/アクション内でこれらの値にアクセスできます。

```tsx
export async function loader() {
  console.log(process.env.SOME_SECRET);
}
```

`@remix-run/cloudflare-pages` アダプターを使用している場合、環境変数は少し異なる動作をします。Cloudflare Pages は Functions で動作するため、[`.dev.vars`][dev-vars] ファイルでローカルの環境変数を定義する必要があります。このファイルは、上記 `.env` ファイルの例と同じ構文を使用します。

その後、`loader`/`action` 関数で Remix の `context.env` を介して利用できます。

```tsx
export const loader = async ({
  context,
}: LoaderFunctionArgs) => {
  console.log(context.env.SOME_SECRET);
};
```

`.env` ファイルは開発用のみです。本番環境では使用しないでください。そのため、Remix は `remix serve` を実行するときに `.env` ファイルを読み込みません。以下に示すリンクから、ホストのガイドに従って、本番サーバーに秘密情報を追加する必要があります。

### 本番環境

本番環境に展開された場合の環境変数は、ホストによって処理されます。たとえば、以下のようなものがあります。

- [Netlify][netlify]
- [Fly.io][fly-io]
- [Cloudflare Pages][cloudflare-pages]
- [Cloudflare Workers][cloudflare-workers]
- [Vercel][vercel]
- [Architect][architect]

## ブラウザ環境変数

Remix でブラウザバンドルに環境変数を配置できるかどうか尋ねる人がいます。これは、ビルドが中心的なフレームワークでは一般的な戦略です。しかし、このアプローチにはいくつかの問題があります。

1. 実際には環境変数ではありません。ビルド時に展開するサーバーを知る必要があります。
2. 再構築と再展開を行わなければ値を変更できません。
3. 公開アクセス可能なファイルに秘密情報を誤って漏らす可能性があります。

代わりに、すべての環境変数をサーバーに保持し（サーバーの秘密情報とブラウザの JavaScript が必要とする情報）、`window.ENV` を介してブラウザコードに公開することをお勧めします。サーバーが常に存在するため、バンドルにこの情報を含める必要はありません。サーバーは、ローダーでクライアント側の環境変数を提供できます。

1. **ルートローダーからクライアントの `ENV` を返す** - ローダー内で、サーバーの環境変数にアクセスできます。ローダーはサーバーでのみ実行され、クライアント側の JavaScript にバンドルされることはありません。

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

2. **`ENV` を window に配置する** - これにより、サーバーからクライアントに値を渡します。`<Scripts/>` の前に配置してください。

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


