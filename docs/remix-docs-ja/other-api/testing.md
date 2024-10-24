---
title: "@remix-run/testing"
---

# `@remix-run/testing`

このパッケージには、Remix アプリケーションの一部をユニットテストする際に役立つユーティリティが含まれています。これは、コンパイラによって出力される Remix ルートモジュール/アセットマニフェストをモックし、[createMemoryRouter][create-memory-router] を使用してメモリ内の React Router アプリを生成することで実現されます。

一般的に、これは、Remix のフック/コンポーネントに依存するコンポーネント/フックをテストするために使用されます。これらのフック/コンポーネントは、クリーンにモックすることができません（[`useLoaderData`][use-loader-data]、[`useFetcher`][use-fetcher] など）。より高度なテスト（リンクをクリックしてページに移動するなど）にも使用できますが、それらは [Cypress][cypress] や [Playwright][playwright] などのエンドツーエンドテストの方が適しています。

## 使用方法

[`createRemixStub`][create-remix-stub] を使用するには、React Router のようなルートオブジェクトを使用してルートを定義します。ここで、`path`、`Component`、`loader` などを指定します。これらは、基本的に Remix アプリのルートファイルのネストとエクスポートをモックしています。

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

次に、`<RemixStub />` コンポーネントをレンダリングし、それをアサートできます。

```tsx
render(<RemixStub />);
await screen.findByText("Some rendered text");
```

## 例

以下は、[`jest`][jest] と [React Testing Library][rtl] を使用したテストの完全な動作例です。

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
  // ⚠️ 通常、これはアプリコードからインポートするコンポーネントです
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



