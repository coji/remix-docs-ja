---
title: React Router ホーム
order: 1
---

# React Router ホーム

React Routerは、React 18からReact 19へのギャップを埋める、マルチ戦略ルーターです。Reactフレームワークとして最大限に活用することも、独自のアーキテクチャを持つライブラリとして最小限に活用することもできます。

- [入門 - フレームワーク](./start/framework/installation)
- [入門 - ライブラリ](./start/library/installation)

今後のフラグに対応している場合は、React Router v6またはRemixからのアップグレードは通常、破壊的変更ではありません。

- [v6からのアップグレード](./upgrading/v6)
- [Remixからのアップグレード](./upgrading/remix)

## ライブラリとしてのReact Router

以前のバージョンと同様に、React Routerはシンプルで宣言的なルーティングライブラリとして使用できます。その唯一の役割は、URLとコンポーネントのセットを照合し、URLデータへのアクセスを提供し、アプリ内を移動することです。

この戦略は、独自のフロントエンドインフラストラクチャを持つ「シングルページアプリケーション」や、ストレスフリーなアップグレードを求めるv6アプリで人気があります。

保留中の状態がまれで、ユーザーが長期にわたるセッションを持つオフライン+同期アーキテクチャに特に適しています。保留中の状態、コード分割、サーバーレンダリング、SEO、初期ページ読み込み時間などのフレームワーク機能を、インスタントのローカルファーストインタラクションと交換できます。

```tsx
ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="dashboard" element={<Dashboard />}>
        <Route index element={<RecentActivity />} />
        <Route path="project/:id" element={<Project />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
```

ライブラリとしてのReact Routerを使い始めるには、[こちら](./library/installation)をご覧ください。


## フレームワークとしてのReact Router

React Routerは、Reactフレームワークとして最大限に活用できます。この設定では、React Router CLIとViteバンドラープラグインを使用して、フルスタック開発とデプロイアーキテクチャを使用します。これにより、React Routerは、ほとんどのWebプロジェクトが必要とする多くの機能を提供できます。これには以下が含まれます。

- Viteバンドラーと開発サーバーの統合
- ホットモジュール置換
- コード分割
- 型安全なルート規約
- ファイルシステムまたは設定ベースのルーティング
- 型安全なデータ読み込み
- 型安全なアクション
- アクション後のページデータの自動再検証
- SSR、SPA、静的レンダリング戦略
- 保留中の状態と楽観的UIのAPI
- デプロイアダプター

ルートは`routes.ts`で設定されており、React Routerが多くの作業を行うことができます。たとえば、各ルートを自動的にコード分割し、パラメーターとデータの型安全性を提供し、ユーザーが移動する際に保留中の状態にアクセスしてデータを自動的に読み込みます。

```ts
import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("about", "./about.tsx"),

  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route(":city/:id", "./concerts/show.tsx")
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;
```

ほとんどの他の機能が構築されているルートモジュールAPIにアクセスできます。

ローダーはルートコンポーネントにデータを提供します。

```tsx
// ローダーはコンポーネントにデータを提供します
export async function loader({ params }: Route.LoaderArgs) {
  const [show, isLiked] = await Promise.all([
    fakeDb.find("show", params.id),
    fakeIsLiked(params.city),
  ]);
  return { show, isLiked };
}
```

コンポーネントは、`routes.ts`から設定されたURLでレンダリングされ、ローダーデータがプロップとして渡されます。

```tsx
export default function Show({
  loaderData,
}: Route.ComponentProps) {
  const { show, isLiked } = loaderData;
  return (
    <div>
      <h1>{show.name}</h1>
      <p>{show.description}</p>

      <form method="post">
        <button
          type="submit"
          name="liked"
          value={isLiked ? 0 : 1}
        >
          {isLiked ? "Remove" : "Save"}
        </button>
      </form>
    </div>
  );
}
```

アクションはデータの更新とページ上のすべてのデータの再検証をトリガーできるため、UIは自動的に最新の状態を維持します。

```tsx
export async function action({
  request,
  params,
}: Route.LoaderArgs) {
  const formData = await request.formData();
  await fakeSetLikedShow(formData.get("liked"));
  return { ok: true };
}
```

ルートモジュールは、SEO、アセットの読み込み、エラー境界などに関する規約も提供します。

フレームワークとしてのReact Routerを使い始めるには、[こちら](./start/framework/installation)をご覧ください。

