---
title: useFetcher
---

# `useFetcher`

ナビゲーション以外のサーバーとのやり取りのためのフックです。

```tsx
import { useFetcher } from "@remix-run/react";

export function SomeComponent() {
  const fetcher = useFetcher();
  // ...
}
```

## オプション

### `key`

デフォルトでは、`useFetcher` はそのコンポーネントにスコープされた一意のフェッチャーを生成します（ただし、インフライト中は [`useFetchers()`][use_fetchers] で見つけることができます）。アプリの他の場所からフェッチャーを独自のキーで識別できるようにしたい場合は、`key` オプションを使用できます。

```tsx lines=[2,8]
function AddToBagButton() {
  const fetcher = useFetcher({ key: "add-to-bag" });
  return <fetcher.Form method="post">...</fetcher.Form>;
}

// ヘッダーの上で...
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

[`<Form>`][form_component] と同じですが、ナビゲーションが発生しません。

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

フォームデータをルートに送信します。複数のネストされたルートが URL に一致する場合、リーフルートのみが呼び出されます。

`formData` は複数のタイプになります。

- [`FormData`][form_data] - `FormData` インスタンス。
- [`HTMLFormElement`][html_form_element] - [`<form>`][form_element] DOM 要素。
- `Object` - デフォルトで `FormData` インスタンスに変換される、キー/値のペアのオブジェクト。より複雑なオブジェクトを渡して、`encType: "application/json"` を指定することで JSON としてシリアル化できます。詳細については、[`useSubmit`][use-submit] を参照してください。

メソッドが `GET` の場合、ルートの [`loader`][loader] が呼び出され、`formData` が [`URLSearchParams`][url_search_params] として URL にシリアル化されます。`DELETE`、`PATCH`、`POST`、または `PUT` の場合、ルートの [`action`][action] が呼び出され、`formData` がボディとして渡されます。

```tsx
// FormData インスタンスを送信する（GET リクエスト）
const formData = new FormData();
fetcher.submit(formData);

// HTML フォーム要素を送信する
fetcher.submit(event.currentTarget.form, {
  method: "POST",
});

// キー/値 JSON を FormData インスタンスとして送信する
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

`fetcher.submit` はフェッチャーインスタンスに対する [`useSubmit`][use-submit] 呼び出しのラッパーであるため、`useSubmit` と同じオプションを受け取ります。

### `fetcher.load(href, options)`

ルートローダーからデータを読み込みます。複数のネストされたルートが URL に一致する場合、リーフルートのみが呼び出されます。

```ts
fetcher.load("/some/route");
fetcher.load("/some/route?foo=bar");
```

`fetcher.load` は、アクション送信後と [`useRevalidator`][userevalidator] を介した明示的な再検証要求の後に、デフォルトで再検証されます。`fetcher.load` は特定の URL を読み込むため、ルートパラメーターまたは URL 検索パラメーターの変更では再検証されません。どのデータを再読み込みする必要があるかを最適化するために、[`shouldRevalidate`][shouldrevalidate] を使用できます。

#### `options.unstable_flushSync`

`unstable_flushSync` オプションは、React Router DOM に、この `fetcher.load` の初期状態の更新を、デフォルトの [`React.startTransition`][start-transition] ではなく、[`ReactDOM.flushSync`][flush-sync] 呼び出しでラップするように指示します。これにより、更新が DOM にフラッシュされた直後に、同期的に DOM アクションを実行できます。

<docs-warning>`ReactDOM.flushSync` は React を最適化解除し、アプリのパフォーマンスを低下させる可能性があります。</docs-warning>

## プロパティ

### `fetcher.state`

`fetcher.state` を使用して、フェッチャーの状態を知ることができます。次のいずれかになります。

- **idle** - 読み込みは行われていません。
- **submitting** - フォームが送信されました。メソッドが `GET` の場合、ルートの `loader` が呼び出されます。`DELETE`、`PATCH`、`POST`、または `PUT` の場合、ルートの `action` が呼び出されます。
- **loading** - `action` 送信後に、ルートのローダーが再読み込みされています。

### `fetcher.data`

`action` または `loader` から返された応答データがここに格納されます。データが設定されると、リロードや再送信（`fetcher.load()` をすでにデータを読んだ後に再度呼び出すなど）によってもフェッチャーに保持されます。

### `fetcher.formData`

サーバーに送信された `FormData` インスタンスがここに格納されます。これは、楽観的な UI に役立ちます。

### `fetcher.formAction`

送信の URL です。

### `fetcher.formMethod`

送信のフォームメソッドです。

## 追加のリソース

**ディスカッション**

- [フォーム vs. フェッチャー][form_vs_fetcher]
- [ネットワークの同時実行管理][network_concurrency_management]

**ビデオ**

- [useFetcher による同時変更][concurrent_mutations_with_use_fetcher]
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



