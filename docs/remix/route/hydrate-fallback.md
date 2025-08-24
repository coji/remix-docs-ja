---
title: HydrateFallback
---

# `HydrateFallback`

`HydrateFallback` コンポーネントは、Remix に対して、ハイドレーション時に `clientLoader` が実行されるまでルートコンポーネントをレンダリングしたくないことを通知する方法です。エクスポートすると、Remix はデフォルトのルートコンポーネントの代わりに SSR 中にフォールバックをレンダリングし、`clientLoader` が完了するとクライアント側でルートコンポーネントをレンダリングします。

最も一般的なユースケースは、クライアント専用のルート（ブラウザ内キャンバスゲームなど）と、サーバーデータをクライアント側のデータ（保存されたユーザー設定など）で拡張することです。

```tsx filename=routes/client-only-route.tsx
export async function clientLoader() {
  const data = await loadSavedGameOrPrepareNewGame();
  return data;
}
// 注: server loader がない場合、clientLoader.hydrate は暗黙的に設定されます

export function HydrateFallback() {
  return <p>Loading Game...</p>;
}

export default function Component() {
  const data = useLoaderData<typeof clientLoader>();
  return <Game data={data} />;
}
```

```tsx filename=routes/augmenting-server-data.tsx
export async function loader() {
  const data = getServerData();
  return json(data);
}

export async function clientLoader({
  request,
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const [serverData, preferences] = await Promise.all([
    serverLoader(),
    getUserPreferences(),
  ]);
  return {
    ...serverData,
    preferences,
  };
}
clientLoader.hydrate = true;

export function HydrateFallback() {
  return <p>Loading user preferences...</p>;
}

export default function Component() {
  const data = useLoaderData<typeof clientLoader>();
  if (data.preferences.display === "list") {
    return <ListView items={data.items} />;
  } else {
    return <GridView items={data.items} />;
  }
}
```

`HydrateFallback` の動作に関して注意すべき点がいくつかあります。

- これは、最初のドキュメントリクエストとハイドレーションでのみ関連し、後続のクライアント側のナビゲーションではレンダリングされません。
- これは、特定のルートで [`clientLoader.hydrate=true`][hydrate-true] も設定している場合にのみ関連します。
- また、サーバーの `loader` なしで `clientLoader` を持つ場合にも関連します。これは、`useLoaderData` から返すローダーデータが他にないため、`clientLoader.hydrate=true` を意味します。
  - この場合、`HydrateFallback` を指定しなくても、Remix はルートコンポーネントをレンダリングせず、祖先の `HydrateFallback` コンポーネントまでバブルアップします。
  - これは、`useLoaderData` が「ハッピーパス」のままであることを保証するためです。
  - サーバーの `loader` がない場合、`useLoaderData` はレンダリングされたルートコンポーネントで `undefined` を返します。
- 子ルートは、ハイドレーション時に `clientLoader` 関数を実行している場合、祖先のローダーデータがまだ利用可能でない可能性があるため（つまり、`useRouteLoaderData()` や `useMatches()` などのユースケース）、正しく動作することが保証されないため、`HydrateFallback` で `<Outlet/>` をレンダリングすることはできません。

以下も参照してください。

- [clientLoader][clientloader]

[hydrate-true]: ./client-loader#clientloaderhydrate
[clientloader]: ./client-loader
