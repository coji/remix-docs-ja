---
title: clientLoader
---

# `clientLoader`

[`loader`][loader]に加えて（または代わりに）、クライアントで実行される`clientLoader`関数を定義できます。

各ルートは、レンダリング時にルートにデータを提供する`clientLoader`関数を定義できます。

```tsx
export const clientLoader = async ({
  request,
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  // サーバーローダーを呼び出します
  const serverData = await serverLoader();
  // クライアントでデータをフェッチします
  const data = getDataFromClient();
  // useLoaderData() を介して公開するデータを返します
  return data;
};
```

この関数はクライアントでのみ実行され、次のような方法で使用できます。

- フルクライアントルートのサーバー`loader`の代わりに
- ミューテーションでキャッシュを無効化することにより、`clientLoader`キャッシュと一緒に使用する場合
  - サーバーへの呼び出しをスキップするためのクライアント側のキャッシュを維持
  - Remix [BFF][bff] ホップをバイパスして、クライアントから直接APIにアクセス
- サーバーからロードされたデータをさらに拡張する場合
  - 例：`localStorage`からユーザー固有の設定を読み込む
- React Routerからの移行を容易にする

## 水和の動作

デフォルトでは、`clientLoader`は、初期SSRドキュメントリクエストでのRemixアプリの水和中に、ルートに対して**実行されません**。これは、`clientLoader`がサーバー`loader`データの形状を変更せず、後続のクライアント側ナビゲーションの最適化（キャッシュから読み取る、または直接APIにアクセス）であるという主要な（そしてより単純な）ユースケースのためです。

```tsx
export async function loader() {
  // SSR中は、直接DBとやり取りします
  const data = getServerDataFromDb();
  return json(data);
}

export async function clientLoader() {
  // クライアント側ナビゲーション中は、公開されたAPIエンドポイントに直接アクセスします
  const data = await fetchDataFromApi();
  return data;
}

export default function Component() {
  const data = useLoaderData<typeof loader>();
  return <>...</>;
}
```

### `clientLoader.hydrate`

初期ドキュメントリクエストで水和中に`clientLoader`を実行する必要がある場合は、`clientLoader.hydrate=true`を設定することでオプトインできます。これにより、Remixは水和中に`clientLoader`を実行する必要があることを認識します。`HydrateFallback`がない場合、ルートコンポーネントはサーバー`loader`データでSSRされ、`clientLoader`が実行されると、返されたデータが水和されたルートコンポーネント内の場所で更新されます。

<docs-info>ルートが`clientLoader`をエクスポートし、サーバー`loader`をエクスポートしない場合、`clientLoader.hydrate`は自動的に`true`として扱われます。これは、サーバーデータがSSRに含まれていないため、水和前にルートコンポーネントをレンダリングするために常に`clientLoader`を実行する必要があるためです。</docs-info>

### HydrateFallback

`clientLoader`から取得する必要があるデータがあるため、SSR中にデフォルトのルートコンポーネントのレンダリングを回避する必要がある場合は、SSR中にレンダリングされる[`HydrateFallback`][hydratefallback]コンポーネントをルートからエクスポートできます。`clientLoader`が水和で実行されると、ルーターコンポーネントがレンダリングされます。

## 引数

### `params`

この関数は、[`loader`][loader]と同じ[`params`][loader-params]引数を受け取ります。

### `request`

この関数は、[`loader`][loader]と同じ[`request`][loader-request]引数を受け取ります。

### `serverLoader`

`serverLoader`は、このルートのサーバー`loader`からデータを取得するための非同期関数です。クライアント側ナビゲーションでは、これはRemixサーバー`loader`への[fetch][fetch]呼び出しを行います。`clientLoader`を水和中に実行するようにオプトインした場合、この関数はサーバーですでにロードされたデータ（`Promise.resolve`経由）を返します。

関連項目：

- [クライアントデータガイド][client-data-guide]
- [HydrateFallback][hydratefallback]
- [clientAction][clientaction]

[loader]: ./loader
[loader-params]: ./loader#params
[loader-request]: ./loader#request
[clientaction]: ./client-action
[hydratefallback]: ./hydrate-fallback
[bff]: ../guides/bff
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[client-data-guide]: ../guides/client-data
