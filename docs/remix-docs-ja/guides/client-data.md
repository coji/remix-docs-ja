---
title: クライアントデータ
---

# クライアントデータ

Remix は [`v2.4.0`][2.4.0] で "クライアントデータ" ([RFC][rfc]) のサポートを追加しました。これにより、ルートの [`clientLoader`][clientloader]/[`clientAction`][clientaction] エクスポートを使用して、ブラウザでルートローダー/アクションを実行することを選択できます。

これらの新しいエクスポートは非常に鋭利なナイフのようなものであり、_主要_なデータの読み込み/送信メカニズムとしては推奨されません。代わりに、次のいくつかの高度なユースケースのために活用できるツールです。

- **ホップのスキップ:** ローダーを SSR にのみ使用して、ブラウザから直接データ API をクエリします
- **フルスタックステート:** サーバーデータにクライアントデータを拡張して、ローダーデータの完全なセットを作成します
- **いずれか一方:** あるときはサーバーローダーを使用し、またあるときはクライアントローダーを使用しますが、1 つのルートでは両方を使用しません
- **クライアントキャッシュ:** サーバーローダーデータをクライアントにキャッシュして、サーバー呼び出しを回避します
- **移行:** React Router -> Remix SPA -> Remix SSR への移行を容易にします（Remix が [SPA モード][rfc-spa] をサポートするようになりました）

これらの新しいエクスポートは注意して使用してください。注意しないと、UI が同期しなくなる可能性があります。Remix は、標準でこれが起こらないようにするために、非常に努力していますが、一度クライアント側のキャッシュを自分で制御し、Remix が通常のサーバー `fetch` 呼び出しを実行することを阻止した場合、Remix は UI の同期を保証できなくなります。

## ホップのスキップ

[BFF][bff] アーキテクチャで Remix を使用する場合、Remix サーバーホップをスキップして、バックエンド API に直接アクセスすることが有利な場合があります。これは、認証を適切に処理でき、CORS の問題が発生しないことを前提としています。Remix BFF ホップをスキップする方法は次のとおりです。

1. ドキュメントの読み込み時にサーバー `loader` からデータをロードします
2. 以降のすべての読み込み時に `clientLoader` からデータをロードします

このシナリオでは、Remix はハイドレーション時に `clientLoader` を呼び出さず、以降のナビゲーション時にのみ呼び出します。

```tsx lines=[8,15]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const data = await fetchApiFromServer({ request }); // (1)
  return json(data);
}

export async function clientLoader({
  request,
}: ClientLoaderFunctionArgs) {
  const data = await fetchApiFromClient({ request }); // (2)
  return data;
}
```

## フルスタックステート

データの一部がサーバーから、一部がブラウザ（つまり、`IndexedDB` またはその他のブラウザ SDK）から取得される "フルスタックステート" を活用したい場合があります。ただし、データの組み合わせが揃うまで、コンポーネントをレンダリングすることはできません。これらの 2 つのデータソースを組み合わせる方法は次のとおりです。

1. ドキュメントの読み込み時にサーバー `loader` から部分的なデータをロードします
2. まだデータの完全なセットが揃っていないため、SSR 時にレンダリングする [`HydrateFallback`][hydratefallback] コンポーネントをエクスポートします
3. `clientLoader.hydrate = true` を設定します。これにより、Remix は初期ドキュメントのハイドレーションの一部として clientLoader を呼び出すように指示されます
4. `clientLoader` でサーバーデータとクライアントデータを組み合わせます

```tsx lines=[8-10,23-24,27,30]
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const partialData = await getPartialDataFromDb({
    request,
  }); // (1)
  return json(partialData);
}

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const [serverData, clientData] = await Promise.all([
    serverLoader(),
    getClientData(request),
  ]);
  return {
    ...serverData, // (4)
    ...clientData, // (4)
  };
}
clientLoader.hydrate = true; // (3)

export function HydrateFallback() {
  return <p>SSR 時にレンダリングされるスケルトン</p>; // (2)
}

export default function Component() {
  // これは常にサーバー + クライアントデータの組み合わせになります
  const data = useLoaderData();
  return <>...</>;
}
```

