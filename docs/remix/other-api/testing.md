---
title: "@remix-run/testing"
---

# `@remix-run/testing`

このパッケージには、Remixアプリケーションの一部のユニットテストを支援するためのユーティリティが含まれています。これは、コンパイラによって出力されるRemixルートモジュール/アセットマニフェストをモックし、[createMemoryRouter][create-memory-router] を介してインメモリのReact Routerアプリを生成することで実現されます。

このパッケージの一般的な使い方は、クリーンにモックすることができないRemixのフック/コンポーネント（[`useLoaderData`][use-loader-data]、[`useFetcher`][use-fetcher]など）に依存するコンポーネント/フックをテストすることです。リンクをクリックしてページをナビゲートするなどのより高度なテストにも使用できますが、それらは[Cypress][cypress]や[Playwright][playwright]のようなツールを使用したエンドツーエンドテストに適しています。

## 使用法

[`createRemixStub`][create-remix-stub]を使用するには、React Routerのようなルートオブジェクトを使用してルートを定義します。ここで、`path`、`Component`、`loader`などを指定します。これらは基本的に、Remixアプリのルートファイルのネストとエクスポートをモックしています。

```tsx
import { createRemixStub } from "@remix-run/testing";

const RemixStub = createRemixStub([
  {
    path: "/",
    Component: MyComponent,
    loader() {
      return json({ message: "hello" });
    },
  },
]);
```

次に、`<RemixStub />`コンポーネントをレンダリングして、それに対してアサートできます。

```tsx
render(<RemixStub />);
await screen.findByText("Some rendered text");
```

## 例

[`jest`][jest]と[React Testing Library][rtl]を使用した完全な動作例を次に示します。

```tsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

test("renders loader data", async () => {
  // ⚠️ これは通常、アプリのコードからインポートするコンポーネントです
  function MyComponent() {
    const data = useLoaderData() as { message: string };
    return <p>Message: {data.message}</p>;
  }

  const RemixStub = createRemixStub([
    {
      path: "/",
      Component: MyComponent,
      loader() {
        return json({ message: "hello" });
      },
    },
  ]);

  render(<RemixStub />);

  await waitFor(() => screen.findByText("Message: hello"));
});
```

[create-memory-router]: https://reactrouter.com/v6/routers/create-memory-router
[use-loader-data]: ../hooks/use-loader-data
[use-fetcher]: ../hooks/use-fetcher
[cypress]: https://www.cypress.io
[playwright]: https://playwright.dev
[create-remix-stub]: ../utils/create-remix-stub
[jest]: https://jestjs.io
[rtl]: https://testing-library.com/docs/react-testing-library/intro
