---
title: モードの選択
order: 1
---

# モードの選択

React Routerは、Reactのためのマルチストラテジーなルーターです。アプリで使用するには、主に3つの方法、つまり「モード」があります。ドキュメント全体で、コンテンツがどのモードに関連しているかを示すこれらのアイコンが表示されます。

[MODES: framework, data, declarative]

<p></p>

各モードで利用できる機能は追加されていくため、DeclarativeからData、そしてFrameworkへと移行すると、アーキテクチャの制御と引き換えに、より多くの機能が追加されます。したがって、React Routerからどれだけの制御または支援が必要かに基づいてモードを選択してください。

モードは、使用している「トップレベル」のルーターAPIによって異なります。

## Declarative

Declarativeモードでは、URLとコンポーネントのマッチング、アプリ内のナビゲーション、`<Link>`、`useNavigate`、`useLocation`などのAPIによるアクティブな状態の提供など、基本的なルーティング機能が有効になります。

```tsx
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

## Data

ルート構成をReactのレンダリングの外に移動することで、Dataモードでは、`loader`、`action`、`useFetcher`などのAPIを使用して、データローディング、アクション、保留状態などを追加します。

```tsx
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

let router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    loader: loadRootData,
  },
]);

ReactDOM.createRoot(root).render(
  <RouterProvider router={router} />
);
```

## Framework

Frameworkモードは、DataモードをViteプラグインでラップし、次の機能を追加して、完全なReact Routerエクスペリエンスを実現します。

- 型安全な `href`
- 型安全な Route Module API
- インテリジェントなコード分割
- SPA、SSR、静的レンダリング戦略
- その他

```ts filename=routes.ts
import { index, route } from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("products/:pid", "./product.tsx"),
];
```

これにより、型安全なパラメータ、loaderData、コード分割、SPA/SSR/SSG戦略などを備えたRoute Module APIにアクセスできるようになります。

```ts filename=product.tsx
import { Route } from "+./types/product.tsx";

export async function loader({ params }: Route.LoaderArgs) {
  let product = await getProduct(params.pid);
  return { product };
}

