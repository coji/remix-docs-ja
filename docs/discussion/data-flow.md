---
title: フルスタックデータフロー
order: 4
---

# フルスタックデータフロー

Remixの主な機能の1つは、UIを永続的なサーバー状態と自動的に同期させる方法です。これは3つのステップで行われます。

1. ルートローダーはUIにデータを提供します
2. フォームは、永続的な状態を更新するルートアクションにデータを投稿します
3. ページのローダーデータは自動的に再検証されます

<img class="tutorial rounded-xl" src="/blog-images/posts/remix-data-flow/loader-action-component.png" />

## ルートモジュールエクスポート

ユーザーアカウント編集ルートを考えてみましょう。ルートモジュールには、以下に示す3つのエクスポートがあり、これらについて説明します。

```tsx filename=routes/account.tsx
export async function loader() {
  // コンポーネントにデータを提供します
}

export default function Component() {
  // UIをレンダリングします
}

export async function action() {
  // 永続的なデータを更新します
}
```

## ルートローダー

ルートファイルは、[`loader`][loader]関数をエクスポートできます。この関数は、ルートコンポーネントにデータを提供します。ユーザーが一致するルートに移動すると、最初にデータがロードされ、次にページがレンダリングされます。

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

ルートファイルのデフォルトエクスポートは、レンダリングされるコンポーネントです。これは、[`useLoaderData`][use_loader_data]を使用してローダーデータを読み取ります。

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
      <h1>Settings for {user.displayName}</h1>

      <input
        name="displayName"
        defaultValue={user.displayName}
      />
      <input name="email" defaultValue={user.email} />

      <button type="submit">Save</button>
    </Form>
  );
}

export async function action() {
  // ...
}
```

## ルートアクション

最後に、フォームのアクション属性と一致するルートのアクションは、フォームが送信されると呼び出されます。この例では、同じルートです。フォームフィールドの値は、標準の[`request.formData()`][request_form_data]APIで利用できます。入力の`name`属性は、[`formData.get(fieldName)`][form_data_get]ゲッターと結合されていることに注意してください。

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
      <h1>Settings for {user.displayName}</h1>

      <input
        name="displayName"
        defaultValue={user.displayName}
      />
      <input name="email" defaultValue={user.email} />

      <button type="submit">Save</button>
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

ユーザーがフォームを送信すると:

1. Remixは`fetch`を使用してフォームデータをルートアクションに送信し、`useNavigation`や`useFetcher`などのフックを介して保留状態が利用可能になります。
2. アクションが完了すると、ローダーが再検証されて新しいサーバー状態が取得されます。
3. `useLoaderData`はサーバーから更新された値を返し、保留状態はアイドル状態に戻ります。

このようにして、UIはサーバー状態と同期したままになり、その同期のためのコードを記述する必要はありません。

HTMLフォーム要素以外に、フォームを送信する方法はいくつかあります（ドラッグアンドドロップやonChangeイベントなど）。フォームの検証、エラー処理、保留状態などについて、もっと詳しく説明する必要があります。これらについては後で説明しますが、これはRemixのデータフローの概要です。

## JavaScriptがロードされる前

サーバーからHTMLを送信する場合、JavaScriptがロードされる前に動作するようにするのが最善です。Remixの一般的なデータフローでは、これは自動的に行われます。フローは同じですが、ブラウザが一部の作業を行います。

ユーザーがJavaScriptがロードされる前にフォームを送信すると:

1. ブラウザはフォームをアクションに送信し（`fetch`ではなく）、ブラウザの保留状態がアクティブになります（回転するファビコン）。
2. アクションが完了すると、ローダーが呼び出されます。
3. Remixはページをレンダリングし、ブラウザにHTMLを送信します。

[loader]: ../route/loader
[use_loader_data]: ../hooks/use-loader-data
[request_form_data]: https://developer.mozilla.org/en-US/docs/Web/API/Request/formData
[form_data_get]: https://developer.mozilla.org/en-US/docs/Web/API/FormData/get

