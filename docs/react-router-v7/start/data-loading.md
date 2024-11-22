---
title: データの読み込み
order: 5
---

# データの読み込み

データは、`loader` と `clientLoader` からルートコンポーネントに提供されます。

## クライアントデータの読み込み

`clientLoader` は、クライアント上でデータをフェッチするために使用されます。これは、ブラウザからのみデータをフェッチすることを好むページまたはフルプロジェクトに役立ちます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type * as Route from "./+types.product";

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
  const res = await fetch(`/api/products/${params.pid}`);
  const product = await res.json();
  return product;
}

export default function Product({
  loaderData,
}: Route.ComponentProps) {
  const { name, description } = loaderData;
  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```

## サーバーデータの読み込み

サーバーレンダリングの場合、`loader` は初期ページロードとクライアントナビゲーションの両方で使用されます。クライアントナビゲーションは、ブラウザからサーバーへのReact Routerによる自動的な`fetch`を通じて、`loader`を呼び出します。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type * as Route from "./+types.product";
import { fakeDb } from "../db";

export async function loader({ params }: Route.LoaderArgs) {
  const product = await fakeDb.getProduct(params.pid);
  return product;
}

export default function Product({
  loaderData,
}: Route.ComponentProps) {
  const { name, description } = loaderData;
  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```

`loader`関数はクライアントバンドルから削除されるため、ブラウザに含まれることを心配せずにサーバー専用のAPIを使用できます。

### カスタムステータスコードとヘッダー

`loader`からカスタムHTTPステータスコードまたはカスタムヘッダーを返す必要がある場合は、[`data`][data]ユーティリティを使用してこれを行うことができます。

```tsx filename=app/product.tsx lines=[3,6-8,14,17-21]
// route("products/:pid", "./product.tsx");
import type * as Route from "./+types.product";
import { data } from "react-router";
import { fakeDb } from "../db";

export function headers({ loaderHeaders }: HeadersArgs) {
  return loaderHeaders;
}

export async function loader({ params }: Route.LoaderArgs) {
  const product = await fakeDb.getProduct(params.pid);

  if (!product) {
    throw data(null, { status: 404 });
  }

  return data(product, {
    headers: {
      "Cache-Control": "public; max-age=300",
    },
  });
}
```

## 静的データの読み込み

事前レンダリングの場合、ローダーは本番ビルド中にデータをフェッチするために使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type * as Route from "./+types.product";

export async function loader({ params }: Route.LoaderArgs) {
  let product = await getProductFromCSVFile(params.pid);
  return product;
}

export default function Product({
  loaderData,
}: Route.ComponentProps) {
  const { name, description } = loaderData;
  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```

事前レンダリングするURLは、Viteプラグインで指定されます。

```ts filename=vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      async prerender() {
        let products = await readProductsFromCSVFile();
        return products.map(
          (product) => `/products/${product.id}`
        );
      },
    }),
  ],
});
```

サーバーレンダリングの場合、事前レンダリングされていないURLは通常どおりサーバーレンダリングされます。

## 両方のローダーを使用する

`loader` と `clientLoader` は一緒に使用できます。`loader` は、サーバーでの初期SSR（または事前レンダリング）に使用され、`clientLoader` は後続のクライアント側ナビゲーションに使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type * as Route from "./+types.product";
import { fakeDb } from "../db";

export async function loader({ params }: Route.LoaderArgs) {
  return fakeDb.getProduct(params.pid);
}

export async function clientLoader({
  params,
}: Route.ClientLoader) {
  const res = await fetch(`/api/products/${params.pid}`);
  return res.json();
}

export default function Product({
  loaderData,
}: Route.ComponentProps) {
  const { name, description } = loaderData;

  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```

キャッシュなどの`clientLoader`のより高度なユースケースについては、[高度なデータフェッチ][advanced_data_fetching]を参照してください。

## Reactサーバーコンポーネントを使用した非同期コンポーネント

<docs-warning>RSCは現時点ではサポートされていません</docs-warning>

将来、ローダーでレンダリングされた非同期コンポーネントは、他の値と同様に`loaderData`で利用できます。

```tsx filename=app/product-page.tsx
// route("products/:pid", "./product-page.tsx");
import type * as Route from "./+types.product";
import Product from "./product";
import Reviews from "./reviews";

export async function loader({ params }: Route.LoaderArgs) {
  return {
    product: <Product id={params.pid} />,
    reviews: <Reviews productId={params.pid} />,
  };
}

export default function ProductPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      {loaderData.product}
      <Suspense fallback={<div>loading...</div>}>
        {loaderData.reviews}
      </Suspense>
    </div>
  );
}
```

```tsx filename=app/product.tsx
export async function Product({ id }: { id: string }) {
  const product = await fakeDb.getProduct(id);
  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

[advanced_data_fetching]: ../tutorials/advanced-data-fetching
[data]: ../../api/react-router/data



