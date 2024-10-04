---
title: データの読み込み
order: 5
---

# データの読み込み

データは`loader`と`clientLoader`からルートコンポーネントに提供されます。

## クライアントデータの読み込み

`clientLoader`は、クライアント上でデータを取得するために使用されます。これは、ブラウザからのみデータを取得することを好むページやプロジェクト全体に役立ちます。

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
  clientLoaderData,
}: Route.ComponentProps) {
  const { name, description } = clientLoaderData;
  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```

## サーバーデータの読み込み

サーバーレンダリング時、`loader`は最初のページ読み込みとクライアントナビゲーションの両方で使用されます。クライアントナビゲーションは、ブラウザからサーバーへの自動`fetch`を介してReact Routerによってローダーを呼び出します。

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

`loader`関数はクライアントバンドルから削除されるため、サーバーのみのAPIを使用しても、ブラウザに含まれていることを心配する必要はありません。

## 静的データの読み込み

事前レンダリング時、ローダーは本番ビルド中にデータを取得するために使用されます。

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

サーバーレンダリング時、事前レンダリングされていないURLは、通常どおりサーバーレンダリングされます。

## 両方のローダーを使用する

`loader`と`clientLoader`は一緒に使用できます。`loader`は、最初のSSR（または事前レンダリング）でサーバーで使用され、`clientLoader`は後続のクライアントサイドナビゲーションで使用されます。

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
  clientLoaderData,
}: Route.ComponentProps) {
  const { name, description } =
    clientLoaderData || loaderData;

  return (
    <div>
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```

`clientLoader`を使用したキャッシュなどのより高度なユースケースについては、[高度なデータ取得][advanced_data_fetching]を参照してください。

## React Server Componentsを使用した非同期コンポーネント

<docs-warning>RSCはまだサポートされていません</docs-warning>

将来的には、ローダーでレンダリングされた非同期コンポーネントは、他の値と同じように`loaderData`で利用できます。

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


