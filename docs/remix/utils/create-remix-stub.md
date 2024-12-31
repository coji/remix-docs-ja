---
title: createRemixStub
---

# `createRemixStub`

このユーティリティを使用すると、モックされたルートを設定することで、Remix のフック/コンポーネントに依存する独自のコンポーネントをユニットテストできます。

```tsx
import { createRemixStub } from "@remix-run/testing";

test("ローダーデータをレンダリングする", async () => {
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

  // 初期レンダリングをアサート
  await waitFor(() => screen.findByText("..."));

  // ボタンをクリックして UI の変更をアサート
  user.click(screen.getByText("ボタンテキスト"));
  await waitFor(() => screen.findByText("..."));
});
```

[`loader`][loader] が `getLoadContext` メソッドに依存している場合は、`createRemixStub` の 2 番目のパラメーターを介してスタブ化されたコンテキストを提供できます。

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

`<RemixStub>` コンポーネント自体は、初期 URL、履歴スタック、ハイドレーションデータ、または将来のフラグを制御する必要がある場合に、React Router と同様のプロパティを受け取ります。

```tsx
// "/2" でレンダリングされたアプリを、2 つ前の履歴スタックエントリでテスト
render(
  <RemixStub
    initialEntries={["/", "/1", "/2"]}
    initialIndex={2}
  />
);

// ルートルートの初期ローダーデータでレンダリングされたアプリをテストします。
// これを使用する場合は、ルート定義でルートに独自のユニークな ID を与えるのが最適です。
render(
  <RemixStub
    hydrationData={{
      loaderData: { root: { message: "hello" } },
    }}
  />
);

// 指定された将来のフラグが有効になっている状態でレンダリングされたアプリをテスト
render(<RemixStub future={{ v3_coolFeature: true }} />);
```

[loader]: ../route/loader

