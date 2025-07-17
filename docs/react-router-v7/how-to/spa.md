---
title: シングルページアプリケーション (SPA)
---

# シングルページアプリケーション (SPA)

[MODES: framework]

<br/>
<br/>

<docs-info>このガイドでは、React Routerのフレームワークモードでシングルページアプリケーションを構築する方法に焦点を当てています。React Routerを宣言型またはデータモードで使用している場合は、独自のSPAアーキテクチャを設計できます。</docs-info>

React Routerをフレームワークとして使用する場合、`react-router.config.ts`ファイルで`ssr:false`を設定することで「SPAモード」を有効にできます。これにより、ランタイムサーバーレンダリングが無効になり、ビルド時に`index.html`が生成され、それをSPAとして提供およびハイドレートできます。

一般的なシングルページアプリケーションは、ほとんど空の`<div id="root"></div>`しかない、ほぼ空白の`index.html`テンプレートを送信します。対照的に、`react-router build`（SPAモード）は、ビルド時にルートルートを`index.html`ファイルにプリレンダリングします。これにより、次のことが可能になります。

- 空の`<div>`以上のものを送信する
- ルート`loader`を使用してアプリケーションシェル用のデータをロードする
- Reactコンポーネントを使用して、ユーザーが最初に目にするページ（ルート`HydrateFallback`）を生成する
- 後でUIを変更することなくサーバーレンダリングを再有効化する

<docs-info>SPAモードは、「プリレンダリング」の特殊な形式であり、アプリケーション内のすべてのパスを同じHTMLファイルから提供できます。より広範なプリレンダリングを行いたい場合は、[プリレンダリング](./pre-rendering)ガイドを参照してください。</docs-info>

## 1. ランタイムサーバーレンダリングを無効にする

サーバーレンダリングはデフォルトで有効になっています。無効にするには、`react-router.config.ts`で`ssr`フラグを`false`に設定します。

```ts filename=react-router.config.ts lines=[4]
import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
} satisfies Config;
```

これを`false`に設定すると、サーバービルドは生成されなくなります。

<docs-info>`ssr:false`を設定しても、_ランタイムサーバーレンダリング_のみが無効になることに注意することが重要です。React Routerは、`index.html`ファイルを生成するために、_ビルド時_にルートルートをサーバーレンダリングします。そのため、プロジェクトには引き続き`@react-router/node`への依存関係が必要であり、ルートはSSRセーフである必要があります。これは、サーバーレンダリングが無効になっている場合でも、初期レンダリング中に`window`やその他のブラウザ専用APIを呼び出すことができないことを意味します。</docs-info>

## 2. ルートルートに`HydrateFallback`とオプションの`loader`を追加する

SPAモードでは、ビルド時に`index.html`ファイルが生成され、それをSPAのエントリポイントとして提供できます。これにより、ルートルートのみがレンダリングされ、アプリケーション内の任意のパスでランタイムにハイドレートできるようになります。

空の`<div>`よりも優れたローディングUIを提供するために、ルートルートに`HydrateFallback`コンポーネントを追加して、ビルド時にローディングUIを`index.html`にレンダリングできます。これにより、SPAのロード/ハイドレート中にユーザーにすぐに表示されます。

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

ルートルートはビルド時にサーバーレンダリングされるため、必要に応じてルートルートで`loader`を使用することもできます。この`loader`はビルド時に呼び出され、データはオプションの`HydrateFallback`の`loaderData`プロップを介して利用可能になります。

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

SPAモードを使用している場合、[それらのページをプリレンダリング](./pre-rendering)していない限り、アプリケーションの他のルートに`loader`を含めることはできません。

## 3. クライアントローダーとクライアントアクションを使用する

サーバーレンダリングが無効になっている場合でも、`clientLoader`と`clientAction`を使用してルートデータとミューテーションを管理できます。

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

## 4. すべてのURLをindex.htmlに転送する

`react-router build`を実行した後、`build/client`ディレクトリを任意の静的ホストにデプロイします。

任意のSPAをデプロイする際に共通することですが、ホストを構成して、すべてのURLをクライアントビルドの`index.html`に転送する必要があります。一部のホストはデフォルトでこれを行いますが、そうでないホストもあります。例として、ホストはこれを行うために`_redirects`ファイルをサポートしている場合があります。

```
/*    /index.html   200
```

アプリケーションの有効なルートで404エラーが発生している場合、ホストを構成する必要がある可能性が高いです。
