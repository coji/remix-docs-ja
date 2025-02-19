---
title: 自動コード分割
---

# 自動コード分割

React Routerのフレームワーク機能を使用すると、アプリケーションへの初回ロード時間を改善するために、アプリケーションは自動的にコード分割されます。

## ルートによるコード分割

次のシンプルなルート設定を考えてみましょう。

```tsx filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/contact", "./contact.tsx"),
  route("/about", "./about.tsx"),
] satisfies RouteConfig;
```

すべてのルートを単一の巨大なビルドにバンドルする代わりに、参照されるモジュール（`contact.tsx`と`about.tsx`）がバンドラーのエントリーポイントになります。

これらのエントリーポイントはURLセグメントに結合されているため、React RouterはURLからどのバンドルがブラウザで必要か、さらに重要なことに、どれが必要でないかを把握できます。

ユーザーが`"/about"`にアクセスすると、`about.tsx`のバンドルはロードされますが、`contact.tsx`はロードされません。これにより、初期ページロードのJavaScriptフットプリントが大幅に削減され、アプリケーションが高速化されます。

## サーバーコードの削除

サーバー専用の[ルートモジュールAPI][route-module]は、バンドルから削除されます。次のルートモジュールを考えてみましょう。

```tsx
export async function loader() {
  return { message: "hello" };
}

export async function action() {
  console.log(Date.now());
  return { ok: true };
}

export async function headers() {
  return { "Cache-Control": "max-age=300" };
}

export default function Component({ loaderData }) {
  return <div>{loaderData.message}</div>;
}
```

ブラウザ用にビルドした後、`Component`のみがバンドルに残るため、他のモジュールエクスポートでサーバー専用のコードを使用できます。

## ルートモジュールの分割

<docs-info>

この機能は、`unstable_splitRouteModules` futureフラグを設定した場合にのみ有効になります。

```tsx filename=react-router-config.ts
export default {
  future: {
    unstable_splitRouteModules: true,
  },
};
```

</docs-info>

[ルートモジュールAPI][route-module]の利便性の1つは、ルートに必要なものがすべて1つのファイルにあることです。残念ながら、これは`clientLoader`、`clientAction`、および`HydrateFallback` APIを使用する場合に、パフォーマンスコストが発生する場合があります。

基本的な例として、次のルートモジュールを考えてみましょう。

```tsx filename=routes/example.tsx
import { MassiveComponent } from "~/components";

export async function clientLoader() {
  return await fetch("https://example.com/api").then(
    (response) => response.json()
  );
}

export default function Component({ loaderData }) {
  return <MassiveComponent data={loaderData} />;
}
```

この例では、基本的なfetch呼び出しを行う最小限の`clientLoader`エクスポートがありますが、デフォルトのコンポーネントエクスポートははるかに大きくなっています。これはパフォーマンス上の問題です。クライアント側でこのルートに移動する場合、クライアントローダーが実行を開始する前に、ルートモジュール全体をダウンロードする必要があるためです。

これをタイムラインとして視覚化するには：

<docs-info>次のタイムライン図では、ルートモジュールバー内で異なる文字を使用して、エクスポートされているさまざまなルートモジュールAPIを示しています。</docs-info>

```
ルートモジュールの取得：  |--=======|
clientLoaderの実行：            |-----|
レンダリング：                            |-|
```

代わりに、これを次のように最適化したいと考えています。

```
clientLoaderの取得：  |--|
コンポーネントの取得：     |=======|
clientLoaderの実行：     |-----|
レンダリング：                     |-|
```

この最適化を実現するために、React Routerは本番ビルドプロセス中にルートモジュールを複数の小さなモジュールに分割します。この場合、2つの別々の[仮想モジュール][virtual-modules]が作成されます。1つはクライアントローダー用、もう1つはコンポーネントとその依存関係用です。

```tsx filename=routes/example.tsx?route-chunk=clientLoader
export async function clientLoader() {
  return await fetch("https://example.com/api").then(
    (response) => response.json()
  );
}
```

```tsx filename=routes/example.tsx?route-chunk=main
import { MassiveComponent } from "~/components";

export default function Component({ loaderData }) {
  return <MassiveComponent data={loaderData} />;
}
```

