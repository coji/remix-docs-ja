---
title: HydrateFallback
---

# `HydrateFallback`

`HydrateFallback` コンポーネントは、Remix に、`clientLoader` が hydration を完了するまでルートコンポーネントをレンダリングしないように指示する方法です。エクスポートされると、Remix はデフォルトのルートコンポーネントではなく、SSR 中にフォールバックをレンダリングし、`clientLoader` が完了したらクライアントサイドでルートコンポーネントをレンダリングします。

これの最も一般的なユースケースは、クライアントのみのルート（ブラウザ内キャンバスゲームなど）と、サーバーデータにクライアントサイドデータ（保存されたユーザー設定など）を追加することです。

```tsx filename=routes/client-only-route.tsx
export async function clientLoader() {
  const data = await loadSavedGameOrPrepareNewGame();
  return data;
}
// 注：clientLoader.hydrate はサーバーローダーがない場合、暗黙的に指定されます

export function HydrateFallback() {
  return <p>ゲームを読み込んでいます...</p>;
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
  return <p>ユーザー設定を読み込んでいます...</p>;
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

`HydrateFallback` の動作に関する注意点がいくつかあります。

- 最初のドキュメントリクエストと hydration にのみ関連し、その後のクライアントサイドナビゲーションではレンダリングされません。
- 特定のルートで [`clientLoader.hydrate=true`][hydrate-true] を設定している場合にのみ関連します。
- また、サーバー `loader` がない `clientLoader` がある場合も関連します。これは、`useLoaderData` から返されるローダーデータがないため、`clientLoader.hydrate=true` が暗黙的に指定されていることを意味します。
  - この場合、`HydrateFallback` を指定しなくても、Remix はルートコンポーネントをレンダリングせず、祖先の `HydrateFallback` コンポーネントにバブルアップします。
  - これは、`useLoaderData` が「ハッピーパス」を維持することを保証するためです。
  - サーバー `loader` がない場合、`useLoaderData` はレンダリングされたルートコンポーネントで `undefined` を返します。
- 子ルートが正しく動作することを保証できないため、`HydrateFallback` 内に `<Outlet/>` をレンダリングすることはできません。なぜなら、子ルートが hydration で `clientLoader` 関数を実行している場合（つまり、`useRouteLoaderData()` や `useMatches()` などのユースケース）、祖先ローダーデータがまだ利用できない可能性があるためです。

関連項目:

- [clientLoader][clientloader]

[hydrate-true]: ./client-loader#clientloaderhydrate
[clientloader]: ./client-loader
