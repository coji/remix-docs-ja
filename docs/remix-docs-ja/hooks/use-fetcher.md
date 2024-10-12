---
title: useFetcher
---

# `useFetcher`

ナビゲーション以外でサーバーとやり取りするためのフックです。

```tsx
import { useFetcher } from "@remix-run/react";

export function SomeComponent() {
  const fetcher = useFetcher();
  // ...
}
```

## オプション

### `key`

デフォルトでは、`useFetcher` はそのコンポーネントにスコープされた一意のフェッチャーを生成します（ただし、インフライト中は [`useFetchers()`][use_fetchers] で検索される場合があります）。アプリ内の他の場所からフェッチャーを自分のキーで識別したい場合は、`key` オプションを使用できます。

```tsx lines=[2,8]
function AddToBagButton() {
  const fetcher = useFetcher({ key: "add-to-bag" });
  return <fetcher.Form method="post">...</fetcher.Form>;
}

// Then, up in the header...
function CartCount({ count }) {
  const fetcher = useFetcher({ key: "add-to-bag" });
  const inFlightCount = Number(
    fetcher.formData?.get("quantity") || 0
  );
  const optimisticCount = count + inFlightCount;
  return (
    <>
      <BagIcon />
      <span>{optimisticCount}</span>
    </>
  );
}
```

## コンポーネント

### `fetcher.Form`

[`<Form>`][form_component] と同じですが、ナビゲーションを引き起こしません。

```tsx
function SomeComponent() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action="/some/route">
      <input type="text" />
    </fetcher.Form>
  );
}
```

## メソッド

### `fetcher.submit(formData, options)`

フォームデータをルートに送信します。複数のネストされたルートが URL に一致する可能性がありますが、リーフルートのみが呼び出されます。

`formData` は、複数のタイプになる可能性があります。

- [`FormData`][form_data] - `FormData` インスタンス。
- [`HTMLFormElement`][html_form_element] - [`<form>`][form_element] DOM 要素。
- `Object` - キーと値のペアのオブジェクトで、デフォルトで `FormData` インスタンスに変換されます。より複雑なオブジェクトを渡して、`encType: "application/json"` を指定して JSON としてシリアル化することができます。詳細については、[`useSubmit`][use-submit] を参照してください。

メソッドが `GET` の場合、ルートの [`loader`][loader] が呼び出され、`formData` は [`URLSearchParams`][url_search_params] として URL にシリアル化されます。 `DELETE`、`PATCH`、`POST`、または `PUT` の場合、ルートの [`action`][action] が呼び出され、`formData` は本文として使用されます。

```tsx
// FormData インスタンスを送信する（GET リクエスト）
const formData = new FormData();
fetcher.submit(formData);

// HTML フォーム要素を送信する
fetcher.submit(event.currentTarget.form, {
  method: "POST",
});

// キーと値の JSON を FormData インスタンスとして送信する
fetcher.submit(
  { serialized: "values" },
  { method: "POST" }
);

// 生の JSON を送信する
fetcher.submit(
  {
    deeply: {
      nested: {
        json: "values",
      },
    },
  },
  {
    method: "POST",
    encType: "application/json",
  }
);
```

`fetcher.submit` は、フェッチャーインスタンスに対する [`useSubmit`][use-submit] コールのラッパーなので、`useSubmit` と同じオプションを受け取ります。

### `fetcher.load(href, options)`

ルートローダーからデータを読み込みます。複数のネストされたルートが URL に一致する可能性がありますが、リーフルートのみが呼び出されます。

```ts
fetcher.load("/some/route");
fetcher.load("/some/route?foo=bar");
```

`fetcher.load` は、アクションの送信後、および [`useRevalidator`][userevalidator] を通じて明示的な再検証要求が行われた後に、デフォルトで再検証します。`fetcher.load` は特定の URL を読み込むため、ルートパラメーターまたは URL 検索パラメーターの変更時に再検証されません。[`shouldRevalidate`][shouldrevalidate] を使用して、どのデータをリロードするかを最適化できます。

#### `options.flushSync`

`flushSync` オプションは、この `fetcher.load` に対する最初の状態の更新を、デフォルトの [`React.startTransition`][start-transition] ではなく、[`ReactDOM.flushSync`][flush-sync] コールでラップするように React Router DOM に指示します。これにより、更新が DOM にフラッシュされた直後に同期的な DOM アクションを実行できます。

<docs-warning>`ReactDOM.flushSync` は React を最適化し、アプリのパフォーマンスに悪影響を与える可能性があります。</docs-warning>

## プロパティ

### `fetcher.state`

`fetcher.state` でフェッチャーの状態を確認できます。状態は次のいずれかになります。

- **idle** - フェッチされていません。
- **submitting** - フォームが送信されました。メソッドが `GET` の場合、ルートの `loader` が呼び出されます。 `DELETE`、`PATCH`、`POST`、または `PUT` の場合、ルートの `action` が呼び出されます。
- **loading** - `action` の送信後に、ルートのローダーがリロードされています。

### `fetcher.data`

`action` または `loader` から返されたレスポンスデータがここに格納されます。データが設定されると、リロードや再送信（`fetcher.load()` を既にデータを読み込んだ後に再び呼び出すなど）を通じてフェッチャーに保持されます。

### `fetcher.formData`

サーバーに送信された `FormData` インスタンスがここに格納されます。これは、楽観的な UI に役立ちます。

### `fetcher.formAction`

送信の URL。

### `fetcher.formMethod`

送信のフォームメソッド。

## 追加のリソース

**ディスカッション**

- [フォーム vs. フェッチャー][form_vs_fetcher]
- [ネットワークコンカレンシー管理][network_concurrency_management]

**動画**

- [`useFetcher` を使った同時変更][concurrent_mutations_with_use_fetcher]
- [楽観的な UI][optimistic_ui]

[form_component]: ../components/form
[form_data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[html_form_element]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
[form_element]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[loader]: ../route/loader
[url_search_params]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[action]: ../route/action
[form_vs_fetcher]: ../discussion/form-vs-fetcher
[network_concurrency_management]: ../discussion/concurrency
[concurrent_mutations_with_use_fetcher]: https://www.youtube.com/watch?v=vTzNpiOk668&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
[optimistic_ui]: https://www.youtube.com/watch?v=EdB_nj01C80&list=PLXoynULbYuEDG2wBFSZ66b85EIspy3fy6
[use_fetchers]: ./use-fetchers
[flush-sync]: https://react.dev/reference/react-dom/flushSync
[start-transition]: https://react.dev/reference/react/startTransition
[use-submit]: ./use-submit
[userevalidator]: ./use-revalidator
[shouldrevalidate]: ../route/should-revalidate#shouldrevalidate