<docs-info>この最適化はフレームワークモードで自動的に適用されますが、[ルートモジュールの遅延ロードに関するブログ記事][blog-lazy-loading-routes]で説明されているように、`route.lazy`を使用してライブラリモードで実装し、ルートを複数のファイルで作成することもできます。</docs-info>

これらが個別のモジュールとして利用できるようになったため、クライアントローダーとコンポーネントを並行してダウンロードできます。これは、クライアントローダーが準備でき次第、コンポーネントを待つことなく実行できることを意味します。

この最適化は、より多くのルートモジュールAPIが使用される場合にさらに顕著になります。たとえば、`clientLoader`、`clientAction`、および`HydrateFallback`を使用する場合、クライアント側のナビゲーション中の単一のルートモジュールのタイムラインは次のようになります。

```
ルートモジュールの取得：     |--~~++++=======|
clientLoaderの実行：                     |-----|
レンダリング：                                     |-|
```

これは代わりに次のように最適化されます。

```
clientLoaderの取得：     |--|
clientActionの取得：     |~~|
HydrateFallbackの取得：  SKIPPED
コンポーネントの取得：        |=======|
clientLoaderの実行：        |-----|
レンダリング：                        |-|
```

この最適化は、分割されるルートモジュールAPIが同じファイル内でコードを共有しない場合にのみ機能することに注意してください。たとえば、次のルートモジュールは分割できません。

```tsx filename=routes/example.tsx
import { MassiveComponent } from "~/components";

const shared = () => console.log("hello");

export async function clientLoader() {
  shared();
  return await fetch("https://example.com/api").then(
    (response) => response.json()
  );
}

export default function Component({ loaderData }) {
  shared();
  return <MassiveComponent data={loaderData} />;
}
```

このルートは引き続き機能しますが、クライアントローダーとコンポーネントの両方が同じファイル内で定義された`shared`関数に依存しているため、単一のルートモジュールに最適化されなくなります。

これを回避するには、エクスポート間で共有されるコードを別のファイルに抽出できます。例：

```tsx filename=routes/example/shared.tsx
export const shared = () => console.log("hello");
```

次に、最適化をトリガーせずに、ルートモジュールでこの共有コードをインポートできます。

```tsx filename=routes/example/route.tsx
import { MassiveComponent } from "~/components";
import { shared } from "./shared";

export async function clientLoader() {
  shared();
  return await fetch("https://example.com/api").then(
    (response) => response.json()
  );
}

export default function Component({ loaderData }) {
  shared();
  return <MassiveComponent data={loaderData} />;
}
```

共有コードは独自のモジュールにあるため、React Routerはルートモジュールを2つの別々の仮想モジュールに分割できるようになりました。

```tsx filename=routes/example/route.tsx?route-chunk=clientLoader
import { shared } from "./shared";

export async function clientLoader() {
  shared();
  return await fetch("https://example.com/api").then(
    (response) => response.json()
  );
}
```

```tsx filename=routes/example/route.tsx?route-chunk=main
import { MassiveComponent } from "~/components";
import { shared } from "./shared";

export default function Component({ loaderData }) {
  shared();
  return <MassiveComponent data={loaderData} />;
}
```

プロジェクトが特にパフォーマンスに敏感な場合は、`unstable_splitRouteModules` futureフラグを`"enforce"`に設定できます。

```tsx filename=react-router-config.ts
export default {
  future: {
    unstable_splitRouteModules: "enforce",
  },
};
```

この設定では、ルートモジュールを分割できない場合にエラーが発生します。

```
ルートモジュールの分割エラー：routes/example/route.tsx

- clientLoader

このエクスポートは、他のエクスポートとコードを共有しているため、独自のチャンクに分割できませんでした。共有コードを独自のモジュールに抽出し、ルートモジュール内でインポートする必要があります。
```

[route-module]: ../../start/framework/route-module
[virtual-modules]: https://vite.dev/guide/api-plugin#virtual-modules-convention
[blog-lazy-loading-routes]: https://remix.run/blog/lazy-loading-routes#advanced-usage-and-optimizations

