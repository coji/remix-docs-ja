---
title: ストリーミング
description: React 18 と Remix の deferred API を使用して、いつ、なぜ、どのようにストリーミングするか。
---

# ストリーミング

ストリーミングを使用すると、ページ全体のコンテンツが準備されるのを待つのではなく、コンテンツが利用可能になった時点で配信することで、ユーザーエクスペリエンスを向上させることができます。

ホスティングプロバイダーがストリーミングをサポートしていることを確認してください。すべてのプロバイダーがサポートしているわけではありません。レスポンスがストリーミングされていない場合は、これが原因である可能性があります。

## ステップ

データのストリーミングには、3 つのステップがあります。

1. **プロジェクトのセットアップ:** クライアントとサーバーのエントリーポイントがストリーミングをサポートするように設定する必要があります。
2. **コンポーネントのセットアップ:** コンポーネントがストリーミングされたデータをレンダリングできるようにする必要があります。
3. **ローダーデータの遅延:** 最後に、ローダーでデータを遅延させることができます。

## 1. プロジェクトのセットアップ

**開始から準備完了:** スターターテンプレートを使用して作成された Remix アプリは、ストリーミング用に事前に設定されています。

**手動セットアップが必要か?:** プロジェクトがゼロから開始されたか、古いテンプレートを使用した場合は、`entry.server.tsx` と `entry.client.tsx` にストリーミングサポートが設定されていることを確認してください。これらのファイルが見当たらない場合は、デフォルトを使用しているため、ストリーミングはサポートされています。独自のエントリを作成した場合は、次のテンプレートのデフォルトを参照してください。

- [entry.client.tsx][entry_client_tsx]
- entry.server.tsx:
  - [cloudflare][entry_server_cloudflare_tsx]
  - [deno][entry_server_deno_tsx]
  - [node][entry_server_node_tsx]

## 2. コンポーネントのセットアップ

ストリーミングされていないルートモジュールは、次のようになります。

```tsx
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData } from "@remix-run/react";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  const [product, reviews] = await Promise.all([
    db.getProduct(params.productId),
    db.getReviews(params.productId),
  ]);

  return json({ product, reviews });
}

export default function Product() {
  const { product, reviews } =
    useLoaderData<typeof loader>();
  return (
    <>
      <ProductPage data={product} />
      <ProductReviews data={reviews} />
    </>
  );
}
```

ストリーミングされたデータをレンダリングするには、React の [`<Suspense>`][suspense_component] と Remix の [`<Await>`][await_component] を使用する必要があります。これは少しばかりの定型コードですが、簡単です。

```tsx lines=[3-4,20-24]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { ReviewsSkeleton } from "./reviews-skeleton";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  // 既存のコード
}

export default function Product() {
  const { product, reviews } =
    useLoaderData<typeof loader>();
  return (
    <>
      <ProductPage data={product} />
      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews}>
          {(reviews) => <ProductReviews data={reviews} />}
        </Await>
      </Suspense>
    </>
  );
}
```

このコードは、データを遅延させる前にでも動作します。コンポーネントコードを最初に作成することをお勧めします。問題が発生した場合、問題の所在を突き止めるのが容易になります。

## 3. ローダーでデータを遅延させる

プロジェクトとルートコンポーネントがストリーミングデータをサポートするように設定されたので、ローダーでデータを遅延させることができます。これには、Remix の [`defer`][defer] ユーティリティを使用します。

非同期プロミスコードの変更に注意してください。

```tsx lines=[2,11-19]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { defer } from "@remix-run/node"; // または cloudflare/deno
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { ReviewsSkeleton } from "./reviews-skeleton";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  // 👇 このプロミスは待機されません
  const reviewsPromise = db.getReviews(params.productId);
  // 👇 しかし、これは待機されます
  const product = await db.getProduct(params.productId);

  return defer({
    product,
    reviews: reviewsPromise,
  });
}

export default function Product() {
  const { product, reviews } =
    useLoaderData<typeof loader>();
  // 既存のコード
}
```

`reviews` プロミスを待機する代わりに、`defer` に渡します。これにより、Remix はそのプロミスをネットワーク経由でブラウザにストリーミングします。

これで完了です！ブラウザにデータをストリーミングできるようになりました。

## 非効率なストリーミングを避ける

遅延データのプロミスは、他のプロミスを待機する _前_ に開始することが重要です。そうしないと、ストリーミングのメリットを十分に得られません。この、効率の低いコードの例との違いに注意してください。

```tsx bad
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const product = await db.getProduct(params.productId);
  // 👇 これは、`product` が完了するまでロードを開始しません
  const reviewsPromise = db.getReviews(params.productId);

  return defer({
    product,
    reviews: reviewsPromise,
  });
}
```

## コンテンツセキュリティポリシーを使用したストリーミング

ストリーミングは、遅延プロミスが解決される際に、スクリプトタグを DOM に挿入することによって動作します。ページに [スクリプトのコンテンツセキュリティポリシー][csp] が含まれている場合は、`Content-Security-Policy` ヘッダーに `script-src 'self' 'unsafe-inline'` を含めることで、セキュリティポリシーを弱体化させるか、すべてのスクリプトタグに nonce を追加する必要があります。

nonce を使用している場合は、次の 3 つの場所に含める必要があります。

- `Content-Security-Policy` ヘッダー。例: `Content-Security-Policy: script-src 'nonce-secretnoncevalue'`
- `<Scripts />`、`<ScrollRestoration />`、`<LiveReload />` コンポーネント。例: `<Scripts nonce="secretnoncevalue" />`
- `entry.server.ts` で `renderToPipeableStream` を呼び出す場所。例:

```tsx
const { pipe, abort } = renderToPipeableStream(
  <RemixServer
    context={remixContext}
    url={request.url}
    abortDelay={ABORT_DELAY}
  />,
  {
    nonce: "secretnoncevalue",
    /* ...その他のフィールド */
  }
);
```

これにより、遅延スクリプトタグに nonce 値が含まれるようになります。

[entry_client_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.client.tsx
[entry_server_cloudflare_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.cloudflare.tsx
[entry_server_deno_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.deno.tsx
[entry_server_node_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.node.tsx
[suspense_component]: https://react.dev/reference/react/Suspense
[await_component]: ../components/await
[defer]: ../utils/defer
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
