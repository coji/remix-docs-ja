---
title: 現行の将来のフラグ
order: 1
new: true
---

# 将来のフラグ

以下の将来のフラグは安定しており、採用する準備ができています。将来のフラグの詳細については、[開発戦略](../guides/api-development-strategy) をご覧ください。

## 最新の v6.x に更新

最初に最新のマイナーバージョンの v6.x に更新して、最新の将来のフラグを入手してください。

👉 **最新の v6 に更新**

```shellscript nonumber
npm install react-router-dom@6
```

## v7_relativeSplatPath

**背景**

`dashboard/*` のようなマルチセグメントスプラットパス（単なる `*` ではなく）に対する相対パスの一致とリンクを変更します。[CHANGELOG を参照](https://github.com/remix-run/react-router/blob/main/packages/react-router-dom/CHANGELOG.md#minor-changes-2) して、詳細を確認してください。

👉 **フラグを有効にする**

フラグの有効化は、ルーターの種類によって異なります。

```tsx
<BrowserRouter
  future={{
    v7_relativeSplatPath: true,
  }}
/>
```

```tsx
createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
  },
});
```

**コードを更新する**

`<Route path="dashboard/*">` のようなパスとスプラットを持つルートがあり、その下に `<Link to="relative">` や `<Link to="../relative">` のような相対リンクがある場合は、コードを更新する必要があります。

👉 **`<Route>` を 2 つに分割する**

マルチセグメントスプラット `<Route>` を、パスを持つ親ルートとスプラットを持つ子ルートに分割します。

```diff
<Routes>
  <Route path="/" element={<Home />} />
-  <Route path="dashboard/*" element={<Dashboard />} />
+  <Route path="dashboard">
+    <Route path="*" element={<Dashboard />} />
+  </Route>
</Routes>

// または
createBrowserRouter([
  { path: "/", element: <Home /> },
  {
-    path: "dashboard/*",
-    element: <Dashboard />,
+    path: "dashboard",
+    children: [{ path: "*", element: <Dashboard /> }],
  },
]);
```

👉 **相対リンクを更新する**

そのルートツリー内の `<Link>` 要素を更新して、同じ場所にリンクし続けるために追加の `..` 相対セグメントを含めます。

```diff
function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <nav>
-        <Link to="/">Dashboard Home</Link>
-        <Link to="team">Team</Link>
-        <Link to="projects">Projects</Link>
+        <Link to="../">Dashboard Home</Link>
+        <Link to="../team">Team</Link>
+        <Link to="../projects">Projects</Link>
      </nav>

      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="team" element={<DashboardTeam />} />
        <Route
          path="projects"
          element={<DashboardProjects />}
        />
      </Routes>
    </div>
  );
}
```

## v7_startTransition

**背景**

これは、ルーターの状態更新に `React.useState` ではなく `React.useTransition` を使用します。[CHANGELOG を参照](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v7_starttransition) して、詳細を確認してください。

👉 **フラグを有効にする**

```tsx
<BrowserRouter
  future={{
    v7_startTransition: true,
  }}
/>

// または
<RouterProvider
  future={{
    v7_startTransition: true,
  }}
/>
```

👉 **コードを更新する**

コンポーネント内で `React.lazy` を使用していない限り、何も更新する必要はありません。

コンポーネント内で `React.lazy` を使用することは、`React.useTransition`（またはコンポーネント内で Promise を作成する他のコード）と互換性がありません。`React.lazy` をモジュールスコープに移動し、コンポーネント内で Promise を作成することを中止します。これは React Router の制限ではなく、React の誤った使用法です。

## v7_fetcherPersist

<docs-warning> `createBrowserRouter` を使用していない場合は、これはスキップできます。 </docs-warning>

**背景**

フェッチャーのライフサイクルは、所有者コンポーネントがアンマウントされたときではなく、アイドル状態に戻ったときに基づいています。[CHANGELOG を参照](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#persistence-future-flag-futurev7_fetcherpersist) して、詳細を確認してください。

**フラグを有効にする**

```tsx
createBrowserRouter(routes, {
  future: {
    v7_fetcherPersist: true,
  },
});
```

**コードを更新する**

アプリに影響を与える可能性は低いでしょう。`useFetchers` の使用状況を確認したい場合があります。なぜなら、これらは以前よりも長く持続する可能性があるからです。何をしているかによって、以前よりも長い時間レンダリングされる場合があります。

## v7_normalizeFormMethod

<docs-warning> `createBrowserRouter` を使用していない場合は、これはスキップできます。 </docs-warning>

これは、`fetch()` の動作に合わせて `formMethod` フィールドを大文字の HTTP メソッドとして正規化します。[CHANGELOG を参照](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#futurev7_normalizeformmethod) して、詳細を確認してください。

👉 **フラグを有効にする**

```tsx
createBrowserRouter(routes, {
  future: {
    v7_normalizeFormMethod: true,
  },
});
```

**コードを更新する**

コードの一部が小文字の HTTP メソッドをチェックしている場合は、大文字の HTTP メソッドをチェックするように（またはそれに `toLowerCase()` を呼び出すように）更新する必要があります。

👉 **`formMethod` を大文字と比較する**

```diff
-useNavigation().formMethod === "post"
-useFetcher().formMethod === "get";
+useNavigation().formMethod === "POST"
+useFetcher().formMethod === "GET";
```

## v7_partialHydration

<docs-warning> `createBrowserRouter` を使用していない場合は、これはスキップできます。 </docs-warning>

これは、SSR フレームワークが部分的な水和データのみを提供できるようにします。これは気にする必要はない可能性が高いので、フラグをオンにするだけです。[CHANGELOG を参照](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#partial-hydration) して、詳細を確認してください。

👉 **フラグを有効にする**

```tsx
createBrowserRouter(routes, {
  future: {
    v7_partialHydration: true,
  },
});
```

## v7_skipActionStatusRevalidation

<docs-warning> `createBrowserRouter` を使用していない場合は、これはスキップできます。 </docs-warning>

このフラグが有効になっている場合、ローダーは、アクションが `4xx`/`5xx` ステータスコードを持つ `Response` をスロー/返した後、デフォルトでは再検証されなくなります。これらのシナリオで再検証を選択するには、`shouldRevalidate` と `actionStatus` パラメーターを使用できます。

👉 **フラグを有効にする**

```tsx
createBrowserRouter(routes, {
  future: {
    v7_skipActionStatusRevalidation: true,
  },
});
```

**コードを更新する**

ほとんどの場合、アプリコードを変更する必要はありません。通常、アクションでエラーが発生した場合、データは変更されていない可能性が高く、再検証する必要はありません。コードの一部がアクションエラーのシナリオでデータを変更する場合、2 つの選択肢があります。

👉 **オプション 1: エラーのシナリオで変更を避けるために `action` を変更する**

```js
// Before
async function action() {
  await mutateSomeData();
  if (detectError()) {
    throw new Response(error, { status: 400 });
  }
  await mutateOtherData();
  // ...
}

// After
async function action() {
  if (detectError()) {
    throw new Response(error, { status: 400 });
  }
  // すべてのデータは、検証後に変更されます。
  await mutateSomeData();
  await mutateOtherData();
  // ...
}
```

👉 **オプション 2: `shouldRevalidate` と `actionStatus` を使用して再検証を選択する**

```js
async function action() {
  await mutateSomeData();
  if (detectError()) {
    throw new Response(error, { status: 400 });
  }
  await mutateOtherData();
}

async function loader() { ... }

function shouldRevalidate({ actionStatus, defaultShouldRevalidate }) {
  if (actionStatus != null && actionStatus >= 400) {
    // アクションが 4xx/5xx ステータスを返す場合、このローダーを再検証します。
    return true;
  }
  return defaultShouldRevalidate;
}
```


