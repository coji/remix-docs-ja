---
title: データ読み込み
order: 5
---

# データ読み込み

データは `loader` および `clientLoader` を介してルートに提供され、ルートコンポーネントの `data` プロパティでアクセスされます。

## クライアントデータ読み込み

`clientLoader` は、クライアントでデータを取得するために使用されます。これは、サーバーレンダリングしていないプロジェクトや、ブラウザでデータを取得することを好むページに便利です。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import { defineRoute$ } from "react-router";

export default defineRoute$({
  params: ["pid"],

  async clientLoader({ params }) {
    const res = await fetch(`/api/products/${params.pid}`);
    const product = await res.json();
    return { product };
  },

  component: function Product({ data }) {
    return (
      <div>
        <h1>{data.product.name}</h1>
        <p>{data.product.description}</p>
      </div>
    );
  },
});
```

## サーバーデータ読み込み

サーバーレンダリングの場合、`loader` メソッドは、最初のページロードと、ブラウザでの React Router による自動 `fetch` によるクライアントナビゲーションの両方で、サーバー上でデータを取得するために使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import { defineRoute$ } from "react-router";
import { fakeDb } from "../db";

export default defineRoute$({
  params: ["pid"],

  async loader({ params }) {
    const product = await fakeDb.getProduct(params.pid);
    return { product };
  },

  Component({ data }) {
    return (
      <div>
        <h1>{data.product.name}</h1>
        <p>{data.product.description}</p>
      </div>
    );
  },
});
```

`loader` 関数は、クライアントバンドルから削除されるため、サーバー専用 API を使用しても、ブラウザに含まれることを心配する必要はありません。

## React Server Components

RSC は、ローダーとアクションからコンポーネントを返すことでサポートされています。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import { defineRoute$ } from "react-router";
import Product from "./product";
import Reviews from "./reviews";

export default defineRoute$({
  params: ["pid"],

  async loader({ params }) {
    return {
      product: <Product id={params.pid} />,
      reviews: <Reviews productId={params.pid} />,
    };
  },

  Component({ data }) {
    return (
      <div>
        {data.product}
        {data.reviews}
      </div>
    );
  },
});
```

## 静的データ読み込み

事前レンダリングの場合、`loader` メソッドはビルド時にデータを取得するために使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import { defineRoute$ } from "react-router";

export default defineRoute$({
  params: ["pid"],

  async loader({ params }) {
    let product = await getProductFromCSVFile(params.pid);
    return { product };
  },

  Component({ data }) {
    return (
      <div>
        <h1>{data.product.name}</h1>
        <p>{data.product.description}</p>
      </div>
    );
  },
});
```

事前レンダリングする URL は、Vite プラグインで指定されます。

```ts filename=vite.config.ts
import { plugin as app } from "@react-router/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    app({
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

サーバーレンダリングの場合、事前レンダリングされていない URL は、通常どおりサーバーレンダリングされます。

## 2 つのローダーの使用

`loader` と `clientLoader` は一緒に使用できます。`loader` は、最初の SSR（または事前レンダリング）でサーバーで使用され、`clientLoader` はその後のクライアントサイドナビゲーションでサーバーで使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import { defineRoute$ } from "react-router";
import { fakeDb } from "../db";

export default defineRoute$({
  // SSR はデータベースから直接読み込みます
  async loader({ params }) {
    return fakeDb.getProduct(params.pid);
  },

  // クライアントナビゲーションはブラウザから直接フェッチします
  // React Router サーバーをスキップします
  async clientLoader({ params }) {
    const res = await fetch(`/api/products/${params.pid}`);
    return res.json();
  },

  Component({ data }) {
    return (
      <div>
        <h1>{data.name}</h1>
        <p>{data.description}</p>
      </div>
    );
  },
});
```

キャッシュなどの `clientLoader` のより高度なユースケースについては、[高度なデータフェッチ][advanced_data_fetching] を参照してください。

[advanced_data_fetching]: ../tutorials/advanced-data-fetching



