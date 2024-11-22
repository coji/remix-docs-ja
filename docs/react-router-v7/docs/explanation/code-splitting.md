---
title: 自動コード分割
---

# 自動コード分割

React Routerのフレームワーク機能を使用すると、アプリケーションは自動的にコード分割され、ユーザーがアプリケーションにアクセスした際の初期読み込み時間を改善します。

## ルートによるコード分割

この簡単なルート設定を考えてみましょう。

```tsx filename=app/routes.ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/contact", "./contact.tsx"),
  route("/about", "./about.tsx"),
] satisfies RouteConfig;
```

すべてのルートを単一の巨大なビルドにバンドルする代わりに、参照されているモジュール（`contact.tsx`と`about.tsx`）がバンドラのエントリポイントになります。

これらのエントリポイントはURLセグメントに関連付けられているため、React RouterはURLからブラウザに必要なバンドルと、より重要なことに、不要なバンドルを認識します。

ユーザーが`/about`にアクセスした場合、`about.tsx`のバンドルは読み込まれますが、`contact.tsx`は読み込まれません。これにより、初期ページ読み込み時のJavaScriptのフットプリントが大幅に削減され、アプリケーションの速度が向上します。

## サーバーサイドコードの削除

サーバー専用Route Module APIは、バンドルから削除されます。このルートモジュールを考えてみましょう。

```tsx
export async function loader() {
  return { message: "hello" };
}

export async function action() {
  console.log(Date.now());
  return { ok: true };
}

export async function headers() {
  return { "Cache-Control": "max-age=300" };
}

export default function Component({ loaderData }) {
  return <div>{loaderData.message}</div>;
}
```

ブラウザ向けにビルドした後、バンドルに残るのは`Component`のみになります。そのため、他のモジュールエクスポートでサーバー専用コードを使用できます。

