---
title: フルスタックデータフロー
order: 4
---

# フルスタックデータフロー

Remix の主要な機能の 1 つは、UI を永続的なサーバーの状態と自動的に同期させる方法です。これは 3 つのステップで実行されます。

1. ルートローダーが UI にデータを提供します
2. フォームが永続的な状態を更新するルートアクションにデータをポストします
3. ページ上のローダーデータが自動的に再検証されます

<img class="tutorial rounded-xl" src="/blog-images/posts/remix-data-flow/loader-action-component.png" />

## ルートモジュールのエクスポート

ユーザーアカウント編集ルートを考えてみましょう。ルートモジュールには、これから記述して説明する 3 つのエクスポートがあります。

```tsx filename=routes/account.tsx
export async function loader() {
  // コンポーネントにデータを提供します
}

export default function Component() {
  // UI をレンダリングします
}

export async function action() {
  // 永続的なデータを更新します
}
```

## ルートローダー

ルートファイルは、ルートコンポーネントにデータを提供する [`loader`][loader] 関数をエクスポートできます。ユーザーが一致するルートに移動すると、最初にデータがロードされ、次にページがレンダリングされます。

```tsx filename=routes/account.tsx lines=[1-2,4-12]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({
    displayName: user.displayName,
    email: user.email,
  });
}

export default function Component() {
  // ...
}

export async function action() {
  // ...
}
```

## ルートコンポーネント

ルートファイルのデフォルトのエクスポートは、レンダリングするコンポーネントです。[`useLoaderData`][use_loader_data] を使用してローダーデータを読み取ります。

```tsx lines=[3,15-30]
import type { LoaderFunctionArgs } from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData, Form } from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({
    displayName: user.displayName,
    email: user.email,
  });
}

export default function Component() {
  const user = useLoaderData<typeof loader>();
  return (
    <Form method="post" action="/account">
      <h1>{user.displayName} の設定</h1>

      <input
        name="displayName"
        defaultValue={user.displayName}
      />
      <input name="email" defaultValue={user.email} />

      <button type="submit">保存</button>
    </Form>
  );
}

export async function action() {
  // ...
}
```

## ルートアクション

最後に、フォームの action 属性に一致するルートのアクションは、フォームが送信されるときに呼び出されます。この例では、同じルートです。フォームフィールドの値は、標準の [`request.formData()`][request_form_data] API で利用できます。入力の `name` 属性は、[`formData.get(fieldName)`][form_data_get] ゲッターに結合されていることに注意してください。

```tsx lines=[2,35-47]
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node"; // または cloudflare/deno
import { json } from "@remix-run/node"; // または cloudflare/deno
import { useLoaderData, Form } from "@remix-run/react";

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const user = await getUser(request);
  return json({
    displayName: user.displayName,
    email: user.email,
  });
}

export default function Component() {
  const user = useLoaderData<typeof loader>();
  return (
    <Form method="post" action="/account">
      <h1>{user.displayName} の設定</h1>

      <input
        name="displayName"
        defaultValue={user.displayName}
      />
      <input name="email" defaultValue={user.email} />

      <button type="submit">保存</button>
    </Form>
  );
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const user = await getUser(request);

  await updateUser(user.id, {
    email: formData.get("email"),
    displayName: formData.get("displayName"),
  });

  return json({ ok: true });
}
```

## 送信と再検証

ユーザーがフォームを送信すると、次のようになります。

1. Remix は `fetch` を介してフォームデータをルートアクションに送信し、`useNavigation` や `useFetcher` などのフックを介して保留中の状態が利用可能になります。
2. アクションが完了すると、ローダーが再検証され、新しいサーバーの状態を取得します。
3. `useLoaderData` はサーバーから更新された値を返し、保留中の状態はアイドル状態に戻ります。

このようにして、UI はその同期のためのコードを記述することなく、サーバーの状態と同期されます。

HTML フォーム要素以外にも、フォームを送信する方法はいくつかあります（ドラッグアンドドロップや onChange イベントへの応答など）。フォームの検証、エラー処理、保留中の状態などについて説明することもたくさんあります。これらについては後で説明しますが、これが Remix のデータフローの要点です。

## JavaScript がロードされる前

サーバーから HTML を送信する場合は、JavaScript がロードされる前でも動作するようにするのが最適です。Remix の一般的なデータフローは、これを自動的に行います。フローは同じですが、ブラウザが一部の作業を行います。

ユーザーが JavaScript がロードされる前にフォームを送信すると、次のようになります。

1. ブラウザは（`fetch` の代わりに）フォームをアクションに送信し、ブラウザの保留中の状態がアクティブになります（回転するファビコン）。
2. アクションが完了すると、ローダーが呼び出されます。
3. Remix はページをレンダリングし、HTML をブラウザに送信します。

[loader]: ../route/loader
[use_loader_data]: ../hooks/use-loader-data
[request_form_data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
[form_data_get]: https://developer.mozilla.org/en-US/docs/Web/API/FormData/get
