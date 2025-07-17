---
title: 自動コード分割
---

# 自動コード分割

[MODES: framework]

<br/>
<br/>

React Routerのフレームワーク機能を使用すると、アプリケーションが自動的にコード分割され、ユーザーがアプリケーションにアクセスした際の初期ロード時間のパフォーマンスが向上します。

## ルートによるコード分割

次の簡単なルート構成を考えてみましょう。

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

すべてのルートを1つの巨大なビルドにバンドルする代わりに、参照されるモジュール（`contact.tsx`と`about.tsx`）がバンドラーのエントリーポイントになります。

これらのエントリーポイントはURLセグメントに結合されているため、React RouterはURLからどのバンドルがブラウザで必要か、さらに重要なことに、どれが必要でないかを把握できます。

ユーザーが`"/about"`にアクセスすると、`about.tsx`のバンドルがロードされますが、`contact.tsx`はロードされません。これにより、初期ページロードのJavaScriptフットプリントが大幅に削減され、アプリケーションが高速化されます。

## サーバーコードの削除

サーバー専用の[ルートモジュールAPI][route-module]は、バンドルから削除されます。次のルートモジュールを考えてみましょう。

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

ブラウザ用にビルドした後、`Component`のみがバンドルに残るため、他のモジュールエクスポートでサーバー専用のコードを使用できます。

[route-module]: ../../start/framework/route-module