## いずれか一方

アプリケーションでデータ読み込み戦略を組み合わせ、一部のルートではサーバーでのみデータを読み込み、一部のルートではクライアントでのみデータを読み込むようにしたい場合があります。ルートごとに次のように選択できます。

1. サーバーデータを使用する場合は `loader` をエクスポートします
2. クライアントデータを使用する場合は、`clientLoader` と `HydrateFallback` をエクスポートします

サーバーローダーのみに依存するルートは次のようになります。

```tsx filename=app/routes/server-data-route.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const data = await getServerData(request);
  return json(data);
}

export default function Component() {
  const data = useLoaderData(); // (1) - サーバーデータ
  return <>...</>;
}
```

クライアントローダーのみに依存するルートは次のようになります。

```tsx filename=app/routes/client-data-route.tsx
import type { ClientLoaderFunctionArgs } from "@remix-run/react";

export async function clientLoader({
  request,
}: ClientLoaderFunctionArgs) {
  const clientData = await getClientData(request);
  return clientData;
}
// 注：これは明示的に設定する必要はありません。`loader` がない場合は暗黙的に設定されます
clientLoader.hydrate = true;

// (2)
export function HydrateFallback() {
  return <p>SSR 時にレンダリングされるスケルトン</p>;
}

export default function Component() {
  const data = useLoaderData(); // (2) - クライアントデータ
  return <>...</>;
}
```

## クライアントキャッシュ

クライアント側のキャッシュ（メモリ、ローカルストレージなど）を活用して、サーバーへの特定の呼び出しを回避することができます。

1. ドキュメントの読み込み時にサーバー `loader` からデータをロードします
2. `clientLoader.hydrate = true` を設定して、キャッシュを準備します
3. `clientLoader` を使用して、以降のナビゲーションをキャッシュからロードします
4. `clientAction` でキャッシュを無効化します

`HydrateFallback` コンポーネントをエクスポートしていないため、ルートコンポーネントを SSR して、ハイドレーション時に `clientLoader` を実行します。そのため、初期読み込み時に `loader` と `clientLoader` が同じデータを返すことが重要です。そうしないと、ハイドレーションエラーが発生します。

```tsx lines=[14,36,42,49,56]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import type {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
} from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const data = await getDataFromDb({ request }); // (1)
  return json(data);
}

export async function action({
  request,
}: ActionFunctionArgs) {
  await saveDataToDb({ request });
  return json({ ok: true });
}

let isInitialRequest = true;

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
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
}: ClientActionFunctionArgs) {
  const cacheKey = generateKey(request);
  cache.delete(cacheKey); // (4)
  const serverData = await serverAction();
  return serverData;
}
```

## 移行

[SPA モード][rfc-spa] が実装されたら、移行に関する別のガイドを作成する予定ですが、現時点では次の手順になると思われます。

1. `createBrowserRouter`/`RouterProvider` に移行して、React Router SPA にデータパターンを導入します
2. Remix への移行に備えて、SPA を Vite を使用して移行します
3. Vite プラグイン（まだ提供されていません）を使用して、ファイルベースのルート定義に段階的に移行します
4. 現在のファイルベースの `loader` 関数が `clientLoader` として機能する、Remix SPA モードに React Router SPA を移行します
5. Remix SPA モード（Remix SSR モード）をオプトアウトして、`loader` 関数を `clientLoader` に見つけて置き換えます
   - これで SSR アプリケーションを実行していますが、すべてのデータ読み込みは `clientLoader` を介してクライアントでまだ行われています
6. `clientLoader -> loader` を段階的に移行して、データ読み込みをサーバーに移行していきます

[rfc]: https://github.com/remix-run/remix/discussions/7634
[2.4.0]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v240
[clientloader]: ../route/client-loader
[clientaction]: ../route/client-action
[hydratefallback]: ../route/hydrate-fallback
[rfc-spa]: https://github.com/remix-run/remix/discussions/7638
[bff]: ../guides/bff

