---
title: Future Flags
order: 5
---

# Future Flags

以下の future flags は安定版であり、導入できます。future flags の詳細については、[開発戦略][development-strategy] を参照してください。

## 最新の v2.x への更新

まず、最新の future flags を持つ、v2.x の最新マイナーバージョンに更新します。

👉 **最新の v2 に更新**

```shellscript nonumber
npm install @remix-run/{dev,react,node,etc.}@2
```

## v3_fetcherPersist

**背景**

fetcher ライフサイクルは、所有者のコンポーネントがアンマウントするのではなく、アイドル状態に戻ったときに基づくようになりました。詳細については、[RFC を参照してください][fetcherpersist-rfc]。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_fetcherPersist: true,
  },
});
```

**コードを更新する**

これは、アプリケーションに影響を与える可能性は低いです。`useFetchers` の使用状況を確認する必要があるかもしれません。以前よりも長く保持される可能性があります。何をしているかによって、以前よりも長くレンダリングされる可能性があります。

## v3_relativeSplatPath

**背景**

`dashboard/*` (単なる `*` ではなく) などの複数セグメントの splat パスに対する相対パスの一致とリンクを変更します。詳細については、[CHANGELOG を参照してください][relativesplatpath-changelog]。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_relativeSplatPath: true,
  },
});
```

**コードを更新する**

`dashboard.$.tsx` や `route("dashboard/*")` のようなパスと splat を組み合わせたルートが、その下に `\<Link to="relative">` や `\<Link to="../relative">` などの相対リンクを持つ場合、コードを更新する必要があります。

👉 **ルートを 2 つに分割**

splat ルートがある場合は、レイアウトルートと splat を持つ子ルートに分割します。

```diff

└── routes
    ├── _index.tsx
+   ├── dashboard.tsx
    └── dashboard.$.tsx

// または
routes(defineRoutes) {
  return defineRoutes((route) => {
    route("/", "home/route.tsx", { index: true });
-    route("dashboard/*", "dashboard/route.tsx")
+    route("dashboard", "dashboard/layout.tsx", () => {
+      route("*", "dashboard/route.tsx");
    });
  });
},
```

👉 **相対リンクを更新する**

そのルートツリー内の相対リンクを持つ `\<Link>` 要素を更新して、追加の `..` 相対セグメントを含めて、同じ場所にリンクし続けます。

```diff
// dashboard.$.tsx または dashboard/route.tsx
function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <nav>
-        <Link to="">Dashboard Home</Link>
-        <Link to="team">Team</Link>
-        <Link to="projects">Projects</Link>
+        <Link to="../">Dashboard Home</Link>
+        <Link to="../team">Team</Link>
+        <Link to="../projects">Projects</Link>
      </nav>
    </div>
  );
}
```

## v3_throwAbortReason

**背景**

ローダーが完了する前にユーザーがページから移動するなど、サーバー側の要求が中止された場合、Remix は `new Error("query() call aborted...")` などのエラーではなく、`request.signal.reason` をスローします。

👉 **フラグを有効にする**

```ts
remix({
  future: {
    v3_throwAbortReason: true,
  },
});
```

**コードを更新する**

`handleError` 内に、以前のエラーメッセージを一致させて他のエラーと区別するカスタムロジックがなければ、コードを調整する必要はありません。

[development-strategy]: ../guides/api-development-strategy
[fetcherpersist-rfc]: https://github.com/remix-run/remix/discussions/7698
[use-fetchers]: ../hooks/use-fetchers
[use-fetcher]: ../hooks/use-fetcher
[relativesplatpath-changelog]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#futurev3_relativesplatpath
[single-fetch]: ../guides/single-fetch
