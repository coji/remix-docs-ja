---
title: createRemixStub
---

# `createRemixStub`

このユーティリティを使用すると、Remix のフック/コンポーネントに依存する独自のコンポーネントを、モックのルートセットを設定することでユニットテストできます。

```tsx
import { createRemixStub } from "@remix-run/testing";

test("ローダーデータを表示する", async () => {
  const RemixStub = createRemixStub([
    {
      path: "/",
      meta() {
        /* ... */
      },
      links() {
        /* ... */
      },
      Component: MyComponent,
      ErrorBoundary: MyErrorBoundary,
      action() {
        /* ... */
      },
      loader() {
        /* ... */
      },
    },
  ]);

  render(<RemixStub />);

  // 初期レンダリングをアサートする
  await waitFor(() => screen.findByText("..."));

  // ボタンをクリックして UI の変更をアサートする
  user.click(screen.getByText("ボタン テキスト"));
  await waitFor(() => screen.findByText("..."));
});
```

[`loader`][loader] が `getLoadContext` メソッドに依存している場合、`createRemixStub` への第 2 パラメーターでスタブされたコンテキストを提供できます。

```tsx
const RemixStub = createRemixStub(
  [
    {
      path: "/",
      Component: MyComponent,
      loader({ context }) {
        return json({ message: context.key });
      },
    },
  ],
  { key: "value" }
);
```

`<RemixStub>` コンポーネント自体は、React Router に似たプロパティを受け取り、初期 URL、履歴スタック、ハイドレーションデータ、または将来のフラグを制御する必要がある場合に役立ちます。

```tsx
// 2 つの前の履歴スタックエントリを持つ "/2" にレンダリングされたアプリケーションをテストする
render(
  <RemixStub
    initialEntries={["/", "/1", "/2"]}
    initialIndex={2}
  />
);

// ルートルートの初期ローダーデータでレンダリングされたアプリケーションをテストします。
// これを使用する場合は、ルート定義でルートに独自の ID を付与することをお勧めします
render(
  <RemixStub
    hydrationData={{
      loaderData: { root: { message: "hello" } },
    }}
  />
);

// 指定された将来のフラグを有効にしてレンダリングされたアプリケーションをテストする
render(<RemixStub future={{ v3_coolFeature: true }} />);
```

[loader]: ../route/loader


