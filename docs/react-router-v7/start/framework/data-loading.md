---
title: データの読み込み
order: 5
---

# データの読み込み

データは、`loader`と`clientLoader`からルートコンポーネントに提供されます。

Loaderデータは、ローダーから自動的にシリアライズされ、コンポーネントでデシリアライズされます。文字列や数値などのプリミティブ値に加えて、ローダーはPromise、Map、Set、Dateなどを返すことができます。

## クライアントデータの読み込み

`clientLoader`は、クライアント側でデータを取得するために使用されます。これは、ブラウザからのみデータを取得することを好むページやプロジェクト全体に役立ちます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type { Route } from "./+types/product";

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

サーバーレンダリング時、`loader`は初期ページロードとクライアントナビゲーションの両方で使用されます。クライアントナビゲーションは、ブラウザからサーバーへのReact Routerによる自動`fetch`を通じてローダーを呼び出します。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type { Route } from "./+types/product";
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

`loader`関数はクライアントバンドルから削除されるため、ブラウザに含まれることを心配することなく、サーバー専用のAPIを使用できます。


## 静的データの読み込み

プレレンダリング時、ローダーは本番ビルド中にデータを取得するために使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type { Route } from "./+types/product";

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

プレレンダリングするURLは、react-router.config.tsで指定されます。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  async prerender() {
    let products = await readProductsFromCSVFile();
    return products.map(
      (product) => `/products/${product.id}`
    );
  },
} satisfies Config;
```

サーバーレンダリング時、プレレンダリングされていないURLは通常どおりサーバーレンダリングされることに注意してください。これにより、特定のルートで一部のデータをプレレンダリングしながら、残りの部分をサーバーレンダリングできます。


## 両方のローダーの使用

`loader`と`clientLoader`は同時に使用できます。`loader`はサーバー側の初期SSR（またはプレレンダリング）で使用され、`clientLoader`は後続のクライアント側のナビゲーションで使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type { Route } from "./+types/product";
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

---

次へ: [アクション](./actions)

参照：

- [Suspenseを使ったストリーミング](../../how-to/suspense)

[advanced_data_fetching]: ../tutorials/advanced-data-fetching
[data]: ../../api/react-router/data

