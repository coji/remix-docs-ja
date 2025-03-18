---
title: シングルページアプリケーション (SPA)
---

# シングルページアプリケーション (SPA)

React Router でシングルページアプリケーションを構築する方法は2つあります。

- **ライブラリとして** - React Router のフレームワーク機能を使用する代わりに、独自の SPA アーキテクチャでライブラリとして使用できます。[React Router をライブラリとして](../start/library/installation)のガイドを参照してください。
- **フレームワークとして** - このガイドではこちらに焦点を当てます。

## 概要

React Router をフレームワークとして使用する場合、`react-router.config.ts` ファイルで `ssr:false` を設定することで「SPA モード」を有効にできます。これにより、ランタイムサーバーレンダリングが無効になり、ビルド時に `index.html` が生成され、SPA として提供およびハイドレートできます。

一般的なシングルページアプリケーションは、ほとんど空の `index.html` テンプレートを送信し、空の `<div id="root"></div>` 程度しか含まれていません。対照的に、`react-router build` (SPA モード) は、ビルド時にルートルートを事前にレンダリングして `index.html` ファイルを作成します。これは、次のことを意味します。

- 空の `<div>` 以上のものを送信できる
- ルート `loader` を使用してアプリケーションシェルのデータをロードできる
- React コンポーネントを使用して、ユーザーが最初に表示するページを生成できる (ルート `HydrateFallback`)
- UI を変更せずに、後でサーバーレンダリングを再度有効にできる

`ssr:false` を設定すると、_ランタイムサーバーレンダリング_ のみが無効になることに注意することが重要です。React Router は、`index.html` ファイルを生成するために、_ビルド時_ にルートルートをサーバーレンダリングします。そのため、プロジェクトは `@react-router/node` に依存する必要があり、ルートは SSR セーフである必要があります。つまり、サーバーレンダリングが無効になっている場合でも、最初のレンダリング中に `window` やその他のブラウザ専用 API を呼び出すことはできません。

<docs-info>SPA モードは、アプリケーション内のすべてのパスを同じ HTML ファイルから提供できる「プリレンダリング」の特別な形式です。より広範なプリレンダリングを行う場合は、[プリレンダリング](./pre-rendering)ガイドを参照してください。</docs-info>

## 1. ランタイムサーバーレンダリングを無効にする

サーバーレンダリングはデフォルトで有効になっています。`react-router.config.ts` で `ssr` フラグを `false` に設定して無効にします。

```ts filename=react-router.config.ts lines=[4]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

これを false に設定すると、サーバービルドは生成されなくなります。

<docs-info>`ssr:false` を設定すると、_ランタイムサーバーレンダリング_ のみが無効になることに注意することが重要です。React Router は、`index.html` ファイルを生成するために、_ビルド時_ にルートルートをサーバーレンダリングします。そのため、プロジェクトは `@react-router/node` に依存する必要があり、ルートは SSR セーフである必要があります。つまり、サーバーレンダリングが無効になっている場合でも、最初のレンダリング中に `window` やその他のブラウザ専用 API を呼び出すことはできません。</docs-info>

## 2. `HydrateFallback` とオプションの `loader` をルートルートに追加する

SPA モードは、SPA のエントリポイントとして提供できる `index.html` ファイルをビルド時に生成します。これはルートルートのみをレンダリングするため、アプリケーション内の任意のパスでランタイムにハイドレートできます。

空の `<div>` よりも優れたローディング UI を提供するために、ルートルートに `HydrateFallback` コンポーネントを追加して、ビルド時にローディング UI を `index.html` にレンダリングできます。これにより、SPA のロード/ハイドレート中に、ユーザーにすぐに表示されます。

```tsx filename=root.tsx lines=[7-9]
import LoadingScreen from "./components/loading-screen";

export function Layout() {
  return <html>{/*...*/}</html>;
}

export function HydrateFallback() {
  return <LoadingScreen />;
}

export default function App() {
  return <Outlet />;
}
```

ルートルートはビルド時にサーバーレンダリングされるため、必要に応じてルートルートで `loader` を使用することもできます。この `loader` はビルド時に呼び出され、データはオプションの `HydrateFallback` `loaderData` プロパティを介して利用可能になります。

```tsx filename=root.tsx lines=[5,10,14]
import { Route } from "./+types/root";

export async function loader() {
  return {
    version: await getVersion(),
  };
}

export function HydrateFallback({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <h1>Loading version {loaderData.version}...</h1>
      <AwesomeSpinner />
    </div>
  );
}
```

[これらのページをプリレンダリング](./pre-rendering)していない限り、SPA モードを使用している場合は、アプリ内の他のルートに `loader` を含めることはできません。

## 3. クライアントローダーとクライアントアクションを使用する

サーバーレンダリングが無効になっている場合でも、`clientLoader` と `clientAction` を使用してルートデータとミューテーションを管理できます。

```tsx filename=some-route.tsx
import { Route } from "./+types/some-route";

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
  let data = await fetch(`/some/api/stuff/${params.id}`);
  return data;
}

export async function clientAction({
  request,
}: Route.ClientActionArgs) {
  let formData = await request.formData();
  return await processPayment(formData);
}
```

## 4. すべての URL を index.html にリダイレクトする

`react-router build` を実行した後、`build/client` ディレクトリを任意の静的ホストにデプロイします。

一般的な SPA のデプロイと同様に、ホストがすべての URL をクライアントビルドの `index.html` にリダイレクトするように構成する必要があります。一部のホストはデフォルトでこれを行いますが、そうでないホストもあります。例として、ホストはこれを実行するために `_redirects` ファイルをサポートする場合があります。

```
/*    /index.html   200
```

アプリの有効なルートで 404 エラーが発生する場合は、ホストを構成する必要がある可能性があります。