export default function Product({
  loaderData,
}: Route.ComponentProps) {
  return <div>{loaderData.product.name}</div>;
}
```

## 選択のアドバイス

どのモードも、あらゆるアーキテクチャとデプロイメントターゲットをサポートしているため、SSR、SPAなどを実行したいかどうかは問題ではありません。どれだけ自分でやりたいかという問題です。

**次のような場合は、Frameworkモードを使用してください。**

- 意見を持つにはまだ経験が浅い
- Next.js、Solid Start、SvelteKit、Astro、TanStack Startなどを検討しており、比較したい
- Reactで何かを構築したいだけ
- サーバーレンダリングが必要になるかもしれないし、そうでないかもしれない
- Remixから移行する場合（React Router v7はRemix v2の「次のバージョン」です）
- Next.jsから移行する場合

[→ Frameworkモードの開始](./framework/installation)。

**次のような場合は、Dataモードを使用してください。**

- データ機能が必要だが、バンドル、データ、サーバーの抽象化を制御したい
- v6.4でデータルーターを開始し、それに満足している

[→ Dataモードの開始](./data/custom)。

**次のような場合は、Declarativeモードを使用してください。**

- React Routerを可能な限りシンプルに使用したい
- v6から移行し、`<BrowserRouter>`に満足している
- 保留状態をスキップする（ローカルファースト、バックグラウンドデータレプリケーション/同期など）か、独自の抽象化を持つデータレイヤーがある
- Create React Appから移行する場合（ただし、フレームワークモードを検討することをお勧めします）

[→ Declarativeモードの開始](./declarative/installation)。

## API + モードの可用性テーブル

これは主にLLM向けですが、ご自由にお使いください。

| API                            | Framework | Data | Declarative |
| ------------------------------ | --------- | ---- | ----------- |
| Await                          | ✅        | ✅   |             |
| Form                           | ✅        | ✅   |             |
| Link                           | ✅        | ✅   | ✅          |
| `<Link discover>`              | ✅        |      |             |
| `<Link prefetch>`              | ✅        |      |             |
| `<Link preventScrollReset>`    | ✅        | ✅   |             |
| Links                          | ✅        |      |             |
| Meta                           | ✅        |      |             |
| NavLink                        | ✅        | ✅   | ✅          |
| `<NavLink discover>`           | ✅        |      |             |
| `<NavLink prefetch>`           | ✅        |      |             |
| `<NavLink preventScrollReset>` | ✅        | ✅   |             |
| NavLink `isPending`            | ✅        | ✅   |             |
| Navigate                       | ✅        | ✅   | ✅          |
| Outlet                         | ✅        | ✅   | ✅          |
| PrefetchPageLinks              | ✅        |      |             |
| Route                          | ✅        | ✅   | ✅          |
| Routes                         | ✅        | ✅   | ✅          |
| Scripts                        | ✅        |      |             |
| ScrollRestoration              | ✅        | ✅   |             |
| ServerRouter                   | ✅        |      |             |
| usePrompt                      | ✅        | ✅   | ✅          |
| useActionData                  | ✅        | ✅   |             |
| useAsyncError                  | ✅        | ✅   |             |
| useAsyncValue                  | ✅        | ✅   |             |
| useBeforeUnload                | ✅        | ✅   | ✅          |
| useBlocker                     | ✅        | ✅   |             |
| useFetcher                     | ✅        | ✅   |             |
| useFetchers                    | ✅        | ✅   |             |
| useFormAction                  | ✅        | ✅   |             |
| useHref                        | ✅        | ✅   | ✅          |
| useInRouterContext             | ✅        | ✅   | ✅          |
| useLinkClickHandler            | ✅        | ✅   | ✅          |
| useLoaderData                  | ✅        | ✅   |             |
| useLocation                    | ✅        | ✅   | ✅          |
| useMatch                       | ✅        | ✅   | ✅          |
| useMatches                     | ✅        | ✅   |             |
| useNavigate                    | ✅        | ✅   | ✅          |
| useNavigation                  | ✅        | ✅   |             |
| useNavigationType              | ✅        | ✅   | ✅          |
| useOutlet                      | ✅        | ✅   | ✅          |
| useOutletContext               | ✅        | ✅   | ✅          |
| useParams                      | ✅        | ✅   | ✅          |
| useResolvedPath                | ✅        | ✅   | ✅          |
| useRevalidator                 | ✅        | ✅   |             |
| useRouteError                  | ✅        | ✅   |             |
| useRouteLoaderData             | ✅        | ✅   |             |
| useRoutes                      | ✅        | ✅   | ✅          |
| useSearchParams                | ✅        | ✅   | ✅          |
| useSubmit                      | ✅        | ✅   |             |
| useViewTransitionState         | ✅        | ✅   |             |
| isCookieFunction               | ✅        | ✅   |             |
| isSessionFunction              | ✅        | ✅   |             |
| createCookie                   | ✅        | ✅   |             |
| createCookieSessionStorage     | ✅        | ✅   |             |
| createMemorySessionStorage     | ✅        | ✅   |             |
| createPath                     | ✅        | ✅   | ✅          |
| createRoutesFromElements       |           | ✅   |             |
| createRoutesStub               | ✅        | ✅   |             |
| createSearchParams             | ✅        | ✅   | ✅          |
| data                           | ✅        | ✅   |             |
| generatePath                   | ✅        | ✅   | ✅          |
| href                           | ✅        |      |             |
| isCookie                       | ✅        | ✅   |             |
| isRouteErrorResponse           | ✅        | ✅   |             |
| isSession                      | ✅        | ✅   |             |
| matchPath                      | ✅        | ✅   | ✅          |
| matchRoutes                    | ✅        | ✅   | ✅          |
| parsePath                      | ✅        | ✅   | ✅          |
| redirect                       | ✅        | ✅   |             |
| redirectDocument               | ✅        | ✅   |             |
| renderMatches                  | ✅        | ✅   | ✅          |
| replace                        | ✅        | ✅   |             |
| resolvePath                    | ✅        | ✅   | ✅          |
