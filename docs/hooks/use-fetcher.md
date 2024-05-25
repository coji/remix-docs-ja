---
title: useFetcher
---

# `useFetcher`

ナビゲーション以外のサーバーとのやり取りを行うためのフック。

```tsx
import { useFetcher } from "@remix-run/react";

export function SomeComponent() {
  const fetcher = useFetcher();
  // ...
}
```

## オプション

### `key`

デフォルトでは、`useFetcher` はそのコンポーネントにスコープされた一意のフェッチャーを生成します（ただし、`in-flight` の間は [`useFetchers()`][use_fetchers] で検索される場合があります）。アプリの他の場所からフェッチャーにアクセスできるように、独自のキーでフェッチャーを識別したい場合は、`key` オプションを使用できます。

```tsx lines=[2,8]
function AddToBagButton() {
  const fetcher = useFetcher({ key: "add-to-bag" });
  return <fetcher.Form method="post">...</fetcher.Form>;
}

// ヘッダーの上にある...
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

フォームデータをルートに送信します。複数のネストされたルートが URL と一致する場合でも、リーフルートのみが呼び出されます。

`formData` は、次の複数のタイプになります。

- [`FormData`][form_data] - `FormData` インスタンス。
- [`HTMLFormElement`][html_form_element] - [`<form>`][form_element] DOM 要素。
- `Object` - デフォルトでは `FormData` インスタンスに変換されるキー/値のペアのオブジェクト。より複雑なオブジェクトを渡して、`encType: "application/json"` を指定することで JSON としてシリアル化できます。詳細については、[`useSubmit`][use-submit] を参照してください。

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

`fetcher.submit` は、フェッチャーインスタンスの [`useSubmit`][use-submit] 呼び出しのラッパーなので、`useSubmit` と同じオプションを受け入れます。

### `fetcher.load(href, options)`

ルートローダーからデータを読み込みます。複数のネストされたルートが URL と一致する場合でも、リーフルートのみが呼び出されます。

```ts
fetcher.load("/some/route");
fetcher.load("/some/route?foo=bar");
```

#### `options.unstable_flushSync`

`unstable_flushSync` オプションは、この `fetcher.load` の最初の状態の更新を、デフォルトの [`React.startTransition`][start-transition] ではなく [`ReactDOM.flushSync`][flush-sync] 呼び出しでラップするように React Router DOM に指示します。これにより、更新が DOM にフラッシュされた直後に、同期的に DOM 操作を実行できます。

<docs-warning>`ReactDOM.flushSync` は React を非最適化し、アプリのパフォーマンスを低下させる可能性があります。</docs-warning>

## プロパティ

### `fetcher.state`

`fetcher.state` を使用して、フェッチャーの状態を知ることができます。次のいずれかになります。

- **idle** - フェッチは行われていません。
- **submitting** - フォームが送信されました。メソッドが `GET` の場合、ルートの `loader` が呼び出されます。`DELETE`、`PATCH`、`POST`、または `PUT` の場合、ルートの `action` が呼び出されます。
- **loading** - `action` の送信後にルートのローダーがリロードされます。

### `fetcher.data`

`action` または `loader` から返された応答データがここに格納されます。データが設定されると、リロードや再送信（`fetcher.load()` をすでにデータを読んだ後に再び呼び出すなど）にもかかわらず、フェッチャーに保持されます。

### `fetcher.formData`

サーバーに送信された `FormData` インスタンスがここに格納されます。これは、楽観的な UI に役立ちます。

### `fetcher.formAction`

送信の URL。

### `fetcher.formMethod`

送信のフォームメソッド。

## 追加のリソース

**ディスカッション**

- [Form vs. Fetcher][form_vs_fetcher]
- [ネットワークコンカレンシー管理][network_concurrency_management]

**ビデオ**

- [Concurrent Mutations w/ useFetcher][concurrent_mutations_with_use_fetcher]
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
