---
title: クライアントデータ
---

# クライアントデータ

Remixは[`v2.4.0`][2.4.0]で「クライアントデータ」([RFC][rfc])のサポートを導入しました。これにより、ルートから[`clientLoader`][clientloader]/[`clientAction`][clientaction]をエクスポートすることで、ブラウザでルートローダー/アクションを実行することを選択できます。

これらの新しいエクスポートは少し扱いが難しいものであり、*主要な*データ読み込み/送信メカニズムとして推奨されるものではありません。代わりに、以下のような高度なユースケースに対応するためのレバーとして利用できます。

* **ホップをスキップ:** ブラウザから直接データAPIをクエリし、ローダーをSSRのためだけに使用する
* **フルスタック状態:** ローダーデータの完全なセットのために、サーバーデータをクライアントデータで補強する
* **どちらか一方:** サーバーローダーを使用する場合もあれば、クライアントローダーを使用する場合もあるが、1つのルートで両方を使用することはない
* **クライアントキャッシュ:** サーバーローダーデータをクライアントにキャッシュし、一部のサーバー呼び出しを回避する
* **移行:** React Router -> Remix SPA -> Remix SSRへの移行を容易にする（Remixが[SPAモード][rfc-spa]をサポートしたら）

これらの新しいエクスポートは慎重に使用してください！注意しないと、UIが同期しなくなる可能性があります。Remixは、デフォルトではこれが起こらないように*非常に*努力していますが、独自のクライアント側キャッシュを制御し、Remixが通常のサーバー`fetch`呼び出しを実行するのを防ぐ可能性がある場合、RemixはUIが同期した状態を維持することを保証できなくなります。

[rfc]: https://github.com/remix-run/remix/blob/main/decisions/0007-client-data.md
[2.4.0]: https://github.com/remix-run/remix/releases/tag/remix%402.4.0
[clientloader]: https://remix.run/docs/en/main/route/client-loader
[clientaction]: https://remix.run/docs/en/main/route/client-action
[rfc-spa]: https://github.com/remix-run/remix/blob/main/decisions/0008-spa-mode.md

## ホップをスキップする

[BFF][bff]アーキテクチャでRemixを使用する場合、Remixサーバーのホップをスキップして、バックエンドAPIに直接アクセスすることが有利な場合があります。これは、認証を適切に処理でき、CORSの問題に悩まされないことを前提としています。Remix BFFホップは、次のようにスキップできます。

1. ドキュメントのロード時にサーバーの`loader`からデータをロードする
2. 後続のすべてのロードで`clientLoader`からデータをロードする

このシナリオでは、Remixはハイドレーション時に`clientLoader`を*呼び出さず*、後続のナビゲーションでのみ呼び出します。

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

場合によっては、「フルスタックステート」を活用したいことがあります。これは、データの一部がサーバーから、一部がブラウザ（つまり、`IndexedDB`やその他のブラウザSDK）から取得されるものの、データの組み合わせが揃うまでコンポーネントをレンダリングできない場合です。これらの2つのデータソースを組み合わせる方法は次のとおりです。

1. ドキュメントのロード時に、サーバーの`loader`から部分的なデータをロードします。
2. SSR中にレンダリングするための[`HydrateFallback`][hydratefallback]コンポーネントをエクスポートします。これは、まだ完全なデータセットがないためです。
3. `clientLoader.hydrate = true`を設定します。これにより、Remixは初期ドキュメントのハイドレーションの一部としてclientLoaderを呼び出すように指示されます。
4. `clientLoader`でサーバーデータとクライアントデータを結合します。

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
  return <p>SSR中にレンダリングされるスケルトン</p>; // (2)
}

export default function Component() {
  // これは常にサーバーとクライアントのデータの組み合わせになります
  const data = useLoaderData();
  return <>...</>;
}
```

## どちらか一方

アプリケーション内でデータ読み込み戦略を混在させたい場合があるかもしれません。例えば、一部のルートではサーバーでのみデータを読み込み、別のルートではクライアントでのみデータを読み込むようにしたい場合です。これはルートごとに次のように選択できます。

1. サーバーデータを使用したい場合は `loader` をエクスポートする
2. クライアントデータを使用したい場合は `clientLoader` と `HydrateFallback` をエクスポートする

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
// 注: これを明示的に設定する必要はありません - `loader` がない場合は暗黙的に設定されます
clientLoader.hydrate = true;

// (2)
export function HydrateFallback() {
  return <p>SSR中にレンダリングされるスケルトン</p>;
}

export default function Component() {
  const data = useLoaderData(); // (2) - クライアントデータ
  return <>...</>;
}
```

## クライアントキャッシュ

クライアント側のキャッシュ（メモリ、ローカルストレージなど）を活用して、以下のようにサーバーへの特定の呼び出しをバイパスできます。

1. ドキュメントのロード時にサーバーの `loader` からデータをロードします。
2. `clientLoader.hydrate = true` を設定してキャッシュをプライムします。
3. 後続のナビゲーションを `clientLoader` を介してキャッシュからロードします。
4. `clientAction` でキャッシュを無効化します。

`HydrateFallback` コンポーネントをエクスポートしていないため、ルートコンポーネントを SSR し、ハイドレーション時に `clientLoader` を実行することに注意してください。したがって、ハイドレーションエラーを避けるために、初期ロード時に `loader` と `clientLoader` が同じデータを返すことが重要です。

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

## マイグレーション

[SPAモード][rfc-spa]が実装され次第、マイグレーションに関する個別のガイドを作成する予定ですが、現時点では、以下の様なプロセスになると予想しています。

1. `createBrowserRouter`/`RouterProvider`に移行することで、React Router SPAにデータパターンを導入する
2. Remixへのマイグレーションに備えて、Viteを使用するようにSPAを移行する
3. Viteプラグイン（まだ提供されていません）を使用して、ファイルベースのルート定義に段階的に移行する
4. React Router SPAをRemix SPAモードに移行する。この際、現在のファイルベースの`loader`関数はすべて`clientLoader`として機能する
5. Remix SPAモードをオプトアウト（Remix SSRモードに移行）し、`loader`関数を`clientLoader`に検索/置換する
   * これでSSRアプリが実行されますが、すべてのデータローディングは`clientLoader`を介してクライアントで実行されます
6. `clientLoader -> loader`への移行を段階的に開始し、データローディングをサーバーに移行し始める

[rfc]: https://github.com/remix-run/remix/discussions/7634

[2.4.0]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v240

[clientloader]: ../route/client-loader

[clientaction]: ../route/client-action

[hydratefallback]: ../route/hydrate-fallback

[rfc-spa]: https://github.com/remix-run/remix/discussions/7638

[bff]: ../guides/bff

