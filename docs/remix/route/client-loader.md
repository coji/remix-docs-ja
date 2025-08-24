---
title: clientLoader
---

# `clientLoader`

[`loader`][loader] に加えて（または代わりに）、クライアントで実行される `clientLoader` 関数を定義できます。

各ルートは、レンダリング時にルートにデータを提供する `clientLoader` 関数を定義できます。

```tsx
export const clientLoader = async ({
  request,
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  // サーバーローダーを呼び出す
  const serverData = await serverLoader();
  // および/またはクライアントでデータをフェッチする
  const data = getDataFromClient();
  // useLoaderData() を通して公開するデータを返す
  return data;
};
```

この関数はクライアントでのみ実行され、いくつかの方法で使用できます。

- 完全なクライアントルートの場合、サーバーの `loader` の代わりに使用する
- ミューテーション時にキャッシュを無効化することで、`clientLoader` キャッシュと併用する
  - サーバーへの呼び出しをスキップするためのクライアント側のキャッシュを維持する
  - Remix [BFF][bff] ホップをバイパスし、クライアントから直接 API にアクセスする
- サーバーからロードされたデータをさらに拡張する
  - 例：`localStorage` からユーザー固有の設定をロードする
- React Router からの移行を容易にする

## ハイドレーションの動作

デフォルトでは、最初の SSR ドキュメントリクエストで Remix アプリのハイドレーション中に、ルートに対して `clientLoader` は**実行されません**。これは、`clientLoader` がサーバーの `loader` データの形状を変更せず、後続のクライアント側のナビゲーション（キャッシュから読み取るか、API に直接アクセスする）の最適化にすぎないという、主な（より単純な）ユースケースのためです。

```tsx
export async function loader() {
  // SSR 中は、DB と直接通信します
  const data = getServerDataFromDb();
  return json(data);
}

export async function clientLoader() {
  // クライアント側のナビゲーション中は、公開された API エンドポイントに直接アクセスします
  const data = await fetchDataFromApi();
  return data;
}

export default function Component() {
  const data = useLoaderData<typeof loader>();
  return <>...</>;
}
```

### `clientLoader.hydrate`

最初のドキュメントリクエストでのハイドレーション中に `clientLoader` を実行する必要がある場合は、`clientLoader.hydrate=true` を設定することでオプトインできます。これにより、Remix はハイドレーション時に `clientLoader` を実行する必要があることを認識します。`HydrateFallback` がない場合、ルートコンポーネントはサーバーの `loader` データで SSR され、その後 `clientLoader` が実行され、返されたデータはハイドレートされたルートコンポーネント内でインプレースで更新されます。

<docs-info>ルートが `clientLoader` をエクスポートし、サーバーの `loader` をエクスポートしない場合、SSR で使用するサーバーデータがないため、`clientLoader.hydrate` は自動的に `true` として扱われます。したがって、ルートコンポーネントをレンダリングする前に、常にハイドレーション時に `clientLoader` を実行する必要があります。</docs-info>

### HydrateFallback

`clientLoader` から取得する必要があるデータがあるため、SSR 中にデフォルトのルートコンポーネントをレンダリングしないようにする必要がある場合は、SSR 中にレンダリングされる [`HydrateFallback`][hydratefallback] コンポーネントをルートからエクスポートできます。`clientLoader` がハイドレーションで実行された場合にのみ、ルーターコンポーネントがレンダリングされます。

## 引数

### `params`

この関数は、[`loader`][loader] と同じ [`params`][loader-params] 引数を受け取ります。

### `request`

この関数は、[`loader`][loader] と同じ [`request`][loader-request] 引数を受け取ります。

### `serverLoader`

`serverLoader` は、このルートのサーバー `loader` からデータを取得するための非同期関数です。クライアント側のナビゲーションでは、これは Remix サーバーの `loader` への [fetch][fetch] 呼び出しを行います。ハイドレーション時に `clientLoader` を実行することを選択した場合、この関数はサーバーで既にロードされたデータ（`Promise.resolve` を介して）を返します。

以下も参照してください。

- [クライアントデータガイド][client-data-guide]
- [HydrateFallback][hydratefallback]
- [clientAction][clientaction]

[loader]: ./loader
[loader-params]: ./loader#params
[loader-request]: ./loader#request
[clientaction]: ./client-action
[hydratefallback]: ./hydrate-fallback
[bff]: ../guides/bff
[fetch]: https://developer.mozilla.org/ja/docs/Web/API/Fetch_API
[client-data-guide]: ../guides/client-data
