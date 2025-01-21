---
title: クライアントデータ
---

# クライアントデータ

`clientLoader` および `clientAction` 関数を使用して、ブラウザで直接データを取得および変更できます。

これらの関数は、[SPA モード][spa] を使用する場合のデータ処理の主要なメカニズムです。このガイドでは、サーバーサイドレンダリング (SSR) でクライアントデータを活用するための一般的なユースケースを示します。

## サーバーホップをスキップする

Backend-For-Frontend (BFF) アーキテクチャで React Router を使用する場合、React Router サーバーをバイパスして、バックエンド API と直接通信したい場合があります。このアプローチでは、適切な認証処理が必要であり、CORS 制限がないことを前提としています。これを実装する方法は次のとおりです。

1. ドキュメントのロード時にサーバーの `loader` からデータをロードします。
2. 後続のすべてのロードで `clientLoader` からデータをロードします。

このシナリオでは、React Router はハイデレーション時に `clientLoader` を呼び出しません。後続のナビゲーションでのみ呼び出します。

```tsx lines=[4,11]
export async function loader({
  request,
}: Route.LoaderArgs) {
  const data = await fetchApiFromServer({ request }); // (1)
  return data;
}

export async function clientLoader({
  request,
}: Route.ClientLoaderArgs) {
  const data = await fetchApiFromClient({ request }); // (2)
  return data;
}
```

## フルスタック状態

コンポーネントをレンダリングする前に、サーバーとブラウザの両方 (IndexedDB やブラウザ SDK など) からのデータを組み合わせる必要がある場合があります。このパターンを実装する方法は次のとおりです。

1. ドキュメントのロード時にサーバーの `loader` から部分的なデータをロードします。
2. まだ完全なデータセットがないため、SSR 中にレンダリングする [`HydrateFallback`][hydratefallback] コンポーネントをエクスポートします。
3. `clientLoader.hydrate = true` を設定します。これにより、React Router は初期ドキュメントのハイデレーションの一部として clientLoader を呼び出すように指示されます。
4. `clientLoader` でサーバーデータをクライアントデータと組み合わせます。

```tsx lines=[4-6,19-20,23,26]
export async function loader({
  request,
}: Route.LoaderArgs) {
  const partialData = await getPartialDataFromDb({
    request,
  }); // (1)
  return partialData;
}

export async function clientLoader({
  request,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const [serverData, clientData] = await Promise.all([
    serverLoader(),
    getClientData(request),
  ]);
  return {
    ...serverData, // (4)
    ...clientData, // (4)
  };
}
clientLoader.hydrate = true as const; // (3)

export function HydrateFallback() {
  return <p>SSR 中にレンダリングされるスケルトン</p>; // (2)
}

export default function Component({
  // これは常にサーバーデータとクライアントデータの組み合わせになります
  loaderData,
}: Route.ComponentProps) {
  return <>...</>;
}
```

## サーバーまたはクライアントのデータロードの選択

アプリケーション全体でデータロード戦略を混在させ、各ルートでサーバーのみまたはクライアントのみのデータロードを選択できます。両方のアプローチを実装する方法は次のとおりです。

1. サーバーデータを使用する場合は `loader` をエクスポートします。
2. クライアントデータを使用する場合は `clientLoader` と `HydrateFallback` をエクスポートします。

サーバーローダーのみに依存するルートは次のようになります。

```tsx filename=app/routes/server-data-route.tsx
export async function loader({
  request,
}: Route.LoaderArgs) {
  const data = await getServerData(request);
  return data;
}

export default function Component({
  loaderData, // (1) - サーバーデータ
}: Route.ComponentProps) {
  return <>...</>;
}
```

クライアントローダーのみに依存するルートは次のようになります。

```tsx filename=app/routes/client-data-route.tsx
export async function clientLoader({
  request,
}: Route.ClientLoaderArgs) {
  const clientData = await getClientData(request);
  return clientData;
}
// 注: これを明示的に設定する必要はありません。`loader` がない場合は暗黙的に設定されます。
clientLoader.hydrate = true;

// (2)
export function HydrateFallback() {
  return <p>SSR 中にレンダリングされるスケルトン</p>;
}

export default function Component({
  loaderData, // (2) - クライアントデータ
}: Route.ComponentProps) {
  return <>...</>;
}
```

## クライアント側のキャッシュ

クライアント側のキャッシュ (メモリ、localStorage などを使用) を実装して、サーバーリクエストを最適化できます。キャッシュ管理を示すパターンを次に示します。

1. ドキュメントのロード時にサーバーの `loader` からデータをロードします。
2. `clientLoader.hydrate = true` を設定してキャッシュを準備します。
3. `clientLoader` を介してキャッシュから後続のナビゲーションをロードします。
4. `clientAction` でキャッシュを無効にします。

`HydrateFallback` コンポーネントをエクスポートしていないため、ルートコンポーネントを SSR し、ハイデレーション時に `clientLoader` を実行することに注意してください。したがって、ハイデレーションエラーを回避するために、初期ロード時に `loader` と `clientLoader` が同じデータを返すことが重要です。

```tsx lines=[4,26,32,39,46]
export async function loader({
  request,
}: Route.LoaderArgs) {
  const data = await getDataFromDb({ request }); // (1)
  return data;
}

export async function action({
  request,
}: Route.ActionArgs) {
  await saveDataToDb({ request });
  return { ok: true };
}

let isInitialRequest = true;

export async function clientLoader({
  request,
  serverLoader,
}: Route.ClientLoaderArgs) {
  const cacheKey = generateKey(request);

  if (isInitialRequest) {
    isInitialRequest = false;
    const serverData = await serverLoader();
    cache.set(cacheKey, serverData); // (2)
    return serverData;
  }

  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return cachedData; // (3)
  }

  const serverData = await serverLoader();
  cache.set(cacheKey, serverData);
  return serverData;
}
clientLoader.hydrate = true; // (2)

export async function clientAction({
  request,
  serverAction,
}: Route.ClientActionArgs) {
  const cacheKey = generateKey(request);
  cache.delete(cacheKey); // (4)
  const serverData = await serverAction();
  return serverData;
}
```

[spa]: ../how-to/spa
[hydratefallback]: ../start/framework/route-module#hydratefallback

