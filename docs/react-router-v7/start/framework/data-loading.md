---
title: データローディング
order: 5
---

# データローディング

[MODES: framework]

## はじめに

データは、`loader` と `clientLoader` からルートコンポーネントに提供されます。

ローダーデータは、ローダーから自動的にシリアライズされ、コンポーネントでデシリアライズされます。文字列や数値のようなプリミティブ値に加えて、ローダーは Promise、Map、Set、Date などを返すことができます。

`loaderData` プロップの型は、[自動的に生成されます][type-safety]。

<docs-info>React がサーバーコンポーネントがクライアントコンポーネントに props として渡すことを許可している[シリアライズ可能な型][serializable-types]と同じセットをサポートするように努めています。これにより、将来的に[RSC][rsc]への移行があった場合にも、アプリケーションが対応できるようになります。</docs-info>

## クライアントデータローディング

`clientLoader` は、クライアントでデータをフェッチするために使用されます。これは、ブラウザからのみデータをフェッチしたいページやプロジェクト全体に役立ちます。

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

// HydrateFallback は、クライアントローダーが実行中にレンダリングされます
export function HydrateFallback() {
  return <div>Loading...</div>;
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

## サーバーデータローディング

サーバーレンダリングの場合、`loader` は初期ページロードとクライアントナビゲーションの両方に使用されます。クライアントナビゲーションは、ブラウザからサーバーへの React Router による自動 `fetch` を通じてローダーを呼び出します。

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

`loader` 関数はクライアントバンドルから削除されるため、ブラウザに含まれることを心配せずにサーバー専用の API を使用できます。

## 静的データローディング

プリレンダリングの場合、ローダーはプロダクションビルド中にデータをフェッチするために使用されます。

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

プリレンダリングする URL は、`react-router.config.ts` で指定します。

```ts filename=react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  async prerender() {
    let products = await readProductsFromCSVFile();
    return products.map(
      (product) => `/products/${product.id}`,
    );
  },
} satisfies Config;
```

サーバーレンダリングの場合、プリレンダリングされていない URL は通常どおりサーバーレンダリングされるため、単一のルートで一部のデータをプリレンダリングしながら、残りをサーバーレンダリングできます。

## 両方のローダーの使用

`loader` と `clientLoader` は一緒に使用できます。`loader` は、初期 SSR (またはプリレンダリング) のためにサーバーで使用され、`clientLoader` は、後続のクライアント側のナビゲーションで使用されます。

```tsx filename=app/product.tsx
// route("products/:pid", "./product.tsx");
import type { Route } from "./+types/product";
import { fakeDb } from "../db";

export async function loader({ params }: Route.LoaderArgs) {
  return fakeDb.getProduct(params.pid);
}

export async function clientLoader({
  serverLoader,
  params,
}: Route.ClientLoaderArgs) {
  const res = await fetch(`/api/products/${params.pid}`);
  const serverData = await serverLoader();
  return { ...serverData, ...res.json() };
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

関数の `hydrate` プロパティを設定して、ハイドレーション中およびページがレンダリングされる前にクライアントローダーを強制的に実行することもできます。この状況では、クライアントローダーの実行中にフォールバック UI を表示するために `HydrateFallback` コンポーネントをレンダリングする必要があります。

```tsx filename=app/product.tsx
export async function loader() {
  /* ... */
}

export async function clientLoader() {
  /* ... */
}

// ハイドレーション中にクライアントローダーを強制的に実行します
clientLoader.hydrate = true as const; // 型推論のための `as const`

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function Product() {
  /* ... */
}
```

---

次: [アクション][actions]

参照:

- [Suspense を使用したストリーミング][streaming]
- [クライアントデータ][client-data]
- [Fetcher の使用][fetchers]

[type-safety]: ../../explanation/type-safety
[serializable-types]: https://react.dev/reference/rsc/use-client#serializable-types
[rsc]: ../../how-to/react-server-components
[actions]: ./actions
[streaming]: ../../how-to/suspense
[client-data]: ../../how-to/client-data
[fetchers]: ../../how-to/fetchers#loading-data