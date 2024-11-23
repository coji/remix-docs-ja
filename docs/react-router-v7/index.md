---
title: React Router ホーム
order: 1
---

# React Router ホーム

React Routerは、React 18からReact 19へのギャップを埋める、マルチストラテジーのReact用ルーターです。Reactフレームワークとして最大限に活用することも、独自のアーキテクチャを持つライブラリとして最小限に活用することもできます。

- [はじめに - フレームワーク](./start/framework/installation)
- [はじめに - ライブラリ](./start/library/installation)

今後の機能に追いついている場合は、React Router v6またはRemixからのアップグレードは一般的に破壊的ではありません。

- [v6からのアップグレード](./upgrading/v6)
- [Remixからのアップグレード](./upgrading/remix)

## ライブラリとしてのReact Router

以前のバージョンと同様に、React Routerはシンプルで宣言的なルーティングライブラリとしても使用できます。その唯一の役割は、URLをコンポーネントのセットにマッチングし、URLデータへのアクセスを提供し、アプリ内をナビゲートすることです。

この戦略は、独自のフロントエンドインフラストラクチャを持ち、ストレスのないアップグレードを探しているv6アプリの「シングルページアプリケーション」で人気があります。

保留中の状態がまれで、ユーザーが長期実行セッションを持っているオフライン+同期アーキテクチャに特に適しています。保留中の状態、コード分割、サーバーサイドレンダリング、SEO、初期ページロード時間などのフレームワーク機能は、インスタントのローカルファーストインタラクションのためにトレードオフできます。

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

ライブラリとしてのReact Routerを使い始めるには、[こちら](./start/library/installation)をご覧ください。

## フレームワークとしてのReact Router

React Routerは、Reactフレームワークとして最大限に活用できます。この設定では、React Router CLIとViteバンドラープラグインを使用して、フルスタック開発とデプロイアーキテクチャを使用します。これにより、React Routerは、ほとんどのウェブプロジェクトが求める多くの機能を提供できるようになります。これには以下が含まれます。

- Viteバンドラーと開発サーバーの統合
- ホットモジュール置換
- コード分割
- 型安全なルート規則
- ファイルシステムまたは設定ベースのルーティング
- 型安全なデータロード
- 型安全なアクション
- アクション後のページデータの自動再検証
- SSR、SPA、静的レンダリング戦略
- 保留中の状態と楽観的UIのAPI
- デプロイアダプター

ルートは`routes.ts`で設定され、React Routerが多くの作業を行うことができます。たとえば、各ルートを自動的にコード分割し、パラメーターとデータの型安全性を提供し、ユーザーが移動する際に保留中の状態にアクセスしてデータを自動的にロードします。

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

コンポーネントは、`routes.ts`から設定されたURLでレンダリングされ、ローダーデータはプロップとして渡されます。

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

アクションはデータを更新し、ページ上のすべてのデータの再検証をトリガーして、UIを自動的に最新の状態に保つことができます。

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

ルートモジュールは、SEO、アセットのロード、エラーバウンダリなどに関する規則も提供します。

フレームワークとしてのReact Routerを使い始めるには、[こちら](./start/framework/installation)をご覧ください。

