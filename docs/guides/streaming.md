---
title: ストリーミング
description: React 18 と Remix の遅延 API でストリーミングを行う場合、理由、方法。
---

# ストリーミング

ストリーミングを使用すると、ページ全体のコンテンツが準備できるまで待たずに、コンテンツが利用可能になった時点でコンテンツを配信することで、ユーザーエクスペリエンスを向上させることができます。

ホスティングプロバイダーがストリーミングをサポートしていることを確認してください。すべてのプロバイダーがサポートしているわけではありません。応答がストリーミングされていない場合は、これが原因である可能性があります。

## 手順

ストリーミングデータには、次の 3 つのステップがあります。

1. **プロジェクトの設定:** クライアントとサーバーのエントリポイントがストリーミングをサポートするように設定する必要があります。
2. **コンポーネントの設定:** コンポーネントがストリーミングされたデータをレンダリングできるようにする必要があります。
3. **ローダーデータの遅延:** 最後に、ローダーでデータを遅延させることができます。

## 1. プロジェクトの設定

**最初から準備済み:** スターターテンプレートを使用して作成された Remix アプリは、ストリーミング用に事前に構成されています。

**手動設定が必要ですか?:** プロジェクトが最初から作成された場合、または古いテンプレートを使用している場合は、`entry.server.tsx` と `entry.client.tsx` にストリーミングサポートが設定されていることを確認してください。これらのファイルが見つからない場合は、デフォルトを使用しており、ストリーミングはサポートされています。独自のエントリを作成した場合は、参照として次のテンプレートのデフォルトがあります。

- [entry.client.tsx][entry_client_tsx]
- entry.server.tsx:
  - [cloudflare][entry_server_cloudflare_tsx]
  - [deno][entry_server_deno_tsx]
  - [node][entry_server_node_tsx]

## 2. コンポーネントの設定

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

ストリーミングされたデータをレンダリングするには、React の [`<Suspense>`][suspense_component] と Remix の [`<Await>`][await_component] を使用する必要があります。少しボイラープレートですが、簡単です。

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

このコードは、データを遅延させる前に動作し続けます。コンポーネントコードを先に実行することをお勧めします。問題が発生した場合、問題の場所を簡単に突き止められます。

## 3. ローダーでのデータの遅延

プロジェクトとルートコンポーネントがストリーミングデータをサポートするように設定されたので、ローダーでデータを遅延させることができます。これには、Remix の [`defer`][defer] ユーティリティを使用します。

非同期プロミスコードの変更に注目してください。

```tsx lines=[2,11-19]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { defer } from "@remix-run/node"; // または cloudflare/deno
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { ReviewsSkeleton } from "./reviews-skeleton";

export async function loader({
  params,
}: LoaderFunctionArgs) {
  // 👇 このプロミスは待機されていません
  const reviewsPromise = db.getReviews(params.productId);
  // 👇 ですが、これは待機されています
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

reviews プロミスを待機する代わりに、`defer` に渡します。これにより、Remix はそのプロミスをネットワーク経由でブラウザにストリーミングするように指示します。

以上です。これでブラウザにデータがストリーミングされるはずです。

## 非効率なストリーミングを避ける

`defer` を使用してストリーミングする場合は、遅延データのプロミスを他のプロミスを待機する *前* に開始することが重要です。そうしないと、ストリーミングの利点をすべて得ることができません。この非効率なコード例との違いに注目してください。

```tsx bad
export async function loader({
  params,
}: LoaderFunctionArgs) {
  const product = await db.getProduct(params.productId);
  // 👇 これは `product` が完了するまでロードを開始しません
  const reviewsPromise = db.getReviews(params.productId);

  return defer({
    product,
    reviews: reviewsPromise,
  });
}
```

## サーバータイムアウトの処理

`defer` を使用してストリーミングする場合は、`entry.server.tsx` ファイルの `<RemixServer abortDelay>` プロップ（デフォルトは 5 秒）を使用して、遅延データが解決されるのを待機する時間を Remix に伝えることができます。現在 `entry.server.tsx` ファイルがない場合は、`npx remix reveal entry.server` を使用して表示できます。この値を使用して、`setTimeout` を介して React の `renderToPipeableStream` メソッドを中止することもできます。

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

## コンテンツセキュリティポリシーでのストリーミング

ストリーミングは、遅延プロミスが解決されると、DOM にスクリプトタグを挿入することによって機能します。ページに [スクリプトのコンテンツセキュリティポリシー][csp] が含まれている場合は、`Content-Security-Policy` ヘッダーに `script-src 'self' 'unsafe-inline'` を含めることでセキュリティポリシーを弱体化するか、すべてのスクリプトタグに nonce を追加する必要があります。

nonce を使用している場合は、3 つの場所に含める必要があります。

- `Content-Security-Policy` ヘッダー。例: `Content-Security-Policy: script-src 'nonce-secretnoncevalue'`
- `<Scripts />`、`<ScrollRestoration />`、`<LiveReload />` コンポーネント。例: `<Scripts nonce="secretnoncevalue" />`
- `renderToPipeableStream` を呼び出す `entry.server.ts`。例:

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

これにより、すべての遅延スクリプトタグに nonce 値が含まれるようになります。

[entry_client_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.client.tsx
[entry_server_cloudflare_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.cloudflare.tsx
[entry_server_deno_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.deno.tsx
[entry_server_node_tsx]: https://github.com/remix-run/remix/blob/dev/packages/remix-dev/config/defaults/entry.server.node.tsx
[suspense_component]: https://react.dev/reference/react/Suspense
[await_component]: ../components/await
[defer]: ../utils/defer
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src



