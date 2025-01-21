---
title: React Router ホーム
order: 1
---

# React Router ホーム

React Router は、React 18 から React 19 へのギャップを埋める、React 用のマルチストラテジー ルーターです。React フレームワークとして最大限に活用することも、独自のアーキテクチャを持つライブラリとして最小限に活用することもできます。

- [はじめに - フレームワーク](./start/framework/installation)
- [はじめに - ライブラリ](./start/library/installation)

将来のフラグについて理解している場合、React Router v6 または Remix からのアップグレードは、一般的に非破壊的です。

- [v6 からのアップグレード](./upgrading/v6)
- [Remix からのアップグレード](./upgrading/remix)

## ライブラリとしての React Router

以前のバージョンと同様に、React Router はシンプルで宣言的なルーティング ライブラリとして使用できます。その役割は、URL をコンポーネントのセットにマッチングさせ、URL データへのアクセスを提供し、アプリ内をナビゲートすることだけです。

この戦略は、独自のフロントエンド インフラストラクチャを持つ「シングルページ アプリ」や、ストレスのないアップグレードを求める v6 アプリで人気があります。

特に、保留状態がまれで、ユーザーが長時間セッションを行うオフライン + 同期アーキテクチャに適しています。保留状態、コード分割、サーバーレンダリング、SEO、初期ページロード時間などのフレームワーク機能は、ローカルファーストの即時インタラクションと交換できます。

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

ライブラリとしての React Router を[使い始める](./start/library/installation)。

## フレームワークとしての React Router

React Router は、React フレームワークとして最大限に活用できます。この設定では、React Router CLI と Vite バンドラー プラグインを使用して、フルスタックの開発およびデプロイ アーキテクチャを実現します。これにより、React Router は、ほとんどの Web プロジェクトで必要となる可能性のある、以下のような多くの機能を提供できます。

- Vite バンドラーと開発サーバーの統合
- ホットモジュールリプレースメント
- コード分割
- 型安全性を備えたルート規約
- ファイルシステムまたは構成ベースのルーティング
- 型安全性を備えたデータローディング
- 型安全性を備えたアクション
- アクション後のページデータの自動再検証
- SSR、SPA、静的レンダリング戦略
- 保留状態と楽観的 UI のための API
- デプロイメントアダプター

ルートは `routes.ts` で構成されており、React Router が多くのことを実行できるようにします。たとえば、各ルートを自動的にコード分割し、パラメーターとデータの型安全性を確保し、ユーザーがナビゲートするときに保留状態へのアクセスとともにデータを自動的にロードします。

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
    route(":city/:id", "./concerts/show.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;
```

他のほとんどの機能が構築されているルートモジュール API にアクセスできます。

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

コンポーネントは、routes.ts から構成された URL でレンダリングされ、ローダーデータがプロップとして渡されます。

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

アクションはデータを更新し、ページ上のすべてのデータの再検証をトリガーして、UI が自動的に最新の状態を維持できるようにします。

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

ルートモジュールは、SEO、アセットローディング、エラー境界などの規約も提供します。

フレームワークとしての React Router を[使い始める](./start/framework/installation)。

