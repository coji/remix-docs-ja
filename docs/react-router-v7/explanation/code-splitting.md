---
title: 自動コード分割
---

# 自動コード分割

React Router のフレームワーク機能を使用すると、アプリケーションは自動的にコード分割され、ユーザーがアプリケーションにアクセスした際の初期ロード時間のパフォーマンスが向上します。

## ルートによるコード分割

このシンプルなルート設定を考えてみましょう。

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

すべてのルートを単一の巨大なバンドルにまとめる代わりに、参照されるモジュール (`contact.tsx` と `about.tsx`) がバンドラーのエントリーポイントになります。

これらのエントリーポイントは URL セグメントに結び付けられているため、React Router は URL からブラウザでどのバンドルが必要か、さらに重要なことに、どれが必要でないかを把握できます。

ユーザーが `"/about"` にアクセスした場合、`about.tsx` のバンドルはロードされますが、`contact.tsx` はロードされません。これにより、初期ページロードの JavaScript フットプリントが大幅に削減され、アプリケーションが高速化されます。

## サーバーコードの削除

サーバー専用のルートモジュール API は、バンドルから削除されます。このルートモジュールを考えてみましょう。

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

ブラウザ用にビルドした後、`Component` のみがバンドルに残るため、他のモジュールエクスポートでサーバー専用のコードを使用できます。

