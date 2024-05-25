---
title: "@remix-run/testing"
---

# `@remix-run/testing`

このパッケージには、Remix アプリケーションの一部をユニットテストする際に役立つユーティリティが含まれています。これは、コンパイラによって出力された Remix ルートモジュール/アセットマニフェストをモックし、[createMemoryRouter][create-memory-router] を介してメモリ内 React Router アプリを生成することで実現されます。

これは一般的に、クリーンにモックできない Remix フック/コンポーネント ([`useLoaderData`][use-loader-data]、[`useFetcher`][use-fetcher] など) に依存するコンポーネント/フックをテストするために使用されます。リンクをクリックしてページをナビゲートするなど、より高度なテストにも使用できますが、そのようなテストは [Cypress][cypress] や [Playwright][playwright] などのツールを使用したエンドツーエンドテストに適しています。

## 使用方法

[`createRemixStub`][create-remix-stub] を使用するには、React Router のようなルートオブジェクトを使用してルートを定義します。ここでは、`path`、`Component`、`loader` などを指定します。これらは、本質的に Remix アプリのルートファイルのネストとエクスポートをモックしています。

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

次に、`<RemixStub />` コンポーネントをレンダリングし、それに対してアサーションを行います。

```tsx
render(<RemixStub />);
await screen.findByText("Some rendered text");
```

## 例

以下は、[`jest`][jest] と [React Testing Library][rtl] を使用した完全な動作例です。

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
  // ⚠️ 通常は、アプリコードからインポートするコンポーネントです
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

[create-memory-router]: https://reactrouter.com/en/main/routers/create-memory-router
[use-loader-data]: ../hooks/use-loader-data
[use-fetcher]: ../hooks/use-fetcher
[cypress]: https://www.cypress.io
[playwright]: https://playwright.dev
[create-remix-stub]: ../utils/create-remix-stub
[jest]: https://jestjs.io
[rtl]: https://testing-library.com/docs/react-testing-library/intro
