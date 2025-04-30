---
title: ストリーミング
description: React 18とRemixのdeferred APIを使ったストリーミングのタイミング、理由、方法について。
---

# ストリーミング

ストリーミングを使用すると、ページ全体のコンテンツが準備できるのを待つのではなく、利用可能になったコンテンツをすぐに配信することで、ユーザーエクスペリエンスを向上させることができます。

ホスティングプロバイダーがストリーミングをサポートしていることを確認してください。すべてのプロバイダーがサポートしているわけではありません。レスポンスがストリーミングされていないように見える場合は、これが原因である可能性があります。

## 手順

データをストリーミングするには、3つの手順があります。

1. **プロジェクトのセットアップ:** クライアントとサーバーのエントリーポイントがストリーミングをサポートするように設定されていることを確認する必要があります。
2. **コンポーネントのセットアップ:** コンポーネントがストリーミングされたデータをレンダリングできることを確認する必要があります。
3. **ローダーデータの遅延:** 最後に、ローダーでデータを遅延させることができます。

## 1. プロジェクトのセットアップ

**最初から準備完了:** スターターテンプレートを使用して作成されたRemixアプリは、ストリーミング用に事前設定されています。

**手動セットアップが必要ですか？:** プロジェクトがゼロから開始された場合、または古いテンプレートを使用した場合は、`entry.server.tsx`と`entry.client.tsx`にストリーミングサポートがあることを確認してください。これらのファイルが表示されない場合は、デフォルトを使用しており、ストリーミングがサポートされています。独自のエントリーを作成した場合は、参考のためにテンプレートのデフォルトを以下に示します。

- [entry.client.tsx][entry_client_tsx]
- entry.server.tsx:
  - [cloudflare][entry_server_cloudflare_tsx]
  - [deno][entry_server_deno_tsx]
  - [node][entry_server_node_tsx]

## 2. コンポーネントのセットアップ

ストリーミングを使用しないルートモジュールは、次のようになります。

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

ストリーミングされたデータをレンダリングするには、Reactの[`<Suspense>`][suspense_component]とRemixの[`<Await>`][await_component]を使用する必要があります。少しボイラープレートですが、簡単です。

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

このコードは、データの遅延を開始する前でも引き続き機能します。最初にコンポーネントコードを作成することをお勧めします。問題が発生した場合は、問題の場所を特定するのが簡単になります。

## 3. ローダーでのデータの遅延

プロジェクトとルートコンポーネントがストリームデータを設定したので、ローダーでデータの遅延を開始できます。これを行うには、Remixの[`defer`][defer]ユーティリティを使用します。

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
  // 👇 このプロミスはawaitされないことに注意してください
  const reviewsPromise = db.getReviews(params.productId);
  // 👇 しかし、これはawaitされます
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

レビュープロミスをawaitする代わりに、`defer`に渡します。これにより、Remixは、そのプロミスをネットワーク経由でブラウザーにストリーミングするように指示します。

以上です！これで、ブラウザーにデータをストリーミングできるようになります。

## 非効率なストリーミングの回避

遅延データのプロミスは、他のプロミスをawaitする_前_に開始することが重要です。そうしないと、ストリーミングのメリットを十分に得ることができません。効率の低いコード例との違いに注意してください。

```tsx bad
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const product = await db.getProduct(params.productId);
  // 👇 これは`product`が完了するまでロードを開始しません
  const reviewsPromise = db.getReviews(params.productId);

  return defer({
    product,
    reviews: reviewsPromise,
  });
}
```

## サーバータイムアウトの処理

ストリーミングに`defer`を使用する場合、`entry.server.tsx`ファイルの`<RemixServer abortDelay>`プロパティ（デフォルトは5秒）を介して、遅延データがタイムアウトする前に解決するまで待機する時間をRemixに指示できます。現在`entry.server.tsx`ファイルがない場合は、`npx remix reveal entry.server`を使用して公開できます。この値を使用して、`setTimeout`を介してReactの`renderToPipeableStream`メソッドを中止することもできます。

```tsx filename=entry.server.tsx lines=[1,9,16]
const ABORT_DELAY = 5_000;

// ...

const { pipe, abort } = renderToPipeableStream(
  <RemixServer
    context={remixContext}
    url={request.url}
    abortDelay={ABORT_DELAY}
  />
  // ...
);

// ...

setTimeout(abort, ABORT_DELAY);
```

## コンテンツセキュリティポリシーを使用したストリーミング

ストリーミングは、遅延プロミスが解決されると、スクリプトタグをDOMに挿入することで機能します。ページに[スクリプトのコンテンツセキュリティポリシー][csp]が含まれている場合は、`Content-Security-Policy`ヘッダーに`script-src 'self' 'unsafe-inline'`を含めることでセキュリティポリシーを弱めるか、すべてのスクリプトタグにnonceを追加する必要があります。

nonceを使用している場合は、次の3つの場所に含める必要があります。

- `Content-Security-Policy`ヘッダー。例：`Content-Security-Policy: script-src 'nonce-secretnoncevalue'`
- `<Scripts />`、`<ScrollRestoration />`、および`<LiveReload />`コンポーネント。例：`<Scripts nonce="secretnoncevalue" />`
- `entry.server.ts`で`renderToPipeableStream`を呼び出す場所。例：

```tsx filename=entry.server.tsx
const { pipe, abort } = renderToPipeableStream(
  <RemixServer
    context={remixContext}
    url={request.url}
    abortDelay={ABORT_DELAY}
  />,
  {
    nonce: "secretnoncevalue",
    /* ...残りのフィールド */
  }
);
```

これにより、遅延スクリプトタグにnonce値が含まれるようになります。

[entry_client_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.client.tsx
[entry_server_cloudflare_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.cloudflare.tsx
[entry_server_deno_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.deno.tsx
[entry_server_node_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.node.tsx
[suspense_component]: https://react.dev/reference/react/Suspense
[await_component]: ../components/await
[defer]: ../utils/defer
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src

